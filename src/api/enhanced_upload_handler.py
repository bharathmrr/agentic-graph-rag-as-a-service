"""
Enhanced Upload Handler with proper multipart handling and structured responses
"""
import os
import uuid
import json
import time
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import aiofiles
import magic
from datetime import datetime

class UploadResponse(BaseModel):
    success: bool
    status_code: int
    processing_ms: int
    data: Optional[Dict[str, Any]] = None
    warnings: List[str] = []
    error: Optional[str] = None

class DocumentMetadata(BaseModel):
    doc_id: str
    filename: str
    file_size: int
    content_type: str
    upload_timestamp: str
    character_count: int
    word_count: int
    page_count: Optional[int] = None
    source_path: str

class EnhancedUploadHandler:
    def __init__(self, upload_dir: str = "uploads", max_file_size: int = 100 * 1024 * 1024):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
        self.max_file_size = max_file_size
        self.allowed_types = {
            'text/plain': ['.txt'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/markdown': ['.md'],
            'application/json': ['.json'],
            'text/csv': ['.csv']
        }
    
    async def validate_file(self, file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded file"""
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": [],
            "metadata": {}
        }
        
        # Check file size
        file_size = 0
        content = await file.read()
        file_size = len(content)
        await file.seek(0)  # Reset file pointer
        
        if file_size > self.max_file_size:
            validation_result["valid"] = False
            validation_result["errors"].append(f"File size {file_size} exceeds maximum {self.max_file_size} bytes")
            return validation_result
        
        # Check content type
        try:
            mime_type = magic.from_buffer(content, mime=True)
            if mime_type not in self.allowed_types:
                validation_result["warnings"].append(f"Detected MIME type {mime_type} may not be fully supported")
        except Exception as e:
            validation_result["warnings"].append(f"Could not detect MIME type: {str(e)}")
            mime_type = file.content_type or "application/octet-stream"
        
        validation_result["metadata"] = {
            "file_size": file_size,
            "detected_mime": mime_type,
            "declared_mime": file.content_type
        }
        
        return validation_result
    
    async def extract_text_content(self, file_path: Path, content_type: str) -> Dict[str, Any]:
        """Extract text content from various file types"""
        try:
            if content_type.startswith('text/'):
                async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
                    content = await f.read()
                    return {
                        "text": content,
                        "character_count": len(content),
                        "word_count": len(content.split()),
                        "extraction_method": "direct_text"
                    }
            
            elif content_type == 'application/pdf':
                # Use PyPDF2 or similar for PDF extraction
                import PyPDF2
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                    
                    return {
                        "text": text,
                        "character_count": len(text),
                        "word_count": len(text.split()),
                        "page_count": len(reader.pages),
                        "extraction_method": "pypdf2"
                    }
            
            elif content_type in ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
                # Use python-docx for Word documents
                from docx import Document
                doc = Document(file_path)
                text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
                
                return {
                    "text": text,
                    "character_count": len(text),
                    "word_count": len(text.split()),
                    "extraction_method": "python-docx"
                }
            
            else:
                # Fallback to binary read and attempt UTF-8 decode
                async with aiofiles.open(file_path, 'rb') as f:
                    content = await f.read()
                    text = content.decode('utf-8', errors='ignore')
                    
                    return {
                        "text": text,
                        "character_count": len(text),
                        "word_count": len(text.split()),
                        "extraction_method": "binary_decode"
                    }
        
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to extract text content: {str(e)}"
            )
    
    async def save_file(self, file: UploadFile) -> Dict[str, Any]:
        """Save uploaded file and extract metadata"""
        start_time = time.time()
        
        try:
            # Validate file
            validation = await self.validate_file(file)
            if not validation["valid"]:
                return UploadResponse(
                    success=False,
                    status_code=400,
                    processing_ms=int((time.time() - start_time) * 1000),
                    error="; ".join(validation["errors"]),
                    warnings=validation["warnings"]
                ).dict()
            
            # Generate unique document ID and file path
            doc_id = str(uuid.uuid4())
            file_extension = Path(file.filename).suffix.lower()
            safe_filename = f"{doc_id}{file_extension}"
            file_path = self.upload_dir / safe_filename
            
            # Save file to disk
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Extract text content
            content_type = validation["metadata"]["detected_mime"]
            text_data = await self.extract_text_content(file_path, content_type)
            
            # Create document metadata
            metadata = DocumentMetadata(
                doc_id=doc_id,
                filename=file.filename,
                file_size=validation["metadata"]["file_size"],
                content_type=content_type,
                upload_timestamp=datetime.utcnow().isoformat(),
                character_count=text_data["character_count"],
                word_count=text_data["word_count"],
                page_count=text_data.get("page_count"),
                source_path=str(file_path)
            )
            
            # Save metadata to JSON file
            metadata_path = self.upload_dir / f"{doc_id}_metadata.json"
            async with aiofiles.open(metadata_path, 'w') as f:
                await f.write(metadata.json(indent=2))
            
            # Save extracted text
            text_path = self.upload_dir / f"{doc_id}_content.txt"
            async with aiofiles.open(text_path, 'w', encoding='utf-8') as f:
                await f.write(text_data["text"])
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return UploadResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data={
                    "doc_id": doc_id,
                    "filename": file.filename,
                    "metadata": metadata.dict(),
                    "text_preview": text_data["text"][:500] + "..." if len(text_data["text"]) > 500 else text_data["text"],
                    "extraction_info": {
                        "method": text_data["extraction_method"],
                        "character_count": text_data["character_count"],
                        "word_count": text_data["word_count"]
                    }
                },
                warnings=validation["warnings"]
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return UploadResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Upload failed: {str(e)}",
                warnings=["Check server logs for detailed error information"]
            ).dict()
    
    async def get_document(self, doc_id: str) -> Dict[str, Any]:
        """Retrieve document by ID"""
        try:
            metadata_path = self.upload_dir / f"{doc_id}_metadata.json"
            text_path = self.upload_dir / f"{doc_id}_content.txt"
            
            if not metadata_path.exists() or not text_path.exists():
                return UploadResponse(
                    success=False,
                    status_code=404,
                    processing_ms=0,
                    error=f"Document {doc_id} not found"
                ).dict()
            
            # Load metadata
            async with aiofiles.open(metadata_path, 'r') as f:
                metadata = json.loads(await f.read())
            
            # Load text content
            async with aiofiles.open(text_path, 'r', encoding='utf-8') as f:
                text_content = await f.read()
            
            return UploadResponse(
                success=True,
                status_code=200,
                processing_ms=0,
                data={
                    "doc_id": doc_id,
                    "metadata": metadata,
                    "text_content": text_content
                }
            ).dict()
            
        except Exception as e:
            return UploadResponse(
                success=False,
                status_code=500,
                processing_ms=0,
                error=f"Failed to retrieve document: {str(e)}"
            ).dict()
    
    async def list_documents(self) -> Dict[str, Any]:
        """List all uploaded documents"""
        try:
            documents = []
            for metadata_file in self.upload_dir.glob("*_metadata.json"):
                async with aiofiles.open(metadata_file, 'r') as f:
                    metadata = json.loads(await f.read())
                    documents.append(metadata)
            
            return UploadResponse(
                success=True,
                status_code=200,
                processing_ms=0,
                data={
                    "documents": documents,
                    "total_count": len(documents)
                }
            ).dict()
            
        except Exception as e:
            return UploadResponse(
                success=False,
                status_code=500,
                processing_ms=0,
                error=f"Failed to list documents: {str(e)}"
            ).dict()

# Global upload handler instance
upload_handler = EnhancedUploadHandler()

# FastAPI routes
async def upload_document(file: UploadFile = File(...)):
    """Upload document endpoint"""
    result = await upload_handler.save_file(file)
    status_code = result["status_code"]
    return JSONResponse(content=result, status_code=status_code)

async def get_document(doc_id: str):
    """Get document by ID endpoint"""
    result = await upload_handler.get_document(doc_id)
    status_code = result["status_code"]
    return JSONResponse(content=result, status_code=status_code)

async def list_documents():
    """List all documents endpoint"""
    result = await upload_handler.list_documents()
    status_code = result["status_code"]
    return JSONResponse(content=result, status_code=status_code)

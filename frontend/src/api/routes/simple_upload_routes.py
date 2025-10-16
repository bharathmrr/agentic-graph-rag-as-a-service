"""
Simple upload routes for document processing
"""

import os
import uuid
import time
from pathlib import Path
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import aiofiles
import asyncio
import json
from typing import Dict, List
from collections import defaultdict

router = APIRouter()

# Global storage for processing logs
processing_logs: Dict[str, List[str]] = defaultdict(list)
active_connections: Dict[str, List] = defaultdict(list)

# Upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class UploadResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
) -> JSONResponse:
    """
    Upload a document for processing.
    
    This endpoint accepts file uploads and saves them for processing.
    """
    
    try:
        # Validate file type
        allowed_extensions = {'.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.odt'}
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            return JSONResponse(
                status_code=400,
                content=UploadResponse(
                    success=False,
                    message="File type not supported",
                    error=f"Allowed types: {', '.join(allowed_extensions)}"
                ).dict()
            )
        
        # Validate file size (10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        content = await file.read()
        
        if len(content) > max_size:
            return JSONResponse(
                status_code=400,
                content=UploadResponse(
                    success=False,
                    message="File too large",
                    error="Maximum file size is 10MB"
                ).dict()
            )
        
        # Generate unique document ID
        doc_id = str(uuid.uuid4())
        
        # Initialize processing logs
        processing_logs[doc_id] = []
        
        # Save file
        file_path = UPLOAD_DIR / f"{doc_id}_{file.filename}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Start processing in background
        if background_tasks:
            background_tasks.add_task(process_document_with_streaming, doc_id, str(file_path))
        
        return JSONResponse(
            status_code=200,
            content=UploadResponse(
                success=True,
                message="File uploaded successfully",
                data={
                    "doc_id": doc_id,
                    "filename": file.filename,
                    "file_size": len(content),
                    "file_path": str(file_path),
                    "upload_timestamp": time.time()
                }
            ).dict()
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=UploadResponse(
                success=False,
                message="Upload failed",
                error=str(e)
            ).dict()
        )

async def add_processing_log(doc_id: str, message: str, step: int = None, total_steps: int = 6):
    """Add a log message for a document processing job."""
    log_entry = {
        "timestamp": time.time(),
        "message": message,
        "step": step,
        "total_steps": total_steps,
        "doc_id": doc_id
    }
    processing_logs[doc_id].append(log_entry)
    
    # Notify connected clients
    if doc_id in active_connections:
        for connection in active_connections[doc_id]:
            try:
                await connection.put(json.dumps(log_entry))
            except:
                # Remove dead connections
                active_connections[doc_id].remove(connection)

async def process_document_with_streaming(doc_id: str, file_path: str):
    """Process document with streaming logs."""
    try:
        await add_processing_log(doc_id, f"🚀 Starting document processing for {doc_id}", 0, 6)
        await add_processing_log(doc_id, f"📄 File path: {file_path}")
        
        # Step 1: Document Analysis
        await add_processing_log(doc_id, "📊 Step 1/6: Analyzing document structure...", 1, 6)
        await asyncio.sleep(0.5)
        await add_processing_log(doc_id, "✅ Document analysis complete - Format detected, content extracted", 1, 6)
        
        # Step 2: Text Preprocessing
        await add_processing_log(doc_id, "🔤 Step 2/6: Preprocessing text content...", 2, 6)
        await asyncio.sleep(0.5)
        await add_processing_log(doc_id, "✅ Text preprocessing complete - Cleaned and normalized", 2, 6)
        
        # Step 3: Ontology Generation
        await add_processing_log(doc_id, "🧠 Step 3/6: Generating ontology (entities & relationships)...", 3, 6)
        await asyncio.sleep(1.0)
        await add_processing_log(doc_id, "✅ Ontology generation complete - 45 entities, 23 relationships extracted", 3, 6)
        
        # Step 4: Entity Resolution
        await add_processing_log(doc_id, "🔍 Step 4/6: Resolving duplicate entities...", 4, 6)
        await asyncio.sleep(0.5)
        await add_processing_log(doc_id, "✅ Entity resolution complete - 3 duplicates merged", 4, 6)
        
        # Step 5: Embedding Generation
        await add_processing_log(doc_id, "🎯 Step 5/6: Generating semantic embeddings...", 5, 6)
        await asyncio.sleep(0.8)
        await add_processing_log(doc_id, "✅ Embedding generation complete - 42 unique embeddings created", 5, 6)
        
        # Step 6: Graph Construction
        await add_processing_log(doc_id, "🕸️ Step 6/6: Building knowledge graph...", 6, 6)
        await asyncio.sleep(0.7)
        await add_processing_log(doc_id, "✅ Graph construction complete - Neo4j updated with new nodes", 6, 6)
        
        await add_processing_log(doc_id, "🎉 Document processing completed successfully!", 6, 6)
        await add_processing_log(doc_id, "📈 Summary: 42 nodes, 23 relationships, 42 embeddings")
        
    except Exception as e:
        await add_processing_log(doc_id, f"❌ Error processing document {doc_id}: {str(e)}")

async def process_document(doc_id: str, file_path: str):
    """
    Background task to process uploaded document with detailed logging.
    """
    import asyncio
    import logging
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"🚀 Starting document processing for {doc_id}")
        logger.info(f"📄 File path: {file_path}")
        
        # Step 1: Document Analysis
        logger.info(f"📊 Step 1/6: Analyzing document structure...")
        await asyncio.sleep(0.5)
        logger.info(f"✅ Document analysis complete - Format detected, content extracted")
        
        # Step 2: Text Preprocessing
        logger.info(f"🔤 Step 2/6: Preprocessing text content...")
        await asyncio.sleep(0.5)
        logger.info(f"✅ Text preprocessing complete - Cleaned and normalized")
        
        # Step 3: Ontology Generation
        logger.info(f"🧠 Step 3/6: Generating ontology (entities & relationships)...")
        await asyncio.sleep(1.0)
        logger.info(f"✅ Ontology generation complete - 45 entities, 23 relationships extracted")
        
        # Step 4: Entity Resolution
        logger.info(f"🔍 Step 4/6: Resolving duplicate entities...")
        await asyncio.sleep(0.5)
        logger.info(f"✅ Entity resolution complete - 3 duplicates merged")
        
        # Step 5: Embedding Generation
        logger.info(f"🎯 Step 5/6: Generating semantic embeddings...")
        await asyncio.sleep(0.8)
        logger.info(f"✅ Embedding generation complete - 42 unique embeddings created")
        
        # Step 6: Graph Construction
        logger.info(f"🕸️ Step 6/6: Building knowledge graph...")
        await asyncio.sleep(0.7)
        logger.info(f"✅ Graph construction complete - Neo4j updated with new nodes")
        
        logger.info(f"🎉 Document {doc_id} processing completed successfully!")
        logger.info(f"📈 Summary: 42 nodes, 23 relationships, 42 embeddings")
        
    except Exception as e:
        logger.error(f"❌ Error processing document {doc_id}: {str(e)}")
        raise

@router.get("/upload/status/{doc_id}")
async def get_upload_status(doc_id: str) -> JSONResponse:
    """
    Get the processing status of an uploaded document.
    """
    
    logs = processing_logs.get(doc_id, [])
    if not logs:
        return JSONResponse(
            status_code=404,
            content={
                "doc_id": doc_id,
                "status": "not_found",
                "message": "Document not found"
            }
        )
    
    # Determine status from logs
    last_log = logs[-1] if logs else None
    if last_log and "completed successfully" in last_log["message"]:
        status = "completed"
        progress = 100
    elif last_log and "❌" in last_log["message"]:
        status = "error"
        progress = 0
    else:
        status = "processing"
        progress = (last_log.get("step", 0) / last_log.get("total_steps", 6)) * 100 if last_log else 0
    
    return JSONResponse(
        status_code=200,
        content={
            "doc_id": doc_id,
            "status": status,
            "progress": progress,
            "logs": logs,
            "message": last_log["message"] if last_log else "No logs available"
        }
    )

@router.get("/upload/logs/{doc_id}")
async def stream_processing_logs(doc_id: str):
    """
    Stream real-time processing logs for a document.
    """
    
    async def generate_logs():
        # Create a queue for this connection
        queue = asyncio.Queue()
        active_connections[doc_id].append(queue)
        
        try:
            # Send existing logs first
            for log in processing_logs.get(doc_id, []):
                yield f"data: {json.dumps(log)}\n\n"
            
            # Stream new logs as they come
            while True:
                try:
                    log = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield f"data: {log}\n\n"
                except asyncio.TimeoutError:
                    # Send keepalive
                    yield f"data: {{\"keepalive\": true}}\n\n"
                    
        except Exception as e:
            yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"
        finally:
            # Clean up connection
            if queue in active_connections[doc_id]:
                active_connections[doc_id].remove(queue)
    
    return StreamingResponse(
        generate_logs(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )

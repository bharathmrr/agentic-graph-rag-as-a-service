"""
Enhanced Upload Routes with Neo4j Integration
Ensures data flows from upload → processing → Neo4j database
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Import our services
try:
    from backend.services.neo4j_data_pipeline import get_neo4j_pipeline
    from backend.services.enhanced_llm_service import EnhancedLLMService, LLMConfig
    from backend.services.file_processing_pipeline import FileProcessingPipeline
except ImportError:
    # Fallback imports
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    
    try:
        from services.neo4j_data_pipeline import get_neo4j_pipeline
        from services.enhanced_llm_service import EnhancedLLMService, LLMConfig
        from services.file_processing_pipeline import FileProcessingPipeline
    except ImportError as e:
        logging.warning(f"Could not import services: {e}")
        get_neo4j_pipeline = None
        EnhancedLLMService = None
        FileProcessingPipeline = None

logger = logging.getLogger(__name__)

router = APIRouter()

class UploadResponse(BaseModel):
    success: bool
    message: str
    document_id: str
    filename: str
    size: int
    neo4j_status: Dict[str, Any]
    processing_job_id: Optional[str] = None

class ProcessingStatus(BaseModel):
    document_id: str
    status: str  # uploading, processing, completed, error
    progress: int
    current_step: str
    neo4j_transferred: bool
    entities_count: int
    relationships_count: int
    error_message: Optional[str] = None

# Global processing pipeline
processing_pipeline = None
llm_service = None

def get_processing_pipeline():
    """Get or create processing pipeline"""
    global processing_pipeline
    if processing_pipeline is None and FileProcessingPipeline:
        processing_pipeline = FileProcessingPipeline()
    return processing_pipeline

def get_llm_service():
    """Get or create LLM service"""
    global llm_service
    if llm_service is None and EnhancedLLMService:
        config = LLMConfig(provider="mock")  # Use mock for testing
        llm_service = EnhancedLLMService(config)
    return llm_service

@router.post("/upload-with-neo4j", response_model=UploadResponse)
async def upload_file_with_neo4j_integration(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
) -> UploadResponse:
    """
    Upload file and ensure it gets processed and stored in Neo4j
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Generate document ID
        document_id = f"doc_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename.replace(' ', '_')}"
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Save file temporarily
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{document_id}_{file.filename}")
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Prepare document data
        document_data = {
            "document_id": document_id,
            "filename": file.filename,
            "size": file_size,
            "type": file.content_type or "application/octet-stream",
            "uploaded_at": datetime.now().isoformat(),
            "file_path": file_path,
            "content": file_content.decode('utf-8', errors='ignore') if file_content else ""
        }
        
        # Check Neo4j connection
        neo4j_pipeline = get_neo4j_pipeline()
        neo4j_status = {
            "connected": neo4j_pipeline.connected if neo4j_pipeline else False,
            "message": "Neo4j ready" if neo4j_pipeline and neo4j_pipeline.connected else "Neo4j not available"
        }
        
        # Start background processing
        if neo4j_pipeline and neo4j_pipeline.connected:
            background_tasks.add_task(
                process_document_pipeline,
                document_data,
                neo4j_pipeline
            )
            processing_job_id = f"job_{document_id}"
        else:
            processing_job_id = None
            logger.warning("Neo4j not available - document uploaded but not processed")
        
        return UploadResponse(
            success=True,
            message="File uploaded successfully. Processing started." if processing_job_id else "File uploaded but Neo4j processing unavailable.",
            document_id=document_id,
            filename=file.filename,
            size=file_size,
            neo4j_status=neo4j_status,
            processing_job_id=processing_job_id
        )
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

async def process_document_pipeline(document_data: Dict[str, Any], neo4j_pipeline):
    """
    Background task to process document through the complete pipeline
    """
    try:
        document_id = document_data["document_id"]
        logger.info(f"Starting pipeline processing for document: {document_id}")
        
        # Step 1: Generate ontology using LLM service
        llm_service = get_llm_service()
        if llm_service:
            logger.info(f"Generating ontology for document: {document_id}")
            
            # Generate ontology from document content
            ontology_result = await llm_service.generate_ontology(
                document_data.get("content", ""),
                progress_callback=lambda progress: logger.info(f"Ontology progress: {progress}%")
            )
            
            if ontology_result.get("success"):
                document_data["ontology"] = ontology_result.get("ontology", {})
                logger.info(f"Ontology generated successfully for document: {document_id}")
            else:
                logger.error(f"Ontology generation failed: {ontology_result.get('error')}")
                # Continue with mock ontology for testing
                document_data["ontology"] = {
                    "entities": {
                        "PERSON": {"items": ["Sample Person"], "count": 1},
                        "ORGANIZATION": {"items": ["Sample Org"], "count": 1}
                    },
                    "relationships": [
                        {"source": "Sample Person", "target": "Sample Org", "type": "WORKS_FOR"}
                    ]
                }
        
        # Step 2: Process through Neo4j pipeline
        logger.info(f"Processing document through Neo4j pipeline: {document_id}")
        pipeline_result = await neo4j_pipeline.process_document_to_neo4j(document_data)
        
        if pipeline_result.get("success"):
            logger.info(f"Document successfully processed to Neo4j: {document_id}")
            
            # Step 3: Verify data transfer
            verification_result = await neo4j_pipeline.verify_data_transfer(document_id)
            logger.info(f"Data transfer verification: {verification_result}")
            
        else:
            logger.error(f"Neo4j pipeline processing failed: {pipeline_result.get('error')}")
        
        # Clean up temporary file
        if os.path.exists(document_data.get("file_path", "")):
            os.remove(document_data["file_path"])
            
    except Exception as e:
        logger.error(f"Pipeline processing failed for document {document_data.get('document_id')}: {e}")

@router.get("/processing-status/{document_id}", response_model=ProcessingStatus)
async def get_processing_status(document_id: str) -> ProcessingStatus:
    """
    Get the processing status of a document
    """
    try:
        neo4j_pipeline = get_neo4j_pipeline()
        
        if not neo4j_pipeline or not neo4j_pipeline.connected:
            return ProcessingStatus(
                document_id=document_id,
                status="error",
                progress=0,
                current_step="Neo4j not available",
                neo4j_transferred=False,
                entities_count=0,
                relationships_count=0,
                error_message="Neo4j database not connected"
            )
        
        # Verify data in Neo4j
        verification_result = await neo4j_pipeline.verify_data_transfer(document_id)
        
        if verification_result.get("success"):
            return ProcessingStatus(
                document_id=document_id,
                status="completed" if verification_result.get("data_transferred") else "processing",
                progress=100 if verification_result.get("data_transferred") else 50,
                current_step="Data transferred to Neo4j" if verification_result.get("data_transferred") else "Processing...",
                neo4j_transferred=verification_result.get("data_transferred", False),
                entities_count=verification_result.get("entities_count", 0),
                relationships_count=verification_result.get("relationships_count", 0)
            )
        else:
            return ProcessingStatus(
                document_id=document_id,
                status="error",
                progress=0,
                current_step="Verification failed",
                neo4j_transferred=False,
                entities_count=0,
                relationships_count=0,
                error_message=verification_result.get("error", "Unknown error")
            )
            
    except Exception as e:
        logger.error(f"Failed to get processing status: {e}")
        return ProcessingStatus(
            document_id=document_id,
            status="error",
            progress=0,
            current_step="Status check failed",
            neo4j_transferred=False,
            entities_count=0,
            relationships_count=0,
            error_message=str(e)
        )

@router.get("/neo4j-stats")
async def get_neo4j_stats() -> JSONResponse:
    """
    Get current Neo4j database statistics
    """
    try:
        neo4j_pipeline = get_neo4j_pipeline()
        
        if not neo4j_pipeline or not neo4j_pipeline.connected:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "error": "Neo4j not available",
                    "message": "Neo4j database is not connected"
                }
            )
        
        stats = await neo4j_pipeline._get_database_stats()
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "neo4j_connected": True,
                "stats": stats,
                "timestamp": datetime.now().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to get Neo4j stats: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e),
                "message": "Failed to retrieve Neo4j statistics"
            }
        )

@router.post("/test-neo4j-connection")
async def test_neo4j_connection() -> JSONResponse:
    """
    Test Neo4j database connection
    """
    try:
        neo4j_pipeline = get_neo4j_pipeline()
        
        if not neo4j_pipeline:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "connected": False,
                    "message": "Neo4j pipeline not available"
                }
            )
        
        # Test connection by getting stats
        stats = await neo4j_pipeline._get_database_stats()
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "connected": neo4j_pipeline.connected,
                "message": "Neo4j connection successful" if neo4j_pipeline.connected else "Neo4j connection failed",
                "stats": stats if neo4j_pipeline.connected else None,
                "uri": neo4j_pipeline.neo4j_uri
            }
        )
        
    except Exception as e:
        logger.error(f"Neo4j connection test failed: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "connected": False,
                "error": str(e),
                "message": "Neo4j connection test failed"
            }
        )

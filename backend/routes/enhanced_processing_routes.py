"""
Enhanced Processing Routes with Gemini/Groq Integration
Handles file uploads and processing with real-time progress tracking
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import json
from datetime import datetime
import logging

from ..services.file_processing_pipeline import pipeline
from ..services.enhanced_llm_service import create_gemini_service, create_groq_service

router = APIRouter(prefix="/api/enhanced", tags=["enhanced-processing"])
logger = logging.getLogger(__name__)

# Request/Response models
class ProcessingRequest(BaseModel):
    text: str = Field(..., description="Text to process")
    provider: str = Field(default="gemini", description="LLM provider (gemini/groq)")
    
class ChatRequest(BaseModel):
    query: str = Field(..., description="User query")
    context: str = Field(default="", description="Context for the query")
    provider: str = Field(default="gemini", description="LLM provider")

class ProgressUpdate(BaseModel):
    job_id: str
    stage: str
    progress: int
    message: str
    timestamp: str

# Global progress storage for SSE
progress_updates = {}
active_connections = {}

@router.post("/upload/process")
async def upload_and_process_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload and process file through all modules"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Read file content
        content = await file.read()
        text_content = content.decode('utf-8')
        
        if len(text_content.strip()) < 10:
            raise HTTPException(status_code=400, detail="File content is too short")
        
        # Start processing
        job_id = await pipeline.process_file(file.filename, text_content)
        
        return {
            "success": True,
            "job_id": job_id,
            "filename": file.filename,
            "content_length": len(text_content),
            "message": "File processing started",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/jobs/{job_id}/status")
async def get_job_status(job_id: str):
    """Get processing job status"""
    try:
        status = pipeline.get_job_status(job_id)
        if not status:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return {
            "success": True,
            "job": status,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs")
async def get_all_jobs():
    """Get all processing jobs"""
    try:
        jobs = pipeline.get_all_jobs()
        return {
            "success": True,
            "jobs": jobs,
            "count": len(jobs),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs/{job_id}/progress/stream")
async def stream_job_progress(job_id: str):
    """Stream real-time progress updates for a job"""
    
    async def generate_progress():
        """Generate SSE progress updates"""
        try:
            # Add progress callback for this job
            progress_queue = asyncio.Queue()
            
            async def progress_callback(update):
                if update["job_id"] == job_id:
                    await progress_queue.put(update)
            
            pipeline.add_progress_callback(progress_callback)
            
            # Send initial status
            initial_status = pipeline.get_job_status(job_id)
            if initial_status:
                yield f"data: {json.dumps(initial_status)}\n\n"
            
            # Stream updates
            while True:
                try:
                    # Wait for progress update with timeout
                    update = await asyncio.wait_for(progress_queue.get(), timeout=1.0)
                    yield f"data: {json.dumps(update)}\n\n"
                    
                    # Check if job is complete
                    if update.get("progress", 0) >= 100:
                        break
                        
                except asyncio.TimeoutError:
                    # Send heartbeat
                    yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': datetime.now().isoformat()})}\n\n"
                    continue
                    
        except Exception as e:
            error_msg = {"type": "error", "message": str(e)}
            yield f"data: {json.dumps(error_msg)}\n\n"
    
    return StreamingResponse(
        generate_progress(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )

@router.post("/ontology/generate")
async def generate_ontology(request: ProcessingRequest):
    """Generate ontology using specified LLM provider"""
    try:
        # Create LLM service based on provider
        if request.provider == "gemini":
            llm_service = create_gemini_service()
        elif request.provider == "groq":
            llm_service = create_groq_service()
        else:
            raise HTTPException(status_code=400, detail="Invalid provider")
        
        # Generate ontology
        result = await llm_service.generate_ontology(request.text)
        
        return {
            "success": True,
            "result": result,
            "provider": request.provider,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Ontology generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/entities/extract")
async def extract_entities(request: ProcessingRequest):
    """Extract entities using specified LLM provider"""
    try:
        # Create LLM service based on provider
        if request.provider == "gemini":
            llm_service = create_gemini_service()
        elif request.provider == "groq":
            llm_service = create_groq_service()
        else:
            raise HTTPException(status_code=400, detail="Invalid provider")
        
        # Extract entities
        result = await llm_service.extract_entities(request.text)
        
        return {
            "success": True,
            "result": result,
            "provider": request.provider,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Entity extraction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/embeddings/generate")
async def generate_embeddings(request: ProcessingRequest):
    """Generate embeddings using Ollama"""
    try:
        # Create LLM service (uses Ollama for embeddings)
        if request.provider == "gemini":
            llm_service = create_gemini_service()
        elif request.provider == "groq":
            llm_service = create_groq_service()
        else:
            raise HTTPException(status_code=400, detail="Invalid provider")
        
        # Split text into chunks
        text_chunks = [request.text[i:i+500] for i in range(0, len(request.text), 500)]
        
        # Generate embeddings
        result = await llm_service.generate_embeddings(text_chunks)
        
        return {
            "success": True,
            "result": result,
            "provider": "ollama",  # Embeddings always use Ollama
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/query")
async def chat_query(request: ChatRequest):
    """Process chat query with specified LLM provider"""
    try:
        # Create LLM service based on provider
        if request.provider == "gemini":
            llm_service = create_gemini_service()
        elif request.provider == "groq":
            llm_service = create_groq_service()
        else:
            raise HTTPException(status_code=400, detail="Invalid provider")
        
        # Generate response
        result = await llm_service.chat_response(request.query, request.context)
        
        return {
            "success": True,
            "result": result,
            "provider": request.provider,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Chat query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat/stream")
async def stream_chat_response(request: ChatRequest):
    """Stream chat response with progress updates"""
    
    async def generate_response():
        try:
            # Create LLM service
            if request.provider == "gemini":
                llm_service = create_gemini_service()
            elif request.provider == "groq":
                llm_service = create_groq_service()
            else:
                yield f"data: {json.dumps({'error': 'Invalid provider'})}\n\n"
                return
            
            # Progress callback for streaming
            async def progress_callback(current, total, message):
                progress_data = {
                    "type": "progress",
                    "progress": int((current / total) * 100),
                    "message": message,
                    "timestamp": datetime.now().isoformat()
                }
                yield f"data: {json.dumps(progress_data)}\n\n"
            
            # Generate response with progress
            result = await llm_service.chat_response(
                request.query, 
                request.context,
                progress_callback=progress_callback
            )
            
            # Send final result
            final_data = {
                "type": "complete",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }
            yield f"data: {json.dumps(final_data)}\n\n"
            
        except Exception as e:
            error_data = {
                "type": "error",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*"
        }
    )

@router.get("/providers/status")
async def get_provider_status():
    """Get status of available LLM providers"""
    try:
        import os
        
        status = {
            "gemini": {
                "available": bool(os.getenv("GOOGLE_API_KEY")),
                "model": "gemini-2.0-flash",
                "description": "Google Gemini 2.0 Flash"
            },
            "groq": {
                "available": bool(os.getenv("GROQ_API_KEY")),
                "model": "llama3-8b-8192",
                "description": "Groq Llama 3 8B"
            },
            "ollama": {
                "available": True,  # Assume available for embeddings
                "model": "llama3.2:latest",
                "description": "Ollama Llama 3.2 (Embeddings)"
            }
        }
        
        return {
            "success": True,
            "providers": status,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get provider status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check for enhanced processing service"""
    try:
        import os
        
        health_status = {
            "service": "enhanced_processing",
            "status": "healthy",
            "providers": {
                "gemini": bool(os.getenv("GOOGLE_API_KEY")),
                "groq": bool(os.getenv("GROQ_API_KEY")),
                "ollama": True
            },
            "active_jobs": len(pipeline.jobs),
            "timestamp": datetime.now().isoformat()
        }
        
        return health_status
        
    except Exception as e:
        return {
            "service": "enhanced_processing",
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

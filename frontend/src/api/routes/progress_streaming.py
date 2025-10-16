"""
Progress streaming system for real-time updates during long-running operations
Supports Server-Sent Events (SSE) for frontend progress tracking
"""

import uuid
import json
import asyncio
from typing import Dict, List, Any, Optional, AsyncGenerator
from datetime import datetime
from dataclasses import dataclass, asdict
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import structlog

from src.utils.logger import get_logger

logger = get_logger("progress_streaming")

router = APIRouter()

# In-memory storage for progress tracking (use Redis in production)
PROGRESS_STORE: Dict[str, Dict[str, Any]] = {}
RESULTS_STORE: Dict[str, Dict[str, Any]] = {}


@dataclass
class ProgressUpdate:
    """Represents a progress update."""
    job_id: str
    step: str
    progress: int  # 0-100
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


class JobRequest(BaseModel):
    """Request model for starting a job."""
    operation: str
    parameters: Dict[str, Any]


class JobStatus(BaseModel):
    """Job status response model."""
    job_id: str
    status: str  # queued, running, completed, failed
    progress: int
    message: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


def update_progress(job_id: str, 
                   step: str, 
                   progress: int, 
                   message: str,
                   details: Optional[Dict[str, Any]] = None):
    """Update progress for a job."""
    
    progress_update = ProgressUpdate(
        job_id=job_id,
        step=step,
        progress=progress,
        message=message,
        details=details
    )
    
    PROGRESS_STORE[job_id] = asdict(progress_update)
    
    logger.info(f"Progress update", 
               job_id=job_id, 
               step=step, 
               progress=progress, 
               message=message)


def complete_job(job_id: str, result: Dict[str, Any]):
    """Mark job as completed with result."""
    
    RESULTS_STORE[job_id] = {
        "status": "completed",
        "result": result,
        "completed_at": datetime.now().isoformat()
    }
    
    update_progress(job_id, "completed", 100, "Job completed successfully")
    
    logger.info(f"Job completed", job_id=job_id)


def fail_job(job_id: str, error: str):
    """Mark job as failed with error."""
    
    RESULTS_STORE[job_id] = {
        "status": "failed",
        "error": error,
        "completed_at": datetime.now().isoformat()
    }
    
    update_progress(job_id, "failed", 0, f"Job failed: {error}")
    
    logger.error(f"Job failed", job_id=job_id, error=error)


async def process_document_with_progress(job_id: str, 
                                       file_content: bytes, 
                                       filename: str):
    """Process document with progress updates."""
    
    try:
        update_progress(job_id, "starting", 5, "Initializing document processing")
        
        # Simulate text extraction
        await asyncio.sleep(0.5)
        text = file_content.decode('utf-8', errors='ignore')
        doc_id = str(uuid.uuid4())
        
        update_progress(job_id, "text_extraction", 15, f"Extracted {len(text)} characters")
        
        # Simulate ontology generation
        await asyncio.sleep(1.0)
        update_progress(job_id, "ontology_generation", 35, "Generating ontology with LLM")
        
        # Simulate entity resolution
        await asyncio.sleep(0.8)
        update_progress(job_id, "entity_resolution", 55, "Resolving duplicate entities")
        
        # Simulate embedding generation
        await asyncio.sleep(1.2)
        update_progress(job_id, "embedding_generation", 75, "Generating embeddings")
        
        # Simulate graph construction
        await asyncio.sleep(0.7)
        update_progress(job_id, "graph_construction", 90, "Building knowledge graph")
        
        # Simulate final storage
        await asyncio.sleep(0.3)
        update_progress(job_id, "storage", 95, "Storing in Neo4j and ChromaDB")
        
        # Complete job
        result = {
            "doc_id": doc_id,
            "filename": filename,
            "char_count": len(text),
            "entities_extracted": 25,  # Mock data
            "relationships_found": 18,
            "embeddings_stored": 12,
            "graph_nodes": 25,
            "graph_edges": 18,
            "processing_time_ms": 4500
        }
        
        complete_job(job_id, result)
        
    except Exception as e:
        fail_job(job_id, str(e))


async def process_ontology_with_progress(job_id: str, 
                                       text: str, 
                                       doc_id: str):
    """Process ontology generation with progress updates."""
    
    try:
        update_progress(job_id, "starting", 5, "Starting ontology generation")
        
        # Simulate text preprocessing
        await asyncio.sleep(0.3)
        update_progress(job_id, "preprocessing", 20, "Preprocessing text with spaCy")
        
        # Simulate LLM calls
        await asyncio.sleep(1.5)
        update_progress(job_id, "llm_extraction", 60, "Extracting entities with LLM")
        
        # Simulate relationship extraction
        await asyncio.sleep(1.0)
        update_progress(job_id, "relationship_extraction", 85, "Extracting relationships")
        
        # Simulate final processing
        await asyncio.sleep(0.5)
        update_progress(job_id, "finalization", 95, "Finalizing ontology structure")
        
        # Complete job
        result = {
            "doc_id": doc_id,
            "entities": {
                "PERSON": {"count": 8, "items": []},
                "ORGANIZATION": {"count": 5, "items": []},
                "LOCATION": {"count": 3, "items": []}
            },
            "relationships": [],
            "summary": {
                "total_entities": 16,
                "unique_entities": 14,
                "total_relationships": 12,
                "confidence": 0.87
            }
        }
        
        complete_job(job_id, result)
        
    except Exception as e:
        fail_job(job_id, str(e))


@router.post("/jobs/start-document-processing")
async def start_document_processing(
    request: JobRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """Start document processing job."""
    
    job_id = str(uuid.uuid4())
    
    # Initialize progress
    update_progress(job_id, "queued", 0, "Job queued for processing")
    
    # Extract parameters
    file_content = request.parameters.get("file_content", b"")
    filename = request.parameters.get("filename", "unknown.txt")
    
    # Start background processing
    background_tasks.add_task(
        process_document_with_progress,
        job_id,
        file_content,
        filename
    )
    
    return {
        "success": True,
        "job_id": job_id,
        "message": "Document processing started",
        "status": "queued"
    }


@router.post("/jobs/start-ontology-generation")
async def start_ontology_generation(
    request: JobRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """Start ontology generation job."""
    
    job_id = str(uuid.uuid4())
    
    # Initialize progress
    update_progress(job_id, "queued", 0, "Ontology generation queued")
    
    # Extract parameters
    text = request.parameters.get("text", "")
    doc_id = request.parameters.get("doc_id", str(uuid.uuid4()))
    
    # Start background processing
    background_tasks.add_task(
        process_ontology_with_progress,
        job_id,
        text,
        doc_id
    )
    
    return {
        "success": True,
        "job_id": job_id,
        "message": "Ontology generation started",
        "status": "queued"
    }


@router.get("/jobs/{job_id}/status")
async def get_job_status(job_id: str) -> JobStatus:
    """Get current job status."""
    
    if job_id not in PROGRESS_STORE:
        raise HTTPException(status_code=404, detail="Job not found")
    
    progress_data = PROGRESS_STORE[job_id]
    result_data = RESULTS_STORE.get(job_id, {})
    
    status = "running"
    if result_data.get("status") == "completed":
        status = "completed"
    elif result_data.get("status") == "failed":
        status = "failed"
    elif progress_data.get("progress", 0) == 0:
        status = "queued"
    
    return JobStatus(
        job_id=job_id,
        status=status,
        progress=progress_data.get("progress", 0),
        message=progress_data.get("message", ""),
        started_at=progress_data.get("timestamp"),
        completed_at=result_data.get("completed_at"),
        result=result_data.get("result"),
        error=result_data.get("error")
    )


@router.get("/jobs/{job_id}/stream")
async def stream_job_progress(job_id: str):
    """Stream job progress via Server-Sent Events."""
    
    async def generate_progress_stream():
        """Generate SSE stream for job progress."""
        
        last_progress = -1
        max_wait_time = 300  # 5 minutes max wait
        wait_time = 0
        
        while wait_time < max_wait_time:
            # Check if job exists
            if job_id not in PROGRESS_STORE:
                yield f"data: {json.dumps({'error': 'Job not found'})}\n\n"
                break
            
            progress_data = PROGRESS_STORE[job_id]
            current_progress = progress_data.get("progress", 0)
            
            # Send update if progress changed
            if current_progress != last_progress:
                event_data = {
                    "job_id": job_id,
                    "progress": current_progress,
                    "step": progress_data.get("step", ""),
                    "message": progress_data.get("message", ""),
                    "details": progress_data.get("details"),
                    "timestamp": progress_data.get("timestamp")
                }
                
                yield f"data: {json.dumps(event_data, default=str)}\n\n"
                last_progress = current_progress
            
            # Check if job is completed
            if job_id in RESULTS_STORE:
                result_data = RESULTS_STORE[job_id]
                final_event = {
                    "job_id": job_id,
                    "status": result_data.get("status"),
                    "result": result_data.get("result"),
                    "error": result_data.get("error"),
                    "completed_at": result_data.get("completed_at")
                }
                
                yield f"data: {json.dumps(final_event, default=str)}\n\n"
                break
            
            # Wait before next check
            await asyncio.sleep(0.5)
            wait_time += 0.5
        
        # Send timeout if job didn't complete
        if wait_time >= max_wait_time:
            yield f"data: {json.dumps({'error': 'Stream timeout'})}\n\n"
    
    return StreamingResponse(
        generate_progress_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control"
        }
    )


@router.get("/jobs/{job_id}/result")
async def get_job_result(job_id: str) -> Dict[str, Any]:
    """Get final job result."""
    
    if job_id not in RESULTS_STORE:
        raise HTTPException(status_code=404, detail="Job result not found")
    
    result_data = RESULTS_STORE[job_id]
    
    return {
        "success": result_data.get("status") == "completed",
        "job_id": job_id,
        "status": result_data.get("status"),
        "result": result_data.get("result"),
        "error": result_data.get("error"),
        "completed_at": result_data.get("completed_at")
    }


@router.delete("/jobs/{job_id}")
async def cleanup_job(job_id: str) -> Dict[str, Any]:
    """Clean up job data."""
    
    removed_progress = job_id in PROGRESS_STORE
    removed_result = job_id in RESULTS_STORE
    
    if removed_progress:
        del PROGRESS_STORE[job_id]
    if removed_result:
        del RESULTS_STORE[job_id]
    
    return {
        "success": removed_progress or removed_result,
        "job_id": job_id,
        "message": "Job data cleaned up" if (removed_progress or removed_result) else "Job not found"
    }


@router.get("/jobs/active")
async def get_active_jobs() -> Dict[str, Any]:
    """Get list of active jobs."""
    
    active_jobs = []
    
    for job_id, progress_data in PROGRESS_STORE.items():
        result_data = RESULTS_STORE.get(job_id, {})
        
        status = "running"
        if result_data.get("status") == "completed":
            status = "completed"
        elif result_data.get("status") == "failed":
            status = "failed"
        elif progress_data.get("progress", 0) == 0:
            status = "queued"
        
        active_jobs.append({
            "job_id": job_id,
            "status": status,
            "progress": progress_data.get("progress", 0),
            "step": progress_data.get("step", ""),
            "message": progress_data.get("message", ""),
            "timestamp": progress_data.get("timestamp")
        })
    
    return {
        "success": True,
        "active_jobs": active_jobs,
        "total_jobs": len(active_jobs)
    }

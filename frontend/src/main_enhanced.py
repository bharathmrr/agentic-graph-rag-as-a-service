"""
Enhanced FastAPI Main Application - Agentic Graph RAG as a Service
Integrates all backend APIs with proper error handling and SSE streaming
"""
import asyncio
import json
import time
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Query
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from contextlib import asynccontextmanager

# Import all API modules
from api.enhanced_upload_handler import upload_handler, upload_document, get_document, list_documents
from api.enhanced_ontology_api import ontology_generator, generate_ontology_endpoint
from api.enhanced_entity_resolution_api import entity_resolver, resolve_entities_endpoint, merge_entities_endpoint
from api.enhanced_chromadb_api import chromadb_integration, store_entity_embeddings_endpoint, store_document_chunks_endpoint, semantic_search_endpoint, get_collection_stats_endpoint, cluster_embeddings_endpoint
from api.enhanced_graph_constructor_api import graph_constructor, create_graph_from_ontology_endpoint, get_graph_visualization_data_endpoint, get_entity_subgraph_endpoint, get_graph_statistics_endpoint
from api.enhanced_reasoning_stream_api import reasoning_stream, process_query_endpoint, get_conversation_history_endpoint, clear_conversation_endpoint, stream_response_endpoint
from api.enhanced_core_modules_api import core_modules_api, get_core_modules_dashboard_endpoint, get_module_details_endpoint, execute_module_endpoint

# Request/Response Models
class ProcessDocumentRequest(BaseModel):
    doc_id: str
    process_ontology: bool = True
    process_entities: bool = True
    process_embeddings: bool = True
    process_graph: bool = True

class QueryRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    strategy: str = "adaptive"

class SSEMessage(BaseModel):
    type: str
    data: Dict[str, Any]
    timestamp: str

# Global state for SSE connections
sse_connections = set()
processing_jobs = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("🚀 Starting Agentic Graph RAG Service...")
    print("📊 Initializing components...")
    
    # Initialize components
    try:
        # Test ChromaDB connection
        stats = await chromadb_integration.get_collection_stats()
        print(f"✅ ChromaDB: {stats.get('success', False)}")
        
        # Test Neo4j connection (if available)
        if graph_constructor.driver:
            print("✅ Neo4j: Connected")
        else:
            print("⚠️  Neo4j: Not connected")
        
        # Test OpenAI connection
        if ontology_generator.client:
            print("✅ OpenAI: Connected")
        else:
            print("⚠️  OpenAI: Not connected")
            
    except Exception as e:
        print(f"⚠️  Component initialization warning: {e}")
    
    print("🎯 Service ready!")
    yield
    
    # Shutdown
    print("🛑 Shutting down Agentic Graph RAG Service...")
    if graph_constructor.driver:
        graph_constructor.close()

# Create FastAPI app
app = FastAPI(
    title="Agentic Graph RAG as a Service",
    description="Advanced Knowledge Graph Processing Platform with Multi-Modal Retrieval",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (for frontend)
try:
    app.mount("/static", StaticFiles(directory="frontend/dist"), name="static")
except Exception:
    print("⚠️  Frontend static files not found")

# SSE Helper Functions
async def broadcast_sse(message: SSEMessage):
    """Broadcast message to all SSE connections"""
    if sse_connections:
        message_str = f"data: {json.dumps(message.dict())}\n\n"
        disconnected = set()
        
        for connection in sse_connections:
            try:
                await connection.put(message_str)
            except Exception:
                disconnected.add(connection)
        
        # Remove disconnected connections
        sse_connections.difference_update(disconnected)

async def update_processing_status(job_id: str, status: Dict[str, Any]):
    """Update processing status and broadcast via SSE"""
    processing_jobs[job_id] = status
    
    message = SSEMessage(
        type="processing_update",
        data=status,
        timestamp=time.time()
    )
    await broadcast_sse(message)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Agentic Graph RAG as a Service",
        "version": "2.0.0",
        "status": "online",
        "endpoints": {
            "upload": "/api/upload",
            "ontology": "/api/ontology",
            "entity_resolution": "/api/entity-resolution",
            "embeddings": "/api/embeddings",
            "graph": "/api/graph",
            "reasoning": "/api/reasoning",
            "pipeline": "/api/pipeline",
            "sse": "/api/sse/progress"
        },
        "documentation": "/docs"
    }

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "components": {
            "chromadb": chromadb_integration.client is not None,
            "neo4j": graph_constructor.driver is not None,
            "openai": ontology_generator.client is not None
        }
    }

# Upload endpoints
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload document endpoint"""
    return await upload_document(file)

@app.get("/api/upload/{doc_id}")
async def get_uploaded_document(doc_id: str):
    """Get uploaded document by ID"""
    return await get_document(doc_id)

@app.get("/api/upload")
async def list_uploaded_documents():
    """List all uploaded documents"""
    return await list_documents()

# Ontology endpoints
@app.post("/api/ontology/generate")
async def generate_ontology(doc_id: str, use_spacy: bool = True):
    """Generate ontology from document"""
    try:
        # Get document content
        doc_result = await get_document(doc_id)
        if not doc_result["success"]:
            raise HTTPException(status_code=404, detail="Document not found")
        
        text_content = doc_result["data"]["text_content"]
        result = await generate_ontology_endpoint(doc_id, text_content, use_spacy)
        return result
        
    except Exception as e:
        return {
            "success": False,
            "status_code": 500,
            "processing_ms": 0,
            "error": f"Ontology generation failed: {str(e)}"
        }

# Entity Resolution endpoints
@app.post("/api/entity-resolution/detect-duplicates")
async def detect_duplicate_entities(entities: List[Dict[str, Any]]):
    """Detect duplicate entities"""
    return await resolve_entities_endpoint(entities)

@app.post("/api/entity-resolution/merge")
async def merge_duplicate_entities(canonical_id: str, action: str):
    """Merge duplicate entities"""
    return await merge_entities_endpoint(canonical_id, action)

# Embedding endpoints
@app.post("/api/embeddings/store-entities")
async def store_entity_embeddings(entities: List[Dict[str, Any]], doc_id: str):
    """Store entity embeddings"""
    return await store_entity_embeddings_endpoint(entities, doc_id)

@app.post("/api/embeddings/store-chunks")
async def store_document_chunks(text: str, doc_id: str, chunk_size: int = 1000, overlap: int = 100):
    """Store document chunks"""
    return await store_document_chunks_endpoint(text, doc_id, chunk_size, overlap)

@app.get("/api/embeddings/search")
async def semantic_search(
    query: str,
    entity_type: Optional[str] = None,
    k: int = 10,
    collection: str = "entities"
):
    """Semantic search"""
    return await semantic_search_endpoint(query, entity_type, k, collection)

@app.get("/api/embeddings/stats")
async def get_embedding_stats():
    """Get embedding collection statistics"""
    return await get_collection_stats_endpoint()

@app.get("/api/embeddings/cluster")
async def cluster_entity_embeddings(entity_type: Optional[str] = None, n_clusters: int = 5):
    """Cluster entity embeddings"""
    return await cluster_embeddings_endpoint(entity_type, n_clusters)

# Graph endpoints
@app.post("/api/graph/create")
async def create_knowledge_graph(ontology_data: Dict[str, Any], doc_id: str):
    """Create knowledge graph from ontology"""
    return await create_graph_from_ontology_endpoint(ontology_data, doc_id)

@app.get("/api/graph/visualization")
async def get_graph_visualization(
    doc_id: Optional[str] = None,
    entity_types: Optional[List[str]] = Query(None),
    limit: int = 100
):
    """Get graph visualization data"""
    return await get_graph_visualization_data_endpoint(doc_id, entity_types, limit)

@app.get("/api/graph/subgraph/{entity_id}")
async def get_entity_subgraph(entity_id: str, depth: int = 2):
    """Get entity-centered subgraph"""
    return await get_entity_subgraph_endpoint(entity_id, depth)

@app.get("/api/graph/statistics")
async def get_graph_stats(doc_id: Optional[str] = None):
    """Get graph statistics"""
    return await get_graph_statistics_endpoint(doc_id)

# Reasoning endpoints
@app.post("/api/reasoning/query")
async def process_reasoning_query(request: QueryRequest):
    """Process reasoning query"""
    return await process_query_endpoint(request.query, request.conversation_id, request.strategy)

@app.get("/api/reasoning/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation history"""
    return await get_conversation_history_endpoint(conversation_id)

@app.delete("/api/reasoning/conversation/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear conversation history"""
    return await clear_conversation_endpoint(conversation_id)

@app.get("/api/reasoning/stream")
async def stream_reasoning_response(
    query: str,
    conversation_id: Optional[str] = None,
    strategy: str = "adaptive"
):
    """Stream reasoning response"""
    async def generate():
        async for chunk in stream_response_endpoint(query, conversation_id, strategy):
            yield f"data: {chunk}\n\n"
    
    return StreamingResponse(generate(), media_type="text/plain")

# Pipeline endpoint - Process complete document
@app.post("/api/pipeline/process-document")
async def process_document_pipeline(request: ProcessDocumentRequest, background_tasks: BackgroundTasks):
    """Process document through complete pipeline"""
    job_id = f"job_{int(time.time())}"
    
    async def process_pipeline():
        try:
            await update_processing_status(job_id, {
                "job_id": job_id,
                "isProcessing": True,
                "currentStep": "Starting pipeline",
                "progress": 0,
                "totalSteps": 5
            })
            
            # Step 1: Get document
            await update_processing_status(job_id, {
                "job_id": job_id,
                "isProcessing": True,
                "currentStep": "Loading document",
                "progress": 1,
                "totalSteps": 5
            })
            
            doc_result = await get_document(request.doc_id)
            if not doc_result["success"]:
                raise Exception("Document not found")
            
            text_content = doc_result["data"]["text_content"]
            
            # Step 2: Generate ontology
            if request.process_ontology:
                await update_processing_status(job_id, {
                    "job_id": job_id,
                    "isProcessing": True,
                    "currentStep": "Generating ontology",
                    "progress": 2,
                    "totalSteps": 5
                })
                
                ontology_result = await generate_ontology_endpoint(request.doc_id, text_content)
                if not ontology_result["success"]:
                    raise Exception("Ontology generation failed")
                
                ontology_data = ontology_result["data"]
            else:
                ontology_data = {"entities": {}, "relations": []}
            
            # Step 3: Process entities
            if request.process_entities and ontology_data["entities"]:
                await update_processing_status(job_id, {
                    "job_id": job_id,
                    "isProcessing": True,
                    "currentStep": "Resolving entities",
                    "progress": 3,
                    "totalSteps": 5
                })
                
                # Flatten entities for resolution
                all_entities = []
                for entity_type, type_data in ontology_data["entities"].items():
                    all_entities.extend(type_data.get("items", []))
                
                if all_entities:
                    entity_result = await resolve_entities_endpoint(all_entities)
                    # Update ontology with resolved entities if needed
            
            # Step 4: Generate embeddings
            if request.process_embeddings:
                await update_processing_status(job_id, {
                    "job_id": job_id,
                    "isProcessing": True,
                    "currentStep": "Generating embeddings",
                    "progress": 4,
                    "totalSteps": 5
                })
                
                # Store document chunks
                await store_document_chunks_endpoint(text_content, request.doc_id)
                
                # Store entity embeddings
                if ontology_data["entities"]:
                    all_entities = []
                    for entity_type, type_data in ontology_data["entities"].items():
                        all_entities.extend(type_data.get("items", []))
                    
                    if all_entities:
                        await store_entity_embeddings_endpoint(all_entities, request.doc_id)
            
            # Step 5: Create graph
            if request.process_graph and ontology_data:
                await update_processing_status(job_id, {
                    "job_id": job_id,
                    "isProcessing": True,
                    "currentStep": "Building knowledge graph",
                    "progress": 5,
                    "totalSteps": 5
                })
                
                graph_result = await create_graph_from_ontology_endpoint(ontology_data, request.doc_id)
            
            # Complete
            await update_processing_status(job_id, {
                "job_id": job_id,
                "isProcessing": False,
                "currentStep": "Pipeline completed",
                "progress": 5,
                "totalSteps": 5
            })
            
            # Broadcast completion
            await broadcast_sse(SSEMessage(
                type="notification",
                data={
                    "level": "success",
                    "title": "Pipeline Complete",
                    "message": f"Document {request.doc_id} processed successfully"
                },
                timestamp=time.time()
            ))
            
        except Exception as e:
            await update_processing_status(job_id, {
                "job_id": job_id,
                "isProcessing": False,
                "currentStep": f"Error: {str(e)}",
                "progress": 0,
                "totalSteps": 5
            })
            
            await broadcast_sse(SSEMessage(
                type="notification",
                data={
                    "level": "error",
                    "title": "Pipeline Failed",
                    "message": f"Document processing failed: {str(e)}"
                },
                timestamp=time.time()
            ))
    
    # Start background processing
    background_tasks.add_task(process_pipeline)
    
    return {
        "success": True,
        "status_code": 202,
        "processing_ms": 0,
        "data": {
            "job_id": job_id,
            "status": "started",
            "message": "Document processing started in background"
        }
    }

# SSE endpoint for real-time updates
@app.get("/api/sse/progress")
async def sse_progress():
    """Server-Sent Events endpoint for real-time progress updates"""
    async def event_stream():
        import asyncio
        queue = asyncio.Queue()
        sse_connections.add(queue)
        
        try:
            # Send initial connection message
            yield f"data: {json.dumps({'type': 'connected', 'timestamp': time.time()})}\n\n"
            
            # Send periodic heartbeat and updates
            while True:
                try:
                    # Wait for message with timeout
                    message = await asyncio.wait_for(queue.get(), timeout=30.0)
                    yield message
                except asyncio.TimeoutError:
                    # Send heartbeat
                    yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': time.time()})}\n\n"
                    
        except Exception as e:
            print(f"SSE connection error: {e}")
        finally:
            sse_connections.discard(queue)
    
    return StreamingResponse(event_stream(), media_type="text/plain")

# Get processing job status
@app.get("/api/pipeline/status/{job_id}")
async def get_job_status(job_id: str):
    """Get processing job status"""
    if job_id in processing_jobs:
        return {
            "success": True,
            "status_code": 200,
            "processing_ms": 0,
            "data": processing_jobs[job_id]
        }
    else:
        return {
            "success": False,
            "status_code": 404,
            "processing_ms": 0,
            "error": "Job not found"
        }

# Core Modules endpoints
@app.get("/api/core-modules/dashboard")
async def get_core_modules_dashboard():
    """Get core modules dashboard data"""
    return await get_core_modules_dashboard_endpoint()

@app.get("/api/core-modules/{module_id}")
async def get_module_details(module_id: str):
    """Get detailed information about a specific module"""
    return await get_module_details_endpoint(module_id)

@app.post("/api/core-modules/{module_id}/execute")
async def execute_module(module_id: str, parameters: Dict[str, Any]):
    """Execute a specific module with given parameters"""
    return await execute_module_endpoint(module_id, parameters)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "processing_ms": 0,
            "error": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "status_code": 500,
            "processing_ms": 0,
            "error": f"Internal server error: {str(exc)}"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main_enhanced:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

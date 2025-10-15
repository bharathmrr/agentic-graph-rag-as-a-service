"""
Simple server startup script
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.api.routes.simple_upload_routes import router as upload_router

# Create FastAPI app
app = FastAPI(
    title="Agentic Graph RAG API",
    description="Document Intelligence API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "agentic-graph-rag-api",
            "version": "1.0.0"
        }
    )

# Root endpoint
@app.get("/")
async def root():
    return JSONResponse(
        status_code=200,
        content={
            "message": "Welcome to Agentic Graph RAG API",
            "docs": "/docs",
            "health": "/health"
        }
    )

# Include upload routes
app.include_router(upload_router, prefix="/api", tags=["Upload"])

# Add mock v2 endpoints to prevent frontend errors
@app.get("/api/v2/system/status")
async def system_status():
    return JSONResponse(
        status_code=200,
        content={
            "status": "online",
            "services": {
                "neo4j": "offline",
                "chromadb": "offline",
                "ollama": "offline"
            },
            "uptime": "00:05:30"
        }
    )

@app.get("/api/v2/embeddings/stats")
async def embeddings_stats():
    return JSONResponse(
        status_code=200,
        content={
            "total_embeddings": 0,
            "collections": 0,
            "avg_similarity": 0.0
        }
    )

@app.get("/api/v2/graph/statistics")
async def graph_statistics():
    return JSONResponse(
        status_code=200,
        content={
            "nodes": 0,
            "relationships": 0,
            "node_types": [],
            "relationship_types": []
        }
    )

@app.get("/api/v2/jobs/active")
async def active_jobs():
    return JSONResponse(
        status_code=200,
        content={
            "active_jobs": [],
            "total_active": 0
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "start_server:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

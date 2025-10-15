"""
Agentic Graph RAG as a Service - Main API Application (Fixed Version)
Production-ready FastAPI server with graceful error handling
"""

import os
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import structlog

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Setup basic logging first
logging = structlog.get_logger()

# Try to import utilities with fallbacks
try:
    from src.utils.config_loader import ConfigLoader
except ImportError:
    # Create a minimal config loader
    from dataclasses import dataclass
    
    @dataclass
    class ConfigLoader:
        api_host: str = "127.0.0.1"
        api_port: int = 8000
        debug: bool = True
        log_level: str = "info"
        neo4j_uri: str = "bolt://localhost:7687"
        neo4j_user: str = "neo4j"
        neo4j_password: str = "password"
        chroma_host: str = "localhost"
        chroma_port: int = 8000
        ollama_base_url: str = "http://localhost:11434"

try:
    from src.utils.logger import setup_logging
    logger = setup_logging()
except ImportError:
    logger = structlog.get_logger()

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events with graceful error handling.
    """
    logger.info("Starting Agentic Graph RAG API server...")

    # Startup: Initialize connections with error handling
    try:
        # Load configuration
        config = ConfigLoader()
        logger.info("Configuration loaded successfully")

        # Initialize services with graceful fallbacks
        services = {}
        
        # Try to initialize Ollama client
        try:
            import ollama
            ollama_client = ollama.Client(host=config.ollama_base_url)
            services['ollama'] = ollama_client
            logger.info("Ollama client initialized", base_url=config.ollama_base_url)
        except Exception as e:
            logger.warning("Ollama not available, continuing without it", error=str(e))
            services['ollama'] = None

        # Try to initialize Neo4j
        try:
            from neo4j import GraphDatabase
            neo4j_driver = GraphDatabase.driver(
                config.neo4j_uri,
                auth=(config.neo4j_user, config.neo4j_password)
            )
            services['neo4j'] = neo4j_driver
            logger.info("Neo4j driver initialized", uri=config.neo4j_uri)
        except Exception as e:
            logger.warning("Neo4j not available, continuing without it", error=str(e))
            services['neo4j'] = None

        # Try to initialize ChromaDB
        try:
            import chromadb
            chroma_client = chromadb.HttpClient(host=config.chroma_host, port=config.chroma_port)
            services['chromadb'] = chroma_client
            logger.info("ChromaDB client initialized", host=config.chroma_host, port=config.chroma_port)
        except Exception as e:
            logger.warning("ChromaDB not available, continuing without it", error=str(e))
            services['chromadb'] = None

        # Store in app state
        app.state.config = config
        app.state.services = services

        yield

    except Exception as e:
        logger.error("Failed to initialize services", error=str(e))
        # Don't raise - continue with limited functionality
        yield

    finally:
        # Shutdown: Close connections
        logger.info("Shutting down Agentic Graph RAG API server...")
        if hasattr(app.state, 'services') and app.state.services.get('neo4j'):
            app.state.services['neo4j'].close()
        logger.info("Connections closed")


# Create FastAPI application
app = FastAPI(
    title="Agentic Graph RAG as a Service",
    description="An extensible, production-grade Agentic Graph RAG platform with hybrid retrieval capabilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
if os.getenv("ENVIRONMENT") == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["your-domain.com", "*.your-domain.com"]
    )

@app.get("/health")
async def health_check(request: Request) -> JSONResponse:
    """Health check endpoint for load balancers and monitoring."""
    services_status = {}
    
    if hasattr(request.app.state, 'services'):
        for service_name, service in request.app.state.services.items():
            services_status[service_name] = "available" if service else "unavailable"
    
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "agentic-graph-rag-api",
            "version": "1.0.0",
            "services": services_status,
            "message": "Server is running with available services"
        }
    )

@app.get("/")
async def root() -> JSONResponse:
    """Root endpoint with API information."""
    return JSONResponse(
        status_code=200,
        content={
            "message": "Welcome to Agentic Graph RAG as a Service",
            "docs": "/docs",
            "health": "/health",
            "version": "1.0.0",
            "status": "Server is running - check /health for service status"
        }
    )

@app.get("/api/status")
async def api_status(request: Request) -> JSONResponse:
    """Detailed API status endpoint."""
    services_detail = {}
    
    if hasattr(request.app.state, 'services'):
        for service_name, service in request.app.state.services.items():
            services_detail[service_name] = {
                "status": "available" if service else "unavailable",
                "type": type(service).__name__ if service else "None"
            }
    
    return JSONResponse(
        status_code=200,
        content={
            "api_status": "running",
            "services": services_detail,
            "available_endpoints": [
                "/health",
                "/docs",
                "/api/status"
            ]
        }
    )

# Try to include basic routes with error handling
def include_routes_safely():
    """Include routes with graceful error handling"""
    
    # Try to include basic routes
    try:
        from src.api.routes import ingestion_routes
        app.include_router(
            ingestion_routes.router,
            prefix="/api/ingest",
            tags=["Ingestion"]
        )
        logger.info("Ingestion routes loaded successfully")
    except ImportError as e:
        logger.warning("Ingestion routes not available", error=str(e))

    try:
        from src.api.routes import retrieval_routes
        app.include_router(
            retrieval_routes.router,
            prefix="/api/query",
            tags=["Retrieval"]
        )
        logger.info("Retrieval routes loaded successfully")
    except ImportError as e:
        logger.warning("Retrieval routes not available", error=str(e))

    try:
        from src.api.routes import ontology_routes
        app.include_router(
            ontology_routes.router,
            prefix="/api/ontology",
            tags=["Ontology"]
        )
        logger.info("Ontology routes loaded successfully")
    except ImportError as e:
        logger.warning("Ontology routes not available", error=str(e))

    # Try enhanced routes
    try:
        from src.api.routes import comprehensive_api_routes
        app.include_router(
            comprehensive_api_routes.router,
            prefix="/api/v2",
            tags=["Enhanced API v2"]
        )
        logger.info("Enhanced API routes loaded successfully")
    except ImportError as e:
        logger.warning("Enhanced API routes not available", error=str(e))

    # Try backend routes (optional)
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
        from backend.routes import enhanced_processing_routes
        app.include_router(
            enhanced_processing_routes.router,
            tags=["Enhanced Processing"]
        )
        logger.info("Enhanced processing routes loaded successfully")
    except ImportError as e:
        logger.warning("Enhanced processing routes not available", error=str(e))
    
    # Try Neo4j upload routes
    try:
        from backend.routes import neo4j_upload_routes
        app.include_router(
            neo4j_upload_routes.router,
            prefix="/api/neo4j",
            tags=["Neo4j Data Pipeline"]
        )
        logger.info("Neo4j upload routes loaded successfully")
    except ImportError as e:
        logger.warning("Neo4j upload routes not available", error=str(e))

# Include routes
include_routes_safely()

if __name__ == "__main__":
    import uvicorn

    # Get configuration
    config = ConfigLoader()

    print("🚀 Starting Agentic Graph RAG API Server (Fixed Version)...")
    print(f"📡 Server: http://{config.api_host}:{config.api_port}")
    print(f"📚 Docs: http://{config.api_host}:{config.api_port}/docs")
    print(f"🔧 Debug: {config.debug}")
    print("=" * 50)

    uvicorn.run(
        app,
        host=config.api_host,
        port=config.api_port,
        reload=config.debug,
        log_level=config.log_level.lower(),
        access_log=True
    )

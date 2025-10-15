"""
Agentic Graph RAG as a Service - Main API Application
Production-ready FastAPI server with hybrid RAG capabilities
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import structlog

import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

try:
    from src.api.routes import ingestion_routes, retrieval_routes, ontology_routes, simple_upload_routes
    from src.utils.config_loader import ConfigLoader
    from src.utils.logger import setup_logging
except ImportError:
    # Fallback to relative imports
    from .routes import ingestion_routes, retrieval_routes, ontology_routes, simple_upload_routes
    from ..utils.config_loader import ConfigLoader
    from ..utils.logger import setup_logging

# Setup structured logging
logger = setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Lifespan context manager for FastAPI application.
    Handles startup and shutdown events.
    """
    logger.info("Starting Agentic Graph RAG API server...")

    # Startup: Initialize connections, load models, etc.
    try:
        # Load configuration
        config = ConfigLoader()
        logger.info("Configuration loaded successfully")

        # Initialize Ollama client
        from ollama import Client
        try:
            ollama_client = Client(host=config.ollama_base_url)
            logger.info("Ollama client initialized", base_url=config.ollama_base_url)
        except Exception as e:
            logger.warning("Ollama not available, continuing without it", error=str(e))
            ollama_client = None

        # Initialize graph database connection
        from neo4j import GraphDatabase
        try:
            neo4j_driver = GraphDatabase.driver(
                config.neo4j_uri,
                auth=(config.neo4j_user, config.neo4j_password)
            )
            logger.info("Neo4j driver initialized", uri=config.neo4j_uri)
        except Exception as e:
            logger.warning("Neo4j not available, continuing without it", error=str(e))
            neo4j_driver = None

        # Initialize vector database
        import chromadb
        try:
            chroma_client = chromadb.HttpClient(host=config.chroma_host, port=config.chroma_port)
            logger.info("ChromaDB client initialized", host=config.chroma_host, port=config.chroma_port)
        except Exception as e:
            logger.warning("ChromaDB not available, continuing without it", error=str(e))
            chroma_client = None

        # Store connections in app state for routes to access
        app.state.config = config
        app.state.ollama_client = ollama_client
        app.state.neo4j_driver = neo4j_driver
        app.state.chroma_client = chroma_client

        yield

    except Exception as e:
        logger.error("Failed to initialize services", error=str(e))
        raise

    finally:
        # Shutdown: Close connections
        logger.info("Shutting down Agentic Graph RAG API server...")
        if hasattr(app.state, 'neo4j_driver'):
            app.state.neo4j_driver.close()
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
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
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
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "agentic-graph-rag-api",
            "version": "1.0.0",
            "timestamp": str(request.state.config.now) if hasattr(request.state, 'config') else None
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
            "version": "1.0.0"
        }
    )


# Include API routes
app.include_router(
    ingestion_routes.router,
    prefix="/api/ingest",
    tags=["Ingestion"]
)

app.include_router(
    retrieval_routes.router,
    prefix="/api/query",
    tags=["Retrieval"]
)

app.include_router(
    ontology_routes.router,
    prefix="/api/ontology",
    tags=["Ontology"]
)

# Include Chatbot and Enhanced File Processing routes (Steps 10-12)
try:
    from src.api.routes import chatbot_routes
    app.include_router(
        chatbot_routes.router,
        prefix="/api",
        tags=["Chatbot & Files"]
    )
    logger.info("Chatbot & File routes loaded successfully")
except ImportError as e:
    logger.warning("Chatbot & File routes not available", error=str(e))

app.include_router(
    simple_upload_routes.router,
    prefix="/api",
    tags=["Upload"]
)

# Include comprehensive enhanced routes
try:
    from src.api.routes import comprehensive_api_routes
    app.include_router(
        comprehensive_api_routes.router,
        prefix="/api/v2",
        tags=["Enhanced API v2"]
    )
except ImportError:
    try:
        from .routes import comprehensive_api_routes
        app.include_router(
            comprehensive_api_routes.router,
            prefix="/api/v2",
            tags=["Enhanced API v2"]
        )
    except ImportError:
        logger.warning("Comprehensive API routes not available")

# Include progress streaming routes
try:
    from src.api.routes import progress_streaming
    app.include_router(
        progress_streaming.router,
        prefix="/api/v2",
        tags=["Progress Streaming"]
    )
except ImportError:
    try:
        from .routes import progress_streaming
        app.include_router(
            progress_streaming.router,
            prefix="/api/v2",
            tags=["Progress Streaming"]
        )
    except ImportError:
        logger.warning("Progress streaming routes not available")

# Include Groq integration routes
try:
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
    from backend.routes import groq_routes
    app.include_router(
        groq_routes.router,
        tags=["Groq Integration"]
    )
    logger.info("Groq routes loaded successfully")
except ImportError as e:
    logger.warning("Groq routes not available", error=str(e))

# Include Enhanced Processing routes
try:
    from backend.routes import enhanced_processing_routes
    app.include_router(
        enhanced_processing_routes.router,
        tags=["Enhanced Processing"]
    )
    logger.info("Enhanced processing routes loaded successfully")
except ImportError as e:
    logger.warning("Enhanced processing routes not available", error=str(e))


if __name__ == "__main__":
    import uvicorn

    # Get configuration
    config = ConfigLoader()

    uvicorn.run(
        "src.api.main:app",
        host=config.api_host,
        port=config.api_port,
        reload=config.debug,
        log_level=config.log_level.lower(),
        access_log=True
    )

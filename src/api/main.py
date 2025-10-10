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

from src.api.routes import ingestion_routes, retrieval_routes, ontology_routes
from src.utils.config_loader import ConfigLoader
from src.utils.logger import setup_logging

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

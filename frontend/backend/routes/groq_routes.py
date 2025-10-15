"""
Groq API Routes for Agentic Graph RAG
Provides endpoints for Groq-powered LLM and RAG functionality
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio
import json
from datetime import datetime

from ..services.groq_integration import (
    GroqRAGService, 
    create_groq_rag_service,
    EntityExtractionResult,
    RAGResponse
)

router = APIRouter(prefix="/api/groq", tags=["groq"])

# Global service instance (in production, use dependency injection)
groq_service: Optional[GroqRAGService] = None

# Pydantic models for request/response
class DocumentsRequest(BaseModel):
    documents: List[str] = Field(..., description="List of document texts to index")
    
class EntityExtractionRequest(BaseModel):
    text: str = Field(..., description="Text to extract entities from")
    
class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="Query for RAG system")
    include_entities: bool = Field(default=True, description="Whether to extract entities from response")
    stream: bool = Field(default=False, description="Whether to stream the response")
    
class SimilarEntitiesRequest(BaseModel):
    entity_text: str = Field(..., description="Entity text to find similar entities for")
    top_k: int = Field(default=5, description="Number of similar entities to return")

class GroqConfigRequest(BaseModel):
    api_key: Optional[str] = Field(None, description="Groq API key (optional if set in env)")
    model: str = Field(default="llama3-8b-8192", description="Groq model to use")
    embedding_model: str = Field(default="BAAI/bge-small-en-v1.5", description="HuggingFace embedding model")
    chunk_size: int = Field(default=512, description="Text chunk size")
    chunk_overlap: int = Field(default=20, description="Chunk overlap size")
    similarity_threshold: float = Field(default=0.7, description="Similarity threshold for retrieval")

# Dependency to get or create Groq service
async def get_groq_service() -> GroqRAGService:
    global groq_service
    if groq_service is None:
        try:
            groq_service = create_groq_rag_service()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize Groq service: {str(e)}")
    return groq_service

@router.post("/initialize")
async def initialize_groq_service(config: GroqConfigRequest):
    """Initialize or reconfigure the Groq service"""
    try:
        global groq_service
        
        from ..services.groq_integration import GroqConfig, GroqRAGService
        
        groq_config = GroqConfig(
            api_key=config.api_key or "",
            model=config.model,
            embedding_model=config.embedding_model,
            chunk_size=config.chunk_size,
            chunk_overlap=config.chunk_overlap,
            similarity_threshold=config.similarity_threshold
        )
        
        groq_service = GroqRAGService(groq_config)
        
        return {
            "success": True,
            "message": "Groq service initialized successfully",
            "config": {
                "model": config.model,
                "embedding_model": config.embedding_model,
                "chunk_size": config.chunk_size
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Groq service: {str(e)}")

@router.get("/status")
async def get_groq_status():
    """Get the status of the Groq service"""
    try:
        global groq_service
        
        if groq_service is None:
            return {
                "initialized": False,
                "message": "Groq service not initialized",
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "initialized": True,
            "model": groq_service.config.model,
            "embedding_model": groq_service.config.embedding_model,
            "has_index": groq_service.index is not None,
            "message": "Groq service is ready",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "initialized": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/index/create")
async def create_document_index(
    request: DocumentsRequest,
    service: GroqRAGService = Depends(get_groq_service)
):
    """Create vector index from documents"""
    try:
        start_time = datetime.now()
        
        success = await service.create_index_from_documents(request.documents)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to create document index")
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "message": f"Created index from {len(request.documents)} documents",
            "document_count": len(request.documents),
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating index: {str(e)}")

@router.post("/entities/extract")
async def extract_entities(
    request: EntityExtractionRequest,
    service: GroqRAGService = Depends(get_groq_service)
):
    """Extract entities from text using Groq LLM"""
    try:
        result = await service.extract_entities_with_groq(request.text)
        
        return {
            "success": True,
            "entities": result.entities,
            "relationships": result.relationships,
            "confidence_score": result.confidence_score,
            "processing_time": result.processing_time,
            "entity_count": len(result.entities),
            "relationship_count": len(result.relationships),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting entities: {str(e)}")

@router.post("/entities/similar")
async def find_similar_entities(
    request: SimilarEntitiesRequest,
    service: GroqRAGService = Depends(get_groq_service)
):
    """Find entities similar to the given entity"""
    try:
        similar_entities = await service.find_similar_entities(
            request.entity_text, 
            request.top_k
        )
        
        return {
            "success": True,
            "query_entity": request.entity_text,
            "similar_entities": similar_entities,
            "count": len(similar_entities),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding similar entities: {str(e)}")

@router.post("/rag/query")
async def rag_query(
    request: RAGQueryRequest,
    service: GroqRAGService = Depends(get_groq_service)
):
    """Perform RAG query with Groq LLM"""
    try:
        if request.stream:
            # Return streaming response
            async def generate_stream():
                async for chunk in service.stream_rag_response(request.query):
                    yield f"data: {json.dumps(chunk)}\n\n"
                yield "data: [DONE]\n\n"
            
            return StreamingResponse(
                generate_stream(),
                media_type="text/plain",
                headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
            )
        else:
            # Return complete response
            result = await service.query_with_rag(request.query, request.include_entities)
            
            return {
                "success": True,
                "query": request.query,
                "answer": result.answer,
                "source_nodes": result.source_nodes,
                "entities_found": result.entities_found,
                "confidence_score": result.confidence_score,
                "processing_time": result.processing_time,
                "reasoning_steps": result.reasoning_steps,
                "timestamp": datetime.now().isoformat()
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in RAG query: {str(e)}")

@router.post("/rag/stream")
async def rag_query_stream(
    request: RAGQueryRequest,
    service: GroqRAGService = Depends(get_groq_service)
):
    """Stream RAG query response"""
    try:
        async def generate_stream():
            try:
                async for chunk in service.stream_rag_response(request.query):
                    yield f"data: {json.dumps(chunk)}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                error_chunk = {"type": "error", "message": str(e)}
                yield f"data: {json.dumps(error_chunk)}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in streaming RAG query: {str(e)}")

@router.post("/chat/agentic")
async def agentic_chat(
    request: RAGQueryRequest,
    service: GroqRAGService = Depends(get_groq_service)
):
    """Enhanced agentic chat with entity finding and RAG"""
    try:
        start_time = datetime.now()
        
        # Step 1: Extract entities from the query
        query_entities = await service.extract_entities_with_groq(request.query)
        
        # Step 2: Find similar entities in the knowledge base
        similar_entities = []
        for entity in query_entities.entities:
            similar = await service.find_similar_entities(entity["text"], top_k=3)
            similar_entities.extend(similar)
        
        # Step 3: Perform RAG query
        rag_result = await service.query_with_rag(request.query, include_entities=True)
        
        # Step 4: Combine results for enhanced response
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "success": True,
            "query": request.query,
            "answer": rag_result.answer,
            "query_entities": query_entities.entities,
            "similar_entities": similar_entities[:10],  # Limit to top 10
            "response_entities": rag_result.entities_found,
            "source_nodes": rag_result.source_nodes,
            "confidence_score": rag_result.confidence_score,
            "reasoning_steps": rag_result.reasoning_steps + [
                f"🔍 Found {len(query_entities.entities)} entities in query",
                f"🔗 Discovered {len(similar_entities)} similar entities",
                f"📊 Overall confidence: {rag_result.confidence_score:.2f}"
            ],
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in agentic chat: {str(e)}")

@router.get("/models/available")
async def get_available_models():
    """Get list of available Groq models"""
    return {
        "groq_models": [
            {
                "id": "llama3-8b-8192",
                "name": "Llama 3 8B",
                "description": "Fast and efficient 8B parameter model",
                "context_length": 8192,
                "recommended": True
            },
            {
                "id": "llama3-70b-8192", 
                "name": "Llama 3 70B",
                "description": "High-quality 70B parameter model",
                "context_length": 8192,
                "recommended": False
            },
            {
                "id": "mixtral-8x7b-32768",
                "name": "Mixtral 8x7B",
                "description": "Mixture of experts model with large context",
                "context_length": 32768,
                "recommended": True
            }
        ],
        "embedding_models": [
            {
                "id": "BAAI/bge-small-en-v1.5",
                "name": "BGE Small English",
                "description": "Compact and fast embedding model",
                "dimensions": 384,
                "recommended": True
            },
            {
                "id": "BAAI/bge-base-en-v1.5",
                "name": "BGE Base English", 
                "description": "Balanced performance embedding model",
                "dimensions": 768,
                "recommended": True
            },
            {
                "id": "sentence-transformers/all-MiniLM-L6-v2",
                "name": "MiniLM L6 v2",
                "description": "Fast and lightweight sentence transformer",
                "dimensions": 384,
                "recommended": False
            }
        ],
        "timestamp": datetime.now().isoformat()
    }

@router.delete("/index/clear")
async def clear_index(service: GroqRAGService = Depends(get_groq_service)):
    """Clear the current document index"""
    try:
        service.index = None
        service.query_engine = None
        
        return {
            "success": True,
            "message": "Document index cleared successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing index: {str(e)}")

# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check for Groq integration"""
    try:
        global groq_service
        
        status = {
            "service": "groq_integration",
            "status": "healthy" if groq_service else "not_initialized",
            "timestamp": datetime.now().isoformat()
        }
        
        if groq_service:
            status.update({
                "model": groq_service.config.model,
                "has_index": groq_service.index is not None,
                "embedding_model": groq_service.config.embedding_model
            })
        
        return status
        
    except Exception as e:
        return {
            "service": "groq_integration", 
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

"""
Comprehensive API routes integrating all enhanced components
Provides unified endpoints for the complete Agentic Graph RAG system
"""

import uuid
import time
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Request, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
import structlog

from src.ingestion.enhanced_ontology_generator import EnhancedOntologyGenerator
from src.ingestion.enhanced_entity_resolution import EnhancedEntityResolution
from src.ingestion.enhanced_chromadb_integration import EnhancedChromaDBIntegration
from src.ingestion.enhanced_graph_constructor import EnhancedGraphConstructor
from src.retrieval.enhanced_agentic_retrieval import EnhancedAgenticRetrieval, RetrievalStrategy
from src.retrieval.enhanced_reasoning_stream import EnhancedReasoningStream
from src.utils.logger import get_logger

logger = get_logger("comprehensive_api_routes")

router = APIRouter()

# Response wrapper for consistent API responses
class APIResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool
    status_code: int
    processing_time_ms: float
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    warnings: List[str] = []
    job_id: Optional[str] = None


# Request models
class OntologyGenerationRequest(BaseModel):
    """Request model for ontology generation."""
    text: str = Field(..., description="Text content to process")
    doc_id: Optional[str] = Field(None, description="Document ID")
    use_spacy: bool = Field(True, description="Use spaCy for NLP preprocessing")


class EntityResolutionRequest(BaseModel):
    """Request model for entity resolution."""
    entities: List[Dict[str, Any]] = Field(..., description="List of entities to resolve")
    similarity_threshold: float = Field(0.8, description="Similarity threshold for clustering")


class EmbeddingRequest(BaseModel):
    """Request model for embedding generation."""
    text: str = Field(..., description="Text to embed")
    doc_id: str = Field(..., description="Document ID")
    chunk_size: int = Field(500, description="Chunk size for splitting")


class SemanticSearchRequest(BaseModel):
    """Request model for semantic search."""
    query: str = Field(..., description="Search query")
    n_results: int = Field(10, description="Number of results to return")
    entity_type_filter: Optional[str] = Field(None, description="Filter by entity type")
    min_score: float = Field(0.0, description="Minimum similarity score")


class RetrievalRequest(BaseModel):
    """Request model for agentic retrieval."""
    query: str = Field(..., description="Query text")
    strategy: Optional[str] = Field(None, description="Retrieval strategy")
    max_results: int = Field(10, description="Maximum results to return")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")


class ReasoningRequest(BaseModel):
    """Request model for reasoning stream."""
    query: str = Field(..., description="Query for reasoning")
    conversation_id: Optional[str] = Field(None, description="Conversation ID")
    stream_response: bool = Field(False, description="Stream the response")


# Dependency injection helpers
async def get_ontology_generator(request: Request) -> EnhancedOntologyGenerator:
    """Get ontology generator instance."""
    return EnhancedOntologyGenerator(
        openai_client=getattr(request.app.state, 'openai_client', None),
        ollama_client=getattr(request.app.state, 'ollama_client', None)
    )


async def get_entity_resolver(request: Request) -> EnhancedEntityResolution:
    """Get entity resolution instance."""
    return EnhancedEntityResolution()


async def get_chromadb_integration(request: Request) -> EnhancedChromaDBIntegration:
    """Get ChromaDB integration instance."""
    return EnhancedChromaDBIntegration(
        chroma_client=getattr(request.app.state, 'chroma_client', None)
    )


async def get_graph_constructor(request: Request) -> EnhancedGraphConstructor:
    """Get graph constructor instance."""
    return EnhancedGraphConstructor(
        neo4j_driver=getattr(request.app.state, 'neo4j_driver', None)
    )


async def get_agentic_retrieval(request: Request) -> EnhancedAgenticRetrieval:
    """Get agentic retrieval instance."""
    return EnhancedAgenticRetrieval(
        chroma_client=getattr(request.app.state, 'chroma_client', None),
        neo4j_driver=getattr(request.app.state, 'neo4j_driver', None)
    )


async def get_reasoning_stream(request: Request) -> EnhancedReasoningStream:
    """Get reasoning stream instance."""
    retrieval_system = await get_agentic_retrieval(request)
    return EnhancedReasoningStream(
        retrieval_system=retrieval_system,
        llm_client=getattr(request.app.state, 'openai_client', None) or 
                   getattr(request.app.state, 'ollama_client', None)
    )


def create_api_response(success: bool, 
                       data: Optional[Dict[str, Any]] = None,
                       error: Optional[str] = None,
                       processing_time_ms: float = 0.0,
                       warnings: List[str] = None,
                       job_id: Optional[str] = None) -> APIResponse:
    """Create standardized API response."""
    return APIResponse(
        success=success,
        status_code=200 if success else 500,
        processing_time_ms=processing_time_ms,
        data=data,
        error=error,
        warnings=warnings or [],
        job_id=job_id
    )


# ONTOLOGY GENERATION ENDPOINTS
@router.post("/ontology/generate", response_model=APIResponse)
async def generate_ontology(
    request: OntologyGenerationRequest,
    ontology_generator: EnhancedOntologyGenerator = Depends(get_ontology_generator)
) -> APIResponse:
    """Generate hierarchical ontology from text."""
    
    start_time = time.time()
    
    try:
        doc_id = request.doc_id or str(uuid.uuid4())
        
        ontology = await ontology_generator.generate_hierarchical_ontology(
            text=request.text,
            doc_id=doc_id
        )
        
        # Get additional statistics
        statistics = ontology_generator.get_entity_statistics(ontology)
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data={
                "ontology": ontology,
                "statistics": statistics,
                "doc_id": doc_id
            },
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Ontology generation failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


# ENTITY RESOLUTION ENDPOINTS
@router.post("/entity-resolution/detect-duplicates", response_model=APIResponse)
async def detect_duplicate_entities(
    request: EntityResolutionRequest,
    entity_resolver: EnhancedEntityResolution = Depends(get_entity_resolver)
) -> APIResponse:
    """Detect and resolve duplicate entities."""
    
    start_time = time.time()
    
    try:
        # Update similarity threshold if provided
        entity_resolver.similarity_threshold = request.similarity_threshold
        
        resolution_result = await entity_resolver.detect_duplicates(request.entities)
        
        # Get resolution statistics
        statistics = entity_resolver.get_resolution_statistics(resolution_result)
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data={
                "resolution_result": resolution_result,
                "statistics": statistics
            },
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Entity resolution failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


# EMBEDDING GENERATION ENDPOINTS
@router.post("/embeddings/store", response_model=APIResponse)
async def store_embeddings(
    request: EmbeddingRequest,
    chromadb_integration: EnhancedChromaDBIntegration = Depends(get_chromadb_integration)
) -> APIResponse:
    """Generate and store embeddings for text."""
    
    start_time = time.time()
    
    try:
        # Create document chunks
        chunks = chromadb_integration.chunk_document(request.text, request.doc_id)
        
        # Generate embeddings
        chunks_with_embeddings = await chromadb_integration.generate_embeddings_batch(chunks)
        
        # Store embeddings
        store_result = await chromadb_integration.store_embeddings(chunks_with_embeddings)
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data={
                "store_result": store_result,
                "chunks_created": len(chunks),
                "doc_id": request.doc_id
            },
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Embedding storage failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


@router.post("/embeddings/search", response_model=APIResponse)
async def semantic_search(
    request: SemanticSearchRequest,
    chromadb_integration: EnhancedChromaDBIntegration = Depends(get_chromadb_integration)
) -> APIResponse:
    """Perform semantic search using embeddings."""
    
    start_time = time.time()
    
    try:
        search_result = await chromadb_integration.semantic_search(
            query=request.query,
            n_results=request.n_results,
            entity_type_filter=request.entity_type_filter,
            min_score=request.min_score
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data=search_result,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


# GRAPH CONSTRUCTION ENDPOINTS
@router.post("/graph/build-from-ontology", response_model=APIResponse)
async def build_graph_from_ontology(
    ontology: Dict[str, Any],
    graph_constructor: EnhancedGraphConstructor = Depends(get_graph_constructor)
) -> APIResponse:
    """Build knowledge graph from ontology."""
    
    start_time = time.time()
    
    try:
        graph_data = await graph_constructor.build_graph_from_ontology(ontology)
        
        # Get graph statistics
        statistics = graph_constructor.get_graph_statistics()
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data={
                "graph": graph_data,
                "statistics": statistics
            },
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Graph construction failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


@router.get("/graph/neo4j-visualization", response_model=APIResponse)
async def get_neo4j_visualization(
    limit: int = 100,
    graph_constructor: EnhancedGraphConstructor = Depends(get_graph_constructor)
) -> APIResponse:
    """Get graph visualization data from Neo4j."""
    
    start_time = time.time()
    
    try:
        visualization_data = await graph_constructor.get_neo4j_visualization_data(limit)
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data=visualization_data,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Neo4j visualization failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


@router.get("/graph/subgraph/{entity_id}", response_model=APIResponse)
async def get_entity_subgraph(
    entity_id: str,
    depth: int = 2,
    graph_constructor: EnhancedGraphConstructor = Depends(get_graph_constructor)
) -> APIResponse:
    """Get subgraph centered on specific entity."""
    
    start_time = time.time()
    
    try:
        subgraph_data = await graph_constructor.get_entity_subgraph(entity_id, depth)
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data=subgraph_data,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Subgraph retrieval failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


# AGENTIC RETRIEVAL ENDPOINTS
@router.post("/retrieval/query", response_model=APIResponse)
async def agentic_retrieval_query(
    request: RetrievalRequest,
    agentic_retrieval: EnhancedAgenticRetrieval = Depends(get_agentic_retrieval)
) -> APIResponse:
    """Perform agentic retrieval with intelligent routing."""
    
    start_time = time.time()
    
    try:
        # Parse strategy if provided
        strategy = None
        if request.strategy:
            try:
                strategy = RetrievalStrategy(request.strategy)
            except ValueError:
                return create_api_response(
                    success=False,
                    error=f"Invalid strategy: {request.strategy}",
                    processing_time_ms=(time.time() - start_time) * 1000
                )
        
        retrieval_response = await agentic_retrieval.retrieve(
            query_text=request.query,
            strategy=strategy,
            max_results=request.max_results,
            context={"conversation_id": request.conversation_id} if request.conversation_id else None
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data={
                "retrieval_response": {
                    "query_id": retrieval_response.query_id,
                    "strategy_used": retrieval_response.strategy_used,
                    "results": [
                        {
                            "id": r.id,
                            "content": r.content,
                            "score": r.score,
                            "source_type": r.source_type,
                            "metadata": r.metadata,
                            "reasoning": r.reasoning
                        }
                        for r in retrieval_response.results
                    ],
                    "reasoning_chain": retrieval_response.reasoning_chain,
                    "total_results": retrieval_response.total_results,
                    "confidence_score": retrieval_response.confidence_score
                }
            },
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Agentic retrieval failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


# REASONING STREAM ENDPOINTS
@router.post("/reasoning/query", response_model=APIResponse)
async def reasoning_stream_query(
    request: ReasoningRequest,
    reasoning_stream: EnhancedReasoningStream = Depends(get_reasoning_stream)
) -> APIResponse:
    """Process query through reasoning stream."""
    
    start_time = time.time()
    
    try:
        rag_response = await reasoning_stream.process_query(
            query=request.query,
            conversation_id=request.conversation_id,
            stream_response=request.stream_response
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data={
                "rag_response": {
                    "response_id": rag_response.response_id,
                    "query": rag_response.query,
                    "answer": rag_response.answer,
                    "supporting_evidence": rag_response.supporting_evidence,
                    "reasoning_steps": [
                        {
                            "step_id": step.step_id,
                            "step_type": step.step_type,
                            "description": step.description,
                            "confidence": step.confidence,
                            "processing_time_ms": step.processing_time_ms
                        }
                        for step in rag_response.reasoning_steps
                    ],
                    "confidence_score": rag_response.confidence_score,
                    "sources_used": rag_response.sources_used,
                    "conversation_id": rag_response.conversation_id
                }
            },
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Reasoning stream failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


@router.get("/reasoning/stream/{query}")
async def stream_reasoning_response(
    query: str,
    conversation_id: Optional[str] = None,
    reasoning_stream: EnhancedReasoningStream = Depends(get_reasoning_stream)
):
    """Stream reasoning response in real-time."""
    
    async def generate_stream():
        try:
            async for chunk in reasoning_stream.stream_response(query, conversation_id):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/reasoning/conversation/{conversation_id}", response_model=APIResponse)
async def get_conversation_history(
    conversation_id: str,
    reasoning_stream: EnhancedReasoningStream = Depends(get_reasoning_stream)
) -> APIResponse:
    """Get conversation history and summary."""
    
    start_time = time.time()
    
    try:
        history = reasoning_stream.get_conversation_history(conversation_id)
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data=history,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"Failed to get conversation history: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )


# COMPREHENSIVE PIPELINE ENDPOINT
@router.post("/pipeline/process-document", response_model=APIResponse)
async def process_document_pipeline(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    request: Request = None
) -> APIResponse:
    """Process document through complete pipeline."""
    
    start_time = time.time()
    job_id = str(uuid.uuid4())
    
    try:
        # Read file content
        content = await file.read()
        text = content.decode('utf-8', errors='ignore')
        doc_id = str(uuid.uuid4())
        
        # Get component instances
        ontology_generator = await get_ontology_generator(request)
        entity_resolver = await get_entity_resolver(request)
        chromadb_integration = await get_chromadb_integration(request)
        graph_constructor = await get_graph_constructor(request)
        
        # Step 1: Generate ontology
        ontology = await ontology_generator.generate_hierarchical_ontology(text, doc_id)
        
        # Step 2: Resolve entities
        entities_list = []
        for entity_type, type_data in ontology.get("entities", {}).items():
            entities_list.extend(type_data.get("items", []))
        
        resolution_result = await entity_resolver.detect_duplicates(entities_list)
        
        # Step 3: Generate and store embeddings
        chunks = chromadb_integration.chunk_document(text, doc_id)
        chunks_with_embeddings = await chromadb_integration.generate_embeddings_batch(chunks)
        store_result = await chromadb_integration.store_embeddings(chunks_with_embeddings)
        
        # Step 4: Build graph
        graph_data = await graph_constructor.build_graph_from_ontology(ontology)
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data={
                "doc_id": doc_id,
                "ontology": ontology,
                "entity_resolution": resolution_result,
                "embeddings": store_result,
                "graph": graph_data,
                "pipeline_stats": {
                    "entities_extracted": len(entities_list),
                    "chunks_created": len(chunks),
                    "embeddings_stored": store_result.get("stored", 0),
                    "graph_nodes": len(graph_data.get("nodes", [])),
                    "graph_edges": len(graph_data.get("edges", []))
                }
            },
            processing_time_ms=processing_time,
            job_id=job_id
        )
        
    except Exception as e:
        logger.error(f"Document pipeline failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time,
            job_id=job_id
        )


# SYSTEM STATUS ENDPOINTS
@router.get("/system/status", response_model=APIResponse)
async def get_system_status(request: Request) -> APIResponse:
    """Get comprehensive system status."""
    
    start_time = time.time()
    
    try:
        # Check component availability
        status = {
            "neo4j_available": hasattr(request.app.state, 'neo4j_driver') and request.app.state.neo4j_driver is not None,
            "chromadb_available": hasattr(request.app.state, 'chroma_client') and request.app.state.chroma_client is not None,
            "openai_available": hasattr(request.app.state, 'openai_client') and request.app.state.openai_client is not None,
            "ollama_available": hasattr(request.app.state, 'ollama_client') and request.app.state.ollama_client is not None,
            "system_time": datetime.now().isoformat(),
            "uptime": "N/A"  # Would need to track startup time
        }
        
        # Get component statistics if available
        if status["chromadb_available"]:
            chromadb_integration = await get_chromadb_integration(request)
            status["chromadb_stats"] = chromadb_integration.get_collection_stats()
        
        if status["neo4j_available"]:
            graph_constructor = await get_graph_constructor(request)
            status["graph_stats"] = graph_constructor.get_graph_statistics()
        
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=True,
            data=status,
            processing_time_ms=processing_time
        )
        
    except Exception as e:
        logger.error(f"System status check failed: {e}")
        processing_time = (time.time() - start_time) * 1000
        
        return create_api_response(
            success=False,
            error=str(e),
            processing_time_ms=processing_time
        )

"""
Enhanced Reasoning Stream API for RAG chatbot with multi-modal retrieval
"""
import time
import uuid
import json
from typing import Dict, Any, List, Optional, AsyncGenerator
from pydantic import BaseModel
from openai import OpenAI
import asyncio
from datetime import datetime

class RetrievedSource(BaseModel):
    source_type: str  # "entity", "chunk", "relation"
    source_id: str
    content: str
    score: float
    metadata: Dict[str, Any]

class ReasoningStep(BaseModel):
    step_id: str
    step_type: str  # "retrieval", "analysis", "synthesis", "response"
    description: str
    sources_used: List[str]
    confidence: float
    processing_time_ms: int

class ConversationMessage(BaseModel):
    message_id: str
    role: str  # "user", "assistant", "system"
    content: str
    timestamp: str
    sources: List[RetrievedSource] = []
    reasoning_steps: List[ReasoningStep] = []

class ReasoningResponse(BaseModel):
    success: bool
    status_code: int
    processing_ms: int
    data: Optional[Dict[str, Any]] = None
    warnings: List[str] = []
    error: Optional[str] = None

class EnhancedReasoningStream:
    def __init__(self):
        self.client = OpenAI()
        
        # Conversation memory (in production, use database)
        self.conversations = {}
        self.max_context_messages = 6
        
        # Retrieval strategies
        self.retrieval_strategies = {
            "vector_only": self._vector_retrieval,
            "graph_only": self._graph_retrieval,
            "hybrid": self._hybrid_retrieval,
            "adaptive": self._adaptive_retrieval
        }
    
    async def _vector_retrieval(self, query: str, k: int = 5) -> List[RetrievedSource]:
        """Retrieve using vector similarity from ChromaDB"""
        try:
            # Import here to avoid circular imports
            from .enhanced_chromadb_api import chromadb_integration
            
            # Search entities
            entity_results = await chromadb_integration.semantic_search(query, k=k, collection="entities")
            
            # Search chunks
            chunk_results = await chromadb_integration.semantic_search(query, k=k, collection="document_chunks")
            
            sources = []
            
            # Process entity results
            if entity_results.get("success") and entity_results.get("data", {}).get("results"):
                for result in entity_results["data"]["results"][:k//2]:
                    source = RetrievedSource(
                        source_type="entity",
                        source_id=result["id"],
                        content=f"Entity: {result['name']} ({result['entity_type']}) - {result['anchor_text']}",
                        score=result["score"],
                        metadata=result["metadata"]
                    )
                    sources.append(source)
            
            # Process chunk results
            if chunk_results.get("success") and chunk_results.get("data", {}).get("results"):
                for result in chunk_results["data"]["results"][:k//2]:
                    source = RetrievedSource(
                        source_type="chunk",
                        source_id=result["id"],
                        content=result["anchor_text"],
                        score=result["score"],
                        metadata=result["metadata"]
                    )
                    sources.append(source)
            
            return sources
            
        except Exception as e:
            print(f"Vector retrieval failed: {e}")
            return []
    
    async def _graph_retrieval(self, query: str, k: int = 5) -> List[RetrievedSource]:
        """Retrieve using graph traversal from Neo4j"""
        try:
            # Import here to avoid circular imports
            from .enhanced_graph_constructor_api import graph_constructor
            
            # For now, return empty - would implement graph-based retrieval
            # This would involve entity extraction from query and graph traversal
            return []
            
        except Exception as e:
            print(f"Graph retrieval failed: {e}")
            return []
    
    async def _hybrid_retrieval(self, query: str, k: int = 5) -> List[RetrievedSource]:
        """Combine vector and graph retrieval"""
        try:
            vector_sources = await self._vector_retrieval(query, k//2)
            graph_sources = await self._graph_retrieval(query, k//2)
            
            # Combine and deduplicate
            all_sources = vector_sources + graph_sources
            seen_ids = set()
            unique_sources = []
            
            for source in all_sources:
                if source.source_id not in seen_ids:
                    unique_sources.append(source)
                    seen_ids.add(source.source_id)
            
            # Sort by score and return top k
            unique_sources.sort(key=lambda x: x.score, reverse=True)
            return unique_sources[:k]
            
        except Exception as e:
            print(f"Hybrid retrieval failed: {e}")
            return []
    
    async def _adaptive_retrieval(self, query: str, k: int = 5) -> List[RetrievedSource]:
        """Adaptively choose retrieval strategy based on query"""
        try:
            # Simple heuristics for strategy selection
            query_lower = query.lower()
            
            # If query mentions specific entities or relationships, use graph
            if any(word in query_lower for word in ["relationship", "connected", "related", "works for", "part of"]):
                return await self._graph_retrieval(query, k)
            
            # If query is about concepts or semantic similarity, use vector
            elif any(word in query_lower for word in ["similar", "like", "concept", "meaning", "semantic"]):
                return await self._vector_retrieval(query, k)
            
            # Default to hybrid
            else:
                return await self._hybrid_retrieval(query, k)
                
        except Exception as e:
            print(f"Adaptive retrieval failed: {e}")
            return await self._vector_retrieval(query, k)  # Fallback
    
    async def _create_reasoning_steps(self, query: str, sources: List[RetrievedSource], strategy: str) -> List[ReasoningStep]:
        """Create reasoning steps for transparency"""
        steps = []
        
        # Step 1: Query Analysis
        analysis_step = ReasoningStep(
            step_id=str(uuid.uuid4()),
            step_type="analysis",
            description=f"Analyzed query using {strategy} strategy",
            sources_used=[],
            confidence=0.9,
            processing_time_ms=50
        )
        steps.append(analysis_step)
        
        # Step 2: Retrieval
        retrieval_step = ReasoningStep(
            step_id=str(uuid.uuid4()),
            step_type="retrieval",
            description=f"Retrieved {len(sources)} relevant sources",
            sources_used=[source.source_id for source in sources],
            confidence=0.8,
            processing_time_ms=200
        )
        steps.append(retrieval_step)
        
        # Step 3: Synthesis
        synthesis_step = ReasoningStep(
            step_id=str(uuid.uuid4()),
            step_type="synthesis",
            description="Synthesized information from retrieved sources",
            sources_used=[source.source_id for source in sources[:3]],  # Top 3 sources
            confidence=0.85,
            processing_time_ms=300
        )
        steps.append(synthesis_step)
        
        return steps
    
    async def process_query(self, query: str, conversation_id: Optional[str] = None, strategy: str = "adaptive") -> Dict[str, Any]:
        """Process a query with RAG and reasoning"""
        start_time = time.time()
        
        try:
            # Generate conversation ID if not provided
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
            
            # Get conversation context
            context_messages = self.conversations.get(conversation_id, [])
            
            # Retrieve relevant sources
            retrieval_start = time.time()
            sources = await self.retrieval_strategies[strategy](query)
            retrieval_time = int((time.time() - retrieval_start) * 1000)
            
            # Create reasoning steps
            reasoning_steps = await self._create_reasoning_steps(query, sources, strategy)
            
            # Prepare context for LLM
            context_text = ""
            if sources:
                context_text = "\n\nRelevant Information:\n"
                for i, source in enumerate(sources[:5], 1):
                    context_text += f"{i}. {source.content} (Score: {source.score:.3f})\n"
            
            # Prepare conversation history
            conversation_context = ""
            if context_messages:
                conversation_context = "\n\nConversation History:\n"
                for msg in context_messages[-4:]:  # Last 4 messages
                    conversation_context += f"{msg.role.title()}: {msg.content}\n"
            
            # Create prompt
            system_prompt = """You are an intelligent assistant with access to a knowledge graph and document embeddings. 
            Provide accurate, helpful responses based on the retrieved information. 
            Always cite your sources and indicate confidence levels.
            If the retrieved information is insufficient, clearly state this."""
            
            user_prompt = f"""Query: {query}
            
            {context_text}
            {conversation_context}
            
            Please provide a comprehensive answer based on the retrieved information. 
            Cite specific sources and indicate your confidence in the response."""
            
            # Generate response
            llm_start = time.time()
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            llm_time = int((time.time() - llm_start) * 1000)
            answer = response.choices[0].message.content
            
            # Add response reasoning step
            response_step = ReasoningStep(
                step_id=str(uuid.uuid4()),
                step_type="response",
                description="Generated response using retrieved context",
                sources_used=[source.source_id for source in sources],
                confidence=0.8,
                processing_time_ms=llm_time
            )
            reasoning_steps.append(response_step)
            
            # Create message objects
            user_message = ConversationMessage(
                message_id=str(uuid.uuid4()),
                role="user",
                content=query,
                timestamp=datetime.utcnow().isoformat(),
                sources=[],
                reasoning_steps=[]
            )
            
            assistant_message = ConversationMessage(
                message_id=str(uuid.uuid4()),
                role="assistant",
                content=answer,
                timestamp=datetime.utcnow().isoformat(),
                sources=sources,
                reasoning_steps=reasoning_steps
            )
            
            # Update conversation memory
            if conversation_id not in self.conversations:
                self.conversations[conversation_id] = []
            
            self.conversations[conversation_id].extend([user_message, assistant_message])
            
            # Keep only recent messages
            if len(self.conversations[conversation_id]) > self.max_context_messages:
                self.conversations[conversation_id] = self.conversations[conversation_id][-self.max_context_messages:]
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return ReasoningResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data={
                    "conversation_id": conversation_id,
                    "query": query,
                    "answer": answer,
                    "sources": [source.dict() for source in sources],
                    "reasoning_steps": [step.dict() for step in reasoning_steps],
                    "strategy_used": strategy,
                    "performance_metrics": {
                        "retrieval_time_ms": retrieval_time,
                        "llm_time_ms": llm_time,
                        "total_time_ms": processing_time,
                        "sources_retrieved": len(sources)
                    }
                }
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return ReasoningResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Query processing failed: {str(e)}"
            ).dict()
    
    async def get_conversation_history(self, conversation_id: str) -> Dict[str, Any]:
        """Get conversation history"""
        try:
            messages = self.conversations.get(conversation_id, [])
            
            return ReasoningResponse(
                success=True,
                status_code=200,
                processing_ms=0,
                data={
                    "conversation_id": conversation_id,
                    "messages": [msg.dict() for msg in messages],
                    "total_messages": len(messages)
                }
            ).dict()
            
        except Exception as e:
            return ReasoningResponse(
                success=False,
                status_code=500,
                processing_ms=0,
                error=f"Failed to get conversation history: {str(e)}"
            ).dict()
    
    async def clear_conversation(self, conversation_id: str) -> Dict[str, Any]:
        """Clear conversation history"""
        try:
            if conversation_id in self.conversations:
                del self.conversations[conversation_id]
            
            return ReasoningResponse(
                success=True,
                status_code=200,
                processing_ms=0,
                data={
                    "conversation_id": conversation_id,
                    "status": "cleared"
                }
            ).dict()
            
        except Exception as e:
            return ReasoningResponse(
                success=False,
                status_code=500,
                processing_ms=0,
                error=f"Failed to clear conversation: {str(e)}"
            ).dict()
    
    async def stream_response(self, query: str, conversation_id: Optional[str] = None, strategy: str = "adaptive") -> AsyncGenerator[str, None]:
        """Stream response for real-time updates"""
        try:
            # Start processing
            yield json.dumps({"type": "start", "message": "Processing query..."})
            
            # Retrieval phase
            yield json.dumps({"type": "retrieval", "message": "Retrieving relevant information..."})
            sources = await self.retrieval_strategies[strategy](query)
            yield json.dumps({"type": "retrieval_complete", "sources_count": len(sources)})
            
            # Analysis phase
            yield json.dumps({"type": "analysis", "message": "Analyzing retrieved information..."})
            await asyncio.sleep(0.5)  # Simulate processing time
            
            # Generate response
            yield json.dumps({"type": "generation", "message": "Generating response..."})
            result = await self.process_query(query, conversation_id, strategy)
            
            if result["success"]:
                yield json.dumps({
                    "type": "complete",
                    "data": result["data"]
                })
            else:
                yield json.dumps({
                    "type": "error",
                    "error": result["error"]
                })
                
        except Exception as e:
            yield json.dumps({
                "type": "error",
                "error": f"Streaming failed: {str(e)}"
            })

# Global reasoning stream instance
reasoning_stream = EnhancedReasoningStream()

# FastAPI endpoints
async def process_query_endpoint(query: str, conversation_id: Optional[str] = None, strategy: str = "adaptive"):
    """Process query endpoint"""
    result = await reasoning_stream.process_query(query, conversation_id, strategy)
    return result

async def get_conversation_history_endpoint(conversation_id: str):
    """Get conversation history endpoint"""
    result = await reasoning_stream.get_conversation_history(conversation_id)
    return result

async def clear_conversation_endpoint(conversation_id: str):
    """Clear conversation endpoint"""
    result = await reasoning_stream.clear_conversation(conversation_id)
    return result

async def stream_response_endpoint(query: str, conversation_id: Optional[str] = None, strategy: str = "adaptive"):
    """Stream response endpoint"""
    async for chunk in reasoning_stream.stream_response(query, conversation_id, strategy):
        yield chunk

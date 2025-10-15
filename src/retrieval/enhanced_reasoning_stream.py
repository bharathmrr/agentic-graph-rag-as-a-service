"""
Enhanced reasoning stream for RAG chatbot with conversation memory
Supports multi-modal retrieval, real-time reasoning visualization, and context management
"""

import uuid
import json
from typing import Dict, List, Any, Optional, AsyncGenerator, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import asyncio
import structlog
from collections import deque

from src.retrieval.enhanced_agentic_retrieval import EnhancedAgenticRetrieval, RetrievalStrategy
from src.utils.logger import get_logger

logger = get_logger("enhanced_reasoning_stream")


@dataclass
class ConversationMessage:
    """Represents a message in the conversation."""
    id: str
    role: str  # user, assistant, system
    content: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class ReasoningStep:
    """Represents a step in the reasoning process."""
    step_id: str
    step_type: str
    description: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    confidence: float
    processing_time_ms: float
    timestamp: datetime


@dataclass
class RAGResponse:
    """Complete RAG response with reasoning chain."""
    response_id: str
    query: str
    answer: str
    supporting_evidence: List[Dict[str, Any]]
    reasoning_steps: List[ReasoningStep]
    confidence_score: float
    sources_used: List[str]
    processing_time_ms: float
    conversation_id: str


class ConversationMemory:
    """Manages conversation context and memory."""
    
    def __init__(self, max_messages: int = 20, context_window: int = 6):
        """Initialize conversation memory."""
        self.max_messages = max_messages
        self.context_window = context_window
        self.conversations: Dict[str, deque] = {}
        self.conversation_metadata: Dict[str, Dict[str, Any]] = {}
    
    def add_message(self, conversation_id: str, message: ConversationMessage):
        """Add a message to the conversation history."""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = deque(maxlen=self.max_messages)
            self.conversation_metadata[conversation_id] = {
                "created_at": datetime.now(),
                "last_updated": datetime.now(),
                "message_count": 0
            }
        
        self.conversations[conversation_id].append(message)
        self.conversation_metadata[conversation_id]["last_updated"] = datetime.now()
        self.conversation_metadata[conversation_id]["message_count"] += 1
    
    def get_context(self, conversation_id: str) -> List[ConversationMessage]:
        """Get recent conversation context."""
        if conversation_id not in self.conversations:
            return []
        
        messages = list(self.conversations[conversation_id])
        return messages[-self.context_window:] if messages else []
    
    def get_conversation_summary(self, conversation_id: str) -> Dict[str, Any]:
        """Get summary of the conversation."""
        if conversation_id not in self.conversations:
            return {}
        
        messages = list(self.conversations[conversation_id])
        metadata = self.conversation_metadata[conversation_id]
        
        return {
            "conversation_id": conversation_id,
            "total_messages": len(messages),
            "created_at": metadata["created_at"].isoformat(),
            "last_updated": metadata["last_updated"].isoformat(),
            "recent_topics": self._extract_topics(messages[-5:])
        }
    
    def _extract_topics(self, messages: List[ConversationMessage]) -> List[str]:
        """Extract topics from recent messages."""
        # Simplified topic extraction
        topics = set()
        for message in messages:
            if message.role == "user":
                words = message.content.lower().split()
                # Extract potential topics (capitalized words, longer words)
                for word in words:
                    if len(word) > 4 and word.isalpha():
                        topics.add(word)
        
        return list(topics)[:5]  # Return top 5 topics


class ReasoningEngine:
    """Handles the reasoning process for RAG responses."""
    
    def __init__(self, 
                 retrieval_system: EnhancedAgenticRetrieval,
                 llm_client=None):
        """Initialize reasoning engine."""
        self.retrieval_system = retrieval_system
        self.llm_client = llm_client
        
    async def generate_reasoning_chain(self, 
                                     query: str,
                                     context: List[ConversationMessage],
                                     retrieval_results: List[Dict[str, Any]]) -> List[ReasoningStep]:
        """Generate detailed reasoning chain for the response."""
        
        reasoning_steps = []
        start_time = datetime.now()
        
        # Step 1: Query Analysis
        step1_start = datetime.now()
        query_analysis = await self._analyze_query(query, context)
        step1_time = (datetime.now() - step1_start).total_seconds() * 1000
        
        reasoning_steps.append(ReasoningStep(
            step_id=str(uuid.uuid4()),
            step_type="query_analysis",
            description="Analyzed user query and conversation context",
            input_data={"query": query, "context_messages": len(context)},
            output_data=query_analysis,
            confidence=0.9,
            processing_time_ms=step1_time,
            timestamp=datetime.now()
        ))
        
        # Step 2: Information Retrieval
        step2_start = datetime.now()
        retrieval_summary = self._summarize_retrieval_results(retrieval_results)
        step2_time = (datetime.now() - step2_start).total_seconds() * 1000
        
        reasoning_steps.append(ReasoningStep(
            step_id=str(uuid.uuid4()),
            step_type="information_retrieval",
            description="Retrieved relevant information from knowledge base",
            input_data={"query_intent": query_analysis.get("intent", "unknown")},
            output_data=retrieval_summary,
            confidence=retrieval_summary.get("avg_confidence", 0.5),
            processing_time_ms=step2_time,
            timestamp=datetime.now()
        ))
        
        # Step 3: Evidence Synthesis
        step3_start = datetime.now()
        synthesis = await self._synthesize_evidence(query, retrieval_results, context)
        step3_time = (datetime.now() - step3_start).total_seconds() * 1000
        
        reasoning_steps.append(ReasoningStep(
            step_id=str(uuid.uuid4()),
            step_type="evidence_synthesis",
            description="Synthesized evidence from multiple sources",
            input_data={"sources_count": len(retrieval_results)},
            output_data=synthesis,
            confidence=synthesis.get("synthesis_confidence", 0.7),
            processing_time_ms=step3_time,
            timestamp=datetime.now()
        ))
        
        return reasoning_steps
    
    async def _analyze_query(self, 
                           query: str, 
                           context: List[ConversationMessage]) -> Dict[str, Any]:
        """Analyze the query in context."""
        
        # Extract query characteristics
        query_lower = query.lower()
        
        # Determine intent
        intent = "information_seeking"
        if any(word in query_lower for word in ["how", "why", "explain"]):
            intent = "explanation_seeking"
        elif any(word in query_lower for word in ["what", "who", "where", "when"]):
            intent = "fact_seeking"
        elif any(word in query_lower for word in ["compare", "difference", "similar"]):
            intent = "comparison"
        
        # Check for context references
        context_references = []
        if any(word in query_lower for word in ["this", "that", "it", "they"]):
            context_references = [msg.content for msg in context[-2:] if msg.role == "user"]
        
        return {
            "intent": intent,
            "query_length": len(query),
            "context_references": context_references,
            "complexity": min(len(query.split()) / 20, 1.0),
            "entities_mentioned": self._extract_entities(query)
        }
    
    def _extract_entities(self, text: str) -> List[str]:
        """Extract potential entities from text."""
        words = text.split()
        entities = []
        
        for word in words:
            if word[0].isupper() and len(word) > 2:
                entities.append(word.strip('.,!?'))
        
        return entities
    
    def _summarize_retrieval_results(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Summarize retrieval results for reasoning."""
        
        if not results:
            return {"sources_found": 0, "avg_confidence": 0.0}
        
        source_types = set()
        confidences = []
        
        for result in results:
            if "source_type" in result:
                source_types.add(result["source_type"])
            if "score" in result:
                confidences.append(result["score"])
        
        return {
            "sources_found": len(results),
            "source_types": list(source_types),
            "avg_confidence": sum(confidences) / len(confidences) if confidences else 0.0,
            "top_result_score": max(confidences) if confidences else 0.0
        }
    
    async def _synthesize_evidence(self, 
                                 query: str,
                                 retrieval_results: List[Dict[str, Any]],
                                 context: List[ConversationMessage]) -> Dict[str, Any]:
        """Synthesize evidence from retrieval results."""
        
        # Group results by source type
        grouped_results = {}
        for result in retrieval_results:
            source_type = result.get("source_type", "unknown")
            if source_type not in grouped_results:
                grouped_results[source_type] = []
            grouped_results[source_type].append(result)
        
        # Calculate synthesis confidence
        synthesis_confidence = 0.7  # Base confidence
        
        # Boost confidence if multiple source types agree
        if len(grouped_results) > 1:
            synthesis_confidence += 0.1
        
        # Boost confidence if high-scoring results
        high_score_count = sum(1 for r in retrieval_results if r.get("score", 0) > 0.8)
        if high_score_count > 0:
            synthesis_confidence += min(high_score_count * 0.05, 0.2)
        
        return {
            "synthesis_confidence": min(synthesis_confidence, 1.0),
            "evidence_groups": {k: len(v) for k, v in grouped_results.items()},
            "supporting_evidence_count": len(retrieval_results),
            "context_integration": len(context) > 0
        }


class EnhancedReasoningStream:
    """Enhanced reasoning stream for RAG chatbot."""
    
    def __init__(self, 
                 retrieval_system: EnhancedAgenticRetrieval,
                 llm_client=None,
                 memory_size: int = 20):
        """Initialize enhanced reasoning stream."""
        
        self.retrieval_system = retrieval_system
        self.llm_client = llm_client
        self.conversation_memory = ConversationMemory(max_messages=memory_size)
        self.reasoning_engine = ReasoningEngine(retrieval_system, llm_client)
        
        logger.info("Enhanced reasoning stream initialized")
    
    async def process_query(self, 
                          query: str,
                          conversation_id: str = None,
                          stream_response: bool = False) -> RAGResponse:
        """Process a query and generate RAG response."""
        
        if conversation_id is None:
            conversation_id = str(uuid.uuid4())
        
        start_time = datetime.now()
        response_id = str(uuid.uuid4())
        
        # Add user message to conversation memory
        user_message = ConversationMessage(
            id=str(uuid.uuid4()),
            role="user",
            content=query,
            timestamp=datetime.now()
        )
        self.conversation_memory.add_message(conversation_id, user_message)
        
        # Get conversation context
        context = self.conversation_memory.get_context(conversation_id)
        
        logger.info(f"Processing query with context", 
                   query_id=response_id, 
                   conversation_id=conversation_id,
                   context_messages=len(context))
        
        try:
            # Retrieve relevant information
            retrieval_response = await self.retrieval_system.retrieve(
                query_text=query,
                strategy=RetrievalStrategy.ADAPTIVE,
                max_results=10,
                context={"conversation_id": conversation_id, "context": context}
            )
            
            # Generate reasoning chain
            reasoning_steps = await self.reasoning_engine.generate_reasoning_chain(
                query, context, retrieval_response.results
            )
            
            # Generate response using LLM
            answer = await self._generate_answer(
                query, 
                retrieval_response.results, 
                context,
                reasoning_steps
            )
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Prepare supporting evidence
            supporting_evidence = []
            for result in retrieval_response.results:
                evidence = {
                    "content": result.content,
                    "score": result.score,
                    "source_type": result.source_type,
                    "metadata": result.metadata
                }
                supporting_evidence.append(evidence)
            
            # Create RAG response
            rag_response = RAGResponse(
                response_id=response_id,
                query=query,
                answer=answer,
                supporting_evidence=supporting_evidence,
                reasoning_steps=reasoning_steps,
                confidence_score=retrieval_response.confidence_score,
                sources_used=list(set(r.source_type for r in retrieval_response.results)),
                processing_time_ms=processing_time,
                conversation_id=conversation_id
            )
            
            # Add assistant message to conversation memory
            assistant_message = ConversationMessage(
                id=response_id,
                role="assistant",
                content=answer,
                timestamp=datetime.now(),
                metadata={
                    "confidence": rag_response.confidence_score,
                    "sources": rag_response.sources_used,
                    "reasoning_steps": len(reasoning_steps)
                }
            )
            self.conversation_memory.add_message(conversation_id, assistant_message)
            
            logger.info(f"Query processed successfully", 
                       response_id=response_id,
                       processing_time_ms=processing_time,
                       confidence=rag_response.confidence_score)
            
            return rag_response
            
        except Exception as e:
            logger.error(f"Failed to process query: {e}", 
                        query_id=response_id,
                        conversation_id=conversation_id)
            
            # Return error response
            return RAGResponse(
                response_id=response_id,
                query=query,
                answer=f"I apologize, but I encountered an error while processing your query: {str(e)}",
                supporting_evidence=[],
                reasoning_steps=[],
                confidence_score=0.0,
                sources_used=[],
                processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
                conversation_id=conversation_id
            )
    
    async def _generate_answer(self, 
                             query: str,
                             retrieval_results: List[Any],
                             context: List[ConversationMessage],
                             reasoning_steps: List[ReasoningStep]) -> str:
        """Generate answer using LLM with retrieved context."""
        
        if self.llm_client:
            return await self._generate_llm_answer(query, retrieval_results, context)
        else:
            return self._generate_fallback_answer(query, retrieval_results)
    
    async def _generate_llm_answer(self, 
                                 query: str,
                                 retrieval_results: List[Any],
                                 context: List[ConversationMessage]) -> str:
        """Generate answer using LLM."""
        
        # Prepare context for LLM
        context_text = ""
        if context:
            recent_context = context[-3:]  # Last 3 messages
            context_text = "\n".join([
                f"{msg.role}: {msg.content}" 
                for msg in recent_context
            ])
        
        # Prepare retrieved information
        retrieved_info = ""
        if retrieval_results:
            retrieved_info = "\n".join([
                f"- {result.content} (confidence: {result.score:.2f})"
                for result in retrieval_results[:5]  # Top 5 results
            ])
        
        # Create prompt
        prompt = f"""
Based on the following context and retrieved information, please provide a comprehensive answer to the user's query.

Conversation Context:
{context_text}

Retrieved Information:
{retrieved_info}

User Query: {query}

Please provide a helpful, accurate, and well-structured response. If the retrieved information doesn't fully answer the query, acknowledge the limitations and provide what information is available.
"""
        
        try:
            if hasattr(self.llm_client, 'chat'):
                # OpenAI-style client
                response = await self.llm_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant that provides accurate information based on retrieved context."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                return response.choices[0].message.content
            
            elif hasattr(self.llm_client, 'generate'):
                # Ollama-style client
                response = await self.llm_client.generate(
                    model="llama2",
                    prompt=prompt
                )
                return response['response']
            
            else:
                return self._generate_fallback_answer(query, retrieval_results)
                
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return self._generate_fallback_answer(query, retrieval_results)
    
    def _generate_fallback_answer(self, 
                                query: str,
                                retrieval_results: List[Any]) -> str:
        """Generate fallback answer without LLM."""
        
        if not retrieval_results:
            return "I couldn't find specific information to answer your query. Please try rephrasing your question or providing more context."
        
        # Simple template-based response
        top_result = retrieval_results[0]
        
        answer = f"Based on the available information, here's what I found:\n\n"
        answer += f"{top_result.content}\n\n"
        
        if len(retrieval_results) > 1:
            answer += "Additional relevant information:\n"
            for result in retrieval_results[1:3]:  # Next 2 results
                answer += f"• {result.content}\n"
        
        answer += f"\n(This response is based on {len(retrieval_results)} sources with an average confidence of {sum(r.score for r in retrieval_results) / len(retrieval_results):.2f})"
        
        return answer
    
    async def stream_response(self, 
                            query: str,
                            conversation_id: str = None) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream response generation in real-time."""
        
        if conversation_id is None:
            conversation_id = str(uuid.uuid4())
        
        # Yield initial status
        yield {
            "type": "status",
            "message": "Processing query...",
            "conversation_id": conversation_id
        }
        
        # Process query step by step
        try:
            # Step 1: Retrieval
            yield {
                "type": "status",
                "message": "Retrieving relevant information..."
            }
            
            retrieval_response = await self.retrieval_system.retrieve(
                query_text=query,
                strategy=RetrievalStrategy.ADAPTIVE,
                max_results=10
            )
            
            yield {
                "type": "retrieval_complete",
                "results_count": len(retrieval_response.results),
                "confidence": retrieval_response.confidence_score
            }
            
            # Step 2: Reasoning
            yield {
                "type": "status",
                "message": "Generating reasoning chain..."
            }
            
            context = self.conversation_memory.get_context(conversation_id)
            reasoning_steps = await self.reasoning_engine.generate_reasoning_chain(
                query, context, retrieval_response.results
            )
            
            yield {
                "type": "reasoning_complete",
                "steps_count": len(reasoning_steps)
            }
            
            # Step 3: Answer generation
            yield {
                "type": "status",
                "message": "Generating response..."
            }
            
            answer = await self._generate_answer(
                query, retrieval_response.results, context, reasoning_steps
            )
            
            # Final response
            yield {
                "type": "complete",
                "answer": answer,
                "supporting_evidence": [asdict(r) for r in retrieval_response.results],
                "reasoning_steps": [asdict(step) for step in reasoning_steps],
                "conversation_id": conversation_id
            }
            
        except Exception as e:
            yield {
                "type": "error",
                "message": str(e),
                "conversation_id": conversation_id
            }
    
    def get_conversation_history(self, conversation_id: str) -> Dict[str, Any]:
        """Get conversation history and summary."""
        
        context = self.conversation_memory.get_context(conversation_id)
        summary = self.conversation_memory.get_conversation_summary(conversation_id)
        
        return {
            "conversation_id": conversation_id,
            "messages": [asdict(msg) for msg in context],
            "summary": summary
        }
    
    def clear_conversation(self, conversation_id: str) -> bool:
        """Clear conversation history."""
        
        if conversation_id in self.conversation_memory.conversations:
            del self.conversation_memory.conversations[conversation_id]
            del self.conversation_memory.conversation_metadata[conversation_id]
            return True
        
        return False

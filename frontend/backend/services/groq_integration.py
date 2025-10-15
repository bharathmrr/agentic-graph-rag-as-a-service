"""
Groq Integration Service for Agentic Graph RAG
Provides LLM capabilities using Groq's high-speed inference
"""

import os
import warnings
import asyncio
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass
import json
from datetime import datetime

from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    ServiceContext,
    Document
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.groq import Groq
from llama_index.core.schema import NodeWithScore
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.postprocessor import SimilarityPostprocessor

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

@dataclass
class GroqConfig:
    """Configuration for Groq integration"""
    api_key: str
    model: str = "llama3-8b-8192"
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    chunk_size: int = 512
    chunk_overlap: int = 20
    similarity_threshold: float = 0.7
    max_tokens: int = 2048
    temperature: float = 0.1

@dataclass
class EntityExtractionResult:
    """Result from entity extraction"""
    entities: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]
    confidence_score: float
    processing_time: float
    source_text: str

@dataclass
class RAGResponse:
    """Response from RAG query"""
    answer: str
    source_nodes: List[Dict[str, Any]]
    entities_found: List[Dict[str, Any]]
    confidence_score: float
    processing_time: float
    reasoning_steps: List[str]

class GroqRAGService:
    """Enhanced RAG service using Groq for high-speed inference"""
    
    def __init__(self, config: GroqConfig):
        self.config = config
        self.llm = None
        self.embed_model = None
        self.service_context = None
        self.index = None
        self.query_engine = None
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize Groq LLM and embedding services"""
        try:
            # Initialize Groq LLM
            self.llm = Groq(
                model=self.config.model,
                api_key=self.config.api_key,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens
            )
            
            # Initialize HuggingFace embedding model
            self.embed_model = HuggingFaceEmbedding(
                model_name=self.config.embedding_model
            )
            
            # Configure service context
            self.service_context = ServiceContext.from_defaults(
                llm=self.llm,
                embed_model=self.embed_model,
                node_parser=SentenceSplitter(
                    chunk_size=self.config.chunk_size,
                    chunk_overlap=self.config.chunk_overlap
                )
            )
            
            print(f"✅ Groq RAG Service initialized with model: {self.config.model}")
            
        except Exception as e:
            print(f"❌ Error initializing Groq services: {str(e)}")
            raise
    
    async def create_index_from_documents(self, documents: List[str]) -> bool:
        """Create vector index from document texts"""
        try:
            start_time = datetime.now()
            
            # Convert text documents to LlamaIndex Document objects
            doc_objects = [
                Document(text=doc_text, metadata={"source": f"doc_{i}"})
                for i, doc_text in enumerate(documents)
            ]
            
            # Create vector store index
            self.index = VectorStoreIndex.from_documents(
                doc_objects,
                service_context=self.service_context
            )
            
            # Create query engine with similarity post-processor
            retriever = VectorIndexRetriever(
                index=self.index,
                similarity_top_k=5
            )
            
            self.query_engine = RetrieverQueryEngine(
                retriever=retriever,
                postprocessors=[
                    SimilarityPostprocessor(similarity_cutoff=self.config.similarity_threshold)
                ]
            )
            
            processing_time = (datetime.now() - start_time).total_seconds()
            print(f"✅ Created vector index from {len(documents)} documents in {processing_time:.2f}s")
            
            return True
            
        except Exception as e:
            print(f"❌ Error creating index: {str(e)}")
            return False
    
    async def extract_entities_with_groq(self, text: str) -> EntityExtractionResult:
        """Extract entities using Groq LLM with enhanced prompting"""
        try:
            start_time = datetime.now()
            
            entity_prompt = f"""
            You are an expert entity extraction system. Analyze the following text and extract:
            1. Named entities (PERSON, ORGANIZATION, LOCATION, TECHNOLOGY, CONCEPT)
            2. Relationships between entities
            3. Key concepts and their attributes
            
            Text to analyze:
            {text}
            
            Return your response as a JSON object with this exact structure:
            {{
                "entities": [
                    {{
                        "text": "entity name",
                        "type": "PERSON|ORGANIZATION|LOCATION|TECHNOLOGY|CONCEPT",
                        "confidence": 0.95,
                        "start_pos": 0,
                        "end_pos": 10,
                        "attributes": {{"key": "value"}}
                    }}
                ],
                "relationships": [
                    {{
                        "source": "entity1",
                        "target": "entity2",
                        "relation": "relationship_type",
                        "confidence": 0.90,
                        "context": "supporting text"
                    }}
                ],
                "confidence_score": 0.92
            }}
            
            Be precise and only extract clearly identifiable entities and relationships.
            """
            
            response = await asyncio.to_thread(self.llm.complete, entity_prompt)
            
            # Parse JSON response
            try:
                result_data = json.loads(response.text)
                entities = result_data.get("entities", [])
                relationships = result_data.get("relationships", [])
                confidence = result_data.get("confidence_score", 0.0)
            except json.JSONDecodeError:
                # Fallback parsing if JSON is malformed
                entities = []
                relationships = []
                confidence = 0.0
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return EntityExtractionResult(
                entities=entities,
                relationships=relationships,
                confidence_score=confidence,
                processing_time=processing_time,
                source_text=text
            )
            
        except Exception as e:
            print(f"❌ Error extracting entities: {str(e)}")
            return EntityExtractionResult(
                entities=[],
                relationships=[],
                confidence_score=0.0,
                processing_time=0.0,
                source_text=text
            )
    
    async def query_with_rag(self, query: str, include_entities: bool = True) -> RAGResponse:
        """Perform RAG query with entity extraction and reasoning"""
        try:
            start_time = datetime.now()
            reasoning_steps = []
            
            if not self.query_engine:
                raise ValueError("Query engine not initialized. Create index first.")
            
            reasoning_steps.append("🔍 Analyzing query for relevant context")
            
            # Perform RAG query
            response = await asyncio.to_thread(self.query_engine.query, query)
            
            reasoning_steps.append("📚 Retrieved relevant document chunks")
            
            # Extract source information
            source_nodes = []
            if hasattr(response, 'source_nodes'):
                for node in response.source_nodes:
                    source_nodes.append({
                        "text": node.node.text[:200] + "..." if len(node.node.text) > 200 else node.node.text,
                        "score": float(node.score) if hasattr(node, 'score') else 0.0,
                        "metadata": node.node.metadata
                    })
            
            reasoning_steps.append("🧠 Generated response using Groq LLM")
            
            # Extract entities from the response if requested
            entities_found = []
            if include_entities and response.response:
                reasoning_steps.append("🔎 Extracting entities from response")
                entity_result = await self.extract_entities_with_groq(response.response)
                entities_found = entity_result.entities
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Calculate confidence based on source similarity scores
            confidence_score = 0.0
            if source_nodes:
                confidence_score = sum(node["score"] for node in source_nodes) / len(source_nodes)
            
            reasoning_steps.append(f"✅ Completed in {processing_time:.2f}s")
            
            return RAGResponse(
                answer=response.response,
                source_nodes=source_nodes,
                entities_found=entities_found,
                confidence_score=confidence_score,
                processing_time=processing_time,
                reasoning_steps=reasoning_steps
            )
            
        except Exception as e:
            print(f"❌ Error in RAG query: {str(e)}")
            return RAGResponse(
                answer=f"Error processing query: {str(e)}",
                source_nodes=[],
                entities_found=[],
                confidence_score=0.0,
                processing_time=0.0,
                reasoning_steps=[f"❌ Error: {str(e)}"]
            )
    
    async def stream_rag_response(self, query: str) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream RAG response for real-time updates"""
        try:
            yield {"type": "status", "message": "🔍 Analyzing query..."}
            
            if not self.query_engine:
                yield {"type": "error", "message": "Query engine not initialized"}
                return
            
            yield {"type": "status", "message": "📚 Retrieving relevant documents..."}
            
            # Perform query (note: streaming would require Groq streaming support)
            response = await self.query_with_rag(query, include_entities=True)
            
            yield {"type": "status", "message": "🧠 Generating response..."}
            
            # Stream the response in chunks
            words = response.answer.split()
            chunk_size = 5
            
            for i in range(0, len(words), chunk_size):
                chunk = " ".join(words[i:i + chunk_size])
                yield {
                    "type": "content",
                    "content": chunk,
                    "is_complete": i + chunk_size >= len(words)
                }
                await asyncio.sleep(0.1)  # Small delay for streaming effect
            
            yield {
                "type": "complete",
                "response": response.__dict__
            }
            
        except Exception as e:
            yield {"type": "error", "message": f"Error: {str(e)}"}
    
    async def find_similar_entities(self, entity_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Find similar entities using embedding similarity"""
        try:
            if not self.index:
                return []
            
            # Create a query to find similar content
            query = f"Find information related to: {entity_text}"
            
            retriever = VectorIndexRetriever(
                index=self.index,
                similarity_top_k=top_k
            )
            
            nodes = await asyncio.to_thread(retriever.retrieve, query)
            
            similar_entities = []
            for node in nodes:
                # Extract entities from each similar node
                entity_result = await self.extract_entities_with_groq(node.node.text)
                
                for entity in entity_result.entities:
                    similar_entities.append({
                        "entity": entity,
                        "similarity_score": float(node.score) if hasattr(node, 'score') else 0.0,
                        "source_text": node.node.text[:100] + "...",
                        "metadata": node.node.metadata
                    })
            
            return similar_entities
            
        except Exception as e:
            print(f"❌ Error finding similar entities: {str(e)}")
            return []

# Factory function to create GroqRAGService
def create_groq_rag_service(api_key: str = None) -> GroqRAGService:
    """Create and initialize GroqRAGService"""
    if not api_key:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")
    
    config = GroqConfig(api_key=api_key)
    return GroqRAGService(config)

# Example usage and testing
async def test_groq_integration():
    """Test the Groq integration"""
    try:
        # Initialize service
        service = create_groq_rag_service()
        
        # Sample documents
        documents = [
            "The Language Processing Unit (LPU) is a new class of processor designed by Groq to accelerate large language models. It provides exceptional speed and low latency for AI workloads.",
            "RAG applications can use Groq for the final generation step, while using another provider for embeddings. This hybrid approach optimizes both speed and accuracy.",
            "Agentic AI systems combine multiple AI agents to solve complex problems. They use retrieval-augmented generation to access relevant information from knowledge bases."
        ]
        
        # Create index
        await service.create_index_from_documents(documents)
        
        # Test entity extraction
        entity_result = await service.extract_entities_with_groq(documents[0])
        print(f"Extracted {len(entity_result.entities)} entities")
        
        # Test RAG query
        rag_response = await service.query_with_rag("What is an LPU and how is it used in AI?")
        print(f"RAG Response: {rag_response.answer[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    # Run test
    asyncio.run(test_groq_integration())

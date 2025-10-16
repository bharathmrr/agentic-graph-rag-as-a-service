"""
Enhanced agentic retrieval system with multiple tools and intelligent routing
Supports vector search, graph traversal, logical filtering, and hybrid strategies
"""

import uuid
import json
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, asdict
from datetime import datetime
import asyncio
import numpy as np
from enum import Enum
import structlog

from src.utils.logger import get_logger

logger = get_logger("enhanced_agentic_retrieval")


class RetrievalStrategy(Enum):
    """Available retrieval strategies."""
    VECTOR_ONLY = "vector_only"
    GRAPH_ONLY = "graph_only"
    LOGICAL_FILTER = "logical_filter"
    HYBRID = "hybrid"
    ADAPTIVE = "adaptive"


@dataclass
class RetrievalQuery:
    """Represents a retrieval query with context."""
    id: str
    text: str
    intent: str
    entities_mentioned: List[str]
    query_type: str
    complexity_score: float
    filters: Optional[Dict[str, Any]] = None
    context: Optional[Dict[str, Any]] = None


@dataclass
class RetrievalResult:
    """Represents a retrieval result."""
    id: str
    content: str
    score: float
    source_type: str  # vector, graph, filter
    metadata: Dict[str, Any]
    reasoning: Optional[str] = None


@dataclass
class RetrievalResponse:
    """Complete retrieval response with reasoning."""
    query_id: str
    strategy_used: str
    results: List[RetrievalResult]
    reasoning_chain: List[Dict[str, Any]]
    total_results: int
    processing_time_ms: float
    confidence_score: float


class QueryAnalyzer:
    """Analyzes queries to determine optimal retrieval strategy."""
    
    def __init__(self):
        self.entity_keywords = ["who", "what", "where", "when", "which"]
        self.relationship_keywords = ["how", "why", "relationship", "connected", "related"]
        self.filter_keywords = ["filter", "where", "having", "with", "without"]
        
    def analyze_query(self, query_text: str) -> RetrievalQuery:
        """Analyze query to determine intent and complexity."""
        
        query_lower = query_text.lower()
        
        # Determine query intent
        intent = self._determine_intent(query_lower)
        
        # Extract mentioned entities (simplified)
        entities = self._extract_entities(query_text)
        
        # Determine query type
        query_type = self._determine_query_type(query_lower)
        
        # Calculate complexity score
        complexity = self._calculate_complexity(query_text, entities)
        
        return RetrievalQuery(
            id=str(uuid.uuid4()),
            text=query_text,
            intent=intent,
            entities_mentioned=entities,
            query_type=query_type,
            complexity_score=complexity
        )
    
    def _determine_intent(self, query_lower: str) -> str:
        """Determine the primary intent of the query."""
        if any(kw in query_lower for kw in self.entity_keywords):
            return "entity_lookup"
        elif any(kw in query_lower for kw in self.relationship_keywords):
            return "relationship_exploration"
        elif any(kw in query_lower for kw in self.filter_keywords):
            return "filtered_search"
        else:
            return "general_search"
    
    def _extract_entities(self, query_text: str) -> List[str]:
        """Extract potential entity mentions from query."""
        # Simplified entity extraction - in production, use NER
        words = query_text.split()
        entities = []
        
        for word in words:
            if word[0].isupper() and len(word) > 2:
                entities.append(word)
        
        return entities
    
    def _determine_query_type(self, query_lower: str) -> str:
        """Determine the type of query for strategy selection."""
        if "similar" in query_lower or "like" in query_lower:
            return "similarity"
        elif "path" in query_lower or "connect" in query_lower:
            return "path_finding"
        elif "all" in query_lower or "list" in query_lower:
            return "comprehensive"
        else:
            return "targeted"
    
    def _calculate_complexity(self, query_text: str, entities: List[str]) -> float:
        """Calculate query complexity score (0-1)."""
        complexity = 0.0
        
        # Length factor
        complexity += min(len(query_text) / 200, 0.3)
        
        # Entity count factor
        complexity += min(len(entities) / 10, 0.3)
        
        # Logical operators
        logical_ops = ["and", "or", "not", "but", "except"]
        op_count = sum(1 for op in logical_ops if op in query_text.lower())
        complexity += min(op_count / 5, 0.2)
        
        # Question complexity
        question_words = ["who", "what", "where", "when", "why", "how"]
        q_count = sum(1 for qw in question_words if qw in query_text.lower())
        complexity += min(q_count / 3, 0.2)
        
        return min(complexity, 1.0)


class StrategySelector:
    """Selects optimal retrieval strategy based on query analysis."""
    
    def __init__(self):
        self.strategy_rules = {
            "entity_lookup": RetrievalStrategy.VECTOR_ONLY,
            "relationship_exploration": RetrievalStrategy.GRAPH_ONLY,
            "filtered_search": RetrievalStrategy.LOGICAL_FILTER,
            "general_search": RetrievalStrategy.HYBRID
        }
    
    def select_strategy(self, query: RetrievalQuery) -> RetrievalStrategy:
        """Select optimal retrieval strategy."""
        
        # Rule-based selection
        if query.complexity_score < 0.3:
            # Simple queries - use vector search
            return RetrievalStrategy.VECTOR_ONLY
        elif query.complexity_score > 0.7:
            # Complex queries - use adaptive approach
            return RetrievalStrategy.ADAPTIVE
        else:
            # Medium complexity - use intent-based rules
            return self.strategy_rules.get(query.intent, RetrievalStrategy.HYBRID)


class EnhancedAgenticRetrieval:
    """Enhanced agentic retrieval system with multiple strategies."""
    
    def __init__(self, 
                 chroma_client=None,
                 neo4j_driver=None,
                 embedding_model=None):
        """Initialize enhanced agentic retrieval."""
        
        self.chroma_client = chroma_client
        self.neo4j_driver = neo4j_driver
        self.embedding_model = embedding_model
        
        self.query_analyzer = QueryAnalyzer()
        self.strategy_selector = StrategySelector()
        
        # Tool availability
        self.tools_available = {
            "vector_search": chroma_client is not None,
            "graph_traversal": neo4j_driver is not None,
            "logical_filter": True,  # Always available
            "hybrid": chroma_client is not None and neo4j_driver is not None
        }
        
        logger.info("Enhanced agentic retrieval initialized", 
                   tools_available=self.tools_available)
    
    async def retrieve(self, 
                      query_text: str,
                      strategy: Optional[RetrievalStrategy] = None,
                      max_results: int = 10,
                      context: Optional[Dict[str, Any]] = None) -> RetrievalResponse:
        """Main retrieval method with intelligent routing."""
        
        start_time = datetime.now()
        
        # Analyze query
        query = self.query_analyzer.analyze_query(query_text)
        query.context = context
        
        # Select strategy if not provided
        if strategy is None:
            strategy = self.strategy_selector.select_strategy(query)
        
        logger.info(f"Processing query with {strategy.value} strategy", 
                   query_id=query.id, intent=query.intent)
        
        # Initialize reasoning chain
        reasoning_chain = [{
            "step": "query_analysis",
            "details": {
                "intent": query.intent,
                "complexity": query.complexity_score,
                "entities": query.entities_mentioned,
                "strategy_selected": strategy.value
            }
        }]
        
        # Execute retrieval based on strategy
        try:
            if strategy == RetrievalStrategy.VECTOR_ONLY:
                results = await self._vector_retrieval(query, max_results, reasoning_chain)
            elif strategy == RetrievalStrategy.GRAPH_ONLY:
                results = await self._graph_retrieval(query, max_results, reasoning_chain)
            elif strategy == RetrievalStrategy.LOGICAL_FILTER:
                results = await self._filter_retrieval(query, max_results, reasoning_chain)
            elif strategy == RetrievalStrategy.HYBRID:
                results = await self._hybrid_retrieval(query, max_results, reasoning_chain)
            elif strategy == RetrievalStrategy.ADAPTIVE:
                results = await self._adaptive_retrieval(query, max_results, reasoning_chain)
            else:
                raise ValueError(f"Unknown strategy: {strategy}")
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            # Calculate confidence score
            confidence = self._calculate_confidence(results, query)
            
            response = RetrievalResponse(
                query_id=query.id,
                strategy_used=strategy.value,
                results=results,
                reasoning_chain=reasoning_chain,
                total_results=len(results),
                processing_time_ms=processing_time,
                confidence_score=confidence
            )
            
            logger.info(f"Retrieval completed", 
                       query_id=query.id, 
                       results_count=len(results),
                       processing_time_ms=processing_time)
            
            return response
            
        except Exception as e:
            logger.error(f"Retrieval failed: {e}", query_id=query.id)
            
            # Return empty response with error
            return RetrievalResponse(
                query_id=query.id,
                strategy_used=strategy.value,
                results=[],
                reasoning_chain=reasoning_chain + [{
                    "step": "error",
                    "details": {"error": str(e)}
                }],
                total_results=0,
                processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
                confidence_score=0.0
            )
    
    async def _vector_retrieval(self, 
                              query: RetrievalQuery,
                              max_results: int,
                              reasoning_chain: List[Dict[str, Any]]) -> List[RetrievalResult]:
        """Perform vector-based retrieval."""
        
        if not self.tools_available["vector_search"]:
            reasoning_chain.append({
                "step": "vector_search_unavailable",
                "details": {"reason": "ChromaDB client not available"}
            })
            return []
        
        reasoning_chain.append({
            "step": "vector_search",
            "details": {"method": "semantic_similarity", "query": query.text}
        })
        
        try:
            # Generate query embedding
            if self.embedding_model:
                query_embedding = self.embedding_model.encode([query.text])[0].tolist()
            else:
                # Fallback to ChromaDB's default embedding
                query_embedding = None
            
            # Search in ChromaDB
            if query_embedding:
                search_results = self.chroma_client.query(
                    query_embeddings=[query_embedding],
                    n_results=max_results
                )
            else:
                # Use ChromaDB's built-in embedding
                search_results = self.chroma_client.query(
                    query_texts=[query.text],
                    n_results=max_results
                )
            
            results = []
            if search_results["ids"] and search_results["ids"][0]:
                for i in range(len(search_results["ids"][0])):
                    score = 1 - search_results["distances"][0][i]  # Convert distance to similarity
                    
                    result = RetrievalResult(
                        id=search_results["ids"][0][i],
                        content=search_results["documents"][0][i],
                        score=score,
                        source_type="vector",
                        metadata=search_results["metadatas"][0][i],
                        reasoning=f"Semantic similarity: {score:.3f}"
                    )
                    results.append(result)
            
            reasoning_chain.append({
                "step": "vector_results",
                "details": {"results_found": len(results)}
            })
            
            return results
            
        except Exception as e:
            reasoning_chain.append({
                "step": "vector_search_error",
                "details": {"error": str(e)}
            })
            return []
    
    async def _graph_retrieval(self, 
                             query: RetrievalQuery,
                             max_results: int,
                             reasoning_chain: List[Dict[str, Any]]) -> List[RetrievalResult]:
        """Perform graph-based retrieval."""
        
        if not self.tools_available["graph_traversal"]:
            reasoning_chain.append({
                "step": "graph_search_unavailable",
                "details": {"reason": "Neo4j driver not available"}
            })
            return []
        
        reasoning_chain.append({
            "step": "graph_search",
            "details": {"method": "entity_traversal", "entities": query.entities_mentioned}
        })
        
        try:
            results = []
            
            # If entities are mentioned, find them and their neighborhoods
            if query.entities_mentioned:
                async with self.neo4j_driver.session() as session:
                    for entity_name in query.entities_mentioned:
                        # Find entity by name
                        find_query = """
                        MATCH (n:Entity)
                        WHERE toLower(n.label) CONTAINS toLower($entity_name)
                        RETURN n
                        LIMIT 5
                        """
                        
                        entity_results = await session.run(find_query, {"entity_name": entity_name})
                        
                        async for record in entity_results:
                            entity = record["n"]
                            
                            # Get entity neighborhood
                            neighborhood_query = """
                            MATCH (center:Entity {id: $entity_id})-[r]-(connected:Entity)
                            RETURN center, r, connected
                            LIMIT $limit
                            """
                            
                            neighborhood_results = await session.run(
                                neighborhood_query, 
                                {"entity_id": entity["id"], "limit": max_results // len(query.entities_mentioned)}
                            )
                            
                            async for neighbor_record in neighborhood_results:
                                center = neighbor_record["center"]
                                relation = neighbor_record["r"]
                                connected = neighbor_record["connected"]
                                
                                content = f"{center['label']} {relation.type} {connected['label']}"
                                
                                result = RetrievalResult(
                                    id=f"graph_{center['id']}_{connected['id']}",
                                    content=content,
                                    score=relation.get("weight", 0.5),
                                    source_type="graph",
                                    metadata={
                                        "center_entity": center["label"],
                                        "connected_entity": connected["label"],
                                        "relationship": relation.type,
                                        "relationship_properties": dict(relation)
                                    },
                                    reasoning=f"Graph traversal from {entity_name}"
                                )
                                results.append(result)
            
            else:
                # General graph search based on query content
                async with self.neo4j_driver.session() as session:
                    general_query = """
                    MATCH (n:Entity)-[r]-(m:Entity)
                    WHERE toLower(n.label) CONTAINS toLower($query_text)
                       OR toLower(m.label) CONTAINS toLower($query_text)
                    RETURN n, r, m
                    LIMIT $limit
                    """
                    
                    general_results = await session.run(
                        general_query, 
                        {"query_text": query.text, "limit": max_results}
                    )
                    
                    async for record in general_results:
                        n = record["n"]
                        r = record["r"]
                        m = record["m"]
                        
                        content = f"{n['label']} {r.type} {m['label']}"
                        
                        result = RetrievalResult(
                            id=f"graph_{n['id']}_{m['id']}",
                            content=content,
                            score=r.get("weight", 0.5),
                            source_type="graph",
                            metadata={
                                "entity1": n["label"],
                                "entity2": m["label"],
                                "relationship": r.type
                            },
                            reasoning="General graph search"
                        )
                        results.append(result)
            
            reasoning_chain.append({
                "step": "graph_results",
                "details": {"results_found": len(results)}
            })
            
            return results[:max_results]
            
        except Exception as e:
            reasoning_chain.append({
                "step": "graph_search_error",
                "details": {"error": str(e)}
            })
            return []
    
    async def _filter_retrieval(self, 
                              query: RetrievalQuery,
                              max_results: int,
                              reasoning_chain: List[Dict[str, Any]]) -> List[RetrievalResult]:
        """Perform logical filter-based retrieval."""
        
        reasoning_chain.append({
            "step": "logical_filter",
            "details": {"method": "rule_based_filtering"}
        })
        
        # Simplified logical filtering - in production, implement proper filter parsing
        results = []
        
        # This is a placeholder implementation
        # In a real system, you'd parse the query for filter conditions
        # and apply them to your data sources
        
        reasoning_chain.append({
            "step": "filter_results",
            "details": {"results_found": len(results), "note": "Placeholder implementation"}
        })
        
        return results
    
    async def _hybrid_retrieval(self, 
                              query: RetrievalQuery,
                              max_results: int,
                              reasoning_chain: List[Dict[str, Any]]) -> List[RetrievalResult]:
        """Perform hybrid retrieval combining multiple strategies."""
        
        reasoning_chain.append({
            "step": "hybrid_search",
            "details": {"combining": ["vector", "graph"]}
        })
        
        # Get results from both vector and graph search
        vector_results = await self._vector_retrieval(query, max_results // 2, reasoning_chain)
        graph_results = await self._graph_retrieval(query, max_results // 2, reasoning_chain)
        
        # Combine and deduplicate results
        all_results = vector_results + graph_results
        
        # Simple deduplication by content similarity
        unique_results = []
        seen_content = set()
        
        for result in all_results:
            content_key = result.content.lower().strip()
            if content_key not in seen_content:
                unique_results.append(result)
                seen_content.add(content_key)
        
        # Sort by score
        unique_results.sort(key=lambda x: x.score, reverse=True)
        
        reasoning_chain.append({
            "step": "hybrid_combination",
            "details": {
                "vector_results": len(vector_results),
                "graph_results": len(graph_results),
                "combined_unique": len(unique_results)
            }
        })
        
        return unique_results[:max_results]
    
    async def _adaptive_retrieval(self, 
                                query: RetrievalQuery,
                                max_results: int,
                                reasoning_chain: List[Dict[str, Any]]) -> List[RetrievalResult]:
        """Perform adaptive retrieval that adjusts based on intermediate results."""
        
        reasoning_chain.append({
            "step": "adaptive_search",
            "details": {"approach": "iterative_refinement"}
        })
        
        # Start with vector search
        initial_results = await self._vector_retrieval(query, max_results // 3, reasoning_chain)
        
        # If vector search yields good results, supplement with graph search
        if len(initial_results) > 0 and np.mean([r.score for r in initial_results]) > 0.7:
            graph_results = await self._graph_retrieval(query, max_results // 3, reasoning_chain)
            all_results = initial_results + graph_results
        else:
            # If vector search is poor, try hybrid approach
            all_results = await self._hybrid_retrieval(query, max_results, reasoning_chain)
        
        reasoning_chain.append({
            "step": "adaptive_decision",
            "details": {
                "initial_quality": np.mean([r.score for r in initial_results]) if initial_results else 0,
                "final_count": len(all_results)
            }
        })
        
        return all_results[:max_results]
    
    def _calculate_confidence(self, 
                            results: List[RetrievalResult], 
                            query: RetrievalQuery) -> float:
        """Calculate confidence score for the retrieval results."""
        
        if not results:
            return 0.0
        
        # Average result score
        avg_score = np.mean([r.score for r in results])
        
        # Result count factor (more results = higher confidence, up to a point)
        count_factor = min(len(results) / 10, 1.0)
        
        # Query complexity factor (simpler queries should have higher confidence)
        complexity_factor = 1.0 - query.complexity_score * 0.3
        
        # Source diversity factor (multiple sources = higher confidence)
        source_types = set(r.source_type for r in results)
        diversity_factor = len(source_types) / 3  # Assuming max 3 source types
        
        confidence = (avg_score * 0.5 + 
                     count_factor * 0.2 + 
                     complexity_factor * 0.2 + 
                     diversity_factor * 0.1)
        
        return min(confidence, 1.0)
    
    async def get_retrieval_statistics(self) -> Dict[str, Any]:
        """Get statistics about the retrieval system."""
        
        return {
            "tools_available": self.tools_available,
            "strategies_supported": [s.value for s in RetrievalStrategy],
            "system_status": "operational",
            "last_updated": datetime.now().isoformat()
        }

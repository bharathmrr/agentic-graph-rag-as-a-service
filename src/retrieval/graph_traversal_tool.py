"""
Graph traversal tool for relationship-based queries
Uses Cypher (Neo4j) or Gremlin (Neptune) for graph queries
"""

from typing import List, Dict, Any, Optional
import structlog

from src.utils.logger import get_logger

logger = get_logger("graph_traversal_tool")


class GraphTraversalTool:
    """Tool for graph-based relationship traversal and queries."""

    def __init__(self, graph_db, ollama_client=None, model_name: str = "gemma3:1b-it-qat"):
        """
        Initialize graph traversal tool.

        Args:
            graph_db: Graph database interface (Neo4j or Neptune)
            ollama_client: Ollama client for query generation
            model_name: Model to use for Cypher/Gremlin generation
        """
        self.graph_db = graph_db
        self.ollama_client = ollama_client
        self.model_name = model_name
        logger.info("Graph traversal tool initialized")

    async def search(
        self,
        query: str,
        max_depth: int = 3,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Perform graph traversal based on natural language query.

        Args:
            query: Natural language query
            max_depth: Maximum traversal depth
            limit: Maximum number of results

        Returns:
            List of graph traversal results
        """

        logger.info(
            "Performing graph traversal",
            query_length=len(query),
            max_depth=max_depth,
            limit=limit
        )

        try:
            # Generate Cypher/Gremlin query from natural language
            graph_query = await self._generate_graph_query(query, max_depth, limit)

            logger.debug("Generated graph query", query=graph_query)

            # Execute query
            results = await self.graph_db.query(graph_query)

            logger.info("Graph traversal completed", result_count=len(results))
            return results

        except Exception as e:
            logger.error("Graph traversal failed", error=str(e))
            raise

    async def _generate_graph_query(
        self,
        natural_language_query: str,
        max_depth: int,
        limit: int
    ) -> str:
        """
        Generate Cypher/Gremlin query from natural language using LLM.

        Args:
            natural_language_query: User's natural language query
            max_depth: Maximum traversal depth
            limit: Result limit

        Returns:
            Generated graph query string
        """

        logger.info("Generating graph query from natural language")

        try:
            if not self.ollama_client:
                # Fallback to simple pattern matching query
                logger.warning("No LLM available, using fallback query")
                return self._generate_fallback_query(natural_language_query, max_depth, limit)

            # TODO: Implement LLM-based Cypher generation
            # For now, use fallback
            return self._generate_fallback_query(natural_language_query, max_depth, limit)

        except Exception as e:
            logger.error("Query generation failed", error=str(e))
            # Return fallback query on error
            return self._generate_fallback_query(natural_language_query, max_depth, limit)

    def _generate_fallback_query(
        self,
        query: str,
        max_depth: int,
        limit: int
    ) -> str:
        """Generate a simple fallback Cypher query."""

        # Simple pattern: find nodes and their relationships
        cypher_query = f"""
        MATCH path = (n)-[*1..{max_depth}]-(m)
        WHERE n.label CONTAINS $search_term OR m.label CONTAINS $search_term
        RETURN DISTINCT n, m, relationships(path) as rels
        LIMIT {limit}
        """

        return cypher_query

    async def find_related_entities(
        self,
        entity_id: str,
        relationship_types: Optional[List[str]] = None,
        max_depth: int = 2
    ) -> List[Dict[str, Any]]:
        """
        Find entities related to a given entity.

        Args:
            entity_id: ID of the source entity
            relationship_types: Optional filter for relationship types
            max_depth: Maximum traversal depth

        Returns:
            List of related entities
        """

        logger.info(
            "Finding related entities",
            entity_id=entity_id,
            max_depth=max_depth
        )

        try:
            # Build relationship type filter
            rel_filter = ""
            if relationship_types:
                rel_types = "|".join(relationship_types)
                rel_filter = f":{rel_types}"

            # Cypher query to find related entities
            query = f"""
            MATCH path = (source {{id: $entity_id}})-[{rel_filter}*1..{max_depth}]-(related)
            RETURN DISTINCT related, length(path) as distance
            ORDER BY distance
            """

            results = await self.graph_db.query(query, {"entity_id": entity_id})

            logger.info("Related entities found", count=len(results))
            return results

        except Exception as e:
            logger.error("Failed to find related entities", error=str(e))
            raise

    async def find_shortest_path(
        self,
        source_id: str,
        target_id: str,
        max_depth: int = 5
    ) -> Optional[Dict[str, Any]]:
        """
        Find shortest path between two entities.

        Args:
            source_id: Source entity ID
            target_id: Target entity ID
            max_depth: Maximum path length

        Returns:
            Shortest path information or None
        """

        logger.info(
            "Finding shortest path",
            source=source_id,
            target=target_id,
            max_depth=max_depth
        )

        try:
            query = f"""
            MATCH path = shortestPath(
                (source {{id: $source_id}})-[*1..{max_depth}]-(target {{id: $target_id}})
            )
            RETURN path, length(path) as path_length
            """

            results = await self.graph_db.query(
                query,
                {"source_id": source_id, "target_id": target_id}
            )

            if results:
                logger.info("Shortest path found", length=results[0].get('path_length'))
                return results[0]
            else:
                logger.info("No path found between entities")
                return None

        except Exception as e:
            logger.error("Failed to find shortest path", error=str(e))
            raise

    def get_name(self) -> str:
        """Get tool name for agent routing."""
        return "graph_traversal"

    def get_description(self) -> str:
        """Get tool description for agent routing."""
        return (
            "Traverses knowledge graph relationships to find connected entities. "
            "Best for queries about relationships, connections, and multi-hop reasoning."
        )

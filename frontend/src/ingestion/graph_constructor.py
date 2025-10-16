"""
Graph constructor for building knowledge graphs in Neo4j/Neptune
Provides unified interface for both graph databases
"""

from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
import structlog

from src.utils.logger import get_logger

logger = get_logger("graph_constructor")


class GraphDBInterface(ABC):
    """Abstract interface for graph database operations."""

    @abstractmethod
    async def create_node(self, node_data: Dict[str, Any]) -> str:
        """Create a node in the graph."""
        pass

    @abstractmethod
    async def create_relationship(self, rel_data: Dict[str, Any]) -> str:
        """Create a relationship in the graph."""
        pass

    @abstractmethod
    async def query(self, query_str: str, parameters: Optional[Dict] = None) -> List[Dict]:
        """Execute a query against the graph."""
        pass

    @abstractmethod
    async def close(self):
        """Close database connection."""
        pass


class Neo4jGraphDB(GraphDBInterface):
    """Neo4j implementation of graph database interface."""

    def __init__(self, driver):
        """Initialize with Neo4j driver."""
        self.driver = driver
        logger.info("Neo4j graph database initialized")

    async def create_node(self, node_data: Dict[str, Any]) -> str:
        """Create a node in Neo4j."""

        node_id = node_data.get('id')
        label = node_data.get('type', 'Entity')
        properties = node_data.get('properties', {})

        # Add core properties
        properties['id'] = node_id
        properties['label'] = node_data.get('label', '')

        query = f"""
        MERGE (n:{label} {{id: $id}})
        SET n += $properties
        RETURN n.id as id
        """

        try:
            with self.driver.session() as session:
                result = session.run(query, id=node_id, properties=properties)
                record = result.single()
                return record['id'] if record else node_id

        except Exception as e:
            logger.error("Failed to create node", error=str(e), node_id=node_id)
            raise

    async def create_relationship(self, rel_data: Dict[str, Any]) -> str:
        """Create a relationship in Neo4j."""

        source_id = rel_data.get('source_id')
        target_id = rel_data.get('target_id')
        rel_type = rel_data.get('type', 'RELATED_TO')
        properties = rel_data.get('properties', {})

        query = f"""
        MATCH (source {{id: $source_id}})
        MATCH (target {{id: $target_id}})
        MERGE (source)-[r:{rel_type}]->(target)
        SET r += $properties
        RETURN id(r) as rel_id
        """

        try:
            with self.driver.session() as session:
                result = session.run(
                    query,
                    source_id=source_id,
                    target_id=target_id,
                    properties=properties
                )
                record = result.single()
                return str(record['rel_id']) if record else f"{source_id}_{rel_type}_{target_id}"

        except Exception as e:
            logger.error("Failed to create relationship", error=str(e))
            raise

    async def query(self, query_str: str, parameters: Optional[Dict] = None) -> List[Dict]:
        """Execute Cypher query."""

        try:
            with self.driver.session() as session:
                result = session.run(query_str, parameters or {})
                return [dict(record) for record in result]

        except Exception as e:
            logger.error("Query execution failed", error=str(e))
            raise

    async def close(self):
        """Close Neo4j driver."""
        if self.driver:
            self.driver.close()
            logger.info("Neo4j connection closed")


class NeptuneGraphDB(GraphDBInterface):
    """AWS Neptune implementation of graph database interface."""

    def __init__(self, endpoint: str, port: int = 8182):
        """Initialize Neptune connection."""
        self.endpoint = endpoint
        self.port = port
        logger.info("Neptune graph database initialized", endpoint=endpoint)

    async def create_node(self, node_data: Dict[str, Any]) -> str:
        """Create a vertex in Neptune using Gremlin."""
        # TODO: Implement Neptune/Gremlin node creation
        logger.warning("Neptune implementation pending")
        return node_data.get('id', '')

    async def create_relationship(self, rel_data: Dict[str, Any]) -> str:
        """Create an edge in Neptune using Gremlin."""
        # TODO: Implement Neptune/Gremlin edge creation
        logger.warning("Neptune implementation pending")
        return f"{rel_data.get('source_id')}_{rel_data.get('type')}_{rel_data.get('target_id')}"

    async def query(self, query_str: str, parameters: Optional[Dict] = None) -> List[Dict]:
        """Execute Gremlin query."""
        # TODO: Implement Neptune/Gremlin query execution
        logger.warning("Neptune implementation pending")
        return []

    async def close(self):
        """Close Neptune connection."""
        logger.info("Neptune connection closed")


class GraphConstructor:
    """Constructs knowledge graphs from ontology data."""

    def __init__(self, graph_db: GraphDBInterface):
        """
        Initialize graph constructor.

        Args:
            graph_db: Graph database interface (Neo4j or Neptune)
        """
        self.graph_db = graph_db
        logger.info("Graph constructor initialized")

    async def build_graph(
        self,
        entities: List[Dict[str, Any]],
        relationships: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Build knowledge graph from entities and relationships.

        Args:
            entities: List of entity dictionaries
            relationships: List of relationship dictionaries

        Returns:
            Build statistics
        """

        logger.info(
            "Building knowledge graph",
            entity_count=len(entities),
            relationship_count=len(relationships)
        )

        try:
            # Create nodes
            created_nodes = 0
            for entity in entities:
                await self.graph_db.create_node(entity)
                created_nodes += 1

            logger.info("Nodes created", count=created_nodes)

            # Create relationships
            created_rels = 0
            for relationship in relationships:
                await self.graph_db.create_relationship(relationship)
                created_rels += 1

            logger.info("Relationships created", count=created_rels)

            stats = {
                "nodes_created": created_nodes,
                "relationships_created": created_rels,
                "status": "success"
            }

            return stats

        except Exception as e:
            logger.error("Graph construction failed", error=str(e))
            raise

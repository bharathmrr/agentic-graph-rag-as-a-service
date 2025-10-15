"""
Neo4j Data Pipeline Service
Ensures data flows from upload → processing → Neo4j database
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging

try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False

logger = logging.getLogger(__name__)

class Neo4jDataPipeline:
    """
    Handles the complete data pipeline from document upload to Neo4j storage
    """
    
    def __init__(self, neo4j_uri: str = "bolt://localhost:7687", 
                 neo4j_user: str = "neo4j", 
                 neo4j_password: str = "password"):
        self.neo4j_uri = neo4j_uri
        self.neo4j_user = neo4j_user
        self.neo4j_password = neo4j_password
        self.driver = None
        self.connected = False
        
        # Initialize Neo4j connection
        self._initialize_neo4j()
    
    def _initialize_neo4j(self):
        """Initialize Neo4j database connection"""
        if not NEO4J_AVAILABLE:
            logger.warning("Neo4j driver not available. Install with: pip install neo4j")
            return
        
        try:
            self.driver = GraphDatabase.driver(
                self.neo4j_uri,
                auth=(self.neo4j_user, self.neo4j_password)
            )
            
            # Test connection
            with self.driver.session() as session:
                result = session.run("RETURN 1 as test")
                test_value = result.single()["test"]
                if test_value == 1:
                    self.connected = True
                    logger.info(f"✅ Neo4j connected successfully: {self.neo4j_uri}")
                    
                    # Create indexes for better performance
                    self._create_indexes()
                    
        except Exception as e:
            logger.error(f"❌ Failed to connect to Neo4j: {e}")
            self.connected = False
    
    def _create_indexes(self):
        """Create necessary indexes in Neo4j for better performance"""
        indexes = [
            "CREATE INDEX entity_name_idx IF NOT EXISTS FOR (e:Entity) ON (e.name)",
            "CREATE INDEX entity_type_idx IF NOT EXISTS FOR (e:Entity) ON (e.type)",
            "CREATE INDEX document_id_idx IF NOT EXISTS FOR (d:Document) ON (d.id)",
            "CREATE CONSTRAINT entity_unique IF NOT EXISTS FOR (e:Entity) REQUIRE (e.id) IS UNIQUE",
            "CREATE CONSTRAINT document_unique IF NOT EXISTS FOR (d:Document) REQUIRE (d.id) IS UNIQUE"
        ]
        
        try:
            with self.driver.session() as session:
                for index_query in indexes:
                    try:
                        session.run(index_query)
                        logger.debug(f"Created index: {index_query}")
                    except Exception as e:
                        logger.debug(f"Index may already exist: {e}")
        except Exception as e:
            logger.warning(f"Failed to create indexes: {e}")
    
    async def process_document_to_neo4j(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complete pipeline: Document → Ontology → Neo4j
        """
        if not self.connected:
            return {
                "success": False,
                "error": "Neo4j not connected",
                "message": "Cannot process data without Neo4j connection"
            }
        
        try:
            # Step 1: Store document metadata
            doc_result = await self._store_document_metadata(document_data)
            
            # Step 2: Process ontology if available
            ontology_result = None
            if "ontology" in document_data:
                ontology_result = await self._store_ontology_data(
                    document_data["ontology"], 
                    document_data.get("document_id")
                )
            
            # Step 3: Store entities and relationships
            entities_result = None
            relationships_result = None
            
            if ontology_result and ontology_result.get("success"):
                if "entities" in document_data["ontology"]:
                    entities_result = await self._store_entities(
                        document_data["ontology"]["entities"],
                        document_data.get("document_id")
                    )
                
                if "relationships" in document_data["ontology"]:
                    relationships_result = await self._store_relationships(
                        document_data["ontology"]["relationships"],
                        document_data.get("document_id")
                    )
            
            # Step 4: Create document-entity connections
            connections_result = await self._create_document_connections(
                document_data.get("document_id")
            )
            
            return {
                "success": True,
                "document_stored": doc_result.get("success", False),
                "ontology_stored": ontology_result.get("success", False) if ontology_result else False,
                "entities_stored": entities_result.get("success", False) if entities_result else False,
                "relationships_stored": relationships_result.get("success", False) if relationships_result else False,
                "connections_created": connections_result.get("success", False),
                "neo4j_stats": await self._get_database_stats(),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Pipeline processing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to process document through pipeline"
            }
    
    async def _store_document_metadata(self, document_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store document metadata in Neo4j"""
        try:
            with self.driver.session() as session:
                query = """
                MERGE (d:Document {id: $doc_id})
                SET d.name = $name,
                    d.size = $size,
                    d.type = $type,
                    d.uploaded_at = $uploaded_at,
                    d.processed_at = $processed_at
                RETURN d.id as document_id
                """
                
                result = session.run(query, {
                    "doc_id": document_data.get("document_id", "unknown"),
                    "name": document_data.get("filename", "unknown"),
                    "size": document_data.get("size", 0),
                    "type": document_data.get("type", "unknown"),
                    "uploaded_at": document_data.get("uploaded_at", datetime.now().isoformat()),
                    "processed_at": datetime.now().isoformat()
                })
                
                record = result.single()
                return {
                    "success": True,
                    "document_id": record["document_id"] if record else None
                }
                
        except Exception as e:
            logger.error(f"Failed to store document metadata: {e}")
            return {"success": False, "error": str(e)}
    
    async def _store_ontology_data(self, ontology_data: Dict[str, Any], document_id: str) -> Dict[str, Any]:
        """Store ontology metadata"""
        try:
            with self.driver.session() as session:
                query = """
                MERGE (o:Ontology {document_id: $doc_id})
                SET o.entity_count = $entity_count,
                    o.relationship_count = $relationship_count,
                    o.created_at = $created_at
                RETURN o.document_id as ontology_id
                """
                
                entity_count = len(ontology_data.get("entities", {}))
                relationship_count = len(ontology_data.get("relationships", []))
                
                result = session.run(query, {
                    "doc_id": document_id,
                    "entity_count": entity_count,
                    "relationship_count": relationship_count,
                    "created_at": datetime.now().isoformat()
                })
                
                return {"success": True, "entity_count": entity_count, "relationship_count": relationship_count}
                
        except Exception as e:
            logger.error(f"Failed to store ontology data: {e}")
            return {"success": False, "error": str(e)}
    
    async def _store_entities(self, entities_data: Dict[str, Any], document_id: str) -> Dict[str, Any]:
        """Store entities in Neo4j"""
        try:
            stored_count = 0
            
            with self.driver.session() as session:
                for entity_type, entity_info in entities_data.items():
                    # Handle different entity data formats
                    if isinstance(entity_info, dict):
                        entity_items = entity_info.get("items", [])
                        if not entity_items and "count" in entity_info:
                            # Generate placeholder entities if only count is available
                            entity_items = [f"{entity_type}_{i+1}" for i in range(entity_info["count"])]
                    elif isinstance(entity_info, list):
                        entity_items = entity_info
                    else:
                        entity_items = [str(entity_info)]
                    
                    # Store each entity
                    for idx, entity_name in enumerate(entity_items):
                        query = """
                        MERGE (e:Entity {id: $entity_id})
                        SET e.name = $name,
                            e.type = $type,
                            e.document_id = $doc_id,
                            e.created_at = $created_at
                        RETURN e.id as entity_id
                        """
                        
                        entity_id = f"{document_id}_{entity_type}_{idx}"
                        
                        result = session.run(query, {
                            "entity_id": entity_id,
                            "name": str(entity_name),
                            "type": entity_type,
                            "doc_id": document_id,
                            "created_at": datetime.now().isoformat()
                        })
                        
                        if result.single():
                            stored_count += 1
            
            return {"success": True, "stored_count": stored_count}
            
        except Exception as e:
            logger.error(f"Failed to store entities: {e}")
            return {"success": False, "error": str(e)}
    
    async def _store_relationships(self, relationships_data: List[Dict[str, Any]], document_id: str) -> Dict[str, Any]:
        """Store relationships in Neo4j"""
        try:
            stored_count = 0
            
            with self.driver.session() as session:
                for relationship in relationships_data:
                    source = relationship.get("source", "")
                    target = relationship.get("target", "")
                    rel_type = relationship.get("type", "RELATED_TO")
                    
                    if source and target:
                        query = """
                        MATCH (s:Entity {name: $source})
                        MATCH (t:Entity {name: $target})
                        WHERE s.document_id = $doc_id AND t.document_id = $doc_id
                        MERGE (s)-[r:RELATIONSHIP {type: $rel_type}]->(t)
                        SET r.document_id = $doc_id,
                            r.created_at = $created_at
                        RETURN r
                        """
                        
                        result = session.run(query, {
                            "source": source,
                            "target": target,
                            "rel_type": rel_type,
                            "doc_id": document_id,
                            "created_at": datetime.now().isoformat()
                        })
                        
                        if result.single():
                            stored_count += 1
            
            return {"success": True, "stored_count": stored_count}
            
        except Exception as e:
            logger.error(f"Failed to store relationships: {e}")
            return {"success": False, "error": str(e)}
    
    async def _create_document_connections(self, document_id: str) -> Dict[str, Any]:
        """Create connections between document and its entities"""
        try:
            with self.driver.session() as session:
                query = """
                MATCH (d:Document {id: $doc_id})
                MATCH (e:Entity {document_id: $doc_id})
                MERGE (d)-[r:CONTAINS]->(e)
                SET r.created_at = $created_at
                RETURN count(r) as connections_created
                """
                
                result = session.run(query, {
                    "doc_id": document_id,
                    "created_at": datetime.now().isoformat()
                })
                
                record = result.single()
                connections_count = record["connections_created"] if record else 0
                
                return {"success": True, "connections_created": connections_count}
                
        except Exception as e:
            logger.error(f"Failed to create document connections: {e}")
            return {"success": False, "error": str(e)}
    
    async def _get_database_stats(self) -> Dict[str, Any]:
        """Get current database statistics"""
        try:
            with self.driver.session() as session:
                stats_queries = {
                    "documents": "MATCH (d:Document) RETURN count(d) as count",
                    "entities": "MATCH (e:Entity) RETURN count(e) as count",
                    "relationships": "MATCH ()-[r:RELATIONSHIP]->() RETURN count(r) as count",
                    "ontologies": "MATCH (o:Ontology) RETURN count(o) as count"
                }
                
                stats = {}
                for stat_name, query in stats_queries.items():
                    result = session.run(query)
                    record = result.single()
                    stats[stat_name] = record["count"] if record else 0
                
                return stats
                
        except Exception as e:
            logger.error(f"Failed to get database stats: {e}")
            return {"error": str(e)}
    
    async def verify_data_transfer(self, document_id: str) -> Dict[str, Any]:
        """Verify that data was properly transferred to Neo4j"""
        try:
            with self.driver.session() as session:
                # Check document exists
                doc_query = "MATCH (d:Document {id: $doc_id}) RETURN d"
                doc_result = session.run(doc_query, {"doc_id": document_id})
                document_exists = doc_result.single() is not None
                
                # Check entities exist
                entities_query = "MATCH (e:Entity {document_id: $doc_id}) RETURN count(e) as count"
                entities_result = session.run(entities_query, {"doc_id": document_id})
                entities_count = entities_result.single()["count"]
                
                # Check relationships exist
                rel_query = "MATCH ()-[r:RELATIONSHIP {document_id: $doc_id}]->() RETURN count(r) as count"
                rel_result = session.run(rel_query, {"doc_id": document_id})
                relationships_count = rel_result.single()["count"]
                
                return {
                    "success": True,
                    "document_exists": document_exists,
                    "entities_count": entities_count,
                    "relationships_count": relationships_count,
                    "data_transferred": document_exists and entities_count > 0,
                    "verification_time": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Failed to verify data transfer: {e}")
            return {"success": False, "error": str(e)}
    
    def close(self):
        """Close Neo4j connection"""
        if self.driver:
            self.driver.close()
            logger.info("Neo4j connection closed")

# Global pipeline instance
neo4j_pipeline = None

def get_neo4j_pipeline() -> Neo4jDataPipeline:
    """Get or create Neo4j pipeline instance"""
    global neo4j_pipeline
    if neo4j_pipeline is None:
        neo4j_pipeline = Neo4jDataPipeline()
    return neo4j_pipeline

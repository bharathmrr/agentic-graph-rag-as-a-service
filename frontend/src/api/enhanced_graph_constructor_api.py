"""
Enhanced Graph Constructor API with Neo4j integration and D3.js visualization
"""
import time
import uuid
import json
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel
from neo4j import GraphDatabase
import networkx as nx
import numpy as np
from collections import defaultdict

class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    color: str
    size: int
    metadata: Dict[str, Any]
    neo4j_id: Optional[int] = None
    x: Optional[float] = None
    y: Optional[float] = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relation_type: str
    weight: float
    color: str
    thickness: int
    metadata: Dict[str, Any]

class GraphVisualizationData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    statistics: Dict[str, Any]
    layout_info: Dict[str, Any]

class GraphResponse(BaseModel):
    success: bool
    status_code: int
    processing_ms: int
    data: Optional[Dict[str, Any]] = None
    warnings: List[str] = []
    error: Optional[str] = None

class EnhancedGraphConstructor:
    def __init__(self, neo4j_uri: str = "bolt://localhost:7687", neo4j_user: str = "neo4j", neo4j_password: str = "password"):
        self.neo4j_uri = neo4j_uri
        self.neo4j_user = neo4j_user
        self.neo4j_password = neo4j_password
        
        # Initialize Neo4j driver
        try:
            self.driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
            self.driver.verify_connectivity()
        except Exception as e:
            print(f"Warning: Neo4j connection failed: {e}")
            self.driver = None
        
        # Entity type colors
        self.entity_colors = {
            "PERSON": "#3b82f6",      # Blue
            "ORGANIZATION": "#10b981", # Green
            "LOCATION": "#f59e0b",     # Orange
            "EVENT": "#8b5cf6",        # Purple
            "CONCEPT": "#06b6d4",      # Cyan
            "TECHNOLOGY": "#ec4899",   # Pink
            "PRODUCT": "#84cc16",      # Lime
            "SKILL": "#f97316",        # Orange
            "ROLE": "#6366f1",         # Indigo
            "PROCESS": "#14b8a6",      # Teal
            "UNKNOWN": "#64748b"       # Gray
        }
        
        # Relation type colors
        self.relation_colors = {
            "works_for": "#3b82f6",
            "located_in": "#10b981",
            "part_of": "#f59e0b",
            "related_to": "#8b5cf6",
            "uses": "#06b6d4",
            "creates": "#ec4899",
            "manages": "#84cc16",
            "collaborates_with": "#f97316",
            "depends_on": "#6366f1",
            "influences": "#14b8a6"
        }
    
    def close(self):
        """Close Neo4j driver connection"""
        if self.driver:
            self.driver.close()
    
    async def create_graph_from_ontology(self, ontology_data: Dict[str, Any], doc_id: str) -> Dict[str, Any]:
        """Create graph from ontology data"""
        start_time = time.time()
        
        try:
            if not self.driver:
                return GraphResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error="Neo4j connection not available"
                ).dict()
            
            entities = ontology_data.get("entities", {})
            relations = ontology_data.get("relations", [])
            
            # Create nodes and relationships in Neo4j
            with self.driver.session() as session:
                # Clear existing data for this document
                session.run(
                    "MATCH (n) WHERE n.source_doc_id = $doc_id DETACH DELETE n",
                    doc_id=doc_id
                )
                
                # Create entity nodes
                entity_id_map = {}
                for entity_type, type_data in entities.items():
                    for entity in type_data.get("items", []):
                        neo4j_result = session.run(
                            """
                            CREATE (n:Entity {
                                entity_id: $entity_id,
                                name: $name,
                                type: $type,
                                normalized: $normalized,
                                source_doc_id: $doc_id,
                                confidence: $confidence,
                                sentence_context: $sentence_context,
                                attributes: $attributes
                            })
                            RETURN id(n) as neo4j_id
                            """,
                            entity_id=entity["id"],
                            name=entity["name"],
                            type=entity_type,
                            normalized=entity.get("normalized", entity["name"].lower()),
                            doc_id=doc_id,
                            confidence=entity.get("confidence", 0.8),
                            sentence_context=entity.get("sentence_context", ""),
                            attributes=json.dumps(entity.get("attributes", {}))
                        )
                        
                        neo4j_id = neo4j_result.single()["neo4j_id"]
                        entity_id_map[entity["id"]] = neo4j_id
                
                # Create relationships
                for relation in relations:
                    source_id = relation.get("source_entity_id")
                    target_id = relation.get("target_entity_id")
                    
                    if source_id in entity_id_map and target_id in entity_id_map:
                        session.run(
                            """
                            MATCH (source) WHERE id(source) = $source_neo4j_id
                            MATCH (target) WHERE id(target) = $target_neo4j_id
                            CREATE (source)-[r:RELATES {
                                relation_id: $relation_id,
                                relation_type: $relation_type,
                                strength: $strength,
                                confidence: $confidence,
                                sentence_context: $sentence_context,
                                source_doc_id: $doc_id
                            }]->(target)
                            """,
                            source_neo4j_id=entity_id_map[source_id],
                            target_neo4j_id=entity_id_map[target_id],
                            relation_id=relation["id"],
                            relation_type=relation["relation_type"],
                            strength=relation.get("strength", 0.7),
                            confidence=relation.get("confidence", 0.8),
                            sentence_context=relation.get("sentence_context", ""),
                            doc_id=doc_id
                        )
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return GraphResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data={
                    "nodes_created": sum(len(type_data.get("items", [])) for type_data in entities.values()),
                    "relationships_created": len(relations),
                    "doc_id": doc_id,
                    "entity_id_map": entity_id_map
                }
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return GraphResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Graph creation failed: {str(e)}"
            ).dict()
    
    async def get_graph_visualization_data(self, doc_id: Optional[str] = None, entity_types: Optional[List[str]] = None, limit: int = 100) -> Dict[str, Any]:
        """Get graph data formatted for D3.js visualization"""
        start_time = time.time()
        
        try:
            if not self.driver:
                return GraphResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error="Neo4j connection not available"
                ).dict()
            
            with self.driver.session() as session:
                # Build query conditions
                where_conditions = []
                params = {"limit": limit}
                
                if doc_id:
                    where_conditions.append("n.source_doc_id = $doc_id")
                    params["doc_id"] = doc_id
                
                if entity_types:
                    where_conditions.append("n.type IN $entity_types")
                    params["entity_types"] = entity_types
                
                where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
                
                # Get nodes
                nodes_query = f"""
                MATCH (n:Entity)
                {where_clause}
                RETURN n, id(n) as neo4j_id
                LIMIT $limit
                """
                
                nodes_result = session.run(nodes_query, **params)
                nodes = []
                node_id_map = {}
                
                for record in nodes_result:
                    node = record["n"]
                    neo4j_id = record["neo4j_id"]
                    
                    # Calculate node size based on degree (number of connections)
                    degree_result = session.run(
                        "MATCH (n)-[r]-() WHERE id(n) = $neo4j_id RETURN count(r) as degree",
                        neo4j_id=neo4j_id
                    )
                    degree = degree_result.single()["degree"] if degree_result.single() else 0
                    
                    node_size = max(8, min(30, 8 + degree * 2))  # Size between 8-30 based on connections
                    
                    graph_node = GraphNode(
                        id=node["entity_id"],
                        label=node["name"],
                        type=node["type"],
                        color=self.entity_colors.get(node["type"], self.entity_colors["UNKNOWN"]),
                        size=node_size,
                        metadata={
                            "confidence": node.get("confidence", 0.8),
                            "sentence_context": node.get("sentence_context", ""),
                            "attributes": json.loads(node.get("attributes", "{}")),
                            "source_doc_id": node.get("source_doc_id", ""),
                            "degree": degree
                        },
                        neo4j_id=neo4j_id
                    )
                    
                    nodes.append(graph_node)
                    node_id_map[node["entity_id"]] = neo4j_id
                
                # Get edges
                edges_query = f"""
                MATCH (source:Entity)-[r:RELATES]->(target:Entity)
                {where_clause.replace('n.', 'source.') if where_clause else ''}
                RETURN source.entity_id as source_id, target.entity_id as target_id, r
                LIMIT $limit
                """
                
                edges_result = session.run(edges_query, **params)
                edges = []
                
                for record in edges_result:
                    source_id = record["source_id"]
                    target_id = record["target_id"]
                    rel = record["r"]
                    
                    # Only include edges where both nodes are in our node set
                    if source_id in node_id_map and target_id in node_id_map:
                        strength = rel.get("strength", 0.7)
                        thickness = max(1, min(8, int(strength * 8)))  # Thickness 1-8 based on strength
                        
                        graph_edge = GraphEdge(
                            id=rel["relation_id"],
                            source=source_id,
                            target=target_id,
                            relation_type=rel["relation_type"],
                            weight=strength,
                            color=self.relation_colors.get(rel["relation_type"], "#64748b"),
                            thickness=thickness,
                            metadata={
                                "confidence": rel.get("confidence", 0.8),
                                "sentence_context": rel.get("sentence_context", ""),
                                "source_doc_id": rel.get("source_doc_id", "")
                            }
                        )
                        
                        edges.append(graph_edge)
                
                # Calculate layout using NetworkX
                layout_info = self._calculate_layout(nodes, edges)
                
                # Calculate statistics
                statistics = self._calculate_graph_statistics(nodes, edges)
                
                processing_time = int((time.time() - start_time) * 1000)
                
                return GraphResponse(
                    success=True,
                    status_code=200,
                    processing_ms=processing_time,
                    data={
                        "nodes": [node.dict() for node in nodes],
                        "edges": [edge.dict() for edge in edges],
                        "statistics": statistics,
                        "layout_info": layout_info,
                        "filters": {
                            "doc_id": doc_id,
                            "entity_types": entity_types,
                            "limit": limit
                        }
                    }
                ).dict()
                
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return GraphResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Graph visualization data retrieval failed: {str(e)}"
            ).dict()
    
    def _calculate_layout(self, nodes: List[GraphNode], edges: List[GraphEdge]) -> Dict[str, Any]:
        """Calculate node positions using NetworkX force-directed layout"""
        try:
            # Create NetworkX graph
            G = nx.Graph()
            
            # Add nodes
            for node in nodes:
                G.add_node(node.id, **node.metadata)
            
            # Add edges
            for edge in edges:
                G.add_edge(edge.source, edge.target, weight=edge.weight)
            
            # Calculate layout
            if len(G.nodes()) > 0:
                pos = nx.spring_layout(G, k=1, iterations=50, seed=42)
                
                # Update node positions
                for node in nodes:
                    if node.id in pos:
                        node.x = float(pos[node.id][0]) * 500  # Scale for visualization
                        node.y = float(pos[node.id][1]) * 500
                
                return {
                    "algorithm": "spring_layout",
                    "parameters": {"k": 1, "iterations": 50},
                    "bounds": {
                        "min_x": min(pos.values(), key=lambda p: p[0])[0] * 500,
                        "max_x": max(pos.values(), key=lambda p: p[0])[0] * 500,
                        "min_y": min(pos.values(), key=lambda p: p[1])[1] * 500,
                        "max_y": max(pos.values(), key=lambda p: p[1])[1] * 500
                    }
                }
            else:
                return {"algorithm": "none", "message": "No nodes to layout"}
                
        except Exception as e:
            print(f"Layout calculation failed: {e}")
            return {"algorithm": "fallback", "error": str(e)}
    
    def _calculate_graph_statistics(self, nodes: List[GraphNode], edges: List[GraphEdge]) -> Dict[str, Any]:
        """Calculate graph statistics"""
        try:
            # Basic counts
            total_nodes = len(nodes)
            total_edges = len(edges)
            
            # Entity type distribution
            entity_type_counts = defaultdict(int)
            for node in nodes:
                entity_type_counts[node.type] += 1
            
            # Relation type distribution
            relation_type_counts = defaultdict(int)
            for edge in edges:
                relation_type_counts[edge.relation_type] += 1
            
            # Calculate average degree
            degree_sum = sum(node.metadata.get("degree", 0) for node in nodes)
            avg_degree = degree_sum / total_nodes if total_nodes > 0 else 0
            
            # Calculate average edge weight
            weight_sum = sum(edge.weight for edge in edges)
            avg_weight = weight_sum / total_edges if total_edges > 0 else 0
            
            return {
                "total_nodes": total_nodes,
                "total_edges": total_edges,
                "average_degree": round(avg_degree, 2),
                "average_edge_weight": round(avg_weight, 2),
                "entity_type_distribution": dict(entity_type_counts),
                "relation_type_distribution": dict(relation_type_counts),
                "density": round(total_edges / (total_nodes * (total_nodes - 1) / 2), 4) if total_nodes > 1 else 0
            }
            
        except Exception as e:
            return {"error": f"Statistics calculation failed: {str(e)}"}
    
    async def get_entity_subgraph(self, entity_id: str, depth: int = 2) -> Dict[str, Any]:
        """Get subgraph centered on a specific entity"""
        start_time = time.time()
        
        try:
            if not self.driver:
                return GraphResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error="Neo4j connection not available"
                ).dict()
            
            with self.driver.session() as session:
                # Get subgraph using variable-length path
                subgraph_query = """
                MATCH path = (center:Entity {entity_id: $entity_id})-[*1..$depth]-(connected:Entity)
                WITH center, connected, relationships(path) as rels
                RETURN center, connected, rels
                """
                
                result = session.run(subgraph_query, entity_id=entity_id, depth=depth)
                
                nodes_dict = {}
                edges_dict = {}
                
                for record in result:
                    center = record["center"]
                    connected = record["connected"]
                    rels = record["rels"]
                    
                    # Add center node
                    if center["entity_id"] not in nodes_dict:
                        nodes_dict[center["entity_id"]] = center
                    
                    # Add connected node
                    if connected["entity_id"] not in nodes_dict:
                        nodes_dict[connected["entity_id"]] = connected
                    
                    # Add relationships
                    for rel in rels:
                        rel_id = rel.get("relation_id", str(uuid.uuid4()))
                        if rel_id not in edges_dict:
                            edges_dict[rel_id] = rel
                
                # Convert to visualization format
                nodes = []
                for node_data in nodes_dict.values():
                    node = GraphNode(
                        id=node_data["entity_id"],
                        label=node_data["name"],
                        type=node_data["type"],
                        color=self.entity_colors.get(node_data["type"], self.entity_colors["UNKNOWN"]),
                        size=15 if node_data["entity_id"] == entity_id else 10,  # Highlight center node
                        metadata={
                            "confidence": node_data.get("confidence", 0.8),
                            "sentence_context": node_data.get("sentence_context", ""),
                            "attributes": json.loads(node_data.get("attributes", "{}")),
                            "source_doc_id": node_data.get("source_doc_id", ""),
                            "is_center": node_data["entity_id"] == entity_id
                        }
                    )
                    nodes.append(node)
                
                edges = []
                for rel_data in edges_dict.values():
                    edge = GraphEdge(
                        id=rel_data.get("relation_id", str(uuid.uuid4())),
                        source=rel_data.get("source_entity_id", ""),
                        target=rel_data.get("target_entity_id", ""),
                        relation_type=rel_data["relation_type"],
                        weight=rel_data.get("strength", 0.7),
                        color=self.relation_colors.get(rel_data["relation_type"], "#64748b"),
                        thickness=3,
                        metadata={
                            "confidence": rel_data.get("confidence", 0.8),
                            "sentence_context": rel_data.get("sentence_context", "")
                        }
                    )
                    edges.append(edge)
                
                # Calculate layout
                layout_info = self._calculate_layout(nodes, edges)
                statistics = self._calculate_graph_statistics(nodes, edges)
                
                processing_time = int((time.time() - start_time) * 1000)
                
                return GraphResponse(
                    success=True,
                    status_code=200,
                    processing_ms=processing_time,
                    data={
                        "center_entity_id": entity_id,
                        "depth": depth,
                        "nodes": [node.dict() for node in nodes],
                        "edges": [edge.dict() for edge in edges],
                        "statistics": statistics,
                        "layout_info": layout_info
                    }
                ).dict()
                
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return GraphResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Subgraph retrieval failed: {str(e)}"
            ).dict()
    
    async def get_graph_statistics(self, doc_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive graph statistics"""
        start_time = time.time()
        
        try:
            if not self.driver:
                return GraphResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error="Neo4j connection not available"
                ).dict()
            
            with self.driver.session() as session:
                where_clause = "WHERE n.source_doc_id = $doc_id" if doc_id else ""
                params = {"doc_id": doc_id} if doc_id else {}
                
                # Get node statistics
                node_stats_query = f"""
                MATCH (n:Entity)
                {where_clause}
                RETURN 
                    count(n) as total_nodes,
                    collect(distinct n.type) as entity_types,
                    n.type as type,
                    count(n.type) as type_count
                """
                
                # Get relationship statistics
                rel_stats_query = f"""
                MATCH (n:Entity)-[r:RELATES]->(m:Entity)
                {where_clause.replace('n.', 'n.') if where_clause else ''}
                RETURN 
                    count(r) as total_relationships,
                    collect(distinct r.relation_type) as relation_types,
                    r.relation_type as type,
                    count(r.relation_type) as type_count,
                    avg(r.strength) as avg_strength
                """
                
                node_result = session.run(node_stats_query, **params)
                rel_result = session.run(rel_stats_query, **params)
                
                # Process results
                node_stats = {"total_nodes": 0, "entity_types": [], "type_distribution": {}}
                rel_stats = {"total_relationships": 0, "relation_types": [], "type_distribution": {}, "avg_strength": 0}
                
                for record in node_result:
                    if record["total_nodes"]:
                        node_stats["total_nodes"] = record["total_nodes"]
                        node_stats["entity_types"] = record["entity_types"]
                    if record["type"]:
                        node_stats["type_distribution"][record["type"]] = record["type_count"]
                
                for record in rel_result:
                    if record["total_relationships"]:
                        rel_stats["total_relationships"] = record["total_relationships"]
                        rel_stats["relation_types"] = record["relation_types"]
                        rel_stats["avg_strength"] = round(record["avg_strength"], 3)
                    if record["type"]:
                        rel_stats["type_distribution"][record["type"]] = record["type_count"]
                
                processing_time = int((time.time() - start_time) * 1000)
                
                return GraphResponse(
                    success=True,
                    status_code=200,
                    processing_ms=processing_time,
                    data={
                        "node_statistics": node_stats,
                        "relationship_statistics": rel_stats,
                        "graph_density": rel_stats["total_relationships"] / (node_stats["total_nodes"] * (node_stats["total_nodes"] - 1) / 2) if node_stats["total_nodes"] > 1 else 0,
                        "doc_id": doc_id
                    }
                ).dict()
                
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return GraphResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Graph statistics retrieval failed: {str(e)}"
            ).dict()

# Global graph constructor instance
graph_constructor = EnhancedGraphConstructor()

# FastAPI endpoints
async def create_graph_from_ontology_endpoint(ontology_data: Dict[str, Any], doc_id: str):
    """Create graph from ontology endpoint"""
    result = await graph_constructor.create_graph_from_ontology(ontology_data, doc_id)
    return result

async def get_graph_visualization_data_endpoint(doc_id: Optional[str] = None, entity_types: Optional[List[str]] = None, limit: int = 100):
    """Get graph visualization data endpoint"""
    result = await graph_constructor.get_graph_visualization_data(doc_id, entity_types, limit)
    return result

async def get_entity_subgraph_endpoint(entity_id: str, depth: int = 2):
    """Get entity subgraph endpoint"""
    result = await graph_constructor.get_entity_subgraph(entity_id, depth)
    return result

async def get_graph_statistics_endpoint(doc_id: Optional[str] = None):
    """Get graph statistics endpoint"""
    result = await graph_constructor.get_graph_statistics(doc_id)
    return result

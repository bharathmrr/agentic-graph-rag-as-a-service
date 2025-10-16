"""
Enhanced graph constructor with Neo4j integration and interactive visualization
Supports node-link JSON output, D3.js compatibility, and real-time updates
"""

import uuid
import json
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import asyncio
import networkx as nx
import numpy as np
from neo4j import GraphDatabase
import structlog

from src.utils.logger import get_logger

logger = get_logger("enhanced_graph_constructor")


@dataclass
class GraphNode:
    """Represents a node in the knowledge graph."""
    id: str
    label: str
    type: str
    properties: Dict[str, Any]
    color: str
    size: int
    x: Optional[float] = None
    y: Optional[float] = None
    neo4j_id: Optional[int] = None


@dataclass
class GraphEdge:
    """Represents an edge in the knowledge graph."""
    id: str
    source: str
    target: str
    type: str
    properties: Dict[str, Any]
    weight: float
    color: str
    thickness: int


class EnhancedGraphConstructor:
    """Enhanced graph constructor with Neo4j integration."""

    def __init__(self, neo4j_driver=None, database: str = "neo4j"):
        """Initialize enhanced graph constructor."""
        self.neo4j_driver = neo4j_driver
        self.database = database
        
        # Color mapping for different entity types
        self.type_colors = {
            "PERSON": "#FF6B6B",
            "ORGANIZATION": "#4ECDC4", 
            "LOCATION": "#45B7D1",
            "CONCEPT": "#96CEB4",
            "EVENT": "#FFEAA7",
            "PRODUCT": "#DDA0DD",
            "OTHER": "#95A5A6"
        }
        
        # NetworkX graph for local operations
        self.nx_graph = nx.Graph()
        
        logger.info("Enhanced graph constructor initialized")

    def get_node_color(self, node_type: str) -> str:
        """Get color for node based on type."""
        return self.type_colors.get(node_type.upper(), self.type_colors["OTHER"])

    def calculate_node_size(self, properties: Dict[str, Any]) -> int:
        """Calculate node size based on properties."""
        base_size = 10
        
        # Size based on confidence
        confidence = properties.get("confidence", 0.5)
        confidence_bonus = int(confidence * 10)
        
        # Size based on occurrence count
        occurrence_count = properties.get("occurrence_count", 1)
        occurrence_bonus = min(occurrence_count * 2, 20)
        
        return base_size + confidence_bonus + occurrence_bonus

    def calculate_edge_weight(self, relationship: Dict[str, Any]) -> float:
        """Calculate edge weight based on relationship properties."""
        # Base weight
        weight = 0.5
        
        # Weight based on confidence/strength
        confidence = relationship.get("confidence", 0.5)
        strength = relationship.get("strength", 0.5)
        
        weight = max(confidence, strength)
        
        # Boost weight for certain relationship types
        rel_type = relationship.get("relation_type", "").upper()
        if rel_type in ["WORKS_FOR", "PART_OF", "LOCATED_IN"]:
            weight *= 1.2
        elif rel_type in ["RELATED_TO", "SIMILAR_TO"]:
            weight *= 0.8
        
        return min(weight, 1.0)

    async def build_graph_from_ontology(self, ontology: Dict[str, Any]) -> Dict[str, Any]:
        """Build knowledge graph from ontology data."""
        
        logger.info("Building graph from ontology")
        
        try:
            nodes = []
            edges = []
            
            # Process entities into nodes
            entities_data = ontology.get("entities", {})
            entity_id_map = {}  # Map entity names to IDs
            
            for entity_type, type_data in entities_data.items():
                for entity in type_data.get("items", []):
                    node_id = entity.get("id", str(uuid.uuid4()))
                    entity_name = entity.get("name", "")
                    
                    # Store mapping for relationship processing
                    entity_id_map[entity_name] = node_id
                    entity_id_map[entity.get("normalized", entity_name)] = node_id
                    
                    node = GraphNode(
                        id=node_id,
                        label=entity_name,
                        type=entity_type,
                        properties=entity.get("attributes", {}),
                        color=self.get_node_color(entity_type),
                        size=self.calculate_node_size(entity)
                    )
                    nodes.append(node)
            
            # Process relationships into edges
            relationships = ontology.get("relationships", [])
            for relationship in relationships:
                source_id = relationship.get("source_entity_id")
                target_id = relationship.get("target_entity_id")
                
                # Skip if we can't find both entities
                if not source_id or not target_id:
                    continue
                
                edge_id = relationship.get("id", str(uuid.uuid4()))
                weight = self.calculate_edge_weight(relationship)
                
                edge = GraphEdge(
                    id=edge_id,
                    source=source_id,
                    target=target_id,
                    type=relationship.get("relation_type", "RELATED_TO"),
                    properties={
                        "sentence_context": relationship.get("sentence_context", ""),
                        "confidence": relationship.get("confidence", 0.8),
                        "source_doc_id": relationship.get("source_doc_id", "")
                    },
                    weight=weight,
                    color=self.get_edge_color(weight),
                    thickness=self.calculate_edge_thickness(weight)
                )
                edges.append(edge)
            
            # Create NetworkX graph for layout calculation
            self.nx_graph.clear()
            
            # Add nodes to NetworkX
            for node in nodes:
                self.nx_graph.add_node(node.id, **asdict(node))
            
            # Add edges to NetworkX
            for edge in edges:
                self.nx_graph.add_edge(edge.source, edge.target, **asdict(edge))
            
            # Calculate layout positions
            if len(nodes) > 0:
                positions = self.calculate_layout_positions(nodes, edges)
                
                # Update node positions
                for node in nodes:
                    if node.id in positions:
                        node.x, node.y = positions[node.id]
            
            # Store in Neo4j if driver is available
            neo4j_stats = {}
            if self.neo4j_driver:
                neo4j_stats = await self.store_in_neo4j(nodes, edges)
            
            # Prepare response
            graph_data = {
                "nodes": [asdict(node) for node in nodes],
                "edges": [asdict(edge) for edge in edges],
                "statistics": {
                    "total_nodes": len(nodes),
                    "total_edges": len(edges),
                    "node_types": list(set(node.type for node in nodes)),
                    "edge_types": list(set(edge.type for edge in edges)),
                    "density": self.calculate_graph_density(len(nodes), len(edges)),
                    "created_at": datetime.now().isoformat()
                },
                "neo4j_stats": neo4j_stats
            }
            
            logger.info(f"Built graph with {len(nodes)} nodes and {len(edges)} edges")
            
            return graph_data
            
        except Exception as e:
            logger.error(f"Failed to build graph from ontology: {e}")
            raise

    def get_edge_color(self, weight: float) -> str:
        """Get edge color based on weight."""
        if weight >= 0.8:
            return "#2ECC71"  # Strong - Green
        elif weight >= 0.6:
            return "#F39C12"  # Medium - Orange
        else:
            return "#95A5A6"  # Weak - Gray

    def calculate_edge_thickness(self, weight: float) -> int:
        """Calculate edge thickness based on weight."""
        return max(1, int(weight * 5))

    def calculate_layout_positions(self, 
                                 nodes: List[GraphNode], 
                                 edges: List[GraphEdge]) -> Dict[str, Tuple[float, float]]:
        """Calculate layout positions for nodes."""
        
        if len(nodes) == 0:
            return {}
        
        if len(nodes) == 1:
            return {nodes[0].id: (0, 0)}
        
        try:
            # Use spring layout for better visualization
            pos = nx.spring_layout(
                self.nx_graph,
                k=1/np.sqrt(len(nodes)),  # Optimal distance between nodes
                iterations=50,
                seed=42  # For reproducible layouts
            )
            
            # Scale positions to reasonable range
            scale_factor = 300
            scaled_pos = {
                node_id: (x * scale_factor, y * scale_factor)
                for node_id, (x, y) in pos.items()
            }
            
            return scaled_pos
            
        except Exception as e:
            logger.warning(f"Failed to calculate layout: {e}")
            # Fallback to circular layout
            return self.circular_layout(nodes)

    def circular_layout(self, nodes: List[GraphNode]) -> Dict[str, Tuple[float, float]]:
        """Create circular layout as fallback."""
        positions = {}
        n = len(nodes)
        
        for i, node in enumerate(nodes):
            angle = 2 * np.pi * i / n
            x = 200 * np.cos(angle)
            y = 200 * np.sin(angle)
            positions[node.id] = (x, y)
        
        return positions

    def calculate_graph_density(self, num_nodes: int, num_edges: int) -> float:
        """Calculate graph density."""
        if num_nodes <= 1:
            return 0.0
        
        max_edges = num_nodes * (num_nodes - 1) / 2
        return num_edges / max_edges if max_edges > 0 else 0.0

    async def store_in_neo4j(self, 
                           nodes: List[GraphNode], 
                           edges: List[GraphEdge]) -> Dict[str, Any]:
        """Store graph data in Neo4j."""
        
        if not self.neo4j_driver:
            return {"error": "Neo4j driver not available"}
        
        logger.info("Storing graph in Neo4j")
        
        try:
            async with self.neo4j_driver.session(database=self.database) as session:
                # Clear existing data (optional - be careful in production)
                # await session.run("MATCH (n) DETACH DELETE n")
                
                # Create nodes
                nodes_created = 0
                for node in nodes:
                    query = """
                    MERGE (n:Entity {id: $id})
                    SET n.label = $label,
                        n.type = $type,
                        n.color = $color,
                        n.size = $size,
                        n.x = $x,
                        n.y = $y,
                        n.properties = $properties,
                        n.updated_at = datetime()
                    RETURN n
                    """
                    
                    result = await session.run(query, {
                        "id": node.id,
                        "label": node.label,
                        "type": node.type,
                        "color": node.color,
                        "size": node.size,
                        "x": node.x,
                        "y": node.y,
                        "properties": json.dumps(node.properties)
                    })
                    
                    if await result.single():
                        nodes_created += 1
                
                # Create relationships
                edges_created = 0
                for edge in edges:
                    query = """
                    MATCH (source:Entity {id: $source_id})
                    MATCH (target:Entity {id: $target_id})
                    MERGE (source)-[r:RELATES {id: $edge_id}]->(target)
                    SET r.type = $edge_type,
                        r.weight = $weight,
                        r.color = $color,
                        r.thickness = $thickness,
                        r.properties = $properties,
                        r.updated_at = datetime()
                    RETURN r
                    """
                    
                    result = await session.run(query, {
                        "source_id": edge.source,
                        "target_id": edge.target,
                        "edge_id": edge.id,
                        "edge_type": edge.type,
                        "weight": edge.weight,
                        "color": edge.color,
                        "thickness": edge.thickness,
                        "properties": json.dumps(edge.properties)
                    })
                    
                    if await result.single():
                        edges_created += 1
                
                return {
                    "nodes_created": nodes_created,
                    "edges_created": edges_created,
                    "success": True
                }
                
        except Exception as e:
            logger.error(f"Failed to store graph in Neo4j: {e}")
            return {
                "error": str(e),
                "success": False
            }

    async def get_neo4j_visualization_data(self, 
                                         limit: int = 100) -> Dict[str, Any]:
        """Get graph data from Neo4j for visualization."""
        
        if not self.neo4j_driver:
            return {"error": "Neo4j driver not available"}
        
        try:
            async with self.neo4j_driver.session(database=self.database) as session:
                # Get nodes
                nodes_query = """
                MATCH (n:Entity)
                RETURN n.id as id, n.label as label, n.type as type,
                       n.color as color, n.size as size, n.x as x, n.y as y,
                       n.properties as properties
                LIMIT $limit
                """
                
                nodes_result = await session.run(nodes_query, {"limit": limit})
                nodes = []
                
                async for record in nodes_result:
                    node_data = {
                        "id": record["id"],
                        "label": record["label"],
                        "type": record["type"],
                        "color": record["color"],
                        "size": record["size"],
                        "x": record["x"],
                        "y": record["y"]
                    }
                    
                    # Parse properties JSON
                    try:
                        if record["properties"]:
                            node_data["properties"] = json.loads(record["properties"])
                        else:
                            node_data["properties"] = {}
                    except:
                        node_data["properties"] = {}
                    
                    nodes.append(node_data)
                
                # Get edges
                edges_query = """
                MATCH (source:Entity)-[r:RELATES]->(target:Entity)
                RETURN r.id as id, source.id as source, target.id as target,
                       r.type as type, r.weight as weight, r.color as color,
                       r.thickness as thickness, r.properties as properties
                LIMIT $limit
                """
                
                edges_result = await session.run(edges_query, {"limit": limit})
                edges = []
                
                async for record in edges_result:
                    edge_data = {
                        "id": record["id"],
                        "source": record["source"],
                        "target": record["target"],
                        "type": record["type"],
                        "weight": record["weight"],
                        "color": record["color"],
                        "thickness": record["thickness"]
                    }
                    
                    # Parse properties JSON
                    try:
                        if record["properties"]:
                            edge_data["properties"] = json.loads(record["properties"])
                        else:
                            edge_data["properties"] = {}
                    except:
                        edge_data["properties"] = {}
                    
                    edges.append(edge_data)
                
                # Get statistics
                stats_query = """
                MATCH (n:Entity)
                OPTIONAL MATCH (n)-[r:RELATES]-()
                RETURN count(DISTINCT n) as node_count,
                       count(r) as edge_count,
                       collect(DISTINCT n.type) as node_types
                """
                
                stats_result = await session.run(stats_query)
                stats_record = await stats_result.single()
                
                statistics = {
                    "total_nodes": stats_record["node_count"],
                    "total_edges": stats_record["edge_count"],
                    "node_types": stats_record["node_types"],
                    "density": self.calculate_graph_density(
                        stats_record["node_count"], 
                        stats_record["edge_count"]
                    ),
                    "retrieved_at": datetime.now().isoformat()
                }
                
                return {
                    "nodes": nodes,
                    "edges": edges,
                    "statistics": statistics,
                    "success": True
                }
                
        except Exception as e:
            logger.error(f"Failed to get Neo4j visualization data: {e}")
            return {
                "error": str(e),
                "success": False
            }

    async def get_entity_subgraph(self, 
                                entity_id: str, 
                                depth: int = 2) -> Dict[str, Any]:
        """Get subgraph centered on a specific entity."""
        
        if not self.neo4j_driver:
            return {"error": "Neo4j driver not available"}
        
        try:
            async with self.neo4j_driver.session(database=self.database) as session:
                query = """
                MATCH path = (center:Entity {id: $entity_id})-[*1..$depth]-(connected:Entity)
                WITH center, connected, relationships(path) as rels
                RETURN center, connected, rels
                """
                
                result = await session.run(query, {
                    "entity_id": entity_id,
                    "depth": depth
                })
                
                nodes = {}
                edges = []
                
                async for record in result:
                    # Add center node
                    center = record["center"]
                    nodes[center["id"]] = {
                        "id": center["id"],
                        "label": center["label"],
                        "type": center["type"],
                        "color": center["color"],
                        "size": center["size"],
                        "x": center.get("x"),
                        "y": center.get("y"),
                        "properties": json.loads(center.get("properties", "{}"))
                    }
                    
                    # Add connected node
                    connected = record["connected"]
                    nodes[connected["id"]] = {
                        "id": connected["id"],
                        "label": connected["label"],
                        "type": connected["type"],
                        "color": connected["color"],
                        "size": connected["size"],
                        "x": connected.get("x"),
                        "y": connected.get("y"),
                        "properties": json.loads(connected.get("properties", "{}"))
                    }
                    
                    # Add relationships
                    for rel in record["rels"]:
                        edge_data = {
                            "id": rel["id"],
                            "source": rel.start_node["id"],
                            "target": rel.end_node["id"],
                            "type": rel["type"],
                            "weight": rel["weight"],
                            "color": rel["color"],
                            "thickness": rel["thickness"],
                            "properties": json.loads(rel.get("properties", "{}"))
                        }
                        edges.append(edge_data)
                
                return {
                    "center_entity": entity_id,
                    "nodes": list(nodes.values()),
                    "edges": edges,
                    "depth": depth,
                    "node_count": len(nodes),
                    "edge_count": len(edges),
                    "success": True
                }
                
        except Exception as e:
            logger.error(f"Failed to get entity subgraph: {e}")
            return {
                "error": str(e),
                "success": False
            }

    def get_graph_statistics(self) -> Dict[str, Any]:
        """Get comprehensive graph statistics."""
        
        try:
            stats = {
                "networkx_stats": {
                    "nodes": self.nx_graph.number_of_nodes(),
                    "edges": self.nx_graph.number_of_edges(),
                    "density": nx.density(self.nx_graph),
                    "is_connected": nx.is_connected(self.nx_graph) if self.nx_graph.number_of_nodes() > 0 else False
                }
            }
            
            if self.nx_graph.number_of_nodes() > 0:
                # Calculate centrality measures
                try:
                    degree_centrality = nx.degree_centrality(self.nx_graph)
                    betweenness_centrality = nx.betweenness_centrality(self.nx_graph)
                    
                    stats["centrality"] = {
                        "top_degree": sorted(degree_centrality.items(), 
                                           key=lambda x: x[1], reverse=True)[:5],
                        "top_betweenness": sorted(betweenness_centrality.items(), 
                                                key=lambda x: x[1], reverse=True)[:5]
                    }
                except:
                    stats["centrality"] = {"error": "Failed to calculate centrality"}
                
                # Calculate clustering
                try:
                    clustering = nx.clustering(self.nx_graph)
                    stats["clustering"] = {
                        "average": np.mean(list(clustering.values())),
                        "top_clustered": sorted(clustering.items(), 
                                              key=lambda x: x[1], reverse=True)[:5]
                    }
                except:
                    stats["clustering"] = {"error": "Failed to calculate clustering"}
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get graph statistics: {e}")
            return {"error": str(e)}

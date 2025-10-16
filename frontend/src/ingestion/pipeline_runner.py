"""
Pipeline runner for orchestrating the document-to-graph ingestion flow
"""

from typing import List, Dict, Any, Optional
import structlog

from src.ingestion.ontology_generator import OntologyGenerator
from src.ingestion.entity_resolution import EntityResolver, Entity
from src.ingestion.embedding_generator import EmbeddingGenerator
from src.ingestion.graph_constructor import GraphConstructor
from src.utils.logger import get_logger

logger = get_logger("pipeline_runner")


class IngestionPipeline:
    """Orchestrates the complete document-to-graph ingestion pipeline."""

    def __init__(
        self,
        ontology_generator: OntologyGenerator,
        entity_resolver: EntityResolver,
        embedding_generator: EmbeddingGenerator,
        graph_constructor: GraphConstructor
    ):
        """
        Initialize ingestion pipeline with all components.

        Args:
            ontology_generator: Component for ontology generation
            entity_resolver: Component for entity resolution
            embedding_generator: Component for embedding generation
            graph_constructor: Component for graph construction
        """
        self.ontology_generator = ontology_generator
        self.entity_resolver = entity_resolver
        self.embedding_generator = embedding_generator
        self.graph_constructor = graph_constructor
        logger.info("Ingestion pipeline initialized")

    async def run(
        self,
        documents: List[str],
        existing_ontology: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Run the complete ingestion pipeline.

        Args:
            documents: List of document texts or file paths
            existing_ontology: Optional existing ontology to extend

        Returns:
            Pipeline execution results and statistics
        """

        logger.info(
            "Starting ingestion pipeline",
            document_count=len(documents),
            has_existing_ontology=existing_ontology is not None
        )

        try:
            # Step 1: Generate ontology from documents
            logger.info("Step 1: Generating ontology")
            ontology = await self.ontology_generator.generate_ontology(
                documents,
                existing_ontology
            )

            # Step 2: Resolve and deduplicate entities
            logger.info("Step 2: Resolving entities")
            entities = [
                Entity(
                    id=e['id'],
                    label=e['label'],
                    type=e['type'],
                    properties=e.get('properties', {})
                )
                for e in ontology['entities']
            ]

            existing_entities = None
            if existing_ontology and 'entities' in existing_ontology:
                existing_entities = [
                    Entity(
                        id=e['id'],
                        label=e['label'],
                        type=e['type'],
                        properties=e.get('properties', {})
                    )
                    for e in existing_ontology['entities']
                ]

            resolved_entities, id_mapping = self.entity_resolver.resolve_entities(
                entities,
                existing_entities
            )

            # Step 3: Generate embeddings for entities and relationships
            logger.info("Step 3: Generating embeddings")

            entity_dicts = [
                {
                    'id': e.id,
                    'label': e.label,
                    'type': e.type,
                    'properties': e.properties
                }
                for e in resolved_entities
            ]

            entity_embeddings = await self.embedding_generator.generate_entity_embeddings(
                entity_dicts
            )

            # Update entities with embeddings
            for entity_dict in entity_dicts:
                entity_dict['embedding'] = entity_embeddings.get(entity_dict['id'])

            # Generate relationship embeddings
            relationships = ontology.get('relationships', [])

            # Update relationship IDs based on entity resolution mapping
            updated_relationships = []
            for rel in relationships:
                updated_rel = rel.copy()
                updated_rel['source_id'] = id_mapping.get(rel['source_id'], rel['source_id'])
                updated_rel['target_id'] = id_mapping.get(rel['target_id'], rel['target_id'])
                updated_relationships.append(updated_rel)

            relationship_embeddings = await self.embedding_generator.generate_relationship_embeddings(
                updated_relationships
            )

            # Step 4: Construct knowledge graph
            logger.info("Step 4: Building knowledge graph")
            graph_stats = await self.graph_constructor.build_graph(
                entity_dicts,
                updated_relationships
            )

            # Compile results
            results = {
                "status": "success",
                "statistics": {
                    "documents_processed": len(documents),
                    "entities_extracted": len(ontology['entities']),
                    "entities_resolved": len(resolved_entities),
                    "relationships_created": len(updated_relationships),
                    "embeddings_generated": len(entity_embeddings) + len(relationship_embeddings),
                    **graph_stats
                },
                "ontology": {
                    "entities": entity_dicts,
                    "relationships": updated_relationships
                },
                "id_mapping": id_mapping
            }

            logger.info(
                "Ingestion pipeline completed successfully",
                **results['statistics']
            )

            return results

        except Exception as e:
            logger.error("Ingestion pipeline failed", error=str(e))
            raise


async def create_pipeline(
    ollama_client,
    neo4j_driver,
    chroma_client,
    config
) -> IngestionPipeline:
    """
    Factory function to create a configured ingestion pipeline.

    Args:
        ollama_client: Ollama client for LLM operations
        neo4j_driver: Neo4j driver for graph operations
        chroma_client: ChromaDB client for vector storage
        config: Application configuration

    Returns:
        Configured IngestionPipeline instance
    """

    from src.ingestion.graph_constructor import Neo4jGraphDB

    # Initialize components
    ontology_generator = OntologyGenerator(
        ollama_client=ollama_client,
        model_name=config.ollama_chat_model
    )

    entity_resolver = EntityResolver(similarity_threshold=0.85)

    embedding_generator = EmbeddingGenerator(
        ollama_client=ollama_client,
        model_name=config.ollama_embedding_model
    )

    graph_db = Neo4jGraphDB(neo4j_driver)
    graph_constructor = GraphConstructor(graph_db)

    # Create and return pipeline
    pipeline = IngestionPipeline(
        ontology_generator=ontology_generator,
        entity_resolver=entity_resolver,
        embedding_generator=embedding_generator,
        graph_constructor=graph_constructor
    )

    logger.info("Ingestion pipeline created and configured")
    return pipeline

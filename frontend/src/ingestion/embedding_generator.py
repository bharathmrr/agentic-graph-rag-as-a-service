"""
Embedding generation pipeline using Ollama
Generates embeddings for entities, relationships, and documents
"""

from typing import List, Dict, Any, Optional
import structlog

from src.utils.logger import get_logger

logger = get_logger("embedding_generator")


class EmbeddingGenerator:
    """Generates embeddings using Ollama models."""

    def __init__(
        self,
        ollama_client=None,
        model_name: str = "llama3.2:latest",
        dimension: int = 4096
    ):
        """
        Initialize embedding generator.

        Args:
            ollama_client: Ollama client instance
            model_name: Model to use for embeddings
            dimension: Embedding dimension
        """
        self.ollama_client = ollama_client
        self.model_name = model_name
        self.dimension = dimension
        logger.info(
            "Embedding generator initialized",
            model=model_name,
            dimension=dimension
        )

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.

        Args:
            text: Input text

        Returns:
            Embedding vector
        """

        try:
            if not self.ollama_client:
                logger.warning("No Ollama client available, returning placeholder")
                return [0.0] * self.dimension

            # TODO: Implement actual Ollama embedding generation
            # response = self.ollama_client.embeddings(
            #     model=self.model_name,
            #     prompt=text
            # )
            # return response['embedding']

            # Placeholder for now
            return [0.0] * self.dimension

        except Exception as e:
            logger.error("Failed to generate embedding", error=str(e), text_length=len(text))
            raise

    async def generate_embeddings_batch(
        self,
        texts: List[str],
        batch_size: int = 32
    ) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batches.

        Args:
            texts: List of input texts
            batch_size: Number of texts to process at once

        Returns:
            List of embedding vectors
        """

        logger.info(
            "Generating embeddings in batches",
            total_texts=len(texts),
            batch_size=batch_size
        )

        try:
            embeddings = []

            # Process in batches
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]

                for text in batch:
                    embedding = await self.generate_embedding(text)
                    embeddings.append(embedding)

                logger.debug(
                    "Processed batch",
                    batch_num=i // batch_size + 1,
                    batch_size=len(batch)
                )

            logger.info("Batch embedding generation completed", total=len(embeddings))
            return embeddings

        except Exception as e:
            logger.error("Batch embedding generation failed", error=str(e))
            raise

    async def generate_entity_embeddings(
        self,
        entities: List[Dict[str, Any]]
    ) -> Dict[str, List[float]]:
        """
        Generate embeddings for entities.

        Args:
            entities: List of entity dictionaries

        Returns:
            Dictionary mapping entity IDs to embeddings
        """

        logger.info("Generating entity embeddings", entity_count=len(entities))

        try:
            entity_embeddings = {}

            for entity in entities:
                # Create text representation of entity
                entity_text = self._entity_to_text(entity)

                # Generate embedding
                embedding = await self.generate_embedding(entity_text)

                entity_embeddings[entity['id']] = embedding

            logger.info("Entity embeddings generated", count=len(entity_embeddings))
            return entity_embeddings

        except Exception as e:
            logger.error("Failed to generate entity embeddings", error=str(e))
            raise

    async def generate_relationship_embeddings(
        self,
        relationships: List[Dict[str, Any]]
    ) -> Dict[str, List[float]]:
        """
        Generate embeddings for relationships.

        Args:
            relationships: List of relationship dictionaries

        Returns:
            Dictionary mapping relationship IDs to embeddings
        """

        logger.info("Generating relationship embeddings", count=len(relationships))

        try:
            relationship_embeddings = {}

            for rel in relationships:
                # Create text representation of relationship
                rel_text = self._relationship_to_text(rel)

                # Generate embedding
                embedding = await self.generate_embedding(rel_text)

                rel_id = f"{rel['source_id']}_{rel['type']}_{rel['target_id']}"
                relationship_embeddings[rel_id] = embedding

            logger.info("Relationship embeddings generated", count=len(relationship_embeddings))
            return relationship_embeddings

        except Exception as e:
            logger.error("Failed to generate relationship embeddings", error=str(e))
            raise

    @staticmethod
    def _entity_to_text(entity: Dict[str, Any]) -> str:
        """Convert entity to text representation for embedding."""
        parts = [
            f"Entity: {entity.get('label', '')}",
            f"Type: {entity.get('type', '')}",
            f"Description: {entity.get('description', '')}"
        ]

        # Add properties
        if 'properties' in entity:
            for key, value in entity['properties'].items():
                parts.append(f"{key}: {value}")

        return " | ".join(parts)

    @staticmethod
    def _relationship_to_text(relationship: Dict[str, Any]) -> str:
        """Convert relationship to text representation for embedding."""
        return (
            f"Relationship: {relationship.get('type', '')} | "
            f"Description: {relationship.get('description', '')} | "
            f"From: {relationship.get('source_id', '')} | "
            f"To: {relationship.get('target_id', '')}"
        )

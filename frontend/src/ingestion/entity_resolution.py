"""
Entity resolution and deduplication logic
Handles entity normalization, matching, and merging
"""

from typing import List, Dict, Any, Optional, Tuple
import structlog
from dataclasses import dataclass
from difflib import SequenceMatcher

from src.utils.logger import get_logger

logger = get_logger("entity_resolution")


@dataclass
class Entity:
    """Represents an entity for resolution."""
    id: str
    label: str
    type: str
    properties: Dict[str, Any]
    embedding: Optional[List[float]] = None


class EntityResolver:
    """Handles entity resolution and deduplication."""

    def __init__(self, similarity_threshold: float = 0.85):
        """
        Initialize entity resolver.

        Args:
            similarity_threshold: Threshold for entity matching (0.0-1.0)
        """
        self.similarity_threshold = similarity_threshold
        logger.info("Entity resolver initialized", threshold=similarity_threshold)

    def resolve_entities(
        self,
        entities: List[Entity],
        existing_entities: Optional[List[Entity]] = None
    ) -> Tuple[List[Entity], Dict[str, str]]:
        """
        Resolve and deduplicate entities.

        Args:
            entities: New entities to resolve
            existing_entities: Existing entities in the graph

        Returns:
            Tuple of (resolved entities, mapping of old IDs to new IDs)
        """

        logger.info(
            "Starting entity resolution",
            new_count=len(entities),
            existing_count=len(existing_entities) if existing_entities else 0
        )

        try:
            resolved_entities = []
            id_mapping = {}

            # First pass: deduplicate within new entities
            for entity in entities:
                # Check for duplicates in resolved entities
                duplicate = self._find_duplicate(entity, resolved_entities)

                if duplicate:
                    # Merge with duplicate
                    merged = self._merge_entities(duplicate, entity)
                    id_mapping[entity.id] = merged.id
                    logger.debug(
                        "Merged duplicate entity",
                        original_id=entity.id,
                        merged_id=merged.id
                    )
                else:
                    resolved_entities.append(entity)
                    id_mapping[entity.id] = entity.id

            # Second pass: match with existing entities if provided
            if existing_entities:
                final_entities = []
                for entity in resolved_entities:
                    existing_match = self._find_duplicate(entity, existing_entities)

                    if existing_match:
                        # Update mapping to point to existing entity
                        id_mapping[entity.id] = existing_match.id
                        logger.debug(
                            "Matched to existing entity",
                            new_id=entity.id,
                            existing_id=existing_match.id
                        )
                    else:
                        final_entities.append(entity)

                resolved_entities = final_entities

            logger.info(
                "Entity resolution completed",
                resolved_count=len(resolved_entities),
                mappings=len(id_mapping)
            )

            return resolved_entities, id_mapping

        except Exception as e:
            logger.error("Entity resolution failed", error=str(e))
            raise

    def _find_duplicate(
        self,
        entity: Entity,
        entity_list: List[Entity]
    ) -> Optional[Entity]:
        """Find duplicate entity in list based on similarity."""

        for candidate in entity_list:
            # Type must match
            if entity.type != candidate.type:
                continue

            # Calculate label similarity
            label_similarity = self._calculate_similarity(
                entity.label.lower(),
                candidate.label.lower()
            )

            # Use embedding similarity if available
            if entity.embedding and candidate.embedding:
                embedding_similarity = self._cosine_similarity(
                    entity.embedding,
                    candidate.embedding
                )
                similarity = (label_similarity + embedding_similarity) / 2
            else:
                similarity = label_similarity

            if similarity >= self.similarity_threshold:
                return candidate

        return None

    def _merge_entities(self, entity1: Entity, entity2: Entity) -> Entity:
        """Merge two duplicate entities."""

        # Use the entity with more properties as base
        if len(entity1.properties) >= len(entity2.properties):
            base, other = entity1, entity2
        else:
            base, other = entity2, entity1

        # Merge properties
        merged_properties = {**base.properties, **other.properties}

        # Create merged entity
        merged = Entity(
            id=base.id,
            label=base.label,
            type=base.type,
            properties=merged_properties,
            embedding=base.embedding or other.embedding
        )

        return merged

    @staticmethod
    def _calculate_similarity(str1: str, str2: str) -> float:
        """Calculate string similarity using SequenceMatcher."""
        return SequenceMatcher(None, str1, str2).ratio()

    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        if len(vec1) != len(vec2):
            return 0.0

        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = sum(a * a for a in vec1) ** 0.5
        magnitude2 = sum(b * b for b in vec2) ** 0.5

        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0

        return dot_product / (magnitude1 * magnitude2)

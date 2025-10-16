"""
Enhanced entity resolution with fuzzy matching and semantic similarity
Supports duplicate detection, confidence scoring, and batch processing
"""

import uuid
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, asdict
from datetime import datetime
import asyncio
import numpy as np
from fuzzywuzzy import fuzz, process
from sentence_transformers import SentenceTransformer
import structlog

from src.utils.logger import get_logger

logger = get_logger("enhanced_entity_resolution")


@dataclass
class EntityCandidate:
    """Represents an entity candidate for resolution."""
    id: str
    name: str
    normalized: str
    type: str
    attributes: Dict[str, Any]
    source_doc_id: str
    confidence: float
    embedding: Optional[np.ndarray] = None


@dataclass
class EntityCluster:
    """Represents a cluster of similar entities."""
    canonical_id: str
    canonical_name: str
    member_entities: List[EntityCandidate]
    similarity_scores: List[float]
    merge_confidence: float
    entity_type: str
    occurrence_count: int


class EnhancedEntityResolution:
    """Enhanced entity resolution with multiple similarity methods."""

    def __init__(self, 
                 similarity_threshold: float = 0.8,
                 fuzzy_threshold: int = 85,
                 use_embeddings: bool = True):
        """Initialize enhanced entity resolution."""
        self.similarity_threshold = similarity_threshold
        self.fuzzy_threshold = fuzzy_threshold
        self.use_embeddings = use_embeddings
        
        # Load sentence transformer for semantic similarity
        if use_embeddings:
            try:
                self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("Sentence transformer loaded for semantic similarity")
            except Exception as e:
                logger.warning(f"Failed to load sentence transformer: {e}")
                self.sentence_model = None
                self.use_embeddings = False
        else:
            self.sentence_model = None
            
        logger.info("Enhanced entity resolution initialized", 
                   similarity_threshold=similarity_threshold,
                   fuzzy_threshold=fuzzy_threshold,
                   use_embeddings=use_embeddings)

    def normalize_entity_name(self, name: str) -> str:
        """Normalize entity name for comparison."""
        # Basic normalization
        normalized = name.lower().strip()
        
        # Remove common prefixes/suffixes
        prefixes = ['the ', 'a ', 'an ', 'mr. ', 'mrs. ', 'dr. ', 'prof. ']
        suffixes = [' inc', ' corp', ' ltd', ' llc', ' co']
        
        for prefix in prefixes:
            if normalized.startswith(prefix):
                normalized = normalized[len(prefix):]
                break
        
        for suffix in suffixes:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)]
                break
        
        return normalized.strip()

    def calculate_fuzzy_similarity(self, name1: str, name2: str) -> float:
        """Calculate fuzzy string similarity between two entity names."""
        # Use multiple fuzzy matching algorithms
        ratio = fuzz.ratio(name1, name2)
        partial_ratio = fuzz.partial_ratio(name1, name2)
        token_sort_ratio = fuzz.token_sort_ratio(name1, name2)
        token_set_ratio = fuzz.token_set_ratio(name1, name2)
        
        # Weighted average of different similarity measures
        weighted_score = (
            ratio * 0.3 +
            partial_ratio * 0.2 +
            token_sort_ratio * 0.3 +
            token_set_ratio * 0.2
        )
        
        return weighted_score / 100.0  # Convert to 0-1 scale

    def calculate_semantic_similarity(self, 
                                    entity1: EntityCandidate, 
                                    entity2: EntityCandidate) -> float:
        """Calculate semantic similarity using embeddings."""
        if not self.sentence_model:
            return 0.0
        
        try:
            # Generate embeddings if not already present
            if entity1.embedding is None:
                entity1.embedding = self.sentence_model.encode([entity1.name])[0]
            if entity2.embedding is None:
                entity2.embedding = self.sentence_model.encode([entity2.name])[0]
            
            # Calculate cosine similarity
            similarity = np.dot(entity1.embedding, entity2.embedding) / (
                np.linalg.norm(entity1.embedding) * np.linalg.norm(entity2.embedding)
            )
            
            return float(similarity)
            
        except Exception as e:
            logger.warning(f"Failed to calculate semantic similarity: {e}")
            return 0.0

    def calculate_combined_similarity(self, 
                                    entity1: EntityCandidate, 
                                    entity2: EntityCandidate) -> Tuple[float, Dict[str, float]]:
        """Calculate combined similarity score with breakdown."""
        
        # Fuzzy string similarity
        fuzzy_score = self.calculate_fuzzy_similarity(
            entity1.normalized, entity2.normalized
        )
        
        # Semantic similarity
        semantic_score = self.calculate_semantic_similarity(entity1, entity2)
        
        # Type similarity (exact match or compatible types)
        type_score = 1.0 if entity1.type == entity2.type else 0.0
        
        # Attribute similarity (if available)
        attr_score = self.calculate_attribute_similarity(
            entity1.attributes, entity2.attributes
        )
        
        # Combined weighted score
        if self.use_embeddings and semantic_score > 0:
            combined_score = (
                fuzzy_score * 0.4 +
                semantic_score * 0.4 +
                type_score * 0.1 +
                attr_score * 0.1
            )
        else:
            combined_score = (
                fuzzy_score * 0.7 +
                type_score * 0.2 +
                attr_score * 0.1
            )
        
        breakdown = {
            "fuzzy_similarity": fuzzy_score,
            "semantic_similarity": semantic_score,
            "type_similarity": type_score,
            "attribute_similarity": attr_score,
            "combined_score": combined_score
        }
        
        return combined_score, breakdown

    def calculate_attribute_similarity(self, 
                                     attrs1: Dict[str, Any], 
                                     attrs2: Dict[str, Any]) -> float:
        """Calculate similarity between entity attributes."""
        if not attrs1 or not attrs2:
            return 0.0
        
        common_keys = set(attrs1.keys()) & set(attrs2.keys())
        if not common_keys:
            return 0.0
        
        matches = 0
        for key in common_keys:
            if attrs1[key] == attrs2[key]:
                matches += 1
        
        return matches / len(common_keys)

    async def detect_duplicates(self, 
                              entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Detect duplicate entities and group them into clusters."""
        
        logger.info(f"Starting duplicate detection for {len(entities)} entities")
        
        # Convert to EntityCandidate objects
        candidates = []
        for ent in entities:
            candidate = EntityCandidate(
                id=ent.get("id", str(uuid.uuid4())),
                name=ent.get("name", ""),
                normalized=self.normalize_entity_name(ent.get("name", "")),
                type=ent.get("type", "OTHER"),
                attributes=ent.get("attributes", {}),
                source_doc_id=ent.get("source_doc_id", ""),
                confidence=ent.get("confidence", 0.8)
            )
            candidates.append(candidate)
        
        # Find duplicate clusters
        clusters = await self.cluster_similar_entities(candidates)
        
        # Create canonical entities
        canonical_entities = []
        duplicates_table = []
        
        for cluster in clusters:
            # Choose canonical name (most frequent or highest confidence)
            canonical_name = self.choose_canonical_name(cluster.member_entities)
            
            canonical_entity = {
                "canonical_id": cluster.canonical_id,
                "canonical_name": canonical_name,
                "member_names": [ent.name for ent in cluster.member_entities],
                "occurrence_count": cluster.occurrence_count,
                "similarity_scores": cluster.similarity_scores,
                "entity_type": cluster.entity_type,
                "merge_confidence": cluster.merge_confidence,
                "attributes": self.merge_attributes(cluster.member_entities)
            }
            canonical_entities.append(canonical_entity)
            
            # Create table row for UI display
            if len(cluster.member_entities) > 1:  # Only include actual duplicates
                duplicates_table.append({
                    "canonical_name": canonical_name,
                    "duplicates": ", ".join([ent.name for ent in cluster.member_entities[1:]]),
                    "count": cluster.occurrence_count,
                    "confidence": round(cluster.merge_confidence, 3),
                    "type": cluster.entity_type
                })
        
        # Calculate metrics
        total_entities = len(entities)
        total_duplicates = sum(len(cluster.member_entities) - 1 
                             for cluster in clusters if len(cluster.member_entities) > 1)
        unique_entities = len(clusters)
        duplication_percentage = (total_duplicates / total_entities * 100) if total_entities > 0 else 0
        
        result = {
            "canonical_entities": canonical_entities,
            "duplicates_table": duplicates_table,
            "metrics": {
                "total_entities": total_entities,
                "total_duplicates": total_duplicates,
                "unique_entities": unique_entities,
                "duplication_percentage": round(duplication_percentage, 2),
                "clusters_found": len(clusters),
                "processed_at": datetime.now().isoformat()
            }
        }
        
        logger.info(f"Duplicate detection completed: {total_duplicates} duplicates found in {len(clusters)} clusters")
        
        return result

    async def cluster_similar_entities(self, 
                                     candidates: List[EntityCandidate]) -> List[EntityCluster]:
        """Cluster similar entities using similarity thresholds."""
        
        clusters = []
        processed = set()
        
        for i, candidate in enumerate(candidates):
            if candidate.id in processed:
                continue
            
            # Start new cluster with this candidate
            cluster_members = [candidate]
            similarity_scores = [1.0]  # Self-similarity
            processed.add(candidate.id)
            
            # Find similar entities
            for j, other_candidate in enumerate(candidates[i+1:], i+1):
                if other_candidate.id in processed:
                    continue
                
                # Calculate similarity
                combined_score, breakdown = self.calculate_combined_similarity(
                    candidate, other_candidate
                )
                
                # Add to cluster if above threshold
                if combined_score >= self.similarity_threshold:
                    cluster_members.append(other_candidate)
                    similarity_scores.append(combined_score)
                    processed.add(other_candidate.id)
            
            # Create cluster
            cluster = EntityCluster(
                canonical_id=str(uuid.uuid4()),
                canonical_name=candidate.name,
                member_entities=cluster_members,
                similarity_scores=similarity_scores,
                merge_confidence=np.mean(similarity_scores),
                entity_type=candidate.type,
                occurrence_count=len(cluster_members)
            )
            clusters.append(cluster)
        
        return clusters

    def choose_canonical_name(self, entities: List[EntityCandidate]) -> str:
        """Choose the best canonical name from a cluster of entities."""
        if len(entities) == 1:
            return entities[0].name
        
        # Score each name based on various factors
        name_scores = {}
        
        for entity in entities:
            score = 0.0
            
            # Prefer names with higher confidence
            score += entity.confidence * 0.4
            
            # Prefer longer names (more descriptive)
            score += len(entity.name) / 100.0 * 0.2
            
            # Prefer names that appear more frequently
            name_count = sum(1 for e in entities if e.name == entity.name)
            score += name_count / len(entities) * 0.4
            
            name_scores[entity.name] = score
        
        # Return name with highest score
        return max(name_scores.items(), key=lambda x: x[1])[0]

    def merge_attributes(self, entities: List[EntityCandidate]) -> Dict[str, Any]:
        """Merge attributes from multiple entities."""
        merged_attrs = {}
        
        for entity in entities:
            for key, value in entity.attributes.items():
                if key not in merged_attrs:
                    merged_attrs[key] = value
                elif isinstance(value, list):
                    if isinstance(merged_attrs[key], list):
                        merged_attrs[key].extend(value)
                    else:
                        merged_attrs[key] = [merged_attrs[key]] + value
                elif value != merged_attrs[key]:
                    # Handle conflicting values
                    if not isinstance(merged_attrs[key], list):
                        merged_attrs[key] = [merged_attrs[key]]
                    if value not in merged_attrs[key]:
                        merged_attrs[key].append(value)
        
        return merged_attrs

    async def resolve_entities_batch(self, 
                                   entity_batches: List[List[Dict[str, Any]]],
                                   batch_size: int = 100) -> Dict[str, Any]:
        """Process entities in batches for large datasets."""
        
        logger.info(f"Processing {len(entity_batches)} batches of entities")
        
        all_canonical_entities = []
        all_duplicates_table = []
        total_metrics = {
            "total_entities": 0,
            "total_duplicates": 0,
            "unique_entities": 0,
            "duplication_percentage": 0.0,
            "clusters_found": 0
        }
        
        for i, batch in enumerate(entity_batches):
            logger.info(f"Processing batch {i+1}/{len(entity_batches)}")
            
            batch_result = await self.detect_duplicates(batch)
            
            all_canonical_entities.extend(batch_result["canonical_entities"])
            all_duplicates_table.extend(batch_result["duplicates_table"])
            
            # Aggregate metrics
            batch_metrics = batch_result["metrics"]
            total_metrics["total_entities"] += batch_metrics["total_entities"]
            total_metrics["total_duplicates"] += batch_metrics["total_duplicates"]
            total_metrics["unique_entities"] += batch_metrics["unique_entities"]
            total_metrics["clusters_found"] += batch_metrics["clusters_found"]
        
        # Calculate final duplication percentage
        if total_metrics["total_entities"] > 0:
            total_metrics["duplication_percentage"] = (
                total_metrics["total_duplicates"] / total_metrics["total_entities"] * 100
            )
        
        total_metrics["processed_at"] = datetime.now().isoformat()
        
        return {
            "canonical_entities": all_canonical_entities,
            "duplicates_table": all_duplicates_table,
            "metrics": total_metrics
        }

    def get_resolution_statistics(self, resolution_result: Dict[str, Any]) -> Dict[str, Any]:
        """Get detailed statistics about the entity resolution process."""
        
        metrics = resolution_result.get("metrics", {})
        canonical_entities = resolution_result.get("canonical_entities", [])
        
        # Confidence distribution
        confidence_scores = [ent["merge_confidence"] for ent in canonical_entities]
        confidence_stats = {
            "mean": np.mean(confidence_scores) if confidence_scores else 0.0,
            "std": np.std(confidence_scores) if confidence_scores else 0.0,
            "min": np.min(confidence_scores) if confidence_scores else 0.0,
            "max": np.max(confidence_scores) if confidence_scores else 0.0
        }
        
        # Entity type distribution
        type_distribution = {}
        for entity in canonical_entities:
            entity_type = entity["entity_type"]
            type_distribution[entity_type] = type_distribution.get(entity_type, 0) + 1
        
        # Cluster size distribution
        cluster_sizes = [ent["occurrence_count"] for ent in canonical_entities]
        cluster_stats = {
            "mean_cluster_size": np.mean(cluster_sizes) if cluster_sizes else 0.0,
            "max_cluster_size": np.max(cluster_sizes) if cluster_sizes else 0.0,
            "single_entity_clusters": sum(1 for size in cluster_sizes if size == 1)
        }
        
        return {
            "basic_metrics": metrics,
            "confidence_statistics": confidence_stats,
            "type_distribution": type_distribution,
            "cluster_statistics": cluster_stats,
            "quality_score": self._calculate_quality_score(resolution_result)
        }

    def _calculate_quality_score(self, resolution_result: Dict[str, Any]) -> float:
        """Calculate overall quality score for the resolution process."""
        canonical_entities = resolution_result.get("canonical_entities", [])
        
        if not canonical_entities:
            return 0.0
        
        # Average confidence score
        avg_confidence = np.mean([ent["merge_confidence"] for ent in canonical_entities])
        
        # Deduplication effectiveness
        metrics = resolution_result.get("metrics", {})
        dedup_effectiveness = metrics.get("duplication_percentage", 0) / 100.0
        
        # Balance between confidence and deduplication
        quality_score = (avg_confidence * 0.7) + (dedup_effectiveness * 0.3)
        
        return min(quality_score, 1.0)

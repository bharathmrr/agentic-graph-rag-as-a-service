"""
Enhanced Entity Resolution API with fuzzy matching and semantic similarity
"""
import time
import uuid
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel
from rapidfuzz import fuzz, process
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import asyncio

class CanonicalEntity(BaseModel):
    canonical_id: str
    canonical_name: str
    member_names: List[str]
    occurrence_count: int
    similarity_scores: List[float]
    entity_type: str
    merge_confidence: float
    attributes: Dict[str, Any]

class DuplicateTableRow(BaseModel):
    canonical_entity: str
    duplicate_names: List[str]
    similarity_score: float
    occurrence_count: int
    entity_type: str
    merge_confidence: float
    action_required: str  # "auto_merge", "manual_review", "keep_separate"

class EntityResolutionResponse(BaseModel):
    success: bool
    status_code: int
    processing_ms: int
    data: Optional[Dict[str, Any]] = None
    warnings: List[str] = []
    error: Optional[str] = None

class EnhancedEntityResolution:
    def __init__(self):
        try:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Warning: Could not load embedding model: {e}")
            self.embedding_model = None
        
        self.fuzzy_threshold = 0.85
        self.semantic_threshold = 0.80
        self.combined_threshold = 0.75
        self.auto_merge_threshold = 0.90
        self.manual_review_threshold = 0.60
    
    def calculate_fuzzy_similarity(self, name1: str, name2: str) -> float:
        """Calculate fuzzy string similarity using multiple methods"""
        # Normalize names
        name1_norm = name1.lower().strip()
        name2_norm = name2.lower().strip()
        
        # Calculate different similarity scores
        token_sort_ratio = fuzz.token_sort_ratio(name1_norm, name2_norm) / 100.0
        token_set_ratio = fuzz.token_set_ratio(name1_norm, name2_norm) / 100.0
        ratio = fuzz.ratio(name1_norm, name2_norm) / 100.0
        partial_ratio = fuzz.partial_ratio(name1_norm, name2_norm) / 100.0
        
        # Weighted average (token_sort_ratio is most reliable for entity names)
        weighted_score = (
            token_sort_ratio * 0.4 +
            token_set_ratio * 0.3 +
            ratio * 0.2 +
            partial_ratio * 0.1
        )
        
        return weighted_score
    
    async def calculate_semantic_similarity(self, entities: List[Dict[str, Any]]) -> np.ndarray:
        """Calculate semantic similarity matrix for entities"""
        if not self.embedding_model:
            # Return identity matrix if no embedding model
            n = len(entities)
            return np.eye(n)
        
        try:
            # Extract entity names and contexts
            texts = []
            for entity in entities:
                # Combine name with context for better embeddings
                name = entity.get("name", "")
                context = entity.get("sentence_context", "")
                combined_text = f"{name}. {context}" if context else name
                texts.append(combined_text)
            
            # Generate embeddings
            embeddings = self.embedding_model.encode(texts)
            
            # Calculate cosine similarity matrix
            similarity_matrix = cosine_similarity(embeddings)
            
            return similarity_matrix
            
        except Exception as e:
            print(f"Warning: Semantic similarity calculation failed: {e}")
            n = len(entities)
            return np.eye(n)
    
    def calculate_combined_confidence(self, fuzzy_score: float, semantic_score: float) -> float:
        """Calculate combined confidence score"""
        # Weighted combination of fuzzy and semantic scores
        combined_score = (fuzzy_score * 0.6) + (semantic_score * 0.4)
        
        # Apply confidence boost if both scores are high
        if fuzzy_score > 0.8 and semantic_score > 0.7:
            combined_score = min(1.0, combined_score * 1.1)
        
        return combined_score
    
    def group_similar_entities(self, entities: List[Dict[str, Any]], similarity_matrix: np.ndarray) -> List[List[int]]:
        """Group entities based on similarity scores"""
        n = len(entities)
        visited = [False] * n
        groups = []
        
        for i in range(n):
            if visited[i]:
                continue
            
            # Start new group
            group = [i]
            visited[i] = True
            
            # Find similar entities
            for j in range(i + 1, n):
                if visited[j]:
                    continue
                
                # Calculate fuzzy similarity
                fuzzy_sim = self.calculate_fuzzy_similarity(
                    entities[i]["name"], 
                    entities[j]["name"]
                )
                
                # Get semantic similarity
                semantic_sim = similarity_matrix[i][j]
                
                # Calculate combined confidence
                combined_conf = self.calculate_combined_confidence(fuzzy_sim, semantic_sim)
                
                # Check if entities should be grouped
                if (fuzzy_sim >= self.fuzzy_threshold or 
                    semantic_sim >= self.semantic_threshold or 
                    combined_conf >= self.combined_threshold):
                    
                    group.append(j)
                    visited[j] = True
            
            groups.append(group)
        
        return groups
    
    def create_canonical_entities(self, entities: List[Dict[str, Any]], groups: List[List[int]], similarity_matrix: np.ndarray) -> List[CanonicalEntity]:
        """Create canonical entities from groups"""
        canonical_entities = []
        
        for group in groups:
            if len(group) == 1:
                # Single entity, no duplicates
                entity = entities[group[0]]
                canonical = CanonicalEntity(
                    canonical_id=str(uuid.uuid4()),
                    canonical_name=entity["name"],
                    member_names=[entity["name"]],
                    occurrence_count=1,
                    similarity_scores=[1.0],
                    entity_type=entity.get("type", "UNKNOWN"),
                    merge_confidence=1.0,
                    attributes=entity.get("attributes", {})
                )
                canonical_entities.append(canonical)
            else:
                # Multiple entities, create canonical
                group_entities = [entities[i] for i in group]
                
                # Choose canonical name (most frequent or longest)
                names = [e["name"] for e in group_entities]
                canonical_name = max(names, key=len)  # Use longest name as canonical
                
                # Calculate similarity scores within group
                similarity_scores = []
                for i in range(len(group)):
                    for j in range(i + 1, len(group)):
                        idx1, idx2 = group[i], group[j]
                        fuzzy_sim = self.calculate_fuzzy_similarity(
                            entities[idx1]["name"], 
                            entities[idx2]["name"]
                        )
                        semantic_sim = similarity_matrix[idx1][idx2]
                        combined_sim = self.calculate_combined_confidence(fuzzy_sim, semantic_sim)
                        similarity_scores.append(combined_sim)
                
                avg_confidence = np.mean(similarity_scores) if similarity_scores else 1.0
                
                # Merge attributes
                merged_attributes = {}
                for entity in group_entities:
                    merged_attributes.update(entity.get("attributes", {}))
                
                canonical = CanonicalEntity(
                    canonical_id=str(uuid.uuid4()),
                    canonical_name=canonical_name,
                    member_names=names,
                    occurrence_count=len(group),
                    similarity_scores=similarity_scores,
                    entity_type=group_entities[0].get("type", "UNKNOWN"),
                    merge_confidence=avg_confidence,
                    attributes=merged_attributes
                )
                canonical_entities.append(canonical)
        
        return canonical_entities
    
    def create_duplicates_table(self, canonical_entities: List[CanonicalEntity]) -> List[DuplicateTableRow]:
        """Create table of duplicates for UI display"""
        table_rows = []
        
        for canonical in canonical_entities:
            if canonical.occurrence_count > 1:  # Only include entities with duplicates
                # Determine action required
                if canonical.merge_confidence >= self.auto_merge_threshold:
                    action = "auto_merge"
                elif canonical.merge_confidence >= self.manual_review_threshold:
                    action = "manual_review"
                else:
                    action = "keep_separate"
                
                row = DuplicateTableRow(
                    canonical_entity=canonical.canonical_name,
                    duplicate_names=canonical.member_names,
                    similarity_score=canonical.merge_confidence,
                    occurrence_count=canonical.occurrence_count,
                    entity_type=canonical.entity_type,
                    merge_confidence=canonical.merge_confidence,
                    action_required=action
                )
                table_rows.append(row)
        
        return table_rows
    
    async def resolve_entities(self, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Main entity resolution function"""
        start_time = time.time()
        
        try:
            if not entities:
                return EntityResolutionResponse(
                    success=True,
                    status_code=200,
                    processing_ms=0,
                    data={
                        "canonical_entities": [],
                        "duplicates_table": [],
                        "metrics": {
                            "total_duplicates": 0,
                            "unique_entities": 0,
                            "duplication_percentage": 0.0
                        }
                    }
                ).dict()
            
            # Calculate semantic similarity matrix
            similarity_matrix = await self.calculate_semantic_similarity(entities)
            
            # Group similar entities
            groups = self.group_similar_entities(entities, similarity_matrix)
            
            # Create canonical entities
            canonical_entities = self.create_canonical_entities(entities, groups, similarity_matrix)
            
            # Create duplicates table
            duplicates_table = self.create_duplicates_table(canonical_entities)
            
            # Calculate metrics
            total_entities = len(entities)
            unique_entities = len(canonical_entities)
            total_duplicates = total_entities - unique_entities
            duplication_percentage = (total_duplicates / total_entities * 100) if total_entities > 0 else 0.0
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return EntityResolutionResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data={
                    "canonical_entities": [entity.dict() for entity in canonical_entities],
                    "duplicates_table": [row.dict() for row in duplicates_table],
                    "metrics": {
                        "total_duplicates": total_duplicates,
                        "unique_entities": unique_entities,
                        "duplication_percentage": round(duplication_percentage, 2),
                        "total_input_entities": total_entities,
                        "auto_merge_count": len([r for r in duplicates_table if r.action_required == "auto_merge"]),
                        "manual_review_count": len([r for r in duplicates_table if r.action_required == "manual_review"]),
                        "keep_separate_count": len([r for r in duplicates_table if r.action_required == "keep_separate"])
                    }
                },
                warnings=[] if self.embedding_model else ["Semantic similarity disabled - embedding model not available"]
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return EntityResolutionResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Entity resolution failed: {str(e)}",
                warnings=["Check input entities format and try again"]
            ).dict()
    
    async def merge_entities(self, canonical_id: str, action: str) -> Dict[str, Any]:
        """Execute merge action for entities"""
        try:
            # This would typically update the database
            # For now, return success response
            return EntityResolutionResponse(
                success=True,
                status_code=200,
                processing_ms=0,
                data={
                    "canonical_id": canonical_id,
                    "action": action,
                    "status": "completed"
                }
            ).dict()
            
        except Exception as e:
            return EntityResolutionResponse(
                success=False,
                status_code=500,
                processing_ms=0,
                error=f"Merge operation failed: {str(e)}"
            ).dict()

# Global entity resolution instance
entity_resolver = EnhancedEntityResolution()

# FastAPI endpoints
async def resolve_entities_endpoint(entities: List[Dict[str, Any]]):
    """Entity resolution endpoint"""
    result = await entity_resolver.resolve_entities(entities)
    return result

async def merge_entities_endpoint(canonical_id: str, action: str):
    """Merge entities endpoint"""
    result = await entity_resolver.merge_entities(canonical_id, action)
    return result

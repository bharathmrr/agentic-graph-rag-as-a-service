"""
Enhanced LLM-powered ontology generation with structured JSON output
Supports OpenAI, Ollama, and local models for entity and relationship extraction
"""

import json
import re
import uuid
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import asyncio
import spacy
import structlog
from sentence_transformers import SentenceTransformer

from src.utils.logger import get_logger

logger = get_logger("enhanced_ontology_generator")


@dataclass
class ExtractedEntity:
    """Represents an extracted entity with full context."""
    id: str
    name: str
    normalized: str
    type: str
    attributes: Dict[str, Any]
    sentence_context: str
    start_char: int
    end_char: int
    confidence: float
    source_doc_id: str


@dataclass
class ExtractedRelationship:
    """Represents an extracted relationship between entities."""
    id: str
    source_entity_id: str
    target_entity_id: str
    relation_type: str
    sentence_context: str
    strength: float
    confidence: float
    source_doc_id: str


class EnhancedOntologyGenerator:
    """Enhanced ontology generator with multiple LLM backends and structured output."""

    def __init__(self, 
                 openai_client=None, 
                 ollama_client=None,
                 model_name: str = "gpt-3.5-turbo",
                 use_spacy: bool = True):
        """Initialize enhanced ontology generator."""
        self.openai_client = openai_client
        self.ollama_client = ollama_client
        self.model_name = model_name
        self.use_spacy = use_spacy
        
        # Load spaCy model for NLP preprocessing
        if use_spacy:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found, using basic text processing")
                self.nlp = None
        else:
            self.nlp = None
            
        # Load sentence transformer for semantic similarity
        try:
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            logger.warning(f"Failed to load sentence transformer: {e}")
            self.sentence_model = None
            
        logger.info("Enhanced ontology generator initialized", 
                   model=model_name, spacy_enabled=use_spacy)

    def clean_json_response(self, response_text: str) -> Dict[str, Any]:
        """Clean and parse JSON response from LLM."""
        try:
            # Remove markdown code blocks
            response_text = re.sub(r'```json\s*', '', response_text)
            response_text = re.sub(r'```\s*$', '', response_text)
            
            # Remove any leading/trailing whitespace
            response_text = response_text.strip()
            
            # Try to parse JSON
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse JSON response: {e}")
            # Try to extract JSON from text
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            # Return empty structure if parsing fails
            return {"entities": [], "relationships": []}

    def preprocess_text(self, text: str) -> List[Dict[str, Any]]:
        """Preprocess text using spaCy for better entity extraction."""
        if not self.nlp:
            # Basic sentence splitting
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            return [{"text": s, "start": 0, "end": len(s)} for s in sentences]
        
        doc = self.nlp(text)
        sentences = []
        
        for sent in doc.sents:
            sentences.append({
                "text": sent.text.strip(),
                "start": sent.start_char,
                "end": sent.end_char,
                "entities": [(ent.text, ent.label_, ent.start_char, ent.end_char) 
                           for ent in sent.ents]
            })
        
        return sentences

    async def extract_entities_and_relations(self, 
                                           text: str, 
                                           doc_id: str) -> Tuple[List[ExtractedEntity], List[ExtractedRelationship]]:
        """Extract entities and relationships from text using LLM."""
        
        # Preprocess text
        sentences = self.preprocess_text(text)
        
        entities = []
        relationships = []
        
        # Process in chunks to avoid token limits
        chunk_size = 3  # Process 3 sentences at a time
        
        for i in range(0, len(sentences), chunk_size):
            chunk_sentences = sentences[i:i+chunk_size]
            chunk_text = " ".join([s["text"] for s in chunk_sentences])
            
            if len(chunk_text.strip()) < 10:  # Skip very short chunks
                continue
                
            # Create extraction prompt
            prompt = self._create_extraction_prompt(chunk_text)
            
            try:
                # Call LLM for extraction
                if self.openai_client:
                    response = await self._call_openai(prompt)
                elif self.ollama_client:
                    response = await self._call_ollama(prompt)
                else:
                    logger.warning("No LLM client available, using fallback extraction")
                    response = self._fallback_extraction(chunk_text)
                
                # Parse response and create entities/relationships
                chunk_entities, chunk_relations = self._parse_extraction_response(
                    response, chunk_sentences, doc_id
                )
                
                entities.extend(chunk_entities)
                relationships.extend(chunk_relations)
                
            except Exception as e:
                logger.error(f"Failed to extract from chunk: {e}")
                continue
        
        return entities, relationships

    def _create_extraction_prompt(self, text: str) -> str:
        """Create a structured prompt for entity and relationship extraction."""
        return f"""
Extract entities and relationships from the following text. Return a JSON object with the following structure:

{{
  "entities": [
    {{
      "name": "entity name",
      "type": "PERSON|ORGANIZATION|LOCATION|CONCEPT|EVENT|PRODUCT|OTHER",
      "attributes": {{"key": "value"}},
      "confidence": 0.0-1.0
    }}
  ],
  "relationships": [
    {{
      "source": "source entity name",
      "target": "target entity name", 
      "type": "WORKS_FOR|LOCATED_IN|PART_OF|RELATED_TO|CAUSES|CREATED_BY|OTHER",
      "confidence": 0.0-1.0
    }}
  ]
}}

Text to analyze:
{text}

Important: Return only valid JSON. Focus on the most important entities and clear relationships.
"""

    async def _call_openai(self, prompt: str) -> Dict[str, Any]:
        """Call OpenAI API for extraction."""
        try:
            response = await self.openai_client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert knowledge extraction system. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            return self.clean_json_response(content)
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return {"entities": [], "relationships": []}

    async def _call_ollama(self, prompt: str) -> Dict[str, Any]:
        """Call Ollama API for extraction."""
        try:
            response = await self.ollama_client.chat(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert knowledge extraction system. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            content = response['message']['content']
            return self.clean_json_response(content)
            
        except Exception as e:
            logger.error(f"Ollama API call failed: {e}")
            return {"entities": [], "relationships": []}

    def _fallback_extraction(self, text: str) -> Dict[str, Any]:
        """Fallback extraction using spaCy when LLM is not available."""
        if not self.nlp:
            return {"entities": [], "relationships": []}
        
        doc = self.nlp(text)
        entities = []
        
        for ent in doc.ents:
            entities.append({
                "name": ent.text,
                "type": ent.label_,
                "attributes": {},
                "confidence": 0.7
            })
        
        return {"entities": entities, "relationships": []}

    def _parse_extraction_response(self, 
                                 response: Dict[str, Any], 
                                 sentences: List[Dict[str, Any]], 
                                 doc_id: str) -> Tuple[List[ExtractedEntity], List[ExtractedRelationship]]:
        """Parse LLM response into structured entities and relationships."""
        
        entities = []
        relationships = []
        
        # Process entities
        for ent_data in response.get("entities", []):
            entity_id = str(uuid.uuid4())
            
            # Find sentence context
            sentence_context = ""
            start_char = 0
            end_char = 0
            
            for sent in sentences:
                if ent_data["name"].lower() in sent["text"].lower():
                    sentence_context = sent["text"]
                    start_char = sent["start"]
                    end_char = sent["end"]
                    break
            
            entity = ExtractedEntity(
                id=entity_id,
                name=ent_data["name"],
                normalized=ent_data["name"].lower().strip(),
                type=ent_data.get("type", "OTHER"),
                attributes=ent_data.get("attributes", {}),
                sentence_context=sentence_context,
                start_char=start_char,
                end_char=end_char,
                confidence=ent_data.get("confidence", 0.8),
                source_doc_id=doc_id
            )
            entities.append(entity)
        
        # Process relationships
        entity_name_to_id = {ent.name: ent.id for ent in entities}
        
        for rel_data in response.get("relationships", []):
            source_id = entity_name_to_id.get(rel_data.get("source"))
            target_id = entity_name_to_id.get(rel_data.get("target"))
            
            if source_id and target_id:
                relationship_id = str(uuid.uuid4())
                
                # Find sentence context for relationship
                sentence_context = ""
                for sent in sentences:
                    if (rel_data["source"].lower() in sent["text"].lower() and 
                        rel_data["target"].lower() in sent["text"].lower()):
                        sentence_context = sent["text"]
                        break
                
                relationship = ExtractedRelationship(
                    id=relationship_id,
                    source_entity_id=source_id,
                    target_entity_id=target_id,
                    relation_type=rel_data.get("type", "RELATED_TO"),
                    sentence_context=sentence_context,
                    strength=rel_data.get("confidence", 0.8),
                    confidence=rel_data.get("confidence", 0.8),
                    source_doc_id=doc_id
                )
                relationships.append(relationship)
        
        return entities, relationships

    async def generate_hierarchical_ontology(self, 
                                           text: str, 
                                           doc_id: str) -> Dict[str, Any]:
        """Generate hierarchical ontology with entities grouped by type."""
        
        logger.info(f"Generating ontology for document {doc_id}")
        
        try:
            # Extract entities and relationships
            entities, relationships = await self.extract_entities_and_relations(text, doc_id)
            
            # Group entities by type
            entities_by_type = {}
            for entity in entities:
                entity_type = entity.type
                if entity_type not in entities_by_type:
                    entities_by_type[entity_type] = {
                        "count": 0,
                        "items": []
                    }
                
                entities_by_type[entity_type]["count"] += 1
                entities_by_type[entity_type]["items"].append(asdict(entity))
            
            # Create summary statistics
            total_entities = len(entities)
            unique_entities = len(set(ent.normalized for ent in entities))
            total_relationships = len(relationships)
            
            counts_by_type = {ent_type: data["count"] 
                            for ent_type, data in entities_by_type.items()}
            
            # Structure final ontology
            ontology = {
                "entities": entities_by_type,
                "relationships": [asdict(rel) for rel in relationships],
                "summary": {
                    "total_entities": total_entities,
                    "unique_entities": unique_entities,
                    "total_relationships": total_relationships,
                    "counts_by_type": counts_by_type,
                    "generated_at": datetime.now().isoformat(),
                    "source_doc_id": doc_id
                }
            }
            
            logger.info(f"Generated ontology with {total_entities} entities and {total_relationships} relationships")
            
            return ontology
            
        except Exception as e:
            logger.error(f"Failed to generate ontology: {e}")
            raise

    def get_entity_statistics(self, ontology: Dict[str, Any]) -> Dict[str, Any]:
        """Get detailed statistics about the generated ontology."""
        
        summary = ontology.get("summary", {})
        entities = ontology.get("entities", {})
        relationships = ontology.get("relationships", [])
        
        # Calculate additional statistics
        relationship_types = {}
        for rel in relationships:
            rel_type = rel.get("relation_type", "UNKNOWN")
            relationship_types[rel_type] = relationship_types.get(rel_type, 0) + 1
        
        # Entity type distribution
        entity_distribution = []
        for ent_type, data in entities.items():
            entity_distribution.append({
                "type": ent_type,
                "count": data["count"],
                "percentage": (data["count"] / summary.get("total_entities", 1)) * 100
            })
        
        return {
            "basic_stats": summary,
            "entity_distribution": entity_distribution,
            "relationship_types": relationship_types,
            "avg_confidence": self._calculate_average_confidence(ontology),
            "complexity_score": self._calculate_complexity_score(ontology)
        }

    def _calculate_average_confidence(self, ontology: Dict[str, Any]) -> float:
        """Calculate average confidence score across all entities and relationships."""
        confidences = []
        
        # Entity confidences
        for ent_type, data in ontology.get("entities", {}).items():
            for entity in data.get("items", []):
                confidences.append(entity.get("confidence", 0.0))
        
        # Relationship confidences
        for rel in ontology.get("relationships", []):
            confidences.append(rel.get("confidence", 0.0))
        
        return sum(confidences) / len(confidences) if confidences else 0.0

    def _calculate_complexity_score(self, ontology: Dict[str, Any]) -> float:
        """Calculate complexity score based on entities, relationships, and types."""
        summary = ontology.get("summary", {})
        
        total_entities = summary.get("total_entities", 0)
        total_relationships = summary.get("total_relationships", 0)
        entity_types = len(ontology.get("entities", {}))
        
        # Simple complexity formula
        if total_entities == 0:
            return 0.0
        
        relationship_density = total_relationships / total_entities
        type_diversity = entity_types / 10  # Normalize to 0-1 scale
        
        complexity = (relationship_density + type_diversity) / 2
        return min(complexity, 1.0)  # Cap at 1.0

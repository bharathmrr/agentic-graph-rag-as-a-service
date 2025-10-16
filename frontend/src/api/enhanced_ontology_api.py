"""
Enhanced Ontology Generator API with structured JSON output
"""
import json
import time
import re
import uuid
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import HTTPException
import spacy
from openai import OpenAI
import asyncio

class EntityModel(BaseModel):
    id: str
    name: str
    normalized: str
    type: str
    attributes: Dict[str, Any]
    sentence_context: str
    start_char: int
    end_char: int
    source_doc_id: str
    confidence: float

class RelationModel(BaseModel):
    id: str
    source_entity_id: str
    target_entity_id: str
    relation_type: str
    sentence_context: str
    strength: float
    source_doc_id: str
    confidence: float

class OntologyResponse(BaseModel):
    success: bool
    status_code: int
    processing_ms: int
    data: Optional[Dict[str, Any]] = None
    warnings: List[str] = []
    error: Optional[str] = None

class EnhancedOntologyGenerator:
    def __init__(self):
        self.client = OpenAI()
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            self.nlp = None
            print("Warning: spaCy model not found. Install with: python -m spacy download en_core_web_sm")
        
        self.entity_types = [
            "PERSON", "ORGANIZATION", "LOCATION", "EVENT", "CONCEPT", 
            "TECHNOLOGY", "PRODUCT", "SKILL", "ROLE", "PROCESS"
        ]
        
        self.relation_types = [
            "works_for", "located_in", "part_of", "related_to", "uses",
            "creates", "manages", "collaborates_with", "depends_on", "influences"
        ]
    
    def clean_json_response(self, llm_output: str) -> Dict[str, Any]:
        """Robust JSON cleaning and validation"""
        try:
            # Remove markdown code blocks
            llm_output = re.sub(r'```json\s*', '', llm_output)
            llm_output = re.sub(r'```\s*$', '', llm_output)
            
            # Remove any leading/trailing whitespace
            llm_output = llm_output.strip()
            
            # Try to find JSON object boundaries
            start_idx = llm_output.find('{')
            end_idx = llm_output.rfind('}')
            
            if start_idx != -1 and end_idx != -1:
                json_str = llm_output[start_idx:end_idx + 1]
                
                # Fix common JSON issues
                json_str = re.sub(r',\s*}', '}', json_str)  # Remove trailing commas
                json_str = re.sub(r',\s*]', ']', json_str)  # Remove trailing commas in arrays
                
                # Parse JSON
                parsed = json.loads(json_str)
                return parsed
            else:
                raise ValueError("No valid JSON object found")
                
        except json.JSONDecodeError as e:
            # Retry with more aggressive cleaning
            try:
                # Remove any non-JSON content before and after
                lines = llm_output.split('\n')
                json_lines = []
                in_json = False
                
                for line in lines:
                    if '{' in line and not in_json:
                        in_json = True
                    if in_json:
                        json_lines.append(line)
                    if '}' in line and in_json:
                        break
                
                cleaned = '\n'.join(json_lines)
                return json.loads(cleaned)
                
            except Exception:
                raise ValueError(f"Failed to parse JSON: {str(e)}")
    
    async def extract_entities_spacy(self, text: str, doc_id: str) -> List[EntityModel]:
        """Extract entities using spaCy NER"""
        if not self.nlp:
            return []
        
        doc = self.nlp(text)
        entities = []
        
        for ent in doc.ents:
            entity_id = str(uuid.uuid4())
            
            # Get sentence context
            sent = ent.sent
            sentence_context = sent.text.strip()
            
            # Map spaCy labels to our types
            entity_type = self._map_spacy_label(ent.label_)
            
            entity = EntityModel(
                id=entity_id,
                name=ent.text,
                normalized=ent.text.lower().strip(),
                type=entity_type,
                attributes={
                    "spacy_label": ent.label_,
                    "spacy_confidence": float(ent._.get("confidence", 0.8))
                },
                sentence_context=sentence_context,
                start_char=ent.start_char,
                end_char=ent.end_char,
                source_doc_id=doc_id,
                confidence=0.8
            )
            entities.append(entity)
        
        return entities
    
    def _map_spacy_label(self, spacy_label: str) -> str:
        """Map spaCy NER labels to our entity types"""
        mapping = {
            "PERSON": "PERSON",
            "ORG": "ORGANIZATION",
            "GPE": "LOCATION",
            "LOC": "LOCATION",
            "EVENT": "EVENT",
            "PRODUCT": "PRODUCT",
            "WORK_OF_ART": "CONCEPT",
            "LAW": "CONCEPT",
            "LANGUAGE": "CONCEPT"
        }
        return mapping.get(spacy_label, "CONCEPT")
    
    async def extract_entities_llm(self, text: str, doc_id: str, max_retries: int = 3) -> Dict[str, Any]:
        """Extract entities and relationships using LLM"""
        
        prompt = f"""
        Extract entities and relationships from the following text. Return a structured JSON object.

        Text: {text[:3000]}  # Limit text length for API

        Return JSON in this exact format:
        {{
            "entities": {{
                "PERSON": {{
                    "count": 0,
                    "items": [
                        {{
                            "id": "unique_id",
                            "name": "entity_name",
                            "normalized": "normalized_name",
                            "type": "PERSON",
                            "attributes": {{}},
                            "sentence_context": "sentence containing entity",
                            "start_char": 0,
                            "end_char": 10,
                            "confidence": 0.9
                        }}
                    ]
                }}
            }},
            "relations": [
                {{
                    "id": "relation_id",
                    "source_entity_id": "entity1_id",
                    "target_entity_id": "entity2_id",
                    "relation_type": "works_for",
                    "sentence_context": "sentence describing relation",
                    "strength": 0.8,
                    "confidence": 0.9
                }}
            ],
            "summary": {{
                "total_entities": 0,
                "unique_entities": 0,
                "total_relations": 0,
                "counts_by_type": {{}}
            }}
        }}

        Entity types: {', '.join(self.entity_types)}
        Relation types: {', '.join(self.relation_types)}
        
        Only return valid JSON, no explanations.
        """
        
        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are an expert entity extraction system. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1,
                    max_tokens=2000
                )
                
                llm_output = response.choices[0].message.content
                parsed_json = self.clean_json_response(llm_output)
                
                # Validate and enhance the structure
                enhanced_json = self._enhance_ontology_structure(parsed_json, doc_id)
                return enhanced_json
                
            except Exception as e:
                if attempt == max_retries - 1:
                    raise HTTPException(
                        status_code=422,
                        detail=f"Failed to extract ontology after {max_retries} attempts: {str(e)}"
                    )
                await asyncio.sleep(1)  # Wait before retry
    
    def _enhance_ontology_structure(self, raw_json: Dict[str, Any], doc_id: str) -> Dict[str, Any]:
        """Enhance and validate ontology structure"""
        enhanced = {
            "entities": {},
            "relations": [],
            "summary": {
                "total_entities": 0,
                "unique_entities": 0,
                "total_relations": 0,
                "counts_by_type": {}
            }
        }
        
        # Process entities
        entities_data = raw_json.get("entities", {})
        entity_id_map = {}
        
        for entity_type, type_data in entities_data.items():
            if entity_type not in enhanced["entities"]:
                enhanced["entities"][entity_type] = {
                    "count": 0,
                    "items": []
                }
            
            items = type_data.get("items", [])
            for item in items:
                # Generate ID if missing
                if "id" not in item:
                    item["id"] = str(uuid.uuid4())
                
                # Add missing fields
                item.setdefault("source_doc_id", doc_id)
                item.setdefault("confidence", 0.8)
                item.setdefault("attributes", {})
                item.setdefault("normalized", item.get("name", "").lower().strip())
                
                enhanced["entities"][entity_type]["items"].append(item)
                entity_id_map[item["name"]] = item["id"]
            
            enhanced["entities"][entity_type]["count"] = len(items)
            enhanced["summary"]["counts_by_type"][entity_type] = len(items)
            enhanced["summary"]["total_entities"] += len(items)
        
        # Process relations
        relations_data = raw_json.get("relations", [])
        for relation in relations_data:
            # Generate ID if missing
            if "id" not in relation:
                relation["id"] = str(uuid.uuid4())
            
            # Add missing fields
            relation.setdefault("source_doc_id", doc_id)
            relation.setdefault("confidence", 0.8)
            relation.setdefault("strength", 0.7)
            
            enhanced["relations"].append(relation)
        
        enhanced["summary"]["total_relations"] = len(enhanced["relations"])
        enhanced["summary"]["unique_entities"] = enhanced["summary"]["total_entities"]
        
        return enhanced
    
    async def generate_ontology(self, doc_id: str, text: str, use_spacy: bool = True) -> Dict[str, Any]:
        """Generate complete ontology from text"""
        start_time = time.time()
        
        try:
            # Extract entities using both methods if available
            spacy_entities = []
            if use_spacy and self.nlp:
                spacy_entities = await self.extract_entities_spacy(text, doc_id)
            
            # Extract using LLM
            llm_ontology = await self.extract_entities_llm(text, doc_id)
            
            # Merge results if we have spaCy entities
            if spacy_entities:
                # Add spaCy entities to LLM results
                for entity in spacy_entities:
                    entity_type = entity.type
                    if entity_type not in llm_ontology["entities"]:
                        llm_ontology["entities"][entity_type] = {"count": 0, "items": []}
                    
                    # Check for duplicates
                    existing_names = [item["name"] for item in llm_ontology["entities"][entity_type]["items"]]
                    if entity.name not in existing_names:
                        llm_ontology["entities"][entity_type]["items"].append(entity.dict())
                        llm_ontology["entities"][entity_type]["count"] += 1
            
            # Recalculate summary
            total_entities = sum(type_data["count"] for type_data in llm_ontology["entities"].values())
            llm_ontology["summary"]["total_entities"] = total_entities
            llm_ontology["summary"]["unique_entities"] = total_entities
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return OntologyResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data=llm_ontology,
                warnings=[] if self.nlp else ["spaCy model not available, using LLM only"]
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return OntologyResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Ontology generation failed: {str(e)}",
                warnings=["Check input text and try again"]
            ).dict()

# Global ontology generator instance
ontology_generator = EnhancedOntologyGenerator()

# FastAPI endpoint
async def generate_ontology_endpoint(doc_id: str, text: str, use_spacy: bool = True):
    """Generate ontology endpoint"""
    result = await ontology_generator.generate_ontology(doc_id, text, use_spacy)
    status_code = result["status_code"]
    return result

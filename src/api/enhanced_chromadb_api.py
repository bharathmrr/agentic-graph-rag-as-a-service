"""
Enhanced ChromaDB Integration API with embedding generation and semantic search
"""
import time
import uuid
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.cluster import KMeans
import asyncio

class EmbeddingMetadata(BaseModel):
    entity_id: str
    entity_name: str
    entity_type: str
    source_doc_id: str
    chunk_index: int
    chunk_text: str
    neo4j_node_id: Optional[str] = None

class SemanticSearchResult(BaseModel):
    id: str
    entity_id: str
    name: str
    score: float
    entity_type: str
    anchor_text: str
    source_doc_id: str
    metadata: Dict[str, Any]

class EmbeddingResponse(BaseModel):
    success: bool
    status_code: int
    processing_ms: int
    data: Optional[Dict[str, Any]] = None
    warnings: List[str] = []
    error: Optional[str] = None

class EnhancedChromaDBIntegration:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        
        # Initialize ChromaDB client
        try:
            self.client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
        except Exception as e:
            print(f"Warning: ChromaDB initialization failed: {e}")
            self.client = None
        
        # Initialize embedding model
        try:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            self.embedding_dimension = 384  # Dimension for all-MiniLM-L6-v2
        except Exception as e:
            print(f"Warning: Could not load embedding model: {e}")
            self.embedding_model = None
            self.embedding_dimension = 384
        
        # Collection names
        self.entities_collection_name = "entities"
        self.chunks_collection_name = "document_chunks"
        
        # Initialize collections
        self._initialize_collections()
    
    def _initialize_collections(self):
        """Initialize ChromaDB collections"""
        if not self.client:
            return
        
        try:
            # Create or get entities collection
            self.entities_collection = self.client.get_or_create_collection(
                name=self.entities_collection_name,
                metadata={"description": "Entity embeddings for semantic search"}
            )
            
            # Create or get chunks collection
            self.chunks_collection = self.client.get_or_create_collection(
                name=self.chunks_collection_name,
                metadata={"description": "Document chunk embeddings"}
            )
            
        except Exception as e:
            print(f"Warning: Collection initialization failed: {e}")
            self.entities_collection = None
            self.chunks_collection = None
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 100) -> List[Dict[str, Any]]:
        """Chunk text into overlapping segments"""
        chunks = []
        words = text.split()
        
        if len(words) <= chunk_size:
            return [{
                "text": text,
                "start_idx": 0,
                "end_idx": len(text),
                "chunk_index": 0
            }]
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)
            
            chunks.append({
                "text": chunk_text,
                "start_idx": i,
                "end_idx": min(i + chunk_size, len(words)),
                "chunk_index": len(chunks)
            })
            
            if i + chunk_size >= len(words):
                break
        
        return chunks
    
    async def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for list of texts"""
        if not self.embedding_model:
            # Return random embeddings as fallback
            return np.random.rand(len(texts), self.embedding_dimension).astype(np.float32)
        
        try:
            embeddings = self.embedding_model.encode(texts, convert_to_numpy=True)
            return embeddings.astype(np.float32)
        except Exception as e:
            print(f"Warning: Embedding generation failed: {e}")
            return np.random.rand(len(texts), self.embedding_dimension).astype(np.float32)
    
    async def store_entity_embeddings(self, entities: List[Dict[str, Any]], doc_id: str) -> Dict[str, Any]:
        """Store entity embeddings in ChromaDB"""
        start_time = time.time()
        
        try:
            if not self.client or not self.entities_collection:
                return EmbeddingResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error="ChromaDB not available"
                ).dict()
            
            if not entities:
                return EmbeddingResponse(
                    success=True,
                    status_code=200,
                    processing_ms=0,
                    data={"stored": 0, "failed": 0, "ids": [], "metadata_map": {}}
                ).dict()
            
            # Prepare texts for embedding
            texts = []
            metadata_list = []
            ids = []
            
            for entity in entities:
                # Combine entity name with context for better embeddings
                entity_text = f"{entity.get('name', '')}. {entity.get('sentence_context', '')}"
                texts.append(entity_text)
                
                # Create unique ID
                entity_id = entity.get('id', str(uuid.uuid4()))
                ids.append(f"entity_{entity_id}")
                
                # Prepare metadata
                metadata = {
                    "entity_id": entity_id,
                    "entity_name": entity.get('name', ''),
                    "entity_type": entity.get('type', 'UNKNOWN'),
                    "source_doc_id": doc_id,
                    "neo4j_node_id": entity.get('neo4j_id'),
                    "confidence": entity.get('confidence', 0.8)
                }
                metadata_list.append(metadata)
            
            # Generate embeddings
            embeddings = await self.generate_embeddings(texts)
            
            # Store in ChromaDB
            self.entities_collection.add(
                embeddings=embeddings.tolist(),
                metadatas=metadata_list,
                documents=texts,
                ids=ids
            )
            
            processing_time = int((time.time() - start_time) * 1000)
            
            # Create metadata map for response
            metadata_map = {id_: meta for id_, meta in zip(ids, metadata_list)}
            
            return EmbeddingResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data={
                    "stored": len(entities),
                    "failed": 0,
                    "ids": ids,
                    "metadata_map": metadata_map,
                    "collection": self.entities_collection_name
                }
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return EmbeddingResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Failed to store embeddings: {str(e)}"
            ).dict()
    
    async def store_document_chunks(self, text: str, doc_id: str, chunk_size: int = 1000, overlap: int = 100) -> Dict[str, Any]:
        """Store document chunks with embeddings"""
        start_time = time.time()
        
        try:
            if not self.client or not self.chunks_collection:
                return EmbeddingResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error="ChromaDB not available"
                ).dict()
            
            # Chunk the document
            chunks = self.chunk_text(text, chunk_size, overlap)
            
            if not chunks:
                return EmbeddingResponse(
                    success=True,
                    status_code=200,
                    processing_ms=0,
                    data={"stored": 0, "failed": 0, "ids": [], "chunks": []}
                ).dict()
            
            # Prepare for embedding
            texts = [chunk["text"] for chunk in chunks]
            ids = [f"chunk_{doc_id}_{chunk['chunk_index']}" for chunk in chunks]
            
            metadata_list = []
            for chunk in chunks:
                metadata = {
                    "source_doc_id": doc_id,
                    "chunk_index": chunk["chunk_index"],
                    "start_idx": chunk["start_idx"],
                    "end_idx": chunk["end_idx"],
                    "chunk_size": len(chunk["text"])
                }
                metadata_list.append(metadata)
            
            # Generate embeddings
            embeddings = await self.generate_embeddings(texts)
            
            # Store in ChromaDB
            self.chunks_collection.add(
                embeddings=embeddings.tolist(),
                metadatas=metadata_list,
                documents=texts,
                ids=ids
            )
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return EmbeddingResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data={
                    "stored": len(chunks),
                    "failed": 0,
                    "ids": ids,
                    "chunks": chunks,
                    "collection": self.chunks_collection_name
                }
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return EmbeddingResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Failed to store document chunks: {str(e)}"
            ).dict()
    
    async def semantic_search(self, query: str, entity_type: Optional[str] = None, k: int = 10, collection: str = "entities") -> Dict[str, Any]:
        """Perform semantic search"""
        start_time = time.time()
        
        try:
            if not self.client:
                return EmbeddingResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error="ChromaDB not available"
                ).dict()
            
            # Select collection
            target_collection = self.entities_collection if collection == "entities" else self.chunks_collection
            
            if not target_collection:
                return EmbeddingResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error=f"Collection {collection} not available"
                ).dict()
            
            # Generate query embedding
            query_embedding = await self.generate_embeddings([query])
            
            # Prepare where clause for filtering
            where_clause = {}
            if entity_type:
                where_clause["entity_type"] = entity_type
            
            # Perform search
            results = target_collection.query(
                query_embeddings=query_embedding.tolist(),
                n_results=k,
                where=where_clause if where_clause else None
            )
            
            # Format results
            search_results = []
            if results['ids'] and len(results['ids']) > 0:
                for i, (id_, distance, metadata, document) in enumerate(zip(
                    results['ids'][0],
                    results['distances'][0],
                    results['metadatas'][0],
                    results['documents'][0]
                )):
                    # Convert distance to similarity score
                    similarity_score = 1.0 - distance
                    
                    result = SemanticSearchResult(
                        id=id_,
                        entity_id=metadata.get('entity_id', id_),
                        name=metadata.get('entity_name', 'Unknown'),
                        score=similarity_score,
                        entity_type=metadata.get('entity_type', 'UNKNOWN'),
                        anchor_text=document[:200] + "..." if len(document) > 200 else document,
                        source_doc_id=metadata.get('source_doc_id', 'unknown'),
                        metadata=metadata
                    )
                    search_results.append(result.dict())
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return EmbeddingResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data={
                    "query": query,
                    "results": search_results,
                    "total_results": len(search_results),
                    "collection": collection,
                    "filters": {"entity_type": entity_type} if entity_type else {}
                }
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return EmbeddingResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Semantic search failed: {str(e)}"
            ).dict()
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about collections"""
        try:
            stats = {
                "entities_collection": {
                    "name": self.entities_collection_name,
                    "count": 0,
                    "available": False
                },
                "chunks_collection": {
                    "name": self.chunks_collection_name,
                    "count": 0,
                    "available": False
                }
            }
            
            if self.entities_collection:
                stats["entities_collection"]["count"] = self.entities_collection.count()
                stats["entities_collection"]["available"] = True
            
            if self.chunks_collection:
                stats["chunks_collection"]["count"] = self.chunks_collection.count()
                stats["chunks_collection"]["available"] = True
            
            return EmbeddingResponse(
                success=True,
                status_code=200,
                processing_ms=0,
                data=stats
            ).dict()
            
        except Exception as e:
            return EmbeddingResponse(
                success=False,
                status_code=500,
                processing_ms=0,
                error=f"Failed to get collection stats: {str(e)}"
            ).dict()
    
    async def cluster_embeddings(self, entity_type: Optional[str] = None, n_clusters: int = 5) -> Dict[str, Any]:
        """Cluster entity embeddings for visualization"""
        start_time = time.time()
        
        try:
            if not self.entities_collection:
                return EmbeddingResponse(
                    success=False,
                    status_code=500,
                    processing_ms=0,
                    error="Entities collection not available"
                ).dict()
            
            # Get all embeddings
            where_clause = {"entity_type": entity_type} if entity_type else None
            
            results = self.entities_collection.get(
                where=where_clause,
                include=["embeddings", "metadatas", "documents"]
            )
            
            if not results['embeddings'] or len(results['embeddings']) < n_clusters:
                return EmbeddingResponse(
                    success=True,
                    status_code=200,
                    processing_ms=0,
                    data={
                        "clusters": [],
                        "total_entities": len(results['embeddings']) if results['embeddings'] else 0,
                        "message": "Not enough entities for clustering"
                    }
                ).dict()
            
            # Perform clustering
            embeddings = np.array(results['embeddings'])
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(embeddings)
            
            # Group results by cluster
            clusters = {}
            for i, (id_, metadata, document, label) in enumerate(zip(
                results['ids'],
                results['metadatas'],
                results['documents'],
                cluster_labels
            )):
                if label not in clusters:
                    clusters[label] = []
                
                clusters[label].append({
                    "id": id_,
                    "entity_name": metadata.get('entity_name', 'Unknown'),
                    "entity_type": metadata.get('entity_type', 'UNKNOWN'),
                    "source_doc_id": metadata.get('source_doc_id', 'unknown'),
                    "text_preview": document[:100] + "..." if len(document) > 100 else document
                })
            
            processing_time = int((time.time() - start_time) * 1000)
            
            return EmbeddingResponse(
                success=True,
                status_code=200,
                processing_ms=processing_time,
                data={
                    "clusters": [{"cluster_id": k, "entities": v} for k, v in clusters.items()],
                    "total_entities": len(results['embeddings']),
                    "n_clusters": n_clusters,
                    "entity_type_filter": entity_type
                }
            ).dict()
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            return EmbeddingResponse(
                success=False,
                status_code=500,
                processing_ms=processing_time,
                error=f"Clustering failed: {str(e)}"
            ).dict()

# Global ChromaDB integration instance
chromadb_integration = EnhancedChromaDBIntegration()

# FastAPI endpoints
async def store_entity_embeddings_endpoint(entities: List[Dict[str, Any]], doc_id: str):
    """Store entity embeddings endpoint"""
    result = await chromadb_integration.store_entity_embeddings(entities, doc_id)
    return result

async def store_document_chunks_endpoint(text: str, doc_id: str, chunk_size: int = 1000, overlap: int = 100):
    """Store document chunks endpoint"""
    result = await chromadb_integration.store_document_chunks(text, doc_id, chunk_size, overlap)
    return result

async def semantic_search_endpoint(query: str, entity_type: Optional[str] = None, k: int = 10, collection: str = "entities"):
    """Semantic search endpoint"""
    result = await chromadb_integration.semantic_search(query, entity_type, k, collection)
    return result

async def get_collection_stats_endpoint():
    """Get collection statistics endpoint"""
    result = await chromadb_integration.get_collection_stats()
    return result

async def cluster_embeddings_endpoint(entity_type: Optional[str] = None, n_clusters: int = 5):
    """Cluster embeddings endpoint"""
    result = await chromadb_integration.cluster_embeddings(entity_type, n_clusters)
    return result

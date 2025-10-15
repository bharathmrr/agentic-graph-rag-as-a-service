"""
Enhanced ChromaDB integration for embedding generation and semantic search
Supports document chunking, batch embeddings, and multi-filter search
"""

import uuid
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import asyncio
import numpy as np
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import structlog

from src.utils.logger import get_logger

logger = get_logger("enhanced_chromadb_integration")


@dataclass
class DocumentChunk:
    """Represents a document chunk for embedding."""
    id: str
    text: str
    metadata: Dict[str, Any]
    embedding: Optional[np.ndarray] = None
    source_doc_id: str = ""
    chunk_index: int = 0
    start_char: int = 0
    end_char: int = 0


@dataclass
class SearchResult:
    """Represents a search result from ChromaDB."""
    id: str
    text: str
    score: float
    metadata: Dict[str, Any]
    entity_id: Optional[str] = None
    entity_type: Optional[str] = None


class EnhancedChromaDBIntegration:
    """Enhanced ChromaDB integration with advanced features."""

    def __init__(self, 
                 chroma_client=None,
                 collection_name: str = "knowledge_graph",
                 embedding_model: str = "all-MiniLM-L6-v2",
                 chunk_size: int = 500,
                 chunk_overlap: int = 50):
        """Initialize enhanced ChromaDB integration."""
        
        self.collection_name = collection_name
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        # Initialize ChromaDB client
        if chroma_client:
            self.client = chroma_client
        else:
            self.client = chromadb.Client(Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory="./chroma_db"
            ))
        
        # Initialize embedding model
        try:
            self.embedding_model = SentenceTransformer(embedding_model)
            logger.info(f"Loaded embedding model: {embedding_model}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
        
        # Get or create collection
        try:
            self.collection = self.client.get_collection(collection_name)
            logger.info(f"Using existing collection: {collection_name}")
        except Exception:
            self.collection = self.client.create_collection(
                name=collection_name,
                metadata={"description": "Knowledge graph embeddings"}
            )
            logger.info(f"Created new collection: {collection_name}")

    def chunk_document(self, text: str, doc_id: str) -> List[DocumentChunk]:
        """Split document into overlapping chunks for embedding."""
        
        if len(text) <= self.chunk_size:
            # Document is small enough to be a single chunk
            return [DocumentChunk(
                id=f"{doc_id}_chunk_0",
                text=text,
                metadata={
                    "source_doc_id": doc_id,
                    "chunk_index": 0,
                    "total_chunks": 1,
                    "char_count": len(text)
                },
                source_doc_id=doc_id,
                chunk_index=0,
                start_char=0,
                end_char=len(text)
            )]
        
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            end = min(start + self.chunk_size, len(text))
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings within the last 100 characters
                sentence_ends = ['.', '!', '?', '\n']
                for i in range(end - 1, max(end - 100, start), -1):
                    if text[i] in sentence_ends:
                        end = i + 1
                        break
            
            chunk_text = text[start:end].strip()
            
            if chunk_text:  # Only add non-empty chunks
                chunk = DocumentChunk(
                    id=f"{doc_id}_chunk_{chunk_index}",
                    text=chunk_text,
                    metadata={
                        "source_doc_id": doc_id,
                        "chunk_index": chunk_index,
                        "char_count": len(chunk_text),
                        "start_char": start,
                        "end_char": end
                    },
                    source_doc_id=doc_id,
                    chunk_index=chunk_index,
                    start_char=start,
                    end_char=end
                )
                chunks.append(chunk)
                chunk_index += 1
            
            # Move start position with overlap
            start = end - self.chunk_overlap
            if start >= end:  # Prevent infinite loop
                break
        
        # Update total chunks in metadata
        for chunk in chunks:
            chunk.metadata["total_chunks"] = len(chunks)
        
        logger.info(f"Split document {doc_id} into {len(chunks)} chunks")
        return chunks

    async def generate_embeddings_batch(self, 
                                      chunks: List[DocumentChunk],
                                      batch_size: int = 32) -> List[DocumentChunk]:
        """Generate embeddings for document chunks in batches."""
        
        logger.info(f"Generating embeddings for {len(chunks)} chunks")
        
        # Process in batches to avoid memory issues
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            texts = [chunk.text for chunk in batch]
            
            try:
                # Generate embeddings
                embeddings = self.embedding_model.encode(
                    texts, 
                    convert_to_numpy=True,
                    show_progress_bar=False
                )
                
                # Assign embeddings to chunks
                for j, chunk in enumerate(batch):
                    chunk.embedding = embeddings[j]
                
                logger.debug(f"Generated embeddings for batch {i//batch_size + 1}")
                
            except Exception as e:
                logger.error(f"Failed to generate embeddings for batch: {e}")
                # Set empty embeddings for failed batch
                for chunk in batch:
                    chunk.embedding = np.zeros(384)  # Default dimension
        
        return chunks

    async def store_embeddings(self, 
                             chunks: List[DocumentChunk],
                             entity_mappings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Store embeddings in ChromaDB with metadata."""
        
        logger.info(f"Storing {len(chunks)} embeddings in ChromaDB")
        
        # Prepare data for ChromaDB
        ids = []
        embeddings = []
        metadatas = []
        documents = []
        
        stored_count = 0
        failed_count = 0
        
        for chunk in chunks:
            try:
                if chunk.embedding is None:
                    logger.warning(f"Chunk {chunk.id} has no embedding, skipping")
                    failed_count += 1
                    continue
                
                # Prepare metadata
                metadata = chunk.metadata.copy()
                metadata.update({
                    "created_at": datetime.now().isoformat(),
                    "embedding_model": self.embedding_model.model_name if hasattr(self.embedding_model, 'model_name') else "unknown",
                    "text_length": len(chunk.text)
                })
                
                # Add entity mappings if provided
                if entity_mappings and chunk.source_doc_id in entity_mappings:
                    metadata["entities"] = entity_mappings[chunk.source_doc_id]
                
                ids.append(chunk.id)
                embeddings.append(chunk.embedding.tolist())
                metadatas.append(metadata)
                documents.append(chunk.text)
                stored_count += 1
                
            except Exception as e:
                logger.error(f"Failed to prepare chunk {chunk.id}: {e}")
                failed_count += 1
        
        # Store in ChromaDB
        try:
            if ids:  # Only store if we have valid data
                self.collection.add(
                    ids=ids,
                    embeddings=embeddings,
                    metadatas=metadatas,
                    documents=documents
                )
                logger.info(f"Successfully stored {stored_count} embeddings")
            else:
                logger.warning("No valid embeddings to store")
                
        except Exception as e:
            logger.error(f"Failed to store embeddings in ChromaDB: {e}")
            failed_count += stored_count
            stored_count = 0
        
        return {
            "stored": stored_count,
            "failed": failed_count,
            "ids": ids,
            "metadata_map": {chunk_id: metadatas[i] for i, chunk_id in enumerate(ids)}
        }

    async def semantic_search(self, 
                            query: str,
                            n_results: int = 10,
                            entity_type_filter: Optional[str] = None,
                            source_doc_filter: Optional[str] = None,
                            min_score: float = 0.0) -> Dict[str, Any]:
        """Perform semantic search with optional filters."""
        
        logger.info(f"Performing semantic search for: '{query[:50]}...'")
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode([query])[0].tolist()
            
            # Prepare filters
            where_filter = {}
            if entity_type_filter:
                where_filter["entity_type"] = entity_type_filter
            if source_doc_filter:
                where_filter["source_doc_id"] = source_doc_filter
            
            # Perform search
            search_kwargs = {
                "query_embeddings": [query_embedding],
                "n_results": n_results
            }
            
            if where_filter:
                search_kwargs["where"] = where_filter
            
            results = self.collection.query(**search_kwargs)
            
            # Process results
            search_results = []
            if results["ids"] and results["ids"][0]:  # Check if we have results
                for i in range(len(results["ids"][0])):
                    score = 1 - results["distances"][0][i]  # Convert distance to similarity
                    
                    if score >= min_score:  # Apply minimum score filter
                        result = SearchResult(
                            id=results["ids"][0][i],
                            text=results["documents"][0][i],
                            score=score,
                            metadata=results["metadatas"][0][i],
                            entity_id=results["metadatas"][0][i].get("entity_id"),
                            entity_type=results["metadatas"][0][i].get("entity_type")
                        )
                        search_results.append(result)
            
            logger.info(f"Found {len(search_results)} relevant results")
            
            return {
                "query": query,
                "results": [asdict(result) for result in search_results],
                "total_found": len(search_results),
                "filters_applied": where_filter,
                "search_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return {
                "query": query,
                "results": [],
                "total_found": 0,
                "error": str(e)
            }

    async def advanced_search(self, 
                            query: str,
                            search_type: str = "hybrid",
                            filters: Optional[Dict[str, Any]] = None,
                            n_results: int = 10) -> Dict[str, Any]:
        """Advanced search with multiple strategies."""
        
        logger.info(f"Performing {search_type} search")
        
        if search_type == "semantic":
            return await self.semantic_search(
                query=query,
                n_results=n_results,
                entity_type_filter=filters.get("entity_type") if filters else None,
                source_doc_filter=filters.get("source_doc_id") if filters else None
            )
        
        elif search_type == "keyword":
            return await self.keyword_search(query, filters, n_results)
        
        elif search_type == "hybrid":
            # Combine semantic and keyword search
            semantic_results = await self.semantic_search(query, n_results // 2)
            keyword_results = await self.keyword_search(query, filters, n_results // 2)
            
            # Merge and deduplicate results
            all_results = semantic_results["results"] + keyword_results["results"]
            seen_ids = set()
            unique_results = []
            
            for result in all_results:
                if result["id"] not in seen_ids:
                    unique_results.append(result)
                    seen_ids.add(result["id"])
            
            # Sort by score
            unique_results.sort(key=lambda x: x["score"], reverse=True)
            
            return {
                "query": query,
                "search_type": "hybrid",
                "results": unique_results[:n_results],
                "total_found": len(unique_results),
                "semantic_count": len(semantic_results["results"]),
                "keyword_count": len(keyword_results["results"])
            }
        
        else:
            raise ValueError(f"Unknown search type: {search_type}")

    async def keyword_search(self, 
                           query: str,
                           filters: Optional[Dict[str, Any]] = None,
                           n_results: int = 10) -> Dict[str, Any]:
        """Keyword-based search using document content."""
        
        try:
            # Get all documents (this is a simplified approach)
            # In production, you'd want to use a proper text search index
            all_results = self.collection.get(
                where=filters if filters else {},
                include=["documents", "metadatas"]
            )
            
            # Simple keyword matching
            query_terms = query.lower().split()
            scored_results = []
            
            if all_results["documents"]:
                for i, doc in enumerate(all_results["documents"]):
                    doc_lower = doc.lower()
                    score = 0
                    
                    for term in query_terms:
                        score += doc_lower.count(term)
                    
                    if score > 0:
                        result = SearchResult(
                            id=all_results["ids"][i],
                            text=doc,
                            score=score / len(query_terms),  # Normalize score
                            metadata=all_results["metadatas"][i]
                        )
                        scored_results.append(result)
            
            # Sort by score and limit results
            scored_results.sort(key=lambda x: x.score, reverse=True)
            
            return {
                "query": query,
                "search_type": "keyword",
                "results": [asdict(result) for result in scored_results[:n_results]],
                "total_found": len(scored_results)
            }
            
        except Exception as e:
            logger.error(f"Keyword search failed: {e}")
            return {
                "query": query,
                "results": [],
                "total_found": 0,
                "error": str(e)
            }

    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the ChromaDB collection."""
        
        try:
            # Get collection info
            collection_info = self.collection.get(include=["metadatas"])
            
            total_documents = len(collection_info["ids"]) if collection_info["ids"] else 0
            
            # Analyze metadata
            source_docs = set()
            entity_types = set()
            chunk_counts = {}
            
            if collection_info["metadatas"]:
                for metadata in collection_info["metadatas"]:
                    if "source_doc_id" in metadata:
                        source_docs.add(metadata["source_doc_id"])
                    if "entity_type" in metadata:
                        entity_types.add(metadata["entity_type"])
                    
                    doc_id = metadata.get("source_doc_id", "unknown")
                    chunk_counts[doc_id] = chunk_counts.get(doc_id, 0) + 1
            
            return {
                "collection_name": self.collection_name,
                "total_documents": total_documents,
                "unique_source_docs": len(source_docs),
                "entity_types": list(entity_types),
                "chunks_per_doc": chunk_counts,
                "avg_chunks_per_doc": np.mean(list(chunk_counts.values())) if chunk_counts else 0,
                "embedding_model": getattr(self.embedding_model, 'model_name', 'unknown'),
                "last_updated": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {
                "collection_name": self.collection_name,
                "error": str(e)
            }

    async def delete_document_embeddings(self, doc_id: str) -> Dict[str, Any]:
        """Delete all embeddings for a specific document."""
        
        try:
            # Find all chunks for this document
            results = self.collection.get(
                where={"source_doc_id": doc_id},
                include=["metadatas"]
            )
            
            if results["ids"]:
                # Delete the chunks
                self.collection.delete(ids=results["ids"])
                deleted_count = len(results["ids"])
                
                logger.info(f"Deleted {deleted_count} embeddings for document {doc_id}")
                
                return {
                    "success": True,
                    "deleted_count": deleted_count,
                    "document_id": doc_id
                }
            else:
                return {
                    "success": True,
                    "deleted_count": 0,
                    "document_id": doc_id,
                    "message": "No embeddings found for document"
                }
                
        except Exception as e:
            logger.error(f"Failed to delete embeddings for document {doc_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "document_id": doc_id
            }

    async def update_embeddings(self, 
                              doc_id: str, 
                              new_text: str,
                              entity_mappings: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Update embeddings for a document."""
        
        logger.info(f"Updating embeddings for document {doc_id}")
        
        try:
            # Delete existing embeddings
            delete_result = await self.delete_document_embeddings(doc_id)
            
            # Create new chunks and embeddings
            chunks = self.chunk_document(new_text, doc_id)
            chunks_with_embeddings = await self.generate_embeddings_batch(chunks)
            
            # Store new embeddings
            store_result = await self.store_embeddings(chunks_with_embeddings, entity_mappings)
            
            return {
                "success": True,
                "document_id": doc_id,
                "deleted_count": delete_result.get("deleted_count", 0),
                "stored_count": store_result.get("stored", 0),
                "failed_count": store_result.get("failed", 0)
            }
            
        except Exception as e:
            logger.error(f"Failed to update embeddings for document {doc_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "document_id": doc_id
            }

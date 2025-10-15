"""
Vector search tool for semantic similarity retrieval
Uses ChromaDB with Ollama embeddings
"""

from typing import List, Dict, Any, Optional
import structlog

from src.utils.logger import get_logger

logger = get_logger("vector_search_tool")


class VectorSearchTool:
    """Tool for vector similarity search using ChromaDB."""

    def __init__(
        self,
        chroma_client,
        collection_name: str = "agentic_rag",
        embedding_generator=None
    ):
        """
        Initialize vector search tool.

        Args:
            chroma_client: ChromaDB client instance
            collection_name: Name of the collection to search
            embedding_generator: Embedding generator for query encoding
        """
        self.chroma_client = chroma_client
        self.collection_name = collection_name
        self.embedding_generator = embedding_generator
        self.collection = None

        logger.info(
            "Vector search tool initialized",
            collection=collection_name
        )

    async def initialize(self):
        """Initialize or get the ChromaDB collection."""
        try:
            self.collection = self.chroma_client.get_or_create_collection(
                name=self.collection_name
            )
            logger.info("ChromaDB collection ready", name=self.collection_name)
        except Exception as e:
            logger.error("Failed to initialize collection", error=str(e))
            raise

    async def search(
        self,
        query: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform vector similarity search.

        Args:
            query: Natural language query
            top_k: Number of results to return
            filters: Optional metadata filters

        Returns:
            List of search results with scores
        """

        logger.info(
            "Performing vector search",
            query_length=len(query),
            top_k=top_k,
            has_filters=filters is not None
        )

        try:
            if not self.collection:
                await self.initialize()

            # Generate query embedding
            if self.embedding_generator:
                query_embedding = await self.embedding_generator.generate_embedding(query)
            else:
                logger.warning("No embedding generator available")
                return []

            # Perform search
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=filters
            )

            # Format results
            formatted_results = []
            if results and 'documents' in results:
                for i, doc in enumerate(results['documents'][0]):
                    result = {
                        'content': doc,
                        'score': results['distances'][0][i] if 'distances' in results else 0.0,
                        'metadata': results['metadatas'][0][i] if 'metadatas' in results else {},
                        'id': results['ids'][0][i] if 'ids' in results else f"result_{i}"
                    }
                    formatted_results.append(result)

            logger.info("Vector search completed", result_count=len(formatted_results))
            return formatted_results

        except Exception as e:
            logger.error("Vector search failed", error=str(e))
            raise

    async def add_documents(
        self,
        documents: List[str],
        embeddings: List[List[float]],
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None
    ) -> None:
        """
        Add documents to the vector store.

        Args:
            documents: List of document texts
            embeddings: Pre-computed embeddings
            metadatas: Optional metadata for each document
            ids: Optional IDs for documents
        """

        logger.info("Adding documents to vector store", count=len(documents))

        try:
            if not self.collection:
                await self.initialize()

            # Generate IDs if not provided
            if not ids:
                ids = [f"doc_{i}" for i in range(len(documents))]

            # Add to collection
            self.collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )

            logger.info("Documents added successfully", count=len(documents))

        except Exception as e:
            logger.error("Failed to add documents", error=str(e))
            raise

    def get_name(self) -> str:
        """Get tool name for agent routing."""
        return "vector_search"

    def get_description(self) -> str:
        """Get tool description for agent routing."""
        return (
            "Performs semantic similarity search using vector embeddings. "
            "Best for finding conceptually similar content based on meaning."
        )

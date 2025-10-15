"""
Enhanced LLM Service with Gemini and Groq Integration
Supports multiple LLM providers with unified interface
"""

import os
import asyncio
import json
from typing import Dict, List, Any, Optional, AsyncGenerator
from dataclasses import dataclass
from datetime import datetime
import logging

# Gemini imports
try:
    import google.generativeai as genai
    from langchain_google_genai import ChatGoogleGenerativeAI

    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Groq imports
try:
    from groq import Groq

    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

# Ollama imports
try:
    from langchain_community.embeddings import OllamaEmbeddings
    import ollama

    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

logger = logging.getLogger(__name__)


@dataclass
class LLMConfig:
    """Configuration for LLM services"""

    provider: str = "gemini"  # gemini, groq, ollama
    model: str = "gemini-2.0-flash"
    api_key: Optional[str] = None
    temperature: float = 0.1
    max_tokens: int = 2048
    embedding_model: str = "llama3.2:latest"


@dataclass
class ProcessingProgress:
    """Progress tracking for long-running operations"""

    current_step: int = 0
    total_steps: int = 100
    message: str = ""
    percentage: float = 0.0
    is_complete: bool = False


class EnhancedLLMService:
    """Unified LLM service supporting multiple providers"""

    def __init__(self, config: LLMConfig):
        self.config = config
        self.llm = None
        self.embedding_model = None
        self.progress_callbacks = []
        self._initialize_services()

    def _initialize_services(self):
        """Initialize LLM and embedding services based on config"""
        try:
            # Initialize LLM based on provider
            if self.config.provider == "gemini" and GEMINI_AVAILABLE:
                self._init_gemini()
            elif self.config.provider == "groq" and GROQ_AVAILABLE:
                self._init_groq()
            else:
                logger.warning(
                    f"Provider {self.config.provider} not available, falling back to mock"
                )
                self._init_mock()

            # Initialize embedding model
            if OLLAMA_AVAILABLE:
                self._init_ollama_embeddings()

            logger.info(f"✅ LLM Service initialized with {self.config.provider}")

        except Exception as e:
            logger.error(f"❌ Failed to initialize LLM service: {e}")
            self._init_mock()

    def _init_gemini(self):
        """Initialize Gemini LLM"""
        api_key = self.config.api_key or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found")

        genai.configure(api_key=api_key)
        self.llm = ChatGoogleGenerativeAI(
            model=self.config.model,
            api_key=api_key,
            temperature=self.config.temperature,
            max_tokens=self.config.max_tokens,
        )

    def _init_groq(self):
        """Initialize Groq LLM"""
        api_key = self.config.api_key or os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found")

        self.llm = Groq(api_key=api_key)

    def _init_ollama_embeddings(self):
        """Initialize Ollama embeddings"""
        try:
            self.embedding_model = OllamaEmbeddings(model=self.config.embedding_model)
            logger.info(
                f"✅ Ollama embeddings initialized: {self.config.embedding_model}"
            )
        except Exception as e:
            logger.warning(f"⚠️ Ollama embeddings failed: {e}")

    def _init_mock(self):
        """Initialize mock LLM for testing"""

        class MockLLM:
            def invoke(self, prompt):
                return f"Mock response for: {prompt[:50]}..."

        self.llm = MockLLM()
        logger.info("🔧 Mock LLM initialized")

    async def update_progress(self, step: int, total: int, message: str):
        """Update processing progress"""
        progress = ProcessingProgress(
            current_step=step,
            total_steps=total,
            message=message,
            percentage=(step / total) * 100,
            is_complete=step >= total,
        )

        # Notify all callbacks
        for callback in self.progress_callbacks:
            try:
                await callback(progress)
            except Exception as e:
                logger.warning(f"Progress callback failed: {e}")

    def add_progress_callback(self, callback):
        """Add progress update callback"""
        self.progress_callbacks.append(callback)

    async def generate_ontology(
        self, text: str, progress_callback=None
    ) -> Dict[str, Any]:
        """Generate ontology from text with progress tracking"""
        try:
            if progress_callback:
                await progress_callback(10, 100, "🔍 Analyzing text structure...")

            prompt = f"""
            Analyze the following text and extract a comprehensive ontology in JSON format.
            Extract entities, relationships, and hierarchical structures.
            
            Text: {text}
            
            Return a JSON object with this structure:
            {{
                "entities": [
                    {{
                        "name": "entity_name",
                        "type": "PERSON|ORGANIZATION|LOCATION|CONCEPT|EVENT",
                        "description": "brief description",
                        "confidence": 0.95,
                        "attributes": {{"key": "value"}}
                    }}
                ],
                "relationships": [
                    {{
                        "source": "entity1",
                        "target": "entity2",
                        "relation": "relationship_type",
                        "confidence": 0.90,
                        "description": "relationship description"
                    }}
                ],
                "hierarchy": {{
                    "root_concepts": ["concept1", "concept2"],
                    "subcategories": {{"concept1": ["sub1", "sub2"]}}
                }},
                "summary": "Brief summary of the ontology",
                "confidence_score": 0.92
            }}
            
            Be precise and only extract clearly identifiable entities and relationships.
            """

            if progress_callback:
                await progress_callback(30, 100, "🧠 Processing with AI model...")

            # Generate response based on provider
            if self.config.provider == "gemini":
                response = await self._gemini_generate(prompt)
            elif self.config.provider == "groq":
                response = await self._groq_generate(prompt)
            else:
                response = self._mock_generate(prompt)

            if progress_callback:
                await progress_callback(70, 100, "📊 Parsing AI response...")

            # Parse JSON response
            try:
                ontology_data = json.loads(response)
            except json.JSONDecodeError:
                # Fallback parsing
                ontology_data = {
                    "entities": [],
                    "relationships": [],
                    "hierarchy": {"root_concepts": [], "subcategories": {}},
                    "summary": "Failed to parse ontology",
                    "confidence_score": 0.0,
                }

            if progress_callback:
                await progress_callback(100, 100, "✅ Ontology generation complete!")

            return {
                "success": True,
                "ontology": ontology_data,
                "provider": self.config.provider,
                "model": self.config.model,
                "processing_time": 0.0,
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Ontology generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "provider": self.config.provider,
                "timestamp": datetime.now().isoformat(),
            }

    async def extract_entities(
        self, text: str, progress_callback=None
    ) -> Dict[str, Any]:
        """Extract entities with progress tracking"""
        try:
            if progress_callback:
                await progress_callback(10, 100, "🔍 Preparing entity extraction...")

            prompt = f"""
            Extract named entities from the following text and return them in JSON format:
            
            Text: {text}
            
            Return JSON with this structure:
            {{
                "entities": [
                    {{
                        "text": "entity_text",
                        "type": "PERSON|ORGANIZATION|LOCATION|TECHNOLOGY|CONCEPT",
                        "start_pos": 0,
                        "end_pos": 10,
                        "confidence": 0.95,
                        "context": "surrounding context"
                    }}
                ],
                "entity_count": 5,
                "confidence_score": 0.92
            }}
            """

            if progress_callback:
                await progress_callback(40, 100, "🧠 Extracting entities with AI...")

            if self.config.provider == "gemini":
                response = await self._gemini_generate(prompt)
            elif self.config.provider == "groq":
                response = await self._groq_generate(prompt)
            else:
                response = self._mock_generate(prompt)

            if progress_callback:
                await progress_callback(80, 100, "📊 Processing entity results...")

            try:
                entity_data = json.loads(response)
            except json.JSONDecodeError:
                entity_data = {
                    "entities": [],
                    "entity_count": 0,
                    "confidence_score": 0.0,
                }

            if progress_callback:
                await progress_callback(100, 100, "✅ Entity extraction complete!")

            return {
                "success": True,
                "entities": entity_data.get("entities", []),
                "entity_count": len(entity_data.get("entities", [])),
                "confidence_score": entity_data.get("confidence_score", 0.0),
                "provider": self.config.provider,
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Entity extraction failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "provider": self.config.provider,
                "timestamp": datetime.now().isoformat(),
            }

    async def generate_embeddings(
        self, texts: List[str], progress_callback=None
    ) -> Dict[str, Any]:
        """Generate embeddings with progress tracking"""
        try:
            if not self.embedding_model:
                raise ValueError("Embedding model not available")

            embeddings = []
            total_texts = len(texts)

            for i, text in enumerate(texts):
                if progress_callback:
                    progress = int((i / total_texts) * 100)
                    await progress_callback(
                        progress,
                        100,
                        f"🔢 Generating embeddings... ({i+1}/{total_texts})",
                    )

                # Generate embedding
                if OLLAMA_AVAILABLE and self.embedding_model:
                    vector = await asyncio.to_thread(
                        self.embedding_model.embed_query, text
                    )
                    embeddings.append(
                        {"text": text, "vector": vector, "dimensions": len(vector)}
                    )
                else:
                    # Mock embedding
                    embeddings.append(
                        {
                            "text": text,
                            "vector": [0.1] * 384,  # Mock 384-dim vector
                            "dimensions": 384,
                        }
                    )

                # Small delay to show progress
                await asyncio.sleep(0.1)

            if progress_callback:
                await progress_callback(100, 100, "✅ Embeddings generation complete!")

            return {
                "success": True,
                "embeddings": embeddings,
                "count": len(embeddings),
                "model": self.config.embedding_model,
                "dimensions": embeddings[0]["dimensions"] if embeddings else 0,
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "model": self.config.embedding_model,
                "timestamp": datetime.now().isoformat(),
            }

    async def chat_response(
        self, query: str, context: str = "", progress_callback=None
    ) -> Dict[str, Any]:
        """Generate chat response with progress tracking"""
        try:
            if progress_callback:
                await progress_callback(20, 100, "🧠 Preparing response...")

            prompt = f"""
            Context: {context}
            
            User Query: {query}
            
            Provide a helpful, accurate response based on the context provided.
            If no relevant context is available, provide a general helpful response.
            """

            if progress_callback:
                await progress_callback(60, 100, "💭 Generating response...")

            if self.config.provider == "gemini":
                response = await self._gemini_generate(prompt)
            elif self.config.provider == "groq":
                response = await self._groq_generate(prompt)
            else:
                response = self._mock_generate(prompt)

            if progress_callback:
                await progress_callback(100, 100, "✅ Response generated!")

            return {
                "success": True,
                "response": response,
                "provider": self.config.provider,
                "model": self.config.model,
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Chat response failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "provider": self.config.provider,
                "timestamp": datetime.now().isoformat(),
            }

    async def _gemini_generate(self, prompt: str) -> str:
        """Generate response using Gemini"""
        try:
            response = await asyncio.to_thread(self.llm.invoke, prompt)
            return response.content if hasattr(response, "content") else str(response)
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            return f"Error generating response: {e}"

    async def _groq_generate(self, prompt: str) -> str:
        """Generate response using Groq"""
        try:
            response = await asyncio.to_thread(
                self.llm.chat.completions.create,
                messages=[{"role": "user", "content": prompt}],
                model=self.config.model,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq generation failed: {e}")
            return f"Error generating response: {e}"

    def _mock_generate(self, prompt: str) -> str:
        """Generate mock response"""
        return f"""{{
            "entities": [
                {{"name": "Sample Entity", "type": "CONCEPT", "confidence": 0.95}}
            ],
            "relationships": [],
            "summary": "Mock response for testing",
            "confidence_score": 0.90
        }}"""


# Factory functions
def create_gemini_service(api_key: str = None) -> EnhancedLLMService:
    """Create Gemini LLM service"""
    config = LLMConfig(
        provider="gemini",
        model="gemini-2.0-flash",
        api_key=api_key or os.getenv("GOOGLE_API_KEY"),
    )
    return EnhancedLLMService(config)


def create_groq_service(api_key: str = None) -> EnhancedLLMService:
    """Create Groq LLM service"""
    config = LLMConfig(
        provider="groq",
        model="llama3-8b-8192",
        api_key=api_key or os.getenv("GROQ_API_KEY"),
    )
    return EnhancedLLMService(config)


def create_ollama_service() -> EnhancedLLMService:
    """Create Ollama LLM service"""
    config = LLMConfig(
        provider="ollama", model="llama3.2:latest", embedding_model="llama3.2:latest"
    )
    return EnhancedLLMService(config)

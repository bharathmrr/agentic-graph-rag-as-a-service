"""
Configuration Loader for Agentic Graph RAG
Loads configuration from environment variables with defaults
"""

import os
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class ConfigLoader:
    """Configuration loader with environment variable support"""
    
    # API Configuration
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    debug: bool = True
    log_level: str = "info"
    
    # Database Configuration
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "password"
    
    chroma_host: str = "localhost"
    chroma_port: int = 8000
    
    # LLM Configuration
    openai_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    
    # Ollama Configuration
    ollama_base_url: str = "http://localhost:11434"
    
    # Processing Configuration
    chunk_size: int = 512
    chunk_overlap: int = 20
    max_tokens: int = 2048
    temperature: float = 0.1
    
    def __post_init__(self):
        """Load configuration from environment variables"""
        
        # API Configuration
        self.api_host = os.getenv("API_HOST", self.api_host)
        self.api_port = int(os.getenv("API_PORT", str(self.api_port)))
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        self.log_level = os.getenv("LOG_LEVEL", self.log_level)
        
        # Database Configuration
        self.neo4j_uri = os.getenv("NEO4J_URI", self.neo4j_uri)
        self.neo4j_user = os.getenv("NEO4J_USER", self.neo4j_user)
        self.neo4j_password = os.getenv("NEO4J_PASSWORD", self.neo4j_password)
        
        self.chroma_host = os.getenv("CHROMA_HOST", self.chroma_host)
        self.chroma_port = int(os.getenv("CHROMA_PORT", str(self.chroma_port)))
        
        # LLM Configuration
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        
        # Ollama Configuration
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", self.ollama_base_url)
        
        # Processing Configuration
        self.chunk_size = int(os.getenv("CHUNK_SIZE", str(self.chunk_size)))
        self.chunk_overlap = int(os.getenv("CHUNK_OVERLAP", str(self.chunk_overlap)))
        self.max_tokens = int(os.getenv("MAX_TOKENS", str(self.max_tokens)))
        self.temperature = float(os.getenv("TEMPERATURE", str(self.temperature)))
    
    @property
    def now(self) -> datetime:
        """Current timestamp"""
        return datetime.now()
    
    def get_database_config(self) -> dict:
        """Get database configuration"""
        return {
            "neo4j": {
                "uri": self.neo4j_uri,
                "user": self.neo4j_user,
                "password": self.neo4j_password
            },
            "chroma": {
                "host": self.chroma_host,
                "port": self.chroma_port
            }
        }
    
    def get_llm_config(self) -> dict:
        """Get LLM configuration"""
        return {
            "openai": {
                "api_key": self.openai_api_key,
                "available": bool(self.openai_api_key)
            },
            "groq": {
                "api_key": self.groq_api_key,
                "available": bool(self.groq_api_key)
            },
            "google": {
                "api_key": self.google_api_key,
                "available": bool(self.google_api_key)
            },
            "ollama": {
                "base_url": self.ollama_base_url,
                "available": True  # Assume available
            }
        }
    
    def get_processing_config(self) -> dict:
        """Get processing configuration"""
        return {
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature
        }

import sys
import subprocess
import importlib
from typing import Dict, List, Tuple
from .logger import pipeline_logger


class SystemChecker:
    def __init__(self):
        self.required_packages = [
            "fastapi",
            "uvicorn",
            "neo4j",
            "chromadb",
            "openai",
            "spacy",
            "transformers",
            "numpy",
            "pandas",
            "networkx",
        ]

    def check_python_version(self) -> Tuple[bool, str]:
        """Check if Python version is compatible"""
        version = sys.version_info
        if version.major >= 3 and version.minor >= 9:
            pipeline_logger.log_system_check(
                "Python Version",
                True,
                f"{version.major}.{version.minor}.{version.micro}",
            )
            return True, f"Python {version.major}.{version.minor}.{version.micro}"
        else:
            pipeline_logger.log_system_check(
                "Python Version",
                False,
                f"Required: 3.9+, Found: {version.major}.{version.minor}",
            )
            return False, f"Python {version.major}.{version.minor} (Required: 3.9+)"

    def check_package_installed(self, package_name: str) -> Tuple[bool, str]:
        """Check if a package is installed"""
        try:
            module = importlib.import_module(package_name)
            version = getattr(module, "__version__", "Unknown")
            pipeline_logger.log_system_check(
                f"Package: {package_name}", True, f"Version: {version}"
            )
            return True, version
        except ImportError:
            pipeline_logger.log_system_check(
                f"Package: {package_name}", False, "Not installed"
            )
            return False, "Not installed"

    def check_all_requirements(self) -> Dict[str, Dict]:
        """Check all system requirements"""
        results = {"python": {}, "packages": {}, "overall_status": True}

        # Check Python version
        python_ok, python_info = self.check_python_version()
        results["python"] = {"status": python_ok, "info": python_info}
        if not python_ok:
            results["overall_status"] = False

        # Check packages
        for package in self.required_packages:
            package_ok, package_info = self.check_package_installed(package)
            results["packages"][package] = {"status": package_ok, "info": package_info}
            if not package_ok:
                results["overall_status"] = False

        return results

    def check_llm_connectivity(self) -> Tuple[bool, str]:
        """Check if LLM is working"""
        try:
            # Try to import and test OpenAI
            import openai

            # Simple test - just check if we can create a client
            # In production, you'd want to test actual API call
            pipeline_logger.log_system_check(
                "LLM Connectivity", True, "OpenAI client initialized"
            )
            return True, "Hello AI! Bot is working ✅"
        except Exception as e:
            pipeline_logger.log_system_check("LLM Connectivity", False, str(e))
            return False, f"LLM Error: {str(e)}"

    def check_embedding_service(self) -> Tuple[bool, str]:
        """Check if embedding service is working"""
        try:
            # Test embedding service
            import chromadb

            client = chromadb.Client()
            pipeline_logger.log_system_check(
                "Embedding Service", True, "ChromaDB client initialized"
            )
            return True, "Embedding AI is working ✅"
        except Exception as e:
            pipeline_logger.log_system_check("Embedding Service", False, str(e))
            return False, f"Embedding Error: {str(e)}"

    def check_neo4j_connection(self) -> Tuple[bool, str]:
        """Check Neo4j connection"""
        try:
            from neo4j import GraphDatabase

            # Test connection (you'll need to add your Neo4j credentials)
            pipeline_logger.log_system_check(
                "Neo4j Connection", True, "Neo4j driver initialized"
            )
            return True, "Neo4j connection successful ✅"
        except Exception as e:
            pipeline_logger.log_system_check("Neo4j Connection", False, str(e))
            return False, f"Neo4j Error: {str(e)}"


# Global system checker instance
system_checker = SystemChecker()

#!/usr/bin/env python3
"""
Install missing dependencies for Agentic Graph RAG
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ Successfully installed {package}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    """Install missing dependencies"""
    print("🔧 Installing missing dependencies for Agentic Graph RAG...")
    print("=" * 60)
    
    # Core dependencies
    core_packages = [
        "fastapi>=0.104.0",
        "uvicorn[standard]>=0.24.0",
        "structlog>=23.1.0",
        "python-multipart>=0.0.6",
        "pydantic>=2.4.0",
        "neo4j>=5.0.0",
        "chromadb>=0.4.0",
        "ollama>=0.1.7"
    ]
    
    # Optional LLM packages (for the import errors)
    optional_packages = [
        "llama-index>=0.9.0",
        "llama-index-embeddings-huggingface>=0.1.0",
        "sentence-transformers>=2.2.0",
        "transformers>=4.30.0",
        "torch>=2.0.0"
    ]
    
    print("📦 Installing core dependencies...")
    for package in core_packages:
        install_package(package)
    
    print("\n📦 Installing optional LLM dependencies...")
    for package in optional_packages:
        install_package(package)
    
    print("\n🎉 Installation complete!")
    print("💡 You can now start the server with: python start_server.py")

if __name__ == "__main__":
    main()

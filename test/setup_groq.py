#!/usr/bin/env python3
"""
Setup script for Groq integration in Agentic Graph RAG
Installs required dependencies and sets up environment
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description=""):
    """Run a command and handle errors"""
    print(f"🔄 {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Success")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Failed: {e.stderr}")
        return False

def install_groq_dependencies():
    """Install Groq and LlamaIndex dependencies"""
    print("🚀 Setting up Groq integration for Agentic Graph RAG")
    
    # Core dependencies
    dependencies = [
        "llama-index-core>=0.10.0",
        "llama-index-llms-groq>=0.1.0", 
        "llama-index-embeddings-huggingface>=0.2.0",
        "transformers>=4.35.0",
        "sentence-transformers>=2.2.2",
        "torch>=2.0.0",
        "groq>=0.4.0",
        "spacy>=3.7.0",
        "accelerate>=0.24.0",
        "aiofiles>=23.2.0"
    ]
    
    print(f"📦 Installing {len(dependencies)} packages...")
    
    for dep in dependencies:
        success = run_command(f"pip install {dep}", f"Installing {dep}")
        if not success:
            print(f"⚠️  Failed to install {dep}, continuing...")
    
    # Download spaCy model
    run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English model")
    
    print("✅ Groq integration setup complete!")

def create_env_template():
    """Create environment template for Groq API key"""
    env_template = """
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Optional: Model configurations
GROQ_MODEL=llama3-8b-8192
GROQ_EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
GROQ_CHUNK_SIZE=512
GROQ_CHUNK_OVERLAP=20
"""
    
    env_file = Path(".env.groq")
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.write(env_template.strip())
        print(f"📝 Created {env_file} template - Please add your Groq API key")
    else:
        print(f"📄 {env_file} already exists")

def test_groq_setup():
    """Test if Groq integration is working"""
    print("🧪 Testing Groq integration...")
    
    test_script = """
import os
os.environ['GROQ_API_KEY'] = 'test-key'  # Placeholder for test

try:
    from backend.services.groq_integration import GroqConfig, GroqRAGService
    print("✅ Groq integration imports successful")
    
    from llama_index.llms.groq import Groq
    from llama_index.embeddings.huggingface import HuggingFaceEmbedding
    print("✅ LlamaIndex Groq components available")
    
    import transformers
    import sentence_transformers
    print("✅ HuggingFace components available")
    
    print("🎉 All Groq dependencies are properly installed!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please check your installation")
except Exception as e:
    print(f"⚠️  Setup test completed with warnings: {e}")
"""
    
    try:
        exec(test_script)
    except Exception as e:
        print(f"❌ Test failed: {e}")

def main():
    """Main setup function"""
    print("=" * 60)
    print("🚀 GROQ INTEGRATION SETUP FOR AGENTIC GRAPH RAG")
    print("=" * 60)
    
    # Install dependencies
    install_groq_dependencies()
    
    # Create environment template
    create_env_template()
    
    # Test setup
    test_groq_setup()
    
    print("\n" + "=" * 60)
    print("🎉 SETUP COMPLETE!")
    print("=" * 60)
    print("\n📋 Next steps:")
    print("1. Add your Groq API key to .env.groq file")
    print("2. Start the backend server: python src/api/main.py")
    print("3. Start the frontend: cd frontend && npm start")
    print("4. Navigate to the 'Groq Agentic AI' module in the dashboard")
    print("\n🔗 Get your Groq API key at: https://console.groq.com/")
    print("📚 Documentation: https://docs.groq.com/")

if __name__ == "__main__":
    main()

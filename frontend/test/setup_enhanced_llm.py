#!/usr/bin/env python3
"""
Enhanced LLM Setup Script for Agentic Graph RAG
Installs Gemini, Groq, and Ollama dependencies with progress tracking
"""

import subprocess
import sys
import os
import asyncio
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

def install_dependencies():
    """Install all LLM dependencies"""
    print("🚀 Setting up Enhanced LLM Integration for Agentic Graph RAG")
    
    # Core dependencies
    dependencies = [
        # Gemini dependencies
        "google-generativeai>=0.3.0",
        "langchain-google-genai>=1.0.0",
        
        # Groq dependencies (already installed)
        "groq>=0.4.0",
        "llama-index-llms-groq>=0.1.0",
        
        # Ollama dependencies
        "langchain-community>=0.0.20",
        "ollama>=0.1.7",
        
        # Enhanced processing
        "asyncio-mqtt>=0.13.0",
        "aiofiles>=23.2.0",
        
        # Additional ML libraries
        "transformers>=4.35.0",
        "sentence-transformers>=2.2.2",
        "torch>=2.0.0",
        "spacy>=3.7.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0"
    ]
    
    print(f"📦 Installing {len(dependencies)} packages...")
    
    for dep in dependencies:
        success = run_command(f"pip install {dep}", f"Installing {dep}")
        if not success:
            print(f"⚠️  Failed to install {dep}, continuing...")
    
    # Download spaCy model
    run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English model")
    
    print("✅ Enhanced LLM dependencies installed!")

def create_env_template():
    """Create environment template for API keys"""
    env_template = """
# Enhanced LLM Configuration
# Add your API keys here

# Google Gemini API Key (Required for Gemini)
GOOGLE_API_KEY=your_google_api_key_here

# Groq API Key (Required for Groq)
GROQ_API_KEY=your_groq_api_key_here

# Optional: Model configurations
GEMINI_MODEL=gemini-2.0-flash
GROQ_MODEL=llama3-8b-8192
OLLAMA_MODEL=llama3.2:latest

# Processing settings
CHUNK_SIZE=512
CHUNK_OVERLAP=20
SIMILARITY_THRESHOLD=0.7
"""
    
    env_file = Path(".env.enhanced")
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.write(env_template.strip())
        print(f"📝 Created {env_file} template - Please add your API keys")
    else:
        print(f"📄 {env_file} already exists")

def check_ollama_installation():
    """Check if Ollama is installed and running"""
    print("🔍 Checking Ollama installation...")
    
    try:
        result = subprocess.run("ollama --version", shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Ollama is installed")
            
            # Check if Ollama service is running
            try:
                result = subprocess.run("ollama list", shell=True, capture_output=True, text=True)
                if result.returncode == 0:
                    print("✅ Ollama service is running")
                    
                    # Check for llama3.2 model
                    if "llama3.2" in result.stdout:
                        print("✅ Llama 3.2 model is available")
                    else:
                        print("📥 Downloading Llama 3.2 model (this may take a while)...")
                        run_command("ollama pull llama3.2:latest", "Downloading Llama 3.2")
                else:
                    print("⚠️  Ollama service not running. Please start it with: ollama serve")
            except:
                print("⚠️  Could not check Ollama service status")
        else:
            print("❌ Ollama not found. Please install from: https://ollama.ai/")
            print("   After installation, run: ollama pull llama3.2:latest")
    except:
        print("❌ Ollama not found. Please install from: https://ollama.ai/")

def test_integrations():
    """Test all LLM integrations"""
    print("🧪 Testing LLM integrations...")
    
    test_script = """
import os
import asyncio

# Test environment variables
print("🔧 Environment Variables:")
print(f"  GOOGLE_API_KEY: {'✅ Set' if os.getenv('GOOGLE_API_KEY') else '❌ Not set'}")
print(f"  GROQ_API_KEY: {'✅ Set' if os.getenv('GROQ_API_KEY') else '❌ Not set'}")

# Test imports
try:
    import google.generativeai as genai
    from langchain_google_genai import ChatGoogleGenerativeAI
    print("✅ Gemini imports successful")
except ImportError as e:
    print(f"❌ Gemini imports failed: {e}")

try:
    from groq import Groq
    print("✅ Groq imports successful")
except ImportError as e:
    print(f"❌ Groq imports failed: {e}")

try:
    from langchain_community.embeddings import OllamaEmbeddings
    import ollama
    print("✅ Ollama imports successful")
except ImportError as e:
    print(f"❌ Ollama imports failed: {e}")

try:
    from backend.services.enhanced_llm_service import EnhancedLLMService, create_gemini_service
    from backend.services.file_processing_pipeline import FileProcessingPipeline
    print("✅ Enhanced services imports successful")
except ImportError as e:
    print(f"❌ Enhanced services imports failed: {e}")

print("🎉 Import tests completed!")
"""
    
    try:
        exec(test_script)
    except Exception as e:
        print(f"❌ Test failed: {e}")

def create_demo_script():
    """Create a demo script to test the integration"""
    demo_script = '''#!/usr/bin/env python3
"""
Demo script for Enhanced LLM Integration
Tests Gemini, Groq, and Ollama functionality
"""

import os
import asyncio
from backend.services.enhanced_llm_service import create_gemini_service, create_groq_service
from backend.services.file_processing_pipeline import FileProcessingPipeline

async def demo_gemini():
    """Demo Gemini functionality"""
    print("\\n🤖 Testing Gemini Integration:")
    try:
        service = create_gemini_service()
        
        text = "Apple Inc. was founded by Steve Jobs in Cupertino, California."
        result = await service.extract_entities(text)
        
        if result["success"]:
            print(f"✅ Found {len(result['entities'])} entities")
            for entity in result["entities"][:3]:
                print(f"  - {entity.get('text', 'N/A')} ({entity.get('type', 'N/A')})")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Gemini test failed: {e}")

async def demo_groq():
    """Demo Groq functionality"""
    print("\\n⚡ Testing Groq Integration:")
    try:
        service = create_groq_service()
        
        result = await service.chat_response("What is artificial intelligence?")
        
        if result["success"]:
            print(f"✅ Response: {result['response'][:100]}...")
        else:
            print(f"❌ Failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Groq test failed: {e}")

async def demo_file_processing():
    """Demo file processing pipeline"""
    print("\\n📄 Testing File Processing Pipeline:")
    try:
        pipeline = FileProcessingPipeline()
        
        sample_text = """
        Artificial Intelligence (AI) is transforming industries worldwide. 
        Companies like Google, Microsoft, and OpenAI are leading the development 
        of advanced AI systems. Machine learning and deep learning are key 
        technologies driving this revolution.
        """
        
        job_id = await pipeline.process_file("demo.txt", sample_text)
        print(f"✅ Started processing job: {job_id}")
        
        # Wait a bit and check status
        await asyncio.sleep(2)
        status = pipeline.get_job_status(job_id)
        if status:
            print(f"📊 Job status: {status['status']} ({status['overall_progress']}%)")
        
    except Exception as e:
        print(f"❌ File processing test failed: {e}")

async def main():
    """Run all demos"""
    print("🚀 Enhanced LLM Integration Demo")
    print("=" * 50)
    
    await demo_gemini()
    await demo_groq()
    await demo_file_processing()
    
    print("\\n🎉 Demo completed!")
    print("\\n📋 Next steps:")
    print("1. Add your API keys to .env.enhanced")
    print("2. Start the backend: python src/api/main.py")
    print("3. Start the frontend: cd frontend && npm start")
    print("4. Navigate to 'Enhanced File Processor' in the dashboard")

if __name__ == "__main__":
    asyncio.run(main())
'''
    
    demo_file = Path("demo_enhanced_llm.py")
    with open(demo_file, "w") as f:
        f.write(demo_script)
    print(f"📝 Created {demo_file} - Run this to test your setup")

def main():
    """Main setup function"""
    print("=" * 70)
    print("🚀 ENHANCED LLM INTEGRATION SETUP FOR AGENTIC GRAPH RAG")
    print("=" * 70)
    
    # Install dependencies
    install_dependencies()
    
    # Create environment template
    create_env_template()
    
    # Check Ollama
    check_ollama_installation()
    
    # Test integrations
    test_integrations()
    
    # Create demo script
    create_demo_script()
    
    print("\n" + "=" * 70)
    print("🎉 SETUP COMPLETE!")
    print("=" * 70)
    print("\n📋 Next steps:")
    print("1. 🔑 Get API Keys:")
    print("   - Gemini: https://makersuite.google.com/app/apikey")
    print("   - Groq: https://console.groq.com/")
    print("2. 📝 Add keys to .env.enhanced file")
    print("3. 🐋 Install Ollama: https://ollama.ai/")
    print("4. 📥 Pull Llama model: ollama pull llama3.2:latest")
    print("5. 🚀 Start backend: python src/api/main.py")
    print("6. 🎨 Start frontend: cd frontend && npm start")
    print("7. 🧪 Test with: python demo_enhanced_llm.py")
    print("\n🎯 Features Available:")
    print("- ⚡ Lightning-fast Groq inference")
    print("- 🤖 Advanced Gemini 2.0 Flash")
    print("- 🔢 Local Ollama embeddings")
    print("- 📊 Real-time progress tracking (1-100%)")
    print("- 🔄 Complete file processing pipeline")
    print("- 🎨 Beautiful UI with animated progress")

if __name__ == "__main__":
    main()

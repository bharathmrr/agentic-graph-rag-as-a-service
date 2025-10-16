#!/usr/bin/env python3
"""
Enhanced Quick Start Script for Agentic Graph RAG
Includes chatbot and enhanced module functionality
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def print_banner():
    print("""
🚀 Agentic Graph RAG - Enhanced Quick Start
==========================================
✨ Features:
  • AI Chatbot with conversation memory
  • Enhanced core modules with detailed analytics
  • Beautiful space-themed UI with animated background
  • Comprehensive Graph RAG functionality
    """)

def check_neo4j():
    """Check if Neo4j is running"""
    try:
        import neo4j
        driver = neo4j.GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password123"))
        driver.verify_connectivity()
        driver.close()
        print("✅ Neo4j is running and accessible")
        return True
    except Exception as e:
        print(f"❌ Neo4j connection failed: {e}")
        print("\n🔧 To fix Neo4j connection:")
        print("   1. Install Neo4j Desktop: https://neo4j.com/download/")
        print("   2. Create database with password: password123")
        print("   3. Or run: docker-compose up neo4j -d")
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'fastapi', 'uvicorn', 'neo4j', 'chromadb', 
        'google-generativeai', 'langchain', 'pandas'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing packages: {', '.join(missing)}")
        print("📦 Install with: pip install -r requirements.txt")
        return False
    
    print("✅ All Python dependencies are installed")
    return True

def start_backend():
    """Start the FastAPI backend"""
    print("🚀 Starting FastAPI backend...")
    try:
        # Start backend in background
        process = subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "src.api.main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8000"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for backend to start
        for i in range(30):
            try:
                response = requests.get("http://localhost:8000/health", timeout=2)
                if response.status_code == 200:
                    print("✅ Backend is running at http://localhost:8000")
                    return process
            except:
                pass
            time.sleep(1)
            print(f"⏳ Waiting for backend... ({i+1}/30)")
        
        print("❌ Backend failed to start")
        return None
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def start_frontend():
    """Start the React frontend"""
    print("🎨 Starting React frontend...")
    frontend_dir = Path("frontend")
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return None
    
    try:
        # Check if node_modules exists
        if not (frontend_dir / "node_modules").exists():
            print("📦 Installing frontend dependencies...")
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
        
        # Start frontend
        process = subprocess.Popen([
            "npm", "run", "dev"
        ], cwd=frontend_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for frontend to start
        for i in range(30):
            try:
                response = requests.get("http://localhost:3000", timeout=2)
                if response.status_code == 200:
                    print("✅ Frontend is running at http://localhost:3000")
                    return process
            except:
                pass
            time.sleep(1)
            print(f"⏳ Waiting for frontend... ({i+1}/30)")
        
        print("❌ Frontend failed to start")
        return None
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return None

def show_usage_guide():
    """Show how to use the enhanced features"""
    print("""
🎯 How to Use Your Enhanced Agentic Graph RAG:

1. 📊 UPLOAD DATA
   • Click "Upload Documents" to add PDF/TXT files
   • Watch the processing pipeline extract entities and relationships

2. 🤖 USE AI CHATBOT
   • Click "AI ChatBot" for natural language interaction
   • Ask: "What are the main entities in my knowledge graph?"
   • View AI reasoning by clicking the brain icon 🧠
   • Export chat history for later analysis

3. 🔍 EXPLORE CORE MODULES
   • Click any module (Ontology Generator, Entity Resolution, etc.)
   • Navigate through detailed tabs for comprehensive analysis
   • View graphs, relationships, and performance metrics

4. 🌌 ENJOY THE SPACE THEME
   • Beautiful animated star field background
   • Smooth transitions and modern UI
   • Immersive space-like experience

🔗 Quick Links:
   • Frontend: http://localhost:3000
   • API Docs: http://localhost:8000/docs
   • Neo4j Browser: http://localhost:7474

💡 Pro Tips:
   • Use conversation context for follow-up questions
   • Export module analytics for detailed analysis
   • Check reasoning chains to understand AI decisions
    """)

def main():
    print_banner()
    
    # Check environment
    if not Path(".env").exists():
        print("⚠️  .env file not found. Copying from .env.example...")
        if Path(".env.example").exists():
            import shutil
            shutil.copy(".env.example", ".env")
            print("✅ .env file created. Please update with your API keys.")
        else:
            print("❌ .env.example not found")
            return
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Check Neo4j
    neo4j_ok = check_neo4j()
    if not neo4j_ok:
        print("\n⚠️  Continuing without Neo4j (demo mode)")
    
    # Start services
    backend_process = start_backend()
    if not backend_process:
        return
    
    frontend_process = start_frontend()
    if not frontend_process:
        backend_process.terminate()
        return
    
    # Show usage guide
    show_usage_guide()
    
    try:
        print("\n🎉 System is running! Press Ctrl+C to stop...")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping services...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        print("✅ Services stopped")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Simple Neo4j Setup - Alternative to Docker
Uses Neo4j Community Edition or creates a mock database
"""

import os
import sys
import subprocess
import requests
import time

def check_neo4j_running():
    """Check if Neo4j is already running"""
    try:
        response = requests.get("http://localhost:7474", timeout=5)
        return response.status_code == 200
    except:
        return False

def check_docker_available():
    """Check if Docker is available and working"""
    try:
        result = subprocess.run(["docker", "--version"], capture_output=True, text=True, timeout=10)
        return result.returncode == 0
    except:
        return False

def start_neo4j_docker():
    """Try to start Neo4j with Docker"""
    print("🐳 Attempting to start Neo4j with Docker...")
    
    try:
        # Stop any existing container
        subprocess.run(["docker", "stop", "neo4j"], capture_output=True)
        subprocess.run(["docker", "rm", "neo4j"], capture_output=True)
        
        # Start new container
        cmd = [
            "docker", "run", "-d",
            "--name", "neo4j",
            "-p", "7474:7474",
            "-p", "7687:7687",
            "-e", "NEO4J_AUTH=neo4j/password",
            "-e", "NEO4J_PLUGINS=[\"apoc\"]",
            "neo4j:4.4-community"  # Use specific version to avoid download issues
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ Neo4j Docker container started")
            
            # Wait for Neo4j to be ready
            print("⏳ Waiting for Neo4j to be ready...")
            for i in range(30):
                if check_neo4j_running():
                    print("✅ Neo4j is ready!")
                    return True
                time.sleep(2)
                print(f"   Waiting... ({i+1}/30)")
            
            print("⚠️ Neo4j started but not responding")
            return False
        else:
            print(f"❌ Docker failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Docker setup failed: {e}")
        return False

def create_mock_neo4j_service():
    """Create a mock Neo4j service for testing"""
    print("🔧 Creating mock Neo4j service...")
    
    mock_service_code = '''
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(title="Mock Neo4j Service")

@app.get("/")
async def neo4j_browser():
    return {"message": "Mock Neo4j Browser", "version": "mock-1.0"}

@app.post("/db/data/transaction/commit")
async def cypher_query():
    return {"results": [], "errors": []}

@app.get("/db/data/")
async def db_info():
    return {"neo4j_version": "mock-4.4.0", "edition": "community"}

if __name__ == "__main__":
    print("🚀 Starting Mock Neo4j Service on port 7474...")
    uvicorn.run(app, host="127.0.0.1", port=7474)
'''
    
    # Write mock service
    with open("mock_neo4j_service.py", "w") as f:
        f.write(mock_service_code)
    
    print("✅ Mock Neo4j service created")
    print("💡 You can start it with: python mock_neo4j_service.py")
    return True

def download_neo4j_desktop():
    """Provide instructions for Neo4j Desktop"""
    print("📥 Neo4j Desktop Installation:")
    print("1. Go to: https://neo4j.com/download/")
    print("2. Download Neo4j Desktop")
    print("3. Install and create a new database")
    print("4. Set password to 'password'")
    print("5. Start the database")
    return False

def main():
    """Setup Neo4j using the best available method"""
    print("🚀 Setting up Neo4j Database...")
    print("=" * 50)
    
    # Check if already running
    if check_neo4j_running():
        print("✅ Neo4j is already running!")
        print("🌐 Neo4j Browser: http://localhost:7474")
        print("🔌 Bolt URL: bolt://localhost:7687")
        return True
    
    # Try Docker first
    if check_docker_available():
        print("🐳 Docker is available")
        if start_neo4j_docker():
            return True
        else:
            print("⚠️ Docker method failed, trying alternatives...")
    else:
        print("❌ Docker not available")
    
    # Offer alternatives
    print("\n🔄 Alternative Setup Options:")
    print("1. Install Neo4j Desktop (Recommended)")
    print("2. Use Mock Service (For Testing)")
    print("3. Skip Neo4j (Limited Functionality)")
    
    choice = input("\nChoose option (1/2/3): ").strip()
    
    if choice == "1":
        download_neo4j_desktop()
        return False
    elif choice == "2":
        return create_mock_neo4j_service()
    else:
        print("⚠️ Skipping Neo4j setup - some features will be unavailable")
        return False

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n🎉 Neo4j setup complete!")
        print("🔗 You can now test the connection with:")
        print("   python test_neo4j_pipeline.py")
    else:
        print("\n💡 Neo4j setup incomplete")
        print("🔧 The system will work with limited functionality")
        print("📚 You can still use other features without Neo4j")

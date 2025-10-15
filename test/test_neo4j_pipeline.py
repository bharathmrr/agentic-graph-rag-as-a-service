#!/usr/bin/env python3
"""
Test Neo4j Data Pipeline
Verifies that data flows from upload to Neo4j database
"""

import requests
import json
import time
import os
from datetime import datetime

# Configuration
API_BASE = "http://127.0.0.1:8000"
TEST_DOCUMENT_CONTENT = """
John Smith is a senior software engineer at TechCorp Inc. 
The company is headquartered in San Francisco, California.
Alice Johnson works as a data scientist at the same company.
TechCorp Inc specializes in artificial intelligence and machine learning solutions.
The company was founded in 2020 and has grown rapidly.
"""

def create_test_document():
    """Create a test document for upload"""
    filename = f"test_document_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    with open(filename, 'w') as f:
        f.write(TEST_DOCUMENT_CONTENT)
    return filename

def test_neo4j_connection():
    """Test Neo4j database connection"""
    print("🔍 Testing Neo4j connection...")
    
    try:
        response = requests.post(f"{API_BASE}/api/neo4j/test-neo4j-connection")
        result = response.json()
        
        if result.get("success") and result.get("connected"):
            print("✅ Neo4j connection successful!")
            print(f"   Database stats: {result.get('stats', {})}")
            return True
        else:
            print("❌ Neo4j connection failed!")
            print(f"   Error: {result.get('message', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to test Neo4j connection: {e}")
        return False

def upload_test_document(filename):
    """Upload test document using Neo4j pipeline"""
    print(f"📤 Uploading test document: {filename}")
    
    try:
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'text/plain')}
            response = requests.post(f"{API_BASE}/api/neo4j/upload-with-neo4j", files=files)
        
        result = response.json()
        
        if result.get("success"):
            print("✅ Document uploaded successfully!")
            print(f"   Document ID: {result.get('document_id')}")
            print(f"   Processing Job ID: {result.get('processing_job_id')}")
            print(f"   Neo4j Status: {result.get('neo4j_status', {})}")
            return result.get("document_id")
        else:
            print("❌ Document upload failed!")
            print(f"   Error: {result.get('message', 'Unknown error')}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to upload document: {e}")
        return None

def check_processing_status(document_id, max_attempts=10):
    """Check processing status until completion"""
    print(f"⏳ Checking processing status for: {document_id}")
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{API_BASE}/api/neo4j/processing-status/{document_id}")
            result = response.json()
            
            status = result.get("status", "unknown")
            progress = result.get("progress", 0)
            current_step = result.get("current_step", "")
            neo4j_transferred = result.get("neo4j_transferred", False)
            entities_count = result.get("entities_count", 0)
            relationships_count = result.get("relationships_count", 0)
            
            print(f"   Attempt {attempt + 1}: {status} ({progress}%) - {current_step}")
            
            if status == "completed" and neo4j_transferred:
                print("✅ Processing completed successfully!")
                print(f"   Entities stored: {entities_count}")
                print(f"   Relationships stored: {relationships_count}")
                return True
            elif status == "error":
                print("❌ Processing failed!")
                print(f"   Error: {result.get('error_message', 'Unknown error')}")
                return False
            
            # Wait before next check
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ Failed to check status: {e}")
            return False
    
    print("⚠️ Processing timeout - check manually")
    return False

def get_neo4j_stats():
    """Get current Neo4j database statistics"""
    print("📊 Getting Neo4j database statistics...")
    
    try:
        response = requests.get(f"{API_BASE}/api/neo4j/neo4j-stats")
        result = response.json()
        
        if result.get("success"):
            stats = result.get("stats", {})
            print("✅ Neo4j statistics:")
            print(f"   Documents: {stats.get('documents', 0)}")
            print(f"   Entities: {stats.get('entities', 0)}")
            print(f"   Relationships: {stats.get('relationships', 0)}")
            print(f"   Ontologies: {stats.get('ontologies', 0)}")
            return stats
        else:
            print("❌ Failed to get Neo4j statistics!")
            print(f"   Error: {result.get('error', 'Unknown error')}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to get Neo4j stats: {e}")
        return None

def cleanup_test_file(filename):
    """Clean up test file"""
    try:
        if os.path.exists(filename):
            os.remove(filename)
            print(f"🧹 Cleaned up test file: {filename}")
    except Exception as e:
        print(f"⚠️ Failed to clean up test file: {e}")

def main():
    """Run complete Neo4j pipeline test"""
    print("🚀 Starting Neo4j Data Pipeline Test")
    print("=" * 50)
    
    # Step 1: Test Neo4j connection
    if not test_neo4j_connection():
        print("\n❌ Test failed: Neo4j connection not available")
        print("💡 Make sure Neo4j is running and the server is started")
        return False
    
    # Step 2: Get initial stats
    print("\n📊 Initial database state:")
    initial_stats = get_neo4j_stats()
    
    # Step 3: Create and upload test document
    print("\n📝 Creating test document...")
    test_filename = create_test_document()
    
    document_id = upload_test_document(test_filename)
    if not document_id:
        cleanup_test_file(test_filename)
        return False
    
    # Step 4: Wait for processing to complete
    print("\n⏳ Waiting for processing to complete...")
    processing_success = check_processing_status(document_id)
    
    # Step 5: Get final stats
    print("\n📊 Final database state:")
    final_stats = get_neo4j_stats()
    
    # Step 6: Compare stats
    if initial_stats and final_stats:
        print("\n📈 Changes in database:")
        for key in ['documents', 'entities', 'relationships', 'ontologies']:
            initial = initial_stats.get(key, 0)
            final = final_stats.get(key, 0)
            change = final - initial
            print(f"   {key.capitalize()}: {initial} → {final} (+{change})")
    
    # Step 7: Cleanup
    cleanup_test_file(test_filename)
    
    # Final result
    if processing_success:
        print("\n🎉 Neo4j Data Pipeline Test PASSED!")
        print("✅ Data successfully flowed from upload to Neo4j database")
        return True
    else:
        print("\n❌ Neo4j Data Pipeline Test FAILED!")
        print("💡 Check server logs and Neo4j connection")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

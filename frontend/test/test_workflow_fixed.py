#!/usr/bin/env python3
"""
Quick test to verify the fixed workflow
"""
import requests
import json
from datetime import datetime

def test_workflow():
    print("🧪 Testing Fixed Workflow")
    print("=" * 50)
    
    API_BASE = "http://127.0.0.1:8000"
    
    # 1. Test backend
    try:
        response = requests.get(f"{API_BASE}/health")
        print(f"✅ Backend: {response.status_code}")
    except:
        print("❌ Backend not available")
        return
    
    # 2. Test upload
    test_content = """
    Apple Inc. is a technology company founded by Steve Jobs.
    Microsoft Corporation was founded by Bill Gates.
    Google LLC was created by Larry Page and Sergey Brin.
    """
    
    files = {'file': ('test.txt', test_content, 'text/plain')}
    data = {'document_type': 'text', 'metadata': '{}'}
    
    try:
        upload_response = requests.post(f"{API_BASE}/upload/document", files=files, data=data)
        if upload_response.status_code == 200:
            result = upload_response.json()
            doc_id = result['data']['doc_id']
            print(f"✅ Upload: {doc_id}")
            
            # 3. Test ontology generation with uploaded content
            ontology_response = requests.post(f"{API_BASE}/ontology/generate", 
                json={'text': test_content, 'doc_id': doc_id})
            
            if ontology_response.status_code == 200:
                ontology_result = ontology_response.json()
                print(f"📋 Raw ontology response keys: {list(ontology_result.keys())}")
                
                # Handle both response formats
                if ontology_result.get('success'):
                    entities = ontology_result['data'].get('entities', {})
                    print(f"✅ Ontology (standardized): {len(entities)} entity types found")
                elif ontology_result.get('status') == 'success':
                    entities = ontology_result.get('entity_breakdown', {})
                    print(f"✅ Ontology (legacy): {len(entities)} entity types found")
                    
                    # Print sample entities
                    for entity_type, entity_group in entities.items():
                        if isinstance(entity_group, dict) and 'entities' in entity_group:
                            items = entity_group['entities'][:3]  # First 3 items
                            print(f"   {entity_type}: {[item.get('name', item) for item in items]}")
                else:
                    print(f"❌ Ontology failed: {ontology_result}")
            else:
                print(f"❌ Ontology HTTP error: {ontology_response.status_code}")
                print(f"Response: {ontology_response.text}")
                
        else:
            print(f"❌ Upload failed: {upload_response.status_code}")
            
    except Exception as e:
        print(f"❌ Test error: {e}")
    
    print("\n🎯 Test completed!")

if __name__ == "__main__":
    test_workflow()

#!/usr/bin/env python3
"""
Test Module Execution to Debug White Screen Issue
"""
import requests
import json

def test_module_execution():
    print("🧪 Testing Module Execution")
    print("=" * 40)
    
    API_BASE = "http://127.0.0.1:8000"
    
    # 1. Test backend health
    try:
        response = requests.get(f"{API_BASE}/health")
        print(f"✅ Backend: {response.status_code}")
    except:
        print("❌ Backend not available")
        return
    
    # 2. Upload a simple document
    test_content = "Apple Inc. is a technology company founded by Steve Jobs."
    
    files = {'file': ('test.txt', test_content, 'text/plain')}
    data = {'document_type': 'text', 'metadata': '{}'}
    
    try:
        upload_response = requests.post(f"{API_BASE}/upload/document", files=files, data=data)
        if upload_response.status_code == 200:
            result = upload_response.json()
            doc_id = result['data']['doc_id']
            print(f"✅ Upload: {doc_id}")
            
            # 3. Test ontology generation (most common module)
            print("\n🧠 Testing Ontology Module...")
            ontology_response = requests.post(f"{API_BASE}/ontology/generate", 
                json={'text': test_content, 'doc_id': doc_id})
            
            print(f"Status Code: {ontology_response.status_code}")
            print(f"Response Headers: {dict(ontology_response.headers)}")
            
            if ontology_response.status_code == 200:
                ontology_result = ontology_response.json()
                print(f"✅ Ontology Response Keys: {list(ontology_result.keys())}")
                print(f"Status: {ontology_result.get('status')}")
                
                # Check if this matches what frontend expects
                if ontology_result.get('status') == 'success':
                    print("✅ Response format matches frontend expectations")
                    
                    # Show sample data structure
                    if 'entity_breakdown' in ontology_result:
                        entities = ontology_result['entity_breakdown']
                        print(f"Entity types found: {list(entities.keys())}")
                        for entity_type, group in entities.items():
                            if isinstance(group, dict) and 'entities' in group:
                                print(f"  {entity_type}: {len(group['entities'])} entities")
                else:
                    print("❌ Unexpected response format")
                    print(f"Full response: {json.dumps(ontology_result, indent=2)}")
            else:
                print(f"❌ Ontology failed: {ontology_response.status_code}")
                print(f"Response: {ontology_response.text}")
                
            # 4. Test other modules
            modules_to_test = [
                ('embeddings', '/embeddings/store'),
                ('graph', '/graph/build-from-ontology')
            ]
            
            for module_name, endpoint in modules_to_test:
                print(f"\n🔧 Testing {module_name} module...")
                try:
                    if module_name == 'embeddings':
                        response = requests.post(f"{API_BASE}{endpoint}", 
                            json={'text': test_content, 'doc_id': doc_id})
                    elif module_name == 'graph':
                        # Use ontology data for graph
                        if 'ontology_result' in locals():
                            response = requests.post(f"{API_BASE}{endpoint}", 
                                json=ontology_result.get('ontology', {}))
                        else:
                            print(f"⚠️ Skipping {module_name} - no ontology data")
                            continue
                    
                    print(f"  Status: {response.status_code}")
                    if response.status_code == 200:
                        result = response.json()
                        print(f"  ✅ {module_name} success: {result.get('status', 'unknown')}")
                    else:
                        print(f"  ❌ {module_name} failed: {response.text[:200]}")
                        
                except Exception as e:
                    print(f"  ❌ {module_name} error: {e}")
        else:
            print(f"❌ Upload failed: {upload_response.status_code}")
            
    except Exception as e:
        print(f"❌ Test error: {e}")
    
    print("\n" + "=" * 40)
    print("🎯 Module Execution Test Complete")
    print("\n💡 If modules are working but frontend shows white screen:")
    print("1. Check browser console for JavaScript errors")
    print("2. Verify React component imports")
    print("3. Check if results modal is rendering properly")
    print("4. Test with SimpleModuleResults component")

if __name__ == "__main__":
    test_module_execution()

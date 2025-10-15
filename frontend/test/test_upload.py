#!/usr/bin/env python3
"""Test upload functionality."""

import requests
import json

def test_upload():
    """Test the upload endpoint."""
    
    # Create a test file
    test_content = "This is a test document for the Agentic Graph RAG system. It contains some sample text to test the upload functionality."
    
    # Prepare the file for upload
    files = {
        'file': ('test_document.txt', test_content, 'text/plain')
    }
    
    data = {
        'document_type': 'text',
        'metadata': json.dumps({'test': True, 'source': 'upload_test'})
    }
    
    try:
        print("🔄 Testing upload endpoint...")
        response = requests.post(
            'http://127.0.0.1:8000/upload/document',
            files=files,
            data=data,
            timeout=10
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Upload successful!")
                print(f"📝 Document ID: {result['data']['doc_id']}")
                return True
            else:
                print(f"❌ Upload failed: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Server not running or endpoint not available")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_upload()
    if success:
        print("🎉 Upload test passed!")
    else:
        print("💥 Upload test failed!")

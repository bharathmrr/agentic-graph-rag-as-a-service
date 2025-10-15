#!/usr/bin/env python3
"""
OCR Test Script
Quick test to verify OCR functionality is working
"""

import requests
import os
import tempfile
from pathlib import Path

def test_ocr_endpoint():
    """Test the OCR endpoint with sample files"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 Testing OCR Functionality")
    print("=" * 50)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/")
        print("✅ Server is running")
        print(f"   Response: {response.json()['message']}")
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running")
        print("   Start server with: python backend/test_ocr_endpoint.py")
        return False
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False
    
    # Test 2: Check OCR status
    try:
        response = requests.get(f"{base_url}/api/ocr-status")
        status = response.json()
        print("\n📊 OCR Status:")
        print(f"   Available: {status['ocr_available']}")
        print(f"   Supported formats: {', '.join(status['supported_formats'])}")
        print("   Dependencies:")
        for dep, stat in status['dependencies'].items():
            icon = "✅" if "Available" in stat else "⚠️"
            print(f"     {icon} {dep}: {stat}")
    except Exception as e:
        print(f"❌ Status check failed: {e}")
    
    # Test 3: Create and test with sample text file
    print("\n📝 Testing with sample text file...")
    try:
        # Create sample text file
        sample_text = """Sample Document for OCR Testing

This is a test document to verify that OCR functionality is working correctly.

Key Information:
- Document Type: Text File
- Purpose: OCR Testing
- Content: Sample text for extraction
- Date: 2024

The OCR system should be able to extract this text successfully.
"""
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(sample_text)
            temp_file_path = f.name
        
        # Test OCR endpoint
        with open(temp_file_path, 'rb') as f:
            files = {'file': ('test_document.txt', f, 'text/plain')}
            response = requests.post(f"{base_url}/api/test-ocr", files=files)
        
        # Clean up
        os.unlink(temp_file_path)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Text file OCR test passed")
            print(f"   File: {result['filename']}")
            print(f"   Size: {result['file_size']} bytes")
            print(f"   Extracted length: {result['text_length']} characters")
            print(f"   Success: {result['success']}")
            
            # Show first 100 characters of extracted text
            extracted = result['extracted_text'][:100]
            print(f"   Preview: {extracted}...")
            
        else:
            print(f"❌ Text file OCR test failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Text file test failed: {e}")
    
    # Test 4: Instructions for further testing
    print("\n🚀 Manual Testing Instructions:")
    print("1. Start the OCR test server:")
    print("   python backend/test_ocr_endpoint.py")
    print("\n2. Open the frontend and navigate to OCR Test component")
    print("   - Upload a PDF, image, or text file")
    print("   - Click 'Test OCR' to verify extraction")
    print("\n3. For image OCR support, install:")
    print("   pip install pytesseract pillow")
    print("\n4. For PDF support, install:")
    print("   pip install PyPDF2")
    
    print("\n" + "=" * 50)
    print("OCR Test Complete")
    
    return True

if __name__ == "__main__":
    test_ocr_endpoint()

#!/usr/bin/env python3
"""Test script to check if all imports work correctly."""

import sys
import traceback

def test_import(module_name, description):
    """Test importing a module and report results."""
    try:
        __import__(module_name)
        print(f"✅ {description}: OK")
        return True
    except Exception as e:
        print(f"❌ {description}: FAILED - {str(e)}")
        return False

def main():
    """Test all critical imports."""
    print("🔍 Testing critical imports...")
    print("=" * 50)
    
    success_count = 0
    total_tests = 0
    
    # Test basic dependencies
    tests = [
        ("fastapi", "FastAPI framework"),
        ("uvicorn", "ASGI server"),
        ("pydantic", "Data validation"),
        ("aiofiles", "Async file operations"),
        ("pathlib", "Path operations"),
        ("json", "JSON operations"),
        ("datetime", "Date/time operations"),
        ("uuid", "UUID generation"),
        ("logging", "Logging"),
    ]
    
    for module, desc in tests:
        total_tests += 1
        if test_import(module, desc):
            success_count += 1
    
    print("=" * 50)
    
    # Test main application import
    print("🚀 Testing main application import...")
    try:
        from src.api.main import app
        print("✅ Main application: OK")
        success_count += 1
    except Exception as e:
        print(f"❌ Main application: FAILED")
        print(f"Error: {str(e)}")
        traceback.print_exc()
    
    total_tests += 1
    
    print("=" * 50)
    print(f"📊 Results: {success_count}/{total_tests} imports successful")
    
    if success_count == total_tests:
        print("🎉 All imports working! Server should start correctly.")
        return 0
    else:
        print("⚠️  Some imports failed. Check dependencies.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

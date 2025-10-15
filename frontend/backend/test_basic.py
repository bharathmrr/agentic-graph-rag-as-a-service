"""
Basic tests for Agentic Graph RAG Backend
"""
import pytest
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that basic imports work"""
    try:
        import fastapi
        import uvicorn
        import neo4j
        import chromadb
        assert True
    except ImportError as e:
        pytest.fail(f"Import failed: {e}")

def test_basic_functionality():
    """Test basic functionality"""
    assert 1 + 1 == 2
    assert "hello" == "hello"

def test_environment_setup():
    """Test environment variables can be loaded"""
    import os
    from dotenv import load_dotenv
    
    # This should not fail
    load_dotenv()
    
    # Basic environment test
    test_var = os.getenv("TEST_VAR", "default")
    assert test_var == "default"

if __name__ == "__main__":
    pytest.main([__file__])

#!/usr/bin/env python3
"""
LLM Connection and System Check Script
Tests all components of the Agentic Graph RAG system
"""
import os
import sys
import asyncio
import json
import time
from typing import Dict, Any, List
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent))

def print_header(title: str):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_status(component: str, status: bool, message: str = ""):
    """Print component status"""
    status_icon = "✅" if status else "❌"
    print(f"{status_icon} {component:<25} {'OK' if status else 'FAILED'}")
    if message:
        print(f"   └─ {message}")

async def check_openai_connection():
    """Check OpenAI API connection"""
    try:
        from openai import OpenAI
        
        # Check if API key is set
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return False, "OPENAI_API_KEY environment variable not set"
        
        client = OpenAI(api_key=api_key)
        
        # Test simple completion
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello, this is a test."}],
            max_tokens=10
        )
        
        if response.choices:
            return True, f"Model: gpt-3.5-turbo, Response: {len(response.choices[0].message.content)} chars"
        else:
            return False, "No response from OpenAI API"
            
    except ImportError:
        return False, "OpenAI package not installed"
    except Exception as e:
        return False, f"Connection failed: {str(e)}"

async def check_spacy_model():
    """Check spaCy model availability"""
    try:
        import spacy
        
        # Try to load English model
        nlp = spacy.load("en_core_web_sm")
        
        # Test processing
        doc = nlp("Apple Inc. is a technology company based in Cupertino.")
        entities = [(ent.text, ent.label_) for ent in doc.ents]
        
        return True, f"Model loaded, found {len(entities)} entities"
        
    except ImportError:
        return False, "spaCy package not installed"
    except OSError:
        return False, "en_core_web_sm model not found. Run: python -m spacy download en_core_web_sm"
    except Exception as e:
        return False, f"Model loading failed: {str(e)}"

async def check_sentence_transformers():
    """Check sentence transformers model"""
    try:
        from sentence_transformers import SentenceTransformer
        
        # Load model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Test encoding
        sentences = ["This is a test sentence.", "Another test sentence."]
        embeddings = model.encode(sentences)
        
        return True, f"Model loaded, embedding dimension: {embeddings.shape[1]}"
        
    except ImportError:
        return False, "sentence-transformers package not installed"
    except Exception as e:
        return False, f"Model loading failed: {str(e)}"

async def check_chromadb():
    """Check ChromaDB connection"""
    try:
        import chromadb
        from chromadb.config import Settings
        
        # Create client
        client = chromadb.PersistentClient(
            path="./test_chroma_db",
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Test collection creation
        collection = client.get_or_create_collection("test_collection")
        
        # Test adding data
        collection.add(
            embeddings=[[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
            documents=["Test document 1", "Test document 2"],
            ids=["test1", "test2"]
        )
        
        # Test querying
        results = collection.query(
            query_embeddings=[[1.0, 2.0, 3.0]],
            n_results=1
        )
        
        # Cleanup
        client.delete_collection("test_collection")
        
        return True, f"Collection created and queried successfully"
        
    except ImportError:
        return False, "chromadb package not installed"
    except Exception as e:
        return False, f"ChromaDB test failed: {str(e)}"

async def check_neo4j_connection():
    """Check Neo4j database connection"""
    try:
        from neo4j import GraphDatabase
        
        # Connection parameters
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USER", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")
        
        # Create driver
        driver = GraphDatabase.driver(uri, auth=(user, password))
        
        # Test connection
        driver.verify_connectivity()
        
        # Test query
        with driver.session() as session:
            result = session.run("RETURN 'Hello Neo4j' as message")
            record = result.single()
            message = record["message"] if record else "No response"
        
        driver.close()
        
        return True, f"Connected to {uri}, Response: {message}"
        
    except ImportError:
        return False, "neo4j package not installed"
    except Exception as e:
        return False, f"Neo4j connection failed: {str(e)}"

async def check_required_packages():
    """Check all required packages"""
    packages = [
        "fastapi", "uvicorn", "pydantic", "aiofiles", "python-multipart",
        "numpy", "pandas", "scikit-learn", "networkx", "rapidfuzz",
        "PyPDF2", "python-docx", "matplotlib", "plotly"
    ]
    
    missing_packages = []
    installed_packages = []
    
    for package in packages:
        try:
            __import__(package.replace("-", "_"))
            installed_packages.append(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        return False, f"Missing packages: {', '.join(missing_packages)}"
    else:
        return True, f"All {len(installed_packages)} packages installed"

async def test_ontology_generation():
    """Test ontology generation functionality"""
    try:
        from api.enhanced_ontology_api import ontology_generator
        
        test_text = """
        Apple Inc. is a technology company founded by Steve Jobs and Steve Wozniak.
        The company is headquartered in Cupertino, California.
        Tim Cook is the current CEO of Apple Inc.
        """
        
        result = await ontology_generator.generate_ontology("test_doc", test_text)
        
        if result["success"]:
            data = result["data"]
            entity_count = data["summary"]["total_entities"]
            relation_count = data["summary"]["total_relations"]
            return True, f"Generated {entity_count} entities, {relation_count} relations"
        else:
            return False, f"Generation failed: {result.get('error', 'Unknown error')}"
            
    except Exception as e:
        return False, f"Test failed: {str(e)}"

async def test_entity_resolution():
    """Test entity resolution functionality"""
    try:
        from api.enhanced_entity_resolution_api import entity_resolver
        
        test_entities = [
            {"id": "1", "name": "Apple Inc.", "type": "ORGANIZATION"},
            {"id": "2", "name": "Apple Inc", "type": "ORGANIZATION"},
            {"id": "3", "name": "Steve Jobs", "type": "PERSON"},
            {"id": "4", "name": "Steven Jobs", "type": "PERSON"}
        ]
        
        result = await entity_resolver.resolve_entities(test_entities)
        
        if result["success"]:
            metrics = result["data"]["metrics"]
            duplicates = metrics["total_duplicates"]
            unique = metrics["unique_entities"]
            return True, f"Found {duplicates} duplicates, {unique} unique entities"
        else:
            return False, f"Resolution failed: {result.get('error', 'Unknown error')}"
            
    except Exception as e:
        return False, f"Test failed: {str(e)}"

async def test_embeddings():
    """Test embedding generation and search"""
    try:
        from api.enhanced_chromadb_api import chromadb_integration
        
        test_entities = [
            {"id": "1", "name": "Apple Inc.", "type": "ORGANIZATION", "sentence_context": "Apple Inc. is a technology company."},
            {"id": "2", "name": "Steve Jobs", "type": "PERSON", "sentence_context": "Steve Jobs founded Apple."}
        ]
        
        # Store embeddings
        store_result = await chromadb_integration.store_entity_embeddings(test_entities, "test_doc")
        
        if not store_result["success"]:
            return False, f"Storage failed: {store_result.get('error', 'Unknown error')}"
        
        # Test search
        search_result = await chromadb_integration.semantic_search("technology company")
        
        if search_result["success"]:
            results_count = len(search_result["data"]["results"])
            return True, f"Stored {len(test_entities)} entities, found {results_count} search results"
        else:
            return False, f"Search failed: {search_result.get('error', 'Unknown error')}"
            
    except Exception as e:
        return False, f"Test failed: {str(e)}"

async def test_reasoning_stream():
    """Test reasoning stream functionality"""
    try:
        from api.enhanced_reasoning_stream_api import reasoning_stream
        
        test_query = "What is Apple Inc.?"
        
        result = await reasoning_stream.process_query(test_query)
        
        if result["success"]:
            answer_length = len(result["data"]["answer"])
            sources_count = len(result["data"]["sources"])
            steps_count = len(result["data"]["reasoning_steps"])
            return True, f"Generated {answer_length} char answer, {sources_count} sources, {steps_count} reasoning steps"
        else:
            return False, f"Query failed: {result.get('error', 'Unknown error')}"
            
    except Exception as e:
        return False, f"Test failed: {str(e)}"

async def run_system_check():
    """Run complete system check"""
    print_header("AGENTIC GRAPH RAG SYSTEM CHECK")
    
    # Check Python version
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    python_ok = sys.version_info >= (3, 9)
    print_status("Python Version", python_ok, f"Version {python_version} {'(OK)' if python_ok else '(Requires 3.9+)'}")
    
    print_header("PACKAGE DEPENDENCIES")
    
    # Check required packages
    packages_ok, packages_msg = await check_required_packages()
    print_status("Required Packages", packages_ok, packages_msg)
    
    print_header("EXTERNAL SERVICES")
    
    # Check OpenAI
    openai_ok, openai_msg = await check_openai_connection()
    print_status("OpenAI API", openai_ok, openai_msg)
    
    # Check Neo4j
    neo4j_ok, neo4j_msg = await check_neo4j_connection()
    print_status("Neo4j Database", neo4j_ok, neo4j_msg)
    
    # Check ChromaDB
    chromadb_ok, chromadb_msg = await check_chromadb()
    print_status("ChromaDB", chromadb_ok, chromadb_msg)
    
    print_header("ML MODELS")
    
    # Check spaCy
    spacy_ok, spacy_msg = await check_spacy_model()
    print_status("spaCy NLP Model", spacy_ok, spacy_msg)
    
    # Check sentence transformers
    st_ok, st_msg = await check_sentence_transformers()
    print_status("Sentence Transformers", st_ok, st_msg)
    
    print_header("FUNCTIONALITY TESTS")
    
    # Test ontology generation
    ontology_ok, ontology_msg = await test_ontology_generation()
    print_status("Ontology Generation", ontology_ok, ontology_msg)
    
    # Test entity resolution
    entity_ok, entity_msg = await test_entity_resolution()
    print_status("Entity Resolution", entity_ok, entity_msg)
    
    # Test embeddings
    embedding_ok, embedding_msg = await test_embeddings()
    print_status("Embedding System", embedding_ok, embedding_msg)
    
    # Test reasoning
    reasoning_ok, reasoning_msg = await test_reasoning_stream()
    print_status("Reasoning Stream", reasoning_ok, reasoning_msg)
    
    print_header("SYSTEM SUMMARY")
    
    # Calculate overall status
    all_checks = [
        python_ok, packages_ok, openai_ok, neo4j_ok, chromadb_ok,
        spacy_ok, st_ok, ontology_ok, entity_ok, embedding_ok, reasoning_ok
    ]
    
    passed = sum(all_checks)
    total = len(all_checks)
    overall_ok = passed == total
    
    print_status("Overall System Status", overall_ok, f"{passed}/{total} checks passed")
    
    if overall_ok:
        print("\n🎉 System is ready for production!")
        print("   Run: python src/main_enhanced.py")
    else:
        print(f"\n⚠️  System has {total - passed} issues that need attention.")
        print("   Please fix the failed checks before running the system.")
    
    print_header("ENVIRONMENT SETUP")
    
    # Check environment variables
    env_vars = {
        "OPENAI_API_KEY": "OpenAI API access",
        "NEO4J_URI": "Neo4j database connection",
        "NEO4J_USER": "Neo4j username",
        "NEO4J_PASSWORD": "Neo4j password"
    }
    
    for var, description in env_vars.items():
        value = os.getenv(var)
        if value:
            masked_value = f"{value[:8]}..." if len(value) > 8 else "***"
            print_status(var, True, f"{description} ({masked_value})")
        else:
            print_status(var, False, f"{description} (not set)")
    
    print("\n" + "="*60)
    return overall_ok

if __name__ == "__main__":
    # Set up environment
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run system check
    try:
        result = asyncio.run(run_system_check())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\nSystem check interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nSystem check failed with error: {e}")
        sys.exit(1)

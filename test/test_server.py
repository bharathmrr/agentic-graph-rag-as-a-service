#!/usr/bin/env python3
"""
Simple test server to verify the backend is working
"""
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import asyncio
import json
import uuid
import time

app = FastAPI(title="Test Server")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test server is running!", "status": "success"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "Server is running"}

@app.get("/api/sse/progress")
async def sse_progress():
    """Server-Sent Events endpoint for real-time progress updates"""
    async def event_generator():
        while True:
            # Send a heartbeat every 5 seconds
            data = {
                "type": "heartbeat",
                "timestamp": "2024-01-01T00:00:00Z",
                "status": "connected"
            }
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(5)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.get("/api/documents")
async def get_documents():
    """Get list of uploaded documents"""
    return {
        "success": True,
        "data": []  # Empty array - no demo data
    }

@app.get("/api/core-modules/{module_id}")
async def get_module_details(module_id: str):
    """Get detailed information about a specific module"""
    modules_data = {
        "ontology-generator": {
            "id": "ontology-generator",
            "name": "Ontology Generator",
            "description": "AI-powered entity and relationship extraction from documents",
            "status": "ready",
            "capabilities": [
                "Entity Recognition",
                "Relationship Mapping", 
                "Concept Extraction",
                "Semantic Analysis"
            ],
            "requirements": ["Uploaded Documents"],
            "output": "Structured Ontology",
            "estimated_time": "2-5 minutes"
        },
        "entity-resolution": {
            "id": "entity-resolution", 
            "name": "Entity Resolution",
            "description": "Intelligent entity linking and deduplication across documents",
            "status": "ready",
            "capabilities": [
                "Entity Linking",
                "Deduplication",
                "Cross-document Resolution",
                "Confidence Scoring"
            ],
            "requirements": ["Generated Ontology"],
            "output": "Resolved Entities",
            "estimated_time": "1-3 minutes"
        },
        "embedding-generator": {
            "id": "embedding-generator",
            "name": "Embedding Generator", 
            "description": "Generate semantic embeddings for intelligent search and retrieval",
            "status": "ready",
            "capabilities": [
                "Semantic Embeddings",
                "Vector Generation",
                "Similarity Indexing",
                "Search Optimization"
            ],
            "requirements": ["Resolved Entities"],
            "output": "Vector Embeddings",
            "estimated_time": "3-7 minutes"
        },
        "graph-constructor": {
            "id": "graph-constructor",
            "name": "Graph Constructor",
            "description": "Build interactive knowledge graphs with Neo4j integration",
            "status": "ready", 
            "capabilities": [
                "Graph Construction",
                "Node Creation",
                "Relationship Mapping",
                "Visualization Data"
            ],
            "requirements": ["Vector Embeddings"],
            "output": "Knowledge Graph",
            "estimated_time": "2-4 minutes"
        }
    }
    
    module = modules_data.get(module_id, {
        "id": module_id,
        "name": "Unknown Module",
        "description": "Module not found",
        "status": "error"
    })
    
    return {
        "success": True,
        "data": module
    }

@app.post("/api/core-modules/{module_id}/execute")
async def execute_module(module_id: str):
    """Execute a specific module"""
    return {
        "success": True,
        "message": f"Module {module_id} execution started",
        "data": {
            "execution_id": f"exec_{module_id}_{hash(module_id)}",
            "status": "running",
            "progress": 0,
            "estimated_completion": "2-5 minutes"
        }
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Handle file upload"""
    try:
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Read file content
        content = await file.read()
        
        # Simulate file processing
        return {
            "success": True,
            "message": "File uploaded successfully",
            "data": {
                "file_id": file_id,
                "filename": file.filename,
                "size": len(content),
                "status": "processing",
                "progress": 0,
                "doc_id": f"doc_{file_id}"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Upload failed: {str(e)}",
            "data": None
        }

@app.post("/api/pipeline/process-document")
async def process_document():
    """Process uploaded document step by step"""
    return {
        "success": True,
        "message": "Document processing started",
        "data": {
            "processing_id": "proc_123",
            "status": "processing",
            "steps": [
                {"step": "Document Analysis", "status": "completed", "progress": 100},
                {"step": "Entity Extraction", "status": "in_progress", "progress": 60},
                {"step": "Relationship Mapping", "status": "pending", "progress": 0},
                {"step": "Embedding Generation", "status": "pending", "progress": 0},
                {"step": "Graph Construction", "status": "pending", "progress": 0}
            ],
            "current_step": "Entity Extraction",
            "overall_progress": 32
        }
    }

# Pydantic models for chatbot requests
class ChatRequest(BaseModel):
    message: str
    top_k: int = 10
    strategy: str = "hybrid"

class GroupManagerRequest(BaseModel):
    message: str

class FileSummarizeRequest(BaseModel):
    doc_id: str
    text: str = None
    chunk_size: int = 1000
    overlap: int = 100

# Step 10: Application Chatbot
@app.post("/v2/chat/app")
async def app_chatbot(request: ChatRequest):
    """Application chatbot with keyword extraction and knowledge base retrieval"""
    await asyncio.sleep(0.5)  # Simulate processing
    
    # Extract simple keywords
    keywords = [word.lower() for word in request.message.split() if len(word) > 3][:5]
    
    return {
        "success": True,
        "status_code": 200,
        "processing_ms": 500,
        "data": {
            "answer": f"Based on your query about '{request.message}', I found relevant information in the knowledge base. The system analyzed {len(keywords)} key terms and retrieved matching entities and relationships.",
            "keywords": keywords,
            "sources": [
                {
                    "name": "Entity: Sample",
                    "anchor_text": "This is sample content from the knowledge base...",
                    "metadata": {"entity_name": "Sample Entity", "type": "CONCEPT"}
                }
            ],
            "confidence": 0.85
        }
    }

# Step 11: Group Manager AI
@app.post("/v2/chat/group-manager")
async def group_manager_chat(request: GroupManagerRequest):
    """Educational chatbot for RAG, AI, and knowledge graph concepts"""
    await asyncio.sleep(0.5)  # Simulate processing
    
    message_lower = request.message.lower()
    
    # Determine educational response based on keywords
    if 'rag' in message_lower or 'retrieval' in message_lower:
        answer = "RAG (Retrieval-Augmented Generation) combines information retrieval with text generation. It searches a knowledge base for relevant information and uses it to generate more accurate, grounded responses."
    elif 'graph' in message_lower or 'neo4j' in message_lower:
        answer = "Knowledge graphs represent information as nodes (entities) and edges (relationships). Neo4j is a popular graph database that stores and queries these structures efficiently using Cypher query language."
    elif 'embedding' in message_lower or 'vector' in message_lower:
        answer = "Vector embeddings are numerical representations of text that capture semantic meaning. Similar concepts have similar embeddings, enabling semantic search through vector similarity measures like cosine distance."
    elif 'lyzr' in message_lower or 'bharath' in message_lower:
        answer = "Lyzr AI, developed by Bharath, focuses on building intelligent agentic systems. This project demonstrates advanced Graph RAG by combining vector search, graph traversal, and agentic reasoning for comprehensive knowledge exploration."
    else:
        answer = "AI systems combine multiple techniques: machine learning for pattern recognition, knowledge graphs for structured reasoning, and retrieval systems for grounded responses. What specific aspect would you like to learn more about?"
    
    keywords = [word.lower() for word in request.message.split() if len(word) > 3][:5]
    
    return {
        "success": True,
        "status_code": 200,
        "processing_ms": 500,
        "data": {
            "answer": answer,
            "keywords": keywords
        }
    }

# Step 12: File Summarization
@app.post("/v2/files/summarize")
async def summarize_file(request: FileSummarizeRequest):
    """Summarize uploaded file and store in ChromaDB"""
    await asyncio.sleep(1.0)  # Simulate processing
    
    text_length = len(request.text) if request.text else 0
    word_count = len(request.text.split()) if request.text else 0
    
    # Generate simple summary
    summary = f"""📄 Document Summary

Document ID: {request.doc_id}
Processed: {text_length} bytes ({word_count} words)

Key Points:
• Document successfully analyzed
• Content extracted and structured
• Embeddings generated for semantic search
• Summary stored in vector database

This document has been processed and is now searchable through the knowledge base system.
"""
    
    return {
        "success": True,
        "status_code": 200,
        "processing_ms": 1000,
        "data": {
            "doc_id": request.doc_id,
            "summary": summary,
            "summary_file": f"data/summaries/{request.doc_id}_summary.txt",
            "processed_bytes": text_length,
            "chroma": {
                "stored": max(1, text_length // 1000)
            }
        }
    }

@app.get("/api/core-modules/dashboard")
async def test_dashboard():
    return {
        "success": True,
        "data": {
            "dashboard_info": {
                "title": "Core Modules Dashboard",
                "subtitle": "8 Modules Available",
                "description": "Explore your processed data through powerful ingestion and retrieval modules"
            },
            "statistics": {
                "total_modules": 8,
                "ingestion_modules": 4,
                "retrieval_modules": 4,
                "active_modules": 2,
                "ready_modules": 6
            },
            "system_metrics": {
                "documents_processed": 12,
                "entities_extracted": 156,
                "relationships_found": 89,
                "embeddings_generated": 1247,
                "graph_nodes": 156
            },
            "ingestion_modules": [
                {
                    "id": "ontology_generator",
                    "name": "Ontology Generator",
                    "type": "ingestion",
                    "description": "LLM-powered automatic ontology generation",
                    "icon": "🧠",
                    "color": "#0ea5e9",
                    "status": "ready",
                    "capabilities": ["Entity extraction", "Relationship identification", "Structured JSON output"]
                },
                {
                    "id": "entity_resolution",
                    "name": "Entity Resolution",
                    "type": "ingestion",
                    "description": "Intelligent entity deduplication",
                    "icon": "🔀",
                    "color": "#8b5cf6",
                    "status": "ready",
                    "capabilities": ["Fuzzy matching", "Duplicate detection", "Entity merging"]
                },
                {
                    "id": "embedding_generator",
                    "name": "Embedding Generator",
                    "type": "ingestion",
                    "description": "Gemini-powered embeddings",
                    "icon": "✨",
                    "color": "#10b981",
                    "status": "ready",
                    "capabilities": ["Semantic embeddings", "ChromaDB integration", "Vector similarity search"]
                },
                {
                    "id": "graph_constructor",
                    "name": "Graph Constructor",
                    "type": "ingestion",
                    "description": "Build knowledge graphs with Neo4j",
                    "icon": "🕸️",
                    "color": "#f97316",
                    "status": "ready",
                    "capabilities": ["Neo4j integration", "Relationship modeling", "Graph visualization"]
                }
            ],
            "retrieval_modules": [
                {
                    "id": "vector_search",
                    "name": "Vector Search Tool",
                    "type": "retrieval",
                    "description": "Semantic similarity search",
                    "icon": "🔍",
                    "color": "#3b82f6",
                    "status": "ready",
                    "capabilities": ["Semantic search", "Similarity scoring", "Multi-modal retrieval"]
                },
                {
                    "id": "graph_traversal",
                    "name": "Graph Traversal Tool",
                    "type": "retrieval",
                    "description": "Navigate knowledge graphs",
                    "icon": "🕸️",
                    "color": "#10b981",
                    "status": "ready",
                    "capabilities": ["Path finding", "Relationship traversal", "Graph algorithms"]
                },
                {
                    "id": "logical_filter",
                    "name": "Logical Filter Tool",
                    "type": "retrieval",
                    "description": "Rule-based information filtering",
                    "icon": "🔧",
                    "color": "#8b5cf6",
                    "status": "ready",
                    "capabilities": ["Rule-based filtering", "Logical constraints", "Conditional queries"]
                },
                {
                    "id": "reasoning_stream",
                    "name": "Reasoning Stream",
                    "type": "retrieval",
                    "description": "Real-time agent reasoning chains",
                    "icon": "🧠",
                    "color": "#f43f5e",
                    "status": "ready",
                    "capabilities": ["Step-by-step reasoning", "Confidence tracking", "Explanation generation"]
                }
            ]
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

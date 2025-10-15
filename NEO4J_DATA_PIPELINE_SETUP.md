# Neo4j Data Pipeline Setup Guide

## Overview
This guide ensures that when you upload documents, the data flows properly through the complete pipeline:
**Upload → Ontology Generation → Entity Extraction → Neo4j Storage**

## 🔧 Prerequisites

### 1. Install Neo4j Database
```bash
# Download and install Neo4j Desktop from: https://neo4j.com/download/
# Or use Docker:
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

### 2. Install Required Python Packages
```bash
pip install neo4j>=5.0.0
pip install fastapi uvicorn
pip install python-multipart
```

## 📊 Data Flow Pipeline

### Complete Pipeline Steps:
1. **Document Upload** → File received and stored
2. **Content Extraction** → Text extracted from document
3. **Ontology Generation** → LLM extracts entities and relationships
4. **Entity Processing** → Entities are cleaned and structured
5. **Neo4j Storage** → Data stored in graph database
6. **Verification** → Confirm data transfer success

## 🚀 Setup Instructions

### Step 1: Configure Neo4j Connection
Create or update your environment variables:

```bash
# .env file
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

### Step 2: Start Neo4j Database
```bash
# If using Docker:
docker start neo4j

# If using Neo4j Desktop:
# Start your database from the Neo4j Desktop application
```

### Step 3: Test Neo4j Connection
```bash
# Test connection endpoint:
curl http://127.0.0.1:8000/api/neo4j/test-neo4j-connection
```

Expected response:
```json
{
  "success": true,
  "connected": true,
  "message": "Neo4j connection successful",
  "stats": {
    "documents": 0,
    "entities": 0,
    "relationships": 0,
    "ontologies": 0
  }
}
```

## 📁 API Endpoints for Data Pipeline

### 1. Upload with Neo4j Integration
```bash
POST /api/neo4j/upload-with-neo4j
Content-Type: multipart/form-data

# Upload a file and automatically process to Neo4j
curl -X POST \
  -F "file=@your-document.pdf" \
  http://127.0.0.1:8000/api/neo4j/upload-with-neo4j
```

### 2. Check Processing Status
```bash
GET /api/neo4j/processing-status/{document_id}

# Check if data was transferred to Neo4j
curl http://127.0.0.1:8000/api/neo4j/processing-status/doc_20251013_120000_document.pdf
```

### 3. Get Neo4j Statistics
```bash
GET /api/neo4j/neo4j-stats

# See current database statistics
curl http://127.0.0.1:8000/api/neo4j/neo4j-stats
```

## 🔍 Verification Steps

### 1. Upload a Test Document
```bash
# Create a test document
echo "John Smith works at TechCorp Inc. The company is located in San Francisco." > test-document.txt

# Upload it
curl -X POST \
  -F "file=@test-document.txt" \
  http://127.0.0.1:8000/api/neo4j/upload-with-neo4j
```

### 2. Check Processing Status
```bash
# Use the document_id from upload response
curl http://127.0.0.1:8000/api/neo4j/processing-status/doc_20251013_120000_test-document.txt
```

Expected response:
```json
{
  "document_id": "doc_20251013_120000_test-document.txt",
  "status": "completed",
  "progress": 100,
  "current_step": "Data transferred to Neo4j",
  "neo4j_transferred": true,
  "entities_count": 3,
  "relationships_count": 2
}
```

### 3. Verify in Neo4j Browser
Open Neo4j Browser at `http://localhost:7474` and run:

```cypher
// Check documents
MATCH (d:Document) RETURN d LIMIT 10;

// Check entities
MATCH (e:Entity) RETURN e.name, e.type LIMIT 10;

// Check relationships
MATCH (s:Entity)-[r:RELATIONSHIP]->(t:Entity) 
RETURN s.name, r.type, t.name LIMIT 10;

// Get complete graph for a document
MATCH (d:Document {id: "doc_20251013_120000_test-document.txt"})
MATCH (d)-[:CONTAINS]->(e:Entity)
OPTIONAL MATCH (e)-[r:RELATIONSHIP]->(e2:Entity)
RETURN d, e, r, e2;
```

## 🛠️ Troubleshooting

### Issue: Neo4j Connection Failed
**Solution:**
1. Check if Neo4j is running: `docker ps` or Neo4j Desktop
2. Verify connection details in environment variables
3. Test connection: `curl http://127.0.0.1:8000/api/neo4j/test-neo4j-connection`

### Issue: Data Not Appearing in Neo4j
**Solution:**
1. Check processing status endpoint
2. Look at server logs for errors
3. Verify Neo4j credentials are correct
4. Ensure Neo4j database is started

### Issue: Ontology Generation Fails
**Solution:**
1. Check if LLM service is configured
2. Verify document content is readable
3. Check server logs for LLM errors
4. Try with a simple text document first

## 📊 Expected Database Schema

After successful processing, your Neo4j database will contain:

### Nodes:
- **Document**: Represents uploaded documents
  - Properties: `id`, `name`, `size`, `type`, `uploaded_at`, `processed_at`
- **Entity**: Represents extracted entities
  - Properties: `id`, `name`, `type`, `document_id`, `created_at`
- **Ontology**: Represents ontology metadata
  - Properties: `document_id`, `entity_count`, `relationship_count`, `created_at`

### Relationships:
- **CONTAINS**: Document → Entity
- **RELATIONSHIP**: Entity → Entity (with `type` property)

### Example Graph Structure:
```
(Document:doc_123)
    ├─[:CONTAINS]─→ (Entity:John_Smith {type: "PERSON"})
    ├─[:CONTAINS]─→ (Entity:TechCorp_Inc {type: "ORGANIZATION"})
    └─[:CONTAINS]─→ (Entity:San_Francisco {type: "LOCATION"})

(Entity:John_Smith)-[:RELATIONSHIP {type: "WORKS_FOR"}]→(Entity:TechCorp_Inc)
(Entity:TechCorp_Inc)-[:RELATIONSHIP {type: "LOCATED_IN"}]→(Entity:San_Francisco)
```

## ✅ Success Indicators

1. **Upload Response**: `"success": true` with `processing_job_id`
2. **Processing Status**: `"status": "completed"` and `"neo4j_transferred": true`
3. **Neo4j Stats**: Shows increasing counts for documents, entities, relationships
4. **Neo4j Browser**: Can query and see your data visually

## 🔄 Integration with Frontend

The frontend upload component will automatically:
1. Upload files using the Neo4j integration endpoint
2. Show real-time processing status
3. Display Neo4j transfer confirmation
4. Update dashboard with new data counts

## 📝 Next Steps

1. **Test the pipeline** with sample documents
2. **Monitor the logs** for any errors
3. **Verify data in Neo4j Browser**
4. **Use the frontend** to upload and visualize data
5. **Scale up** with larger documents once working

---

**Quick Test Command:**
```bash
# Test the complete pipeline
echo "Alice Johnson is a software engineer at DataTech Solutions." > test.txt
curl -X POST -F "file=@test.txt" http://127.0.0.1:8000/api/neo4j/upload-with-neo4j
```

This should result in entities and relationships being stored in your Neo4j database!

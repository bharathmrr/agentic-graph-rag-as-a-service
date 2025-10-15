# Complete Setup Guide - Agentic Graph RAG as a Service

## 🚀 Quick Start

This guide will help you set up the complete Agentic Graph RAG system with all backend APIs and frontend components.

## 📋 Prerequisites

### System Requirements
- **Python**: 3.9 or higher
- **Node.js**: 16 or higher
- **Neo4j**: 4.4 or higher
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 10GB free space

### Required Services
1. **OpenAI API Key** - For LLM processing
2. **Neo4j Database** - For graph storage
3. **ChromaDB** - For vector embeddings (auto-installed)

## 🛠️ Installation Steps

### Step 1: Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd agentic-graph-rag-as-a-service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 2: Install Python Dependencies

```bash
# Install all required packages
pip install -r requirements_enhanced.txt

# Download spaCy English model
python -m spacy download en_core_web_sm
```

### Step 3: Setup Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
```

**Required Environment Variables:**
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Neo4j Configuration  
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password_here

# Application Configuration
APP_HOST=0.0.0.0
APP_PORT=8000
```

### Step 4: Setup Neo4j Database

#### Option A: Docker (Recommended)
```bash
# Run Neo4j in Docker
docker run \
    --name neo4j-agentic-rag \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -v $HOME/neo4j/data:/data \
    -v $HOME/neo4j/logs:/logs \
    -v $HOME/neo4j/import:/var/lib/neo4j/import \
    -v $HOME/neo4j/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/your_password_here \
    neo4j:latest
```

#### Option B: Local Installation
1. Download Neo4j Desktop from https://neo4j.com/download/
2. Create a new database
3. Set password and start the database
4. Note the connection details (usually bolt://localhost:7687)

### Step 5: Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Build frontend for production (optional)
npm run build
```

### Step 6: Run System Check

```bash
# Navigate back to root directory
cd ..

# Run comprehensive system check
python src/llm_check.py
```

This will verify:
- ✅ All Python packages installed
- ✅ OpenAI API connection
- ✅ Neo4j database connection
- ✅ ChromaDB functionality
- ✅ ML models loaded
- ✅ All API endpoints working

### Step 7: Start the Backend Server

```bash
# Start the enhanced FastAPI server
python src/main_enhanced.py
```

The server will start on `http://localhost:8000`

### Step 8: Start the Frontend (Development)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🧪 Testing the System

### 1. Upload Test Document

1. Open `http://localhost:3000` in your browser
2. Navigate to "Upload Documents"
3. Upload a text file or PDF
4. Watch real-time processing progress

### 2. Explore Generated Ontology

1. Go to "Ontology Generator" module
2. View extracted entities and relationships
3. Check entity counts and statistics

### 3. Test Entity Resolution

1. Open "Entity Resolution" module
2. View duplicate detection results
3. Review confidence scores

### 4. Explore Knowledge Graph

1. Navigate to "Graph Constructor"
2. View interactive graph visualization
3. Test drag, zoom, and filtering

### 5. Try Semantic Search

1. Go to "Embedding Generator"
2. Enter search queries
3. View similarity results

### 6. Chat with RAG Bot

1. Open "Reasoning Stream"
2. Ask questions about your documents
3. View reasoning steps and sources

## 📊 API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload documents |
| `/api/ontology/generate` | POST | Generate ontology |
| `/api/entity-resolution/detect-duplicates` | POST | Detect duplicate entities |
| `/api/embeddings/search` | GET | Semantic search |
| `/api/graph/visualization` | GET | Graph visualization data |
| `/api/reasoning/query` | POST | RAG query processing |
| `/api/pipeline/process-document` | POST | Complete pipeline |
| `/api/sse/progress` | GET | Real-time updates |

### API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔧 Configuration Options

### Upload Settings
```env
MAX_FILE_SIZE=104857600  # 100MB
ALLOWED_FILE_TYPES=txt,pdf,doc,docx,md,json,csv
```

### Processing Settings
```env
MAX_CHUNK_SIZE=1000
CHUNK_OVERLAP=100
SIMILARITY_THRESHOLD=0.7
```

### Model Settings
```env
EMBEDDING_MODEL=all-MiniLM-L6-v2
OPENAI_MODEL=gpt-3.5-turbo
```

## 🚨 Troubleshooting

### Common Issues

#### 1. OpenAI API Errors
```bash
# Check API key
echo $OPENAI_API_KEY

# Test connection
python -c "from openai import OpenAI; print(OpenAI().models.list())"
```

#### 2. Neo4j Connection Issues
```bash
# Check Neo4j status
docker ps | grep neo4j

# Test connection
python -c "from neo4j import GraphDatabase; driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'password')); driver.verify_connectivity(); print('Connected!')"
```

#### 3. spaCy Model Missing
```bash
# Download English model
python -m spacy download en_core_web_sm

# Verify installation
python -c "import spacy; nlp = spacy.load('en_core_web_sm'); print('Model loaded!')"
```

#### 4. Frontend Connection Issues
- Check if backend is running on port 8000
- Verify CORS settings in main_enhanced.py
- Check browser console for errors

#### 5. Memory Issues
- Reduce `MAX_CHUNK_SIZE` in .env
- Limit concurrent processing
- Increase system RAM or use swap

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=DEBUG
APP_DEBUG=true
```

View logs:
```bash
tail -f logs/agentic_rag.log
```

## 📈 Performance Optimization

### Backend Optimization
1. **Use GPU for embeddings** (if available)
2. **Increase worker processes** for FastAPI
3. **Enable Redis caching** for frequent queries
4. **Optimize Neo4j memory settings**

### Frontend Optimization
1. **Enable production build**: `npm run build`
2. **Use CDN for static assets**
3. **Enable gzip compression**
4. **Implement lazy loading**

## 🔒 Security Considerations

### Production Deployment
1. **Change default passwords**
2. **Use HTTPS certificates**
3. **Configure firewall rules**
4. **Enable authentication**
5. **Set up monitoring**

### Environment Security
```env
# Production settings
APP_DEBUG=false
CORS_ORIGINS=https://yourdomain.com
SECRET_KEY=your_production_secret_key
```

## 📦 Docker Deployment

### Complete Docker Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  neo4j:
    image: neo4j:latest
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/password
    volumes:
      - neo4j_data:/data

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEO4J_URI=bolt://neo4j:7687
    depends_on:
      - neo4j

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  neo4j_data:
```

### Deploy with Docker
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🎯 Usage Examples

### 1. Process Academic Paper
```python
# Upload research paper
# System extracts: authors, institutions, concepts, methodologies
# Creates knowledge graph of research relationships
```

### 2. Analyze Business Documents
```python
# Upload company reports
# System identifies: people, organizations, products, relationships
# Enables semantic search across documents
```

### 3. Build Knowledge Base
```python
# Upload multiple documents
# System creates unified knowledge graph
# Supports intelligent Q&A with citations
```

## 🔄 Updates and Maintenance

### Regular Maintenance
1. **Update dependencies**: `pip install -r requirements_enhanced.txt --upgrade`
2. **Backup Neo4j data**: Regular database backups
3. **Monitor disk space**: ChromaDB and uploads directory
4. **Check logs**: Review error logs regularly

### System Updates
1. **Pull latest code**: `git pull origin main`
2. **Update dependencies**: `pip install -r requirements_enhanced.txt`
3. **Run migrations**: If database schema changes
4. **Restart services**: `docker-compose restart`

## 📞 Support

### Getting Help
1. **Check logs**: `tail -f logs/agentic_rag.log`
2. **Run system check**: `python src/llm_check.py`
3. **Review documentation**: `/docs` endpoint
4. **Check GitHub issues**: For known problems

### Reporting Issues
Include:
- System check output
- Error logs
- Environment details
- Steps to reproduce

## 🎉 Success!

If all steps completed successfully, you now have:

✅ **Complete Backend API** - All modules working
✅ **Modern Frontend** - Dark theme with animations  
✅ **Real-time Processing** - SSE updates
✅ **Knowledge Graph** - Interactive visualization
✅ **RAG Chatbot** - Intelligent Q&A
✅ **Production Ready** - Scalable architecture

Your Agentic Graph RAG system is ready for production use!

## 📚 Next Steps

1. **Customize UI** - Modify frontend components
2. **Add Authentication** - Implement user management
3. **Scale Infrastructure** - Add load balancing
4. **Monitor Performance** - Set up analytics
5. **Extend Functionality** - Add custom modules

Happy building! 🚀

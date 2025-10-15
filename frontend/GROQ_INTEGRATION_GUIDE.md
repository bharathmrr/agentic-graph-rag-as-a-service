# 🚀 Groq Integration Guide for Agentic Graph RAG

## Overview

This guide covers the integration of **Groq's high-speed LLM inference** with your Agentic Graph RAG system, providing lightning-fast entity extraction, embeddings, and conversational AI capabilities.

## 🎯 Features Implemented

### ✅ **Core Components**
- **Groq LLM Integration** - Ultra-fast inference with Llama 3 models
- **HuggingFace Embeddings** - High-quality semantic embeddings
- **Entity Extraction** - AI-powered entity and relationship detection
- **RAG Pipeline** - Retrieval-augmented generation with streaming
- **Agentic Chat** - Intelligent conversational AI with reasoning

### ✅ **Key Capabilities**
- 🔍 **Entity Finding** - Extract entities from any text with confidence scores
- 📊 **Similarity Search** - Find related entities using semantic embeddings
- 🧠 **Reasoning Chain** - Visualize AI decision-making process
- ⚡ **Streaming Responses** - Real-time response generation
- 🔄 **Multi-Model Support** - Switch between Llama 3 8B, 70B, and Mixtral

## 🛠️ Installation & Setup

### 1. **Install Dependencies**
```bash
# Run the automated setup script
python setup_groq.py

# Or install manually
pip install llama-index-core llama-index-llms-groq llama-index-embeddings-huggingface
pip install transformers sentence-transformers torch groq spacy
python -m spacy download en_core_web_sm
```

### 2. **Get Groq API Key**
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Generate your API key
4. Add to environment:

```bash
# Create .env file or add to existing
GROQ_API_KEY=your_groq_api_key_here
```

### 3. **Start the System**
```bash
# Backend
cd src/api
python main.py

# Frontend  
cd frontend
npm start
```

## 📡 API Endpoints

### **Groq Service Management**
```http
POST /api/groq/initialize
GET  /api/groq/status
GET  /api/groq/health
```

### **Entity Extraction**
```http
POST /api/groq/entities/extract
POST /api/groq/entities/similar
```

### **RAG & Chat**
```http
POST /api/groq/rag/query
POST /api/groq/rag/stream
POST /api/groq/chat/agentic
```

### **Document Processing**
```http
POST /api/groq/index/create
DELETE /api/groq/index/clear
```

## 💻 Usage Examples

### **1. Entity Extraction**
```python
import asyncio
from backend.services.groq_integration import create_groq_rag_service

async def extract_entities():
    service = create_groq_rag_service()
    
    text = "Apple Inc. was founded by Steve Jobs in Cupertino, California."
    result = await service.extract_entities_with_groq(text)
    
    print(f"Found {len(result.entities)} entities:")
    for entity in result.entities:
        print(f"- {entity['text']} ({entity['type']})")
```

### **2. RAG Query**
```python
async def rag_query():
    service = create_groq_rag_service()
    
    # Create index from documents
    documents = [
        "The Language Processing Unit (LPU) is designed by Groq for AI acceleration.",
        "RAG systems combine retrieval with generation for better responses."
    ]
    await service.create_index_from_documents(documents)
    
    # Query the system
    response = await service.query_with_rag("What is an LPU?")
    print(f"Answer: {response.answer}")
    print(f"Confidence: {response.confidence_score}")
```

### **3. Frontend Integration**
```javascript
// Initialize Groq service
const initGroq = async () => {
  const response = await fetch('/api/groq/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      embedding_model: 'BAAI/bge-small-en-v1.5'
    })
  });
  return response.json();
};

// Extract entities
const extractEntities = async (text) => {
  const response = await fetch('/api/groq/entities/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.json();
};

// Agentic chat
const agenticChat = async (query) => {
  const response = await fetch('/api/groq/chat/agentic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query,
      include_entities: true 
    })
  });
  return response.json();
};
```

## 🎨 Frontend Components

### **GroqAgenticChatBot.jsx**
- **Real-time chat interface** with Groq-powered responses
- **Entity visualization** with color-coded entity types
- **Reasoning chain display** showing AI decision steps
- **Streaming support** for real-time response generation
- **Model selection** between different Groq models
- **Export functionality** for chat history

### **Key Features:**
- 🎯 **Smart Entity Detection** - Automatically finds entities in conversations
- 🔄 **Streaming Responses** - See responses as they're generated
- 🧠 **Reasoning Visualization** - Understand how AI makes decisions
- ⚙️ **Configurable Settings** - Switch models and adjust parameters
- 📱 **Responsive Design** - Works on desktop and mobile

## 🔧 Configuration Options

### **Groq Models Available:**
```javascript
const models = [
  {
    id: "llama3-8b-8192",
    name: "Llama 3 8B",
    description: "Fast and efficient",
    recommended: true
  },
  {
    id: "llama3-70b-8192", 
    name: "Llama 3 70B",
    description: "High quality responses"
  },
  {
    id: "mixtral-8x7b-32768",
    name: "Mixtral 8x7B",
    description: "Large context window"
  }
];
```

### **Embedding Models:**
```javascript
const embeddingModels = [
  "BAAI/bge-small-en-v1.5",  // Fast, 384 dimensions
  "BAAI/bge-base-en-v1.5",   // Balanced, 768 dimensions
  "sentence-transformers/all-MiniLM-L6-v2"  // Lightweight
];
```

### **Performance Tuning:**
```python
config = GroqConfig(
    api_key="your-key",
    model="llama3-8b-8192",
    chunk_size=512,           # Adjust for your documents
    chunk_overlap=20,         # Context preservation
    similarity_threshold=0.7, # Retrieval quality
    temperature=0.1,          # Response creativity
    max_tokens=2048          # Response length
)
```

## 🚀 Performance Benefits

### **Speed Comparison:**
- **Traditional LLM**: 2-5 seconds per response
- **Groq LLM**: 50-200ms per response (10-100x faster!)

### **Use Cases:**
- ✅ **Real-time chat** - Instant responses
- ✅ **Batch processing** - Process thousands of documents quickly
- ✅ **Interactive demos** - No waiting for users
- ✅ **Production systems** - Handle high traffic

## 🔍 Entity Types Supported

The system automatically detects and categorizes:

- 👤 **PERSON** - Names of individuals
- 🏢 **ORGANIZATION** - Companies, institutions
- 📍 **LOCATION** - Places, addresses, regions
- 💻 **TECHNOLOGY** - Software, hardware, tools
- 💡 **CONCEPT** - Abstract ideas, methodologies

## 🛡️ Error Handling & Fallbacks

### **Robust Error Management:**
```python
# Automatic fallbacks
if groq_service_unavailable:
    fallback_to_openai()
    
if api_key_invalid:
    show_configuration_help()
    
if rate_limit_exceeded:
    implement_exponential_backoff()
```

### **Graceful Degradation:**
- Missing API key → Show setup instructions
- Network issues → Retry with backoff
- Model unavailable → Switch to alternative
- Parsing errors → Return partial results

## 📊 Monitoring & Analytics

### **Built-in Metrics:**
- Response time tracking
- Entity extraction accuracy
- Confidence score analysis
- Usage statistics
- Error rate monitoring

### **Dashboard Integration:**
All metrics are displayed in the main dashboard with real-time updates.

## 🔄 Integration with Existing System

### **Seamless Integration:**
- Works alongside existing OpenAI/Ollama integrations
- Shares the same ChromaDB and Neo4j instances
- Compatible with existing document processing pipeline
- Maintains conversation history and context

### **Migration Path:**
1. Install Groq dependencies
2. Add API key to environment
3. Enable Groq module in dashboard
4. Gradually migrate workloads

## 🎯 Best Practices

### **For Optimal Performance:**
1. **Use appropriate chunk sizes** (512-1024 tokens)
2. **Batch similar requests** when possible
3. **Cache frequent queries** to reduce API calls
4. **Monitor rate limits** and implement backoff
5. **Use streaming** for real-time applications

### **For Better Results:**
1. **Provide clear context** in queries
2. **Use specific entity types** when known
3. **Combine with graph data** for richer responses
4. **Validate entity extractions** before storage
5. **Fine-tune similarity thresholds** per use case

## 🆘 Troubleshooting

### **Common Issues:**

**Q: "Groq API key not found"**
A: Add `GROQ_API_KEY=your-key` to your environment variables

**Q: "Import error: llama-index-llms-groq"**
A: Run `pip install llama-index-llms-groq>=0.1.0`

**Q: "Slow response times"**
A: Check your internet connection and Groq service status

**Q: "Entity extraction returning empty results"**
A: Verify your text has clear entities and adjust confidence thresholds

**Q: "Frontend not showing Groq module"**
A: Ensure backend is running and Groq routes are loaded

## 📚 Additional Resources

- [Groq Documentation](https://docs.groq.com/)
- [LlamaIndex Groq Integration](https://docs.llamaindex.ai/en/stable/examples/llm/groq/)
- [HuggingFace Embeddings](https://huggingface.co/models?pipeline_tag=sentence-similarity)
- [Agentic RAG Patterns](https://github.com/run-llama/llama_index/tree/main/docs/examples/agent)

## 🎉 Success! 

You now have a **lightning-fast, AI-powered entity extraction and RAG system** integrated into your Agentic Graph RAG platform! 

The Groq integration provides:
- ⚡ **10-100x faster** response times
- 🔍 **Advanced entity detection** with confidence scoring
- 🧠 **Transparent reasoning** chains
- 🔄 **Real-time streaming** responses
- 📊 **Rich analytics** and monitoring

Navigate to the **"Groq Agentic AI"** module in your dashboard to start using these powerful capabilities!

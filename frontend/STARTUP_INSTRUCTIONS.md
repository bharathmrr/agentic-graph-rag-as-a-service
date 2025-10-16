# 🚀 Agentic Graph RAG - Startup Instructions

## Quick Start Options

### Option 1: Start Everything at Once
```bash
# Windows Batch
start_all.bat

# Windows PowerShell
.\start_all.ps1
```

### Option 2: Start Backend and Frontend Separately

#### Backend Server (Terminal 1)
```bash
# Windows Batch
runserver.bat

# Windows PowerShell
.\runserver.ps1

# Or directly with Python
python runserver.py
```

#### Frontend Server (Terminal 2)
```bash
# Windows Batch
start_frontend.bat

# Windows PowerShell
.\start_frontend.ps1

# Or manually
cd frontend
npm start
```

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/health

## 🎯 Features Implemented

### ✅ Upload File Generator Alert
- Shows beautiful alert when trying to access modules without uploading files
- Guides users through the processing pipeline
- Directs to upload module

### ✅ Beautiful Data Display
- Modern, animated data visualization after upload
- Interactive tabs (Overview, Entities, Relationships, Analytics)
- Real-time metrics and statistics
- Professional glass-morphism design

### ✅ Core Modules Integration
- Upload alert prevents access to modules without files
- Beautiful data display after successful upload
- Explore functionality with modern data visualization

## 🔧 Backend Features

- **FastAPI Server**: High-performance async API
- **Real-time Processing**: SSE for live updates
- **Document Processing**: PDF, TXT, DOC support
- **AI Integration**: OpenAI for ontology generation
- **Graph Database**: Neo4j for knowledge graphs
- **Vector Database**: ChromaDB for embeddings

## 🎨 Frontend Features

- **React Application**: Modern component-based UI
- **Animated Backgrounds**: Stars and glowing effects
- **Glass-morphism Design**: Transparent, blurred elements
- **Responsive Layout**: Works on all screen sizes
- **Real-time Updates**: Live processing status
- **Professional Branding**: LYzr AI integration

## 🚀 Usage Flow

1. **Start Servers**: Run `start_all.bat` or `start_all.ps1`
2. **Open Browser**: Navigate to http://localhost:3000
3. **Upload Documents**: Click "Upload Documents" module
4. **Process Files**: Upload and wait for processing
5. **View Results**: Beautiful data display appears
6. **Explore Modules**: Access all core modules
7. **Knowledge Graph**: Interactive graph visualization

## 🛠️ Troubleshooting

### Backend Issues
- Check if port 8000 is available
- Ensure Python dependencies are installed
- Verify test_server.py exists

### Frontend Issues
- Check if port 3000 is available
- Ensure Node.js and npm are installed
- Run `npm install` in frontend directory

### Connection Issues
- Backend must be running on 127.0.0.1:8000
- Frontend must be running on localhost:3000
- Check firewall settings

## 📊 System Requirements

- **Python 3.8+**
- **Node.js 16+**
- **npm 8+**
- **8GB RAM** (recommended)
- **Windows 10/11**

## 🎉 Success!

Once both servers are running, you'll have:
- ✅ Professional upload interface with stars background
- ✅ Beautiful data display after upload
- ✅ Upload alerts for module access
- ✅ Modern knowledge graph visualization
- ✅ Real-time processing updates

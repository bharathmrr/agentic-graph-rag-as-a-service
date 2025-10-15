# 🔧 Dependency Installation Fix Guide

## ✅ **ISSUE RESOLVED: LangChain Dependency Conflicts**

The dependency conflicts have been fixed by updating to compatible versions.

## 🚀 **Step-by-Step Installation**

### **1. Clean Installation (Recommended)**
```bash
# Create a fresh virtual environment
python -m venv venv
venv\Scripts\activate

# Upgrade pip first
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### **2. If You Have Existing Environment**
```bash
# Activate your environment
venv\Scripts\activate

# Uninstall conflicting packages
pip uninstall langchain langchain-community langchain-openai -y

# Clear pip cache
pip cache purge

# Install fresh dependencies
pip install -r requirements.txt
```

### **3. Alternative: Install Without Version Constraints**
```bash
# If you still get conflicts, try this:
pip install --upgrade --force-reinstall -r requirements.txt
```

## 🔍 **What Was Fixed**

### **Before (Conflicting)**
```
langchain==0.0.350
langchain-community==0.0.1  # ❌ Conflict!
langchain-openai==0.0.2
```

### **After (Compatible)**
```
langchain>=0.1.0
langchain-community>=0.0.10  # ✅ Compatible!
langchain-openai>=0.0.5
```

## 🛠️ **Troubleshooting Common Issues**

### **Issue 1: NumPy Compilation Error on Windows**
```bash
# Error: "Unknown compiler(s): [['icl'], ['cl'], ['cc'], ['gcc']..."
# Solution: Install pre-compiled wheel
pip install numpy --only-binary=all
```

### **Issue 2: PyTorch Installation Issues**
```bash
# For CPU-only version (faster install)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# For GPU version (if you have CUDA)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### **Issue 3: ChromaDB Installation Issues**
```bash
# If ChromaDB fails to install
pip install chromadb --no-deps
pip install -r requirements.txt
```

### **Issue 4: spaCy Model Download**
```bash
# After installation, download spaCy model
python -m spacy download en_core_web_sm
```

## 📋 **Verification Steps**

### **1. Test Basic Imports**
```python
# test_imports.py
try:
    import fastapi
    import langchain
    import langchain_community
    import langchain_openai
    import chromadb
    import neo4j
    print("✅ All imports successful!")
except ImportError as e:
    print(f"❌ Import error: {e}")
```

### **2. Test LangChain Compatibility**
```python
# test_langchain.py
from langchain.llms import OpenAI
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
print("✅ LangChain ecosystem working!")
```

### **3. Run Backend Tests**
```bash
cd backend
python test_basic.py
```

## 🎯 **Next Steps After Installation**

### **1. Environment Variables**
```bash
# Copy environment template
copy environment.env .env

# Edit with your API keys
notepad .env
```

### **2. Start Services**
```bash
# Start databases first
docker-compose up -d neo4j chromadb

# Start backend
cd backend
python -m uvicorn main:app --reload

# Start frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### **3. Verify Everything Works**
- Backend API: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Neo4j Browser: http://localhost:7474
- ChromaDB: http://localhost:8001

## 🚨 **If You Still Have Issues**

### **Nuclear Option: Complete Reset**
```bash
# Remove virtual environment
rmdir /s venv

# Create fresh environment
python -m venv venv
venv\Scripts\activate

# Install one by one to identify issues
pip install fastapi
pip install langchain
pip install langchain-community
pip install chromadb
# ... continue with others
```

### **Alternative: Use Conda**
```bash
# If pip continues to have issues
conda create -n agentic python=3.9
conda activate agentic
conda install -c conda-forge fastapi uvicorn
pip install -r requirements.txt
```

## 📞 **Getting Help**

If you encounter issues:

1. **Check Python Version**: Ensure you're using Python 3.9-3.11
2. **Check pip Version**: `pip --version` (should be 23.0+)
3. **Check Virtual Environment**: Make sure it's activated
4. **Check System**: Windows may need Visual C++ Build Tools

### **Useful Commands**
```bash
# Check installed packages
pip list

# Check for conflicts
pip check

# Show package info
pip show langchain

# Install with verbose output
pip install -v langchain
```

---
**🎉 Your dependencies should now install successfully!**

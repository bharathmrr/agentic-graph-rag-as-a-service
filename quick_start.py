"""
Quick Start Script - Optimized for Fast Startup
Starts the backend API with minimal overhead
"""
import uvicorn
import sys
import os

# Set UTF-8 encoding for Windows console
if sys.platform == "win32":
    os.environ["PYTHONIOENCODING"] = "utf-8"

def main():
    print("Starting Agentic Graph RAG Backend (Fast Mode)")
    print("=" * 50)
    
    uvicorn.run(
        "src.api.main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,      # Disable auto-reload for speed
        workers=1,         # Single worker for development
        log_level="info",  # Reduced logging
        access_log=False   # Disable access logs for speed
    )

if __name__ == "__main__":
    main()

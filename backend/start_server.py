import uvicorn
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from utils.logger import pipeline_logger
from utils.system_checker import system_checker


def check_system_requirements():
    """Check all system requirements before starting server"""
    print("🔍 Checking System Requirements...")
    pipeline_logger.log_pipeline_start("System Requirements Check")

    # Check all requirements
    results = system_checker.check_all_requirements()

    # Display results
    print(f"\n📋 System Check Results:")
    print(
        f"Python: {results['python']['info']} {'✅' if results['python']['status'] else '❌'}"
    )

    print(f"\n📦 Package Status:")
    for package, info in results["packages"].items():
        status_icon = "✅" if info["status"] else "❌"
        print(f"  {package}: {info['info']} {status_icon}")

    # Check services
    print(f"\n🔧 Service Status:")

    # LLM Check
    llm_ok, llm_msg = system_checker.check_llm_connectivity()
    print(f"  LLM: {llm_msg}")

    # Embedding Check
    embed_ok, embed_msg = system_checker.check_embedding_service()
    print(f"  Embeddings: {embed_msg}")

    # Neo4j Check
    neo4j_ok, neo4j_msg = system_checker.check_neo4j_connection()
    print(f"  Neo4j: {neo4j_msg}")

    if not results["overall_status"]:
        print(f"\n❌ System check failed! Please install missing requirements:")
        print(f"Run: pip install -r requirements.txt")
        pipeline_logger.log_pipeline_error(
            "System Requirements Check", "Missing requirements"
        )
        return False

    print(f"\n✅ All system requirements satisfied!")
    pipeline_logger.log_pipeline_success(
        "System Requirements Check", "All requirements met"
    )
    return True


def start_server():
    """Start the FastAPI server with full logging"""
    print("🚀 Starting Agentic Graph RAG Server...")
    pipeline_logger.log_pipeline_start("Server Startup")

    # Check system requirements first
    if not check_system_requirements():
        print("❌ Server startup failed due to missing requirements")
        sys.exit(1)

    try:
        print(f"\n🌟 Starting FastAPI server on http://localhost:8000")
        print(f"📊 Dashboard: http://localhost:3000")
        print(f"📖 API Docs: http://localhost:8000/docs")
        print(f"📝 Logs: backend/logs/")

        pipeline_logger.log_pipeline_success(
            "Server Startup", "Server starting on port 8000"
        )

        # Start the server
        uvicorn.run(
            "main:app", host="0.0.0.0", port=8000, reload=True, log_level="info"
        )

    except Exception as e:
        pipeline_logger.log_pipeline_error("Server Startup", str(e))
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    start_server()

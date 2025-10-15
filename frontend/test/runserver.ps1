# PowerShell script to run the backend server
Write-Host "🚀 Starting Agentic Graph RAG Backend Server..." -ForegroundColor Green
Write-Host "📍 Server will run on: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "📊 API Documentation: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "🔍 Health Check: http://127.0.0.1:8000/health" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

try {
    python runserver.py
} catch {
    Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}

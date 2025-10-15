# PowerShell script to start the frontend
Write-Host "🎨 Starting Agentic Graph RAG Frontend..." -ForegroundColor Green
Write-Host "📍 Frontend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 Make sure backend is running on: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

try {
    Set-Location frontend
    npm start
} catch {
    Write-Host "❌ Error starting frontend: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}

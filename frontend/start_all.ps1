# PowerShell script to start both backend and frontend
Write-Host "🚀 Starting Agentic Graph RAG Full Stack Application..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend: http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python runserver.py" -WindowStyle Normal

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🎨 Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host "📍 Open your browser to: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"

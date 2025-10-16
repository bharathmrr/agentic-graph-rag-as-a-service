#!/usr/bin/env pwsh
# Docker Build Test Script for Agentic Graph RAG

Write-Host "🐳 Testing Docker Builds for Agentic Graph RAG" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Test Backend Build
Write-Host "`n🏗️ Testing Backend Docker Build..." -ForegroundColor Yellow
try {
    Set-Location "backend"
    docker build -t agentic-graph-rag-backend:test --target production .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend build error: $_" -ForegroundColor Red
    exit 1
} finally {
    Set-Location ".."
}

# Test Frontend Build
Write-Host "`n🎨 Testing Frontend Docker Build..." -ForegroundColor Yellow
try {
    Set-Location "frontend"
    docker build -t agentic-graph-rag-frontend:test --target production .
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Frontend build error: $_" -ForegroundColor Red
    exit 1
} finally {
    Set-Location ".."
}

# Test Images
Write-Host "`n📋 Built Images:" -ForegroundColor Cyan
docker images | Select-String "agentic-graph-rag"

Write-Host "`n🎉 All Docker builds completed successfully!" -ForegroundColor Green
Write-Host "You can now push to GitHub and the CI/CD pipeline should work." -ForegroundColor Green

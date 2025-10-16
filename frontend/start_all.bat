@echo off
echo 🚀 Starting Agentic Graph RAG Full Stack Application...
echo.
echo 📍 Backend: http://127.0.0.1:8000
echo 📍 Frontend: http://localhost:3000
echo 📊 API Docs: http://127.0.0.1:8000/docs
echo ==================================================
echo.

echo 🔧 Starting Backend Server...
start "Backend Server" cmd /k "python runserver.py"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 🎨 Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo ✅ Both servers are starting...
echo 📍 Open your browser to: http://localhost:3000
echo.
pause

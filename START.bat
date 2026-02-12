@echo off
echo Starting Backend...
start "Backend Server" cmd /k "cd backend && pip install -r requirements.txt && python app.py"

echo Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm install && npm run dev"

echo Both servers are starting...
echo Backend: http://127.0.0.1:5000
echo Frontend: http://localhost:5173
pause

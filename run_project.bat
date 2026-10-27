@echo off
title Personal Expense Tracker Launcher
color 0b

echo =========================================================
echo       Starting Personal Expense Tracker (MERN)
echo =========================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Backend Server on port 5000...
start "Backend Server (Port 5000)" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Frontend Server on port 3000...
start "Frontend App (Port 3000)" cmd /k "cd frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo =========================================================
echo Both servers are running! You can minimize this window.
echo Close the individual terminal windows to stop the servers.
echo =========================================================
pause

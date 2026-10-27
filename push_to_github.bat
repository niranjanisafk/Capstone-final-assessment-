@echo off
title Push to GitHub Repository
color 0a

echo ======================================================================
echo    Pushing Personal Expense Tracker to GitHub Repository:
echo    https://github.com/niranjanisafk/Capstone-final-assessment-
echo ======================================================================
echo.

cd /d "%~dp0"

where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Git command-line tool is not installed or not in your system PATH.
    echo.
    echo Please follow either of these 2 quick solutions:
    echo.
    echo 1. Install Git for Windows:
    echo    https://git-scm.com/download/win
    echo    (Once installed, double-click this script again!)
    echo.
    echo 2. OR use GitHub Desktop (Drag and Drop):
    echo    Download: https://desktop.github.com/
    echo    File -^> Add Local Repository -^> Choose this folder -^> Publish!
    echo.
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
git init

echo [2/5] Staging project files (frontend, backend, configs, .env)...
git add .

echo [3/5] Creating commit...
git commit -m "Complete Personal Expense Tracker MERN Stack Project"

echo [4/5] Setting main branch...
git branch -M main

echo [5/5] Connecting to remote and pushing...
git remote remove origin 2>nul
git remote add origin https://github.com/niranjanisafk/Capstone-final-assessment-.git

echo.
echo Pushing files to main branch...
git push -u origin main

echo.
echo ======================================================================
echo Done! Verify your repository at:
echo https://github.com/niranjanisafk/Capstone-final-assessment-
echo ======================================================================
pause

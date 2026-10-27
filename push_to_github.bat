@echo off
title Push to https://github.com/niranjanisafk/Capstone-final-assessment-
color 0b

echo =======================================================================
echo    Push to: https://github.com/niranjanisafk/Capstone-final-assessment-
echo =======================================================================
echo.

cd /d "%~dp0"

echo Your local repository is already initialized and all 35 files committed!
echo.
echo To authenticate and push to your GitHub repo, enter your
echo GitHub Personal Access Token below:
echo (Create one in 30 seconds at: https://github.com/settings/tokens)
echo.
set /p TOKEN="Enter your GitHub Token: "

if "%TOKEN%"=="" (
    echo [!] No token entered. Exiting.
    pause
    exit /b
)

echo.
echo Pushing commit to GitHub...
node isogit_push.js %TOKEN%

echo.
pause

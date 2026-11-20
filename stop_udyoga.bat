@echo off
title Stop UDYOGA Platform

echo =====================================================================
echo  Stopping UDYOGA Backend (Port 8000) and Frontend (Port 5173)...
echo =====================================================================
echo.

:: Kill process listening on port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":8000.*LISTENING"') do (
    echo Stopping backend process PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

:: Kill process listening on port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":5173.*LISTENING"') do (
    echo Stopping frontend process PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo All UDYOGA services have been stopped.
timeout /t 2 /nobreak >nul

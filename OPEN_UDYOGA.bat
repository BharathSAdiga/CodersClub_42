@echo off
setlocal enabledelayedexpansion
title UDYOGA — Platform Live Console

echo =====================================================================
echo          UDYOGA -- Beyond Credit. Beyond Barriers.
echo     AI-Powered Financial Intelligence Platform for India's MSMEs
echo =====================================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: 1. Ensure port 5173 is clean and free
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":5173.*LISTENING"') do (
    echo [*] Freeing port 5173 (closing old process PID %%a)...
    taskkill /f /pid %%a >nul 2>&1
)

:: 2. Optional: Launch Python Backend in background if available
if exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    echo [*] Starting FastAPI Backend on http://127.0.0.1:8000 ...
    start "UDYOGA Backend [FastAPI :8000]" cmd /k "cd /d ""%ROOT_DIR%"" && call .venv\Scripts\activate.bat && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
) else (
    python -c "import fastapi, uvicorn" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [*] Starting FastAPI Backend on http://127.0.0.1:8000 ...
        start "UDYOGA Backend [FastAPI :8000]" cmd /k "cd /d ""%ROOT_DIR%"" && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
    ) else (
        echo [*] Running Frontend in Standalone Engine Mode (all personas and models active).
    )
)

:: 3. Check frontend dependencies
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo [*] Installing frontend dependencies (one-time setup)...
    cd /d "%ROOT_DIR%frontend"
    call npm install
    cd /d "%ROOT_DIR%"
)

:: 4. Automatically open browser to application in 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173"

echo.
echo =====================================================================
echo  STARTING VITE DEV SERVER (LIVE CONSOLE OUTPUT BELOW)
echo  Application URL: http://localhost:5173
echo =====================================================================
echo.

:: 5. Run Vite directly in the current window to stream all live output
cd /d "%ROOT_DIR%frontend"
call npm run dev

pause

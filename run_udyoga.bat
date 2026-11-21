@echo off
setlocal enabledelayedexpansion
title UDYOGA — Platform Launcher

echo =====================================================================
echo          UDYOGA -- Beyond Credit. Beyond Barriers.
echo     AI-Powered Financial Intelligence Platform for India's MSMEs
echo =====================================================================
echo.

:: Resolve workspace root directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: 1. Check Python virtual environment
if not exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at .venv\Scripts\python.exe!
    echo Please create the virtual environment and install backend requirements.
    pause
    exit /b 1
)

:: 2. Check Node modules in frontend
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo [ERROR] Frontend dependencies not found at frontend\node_modules!
    echo Please run 'cd frontend ^&^& npm install' before launching.
    pause
    exit /b 1
)

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "UDYOGA Backend [FastAPI :8000]" cmd /k "cd /d ""%ROOT_DIR%"" && call .venv\Scripts\activate.bat && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting Vite React Frontend on http://localhost:5173 ...
start "UDYOGA Frontend [React/Vite :5173]" cmd /k "cd /d ""%ROOT_DIR%frontend"" && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo =====================================================================
echo  UDYOGA IS NOW RUNNING!
echo =====================================================================
echo.
echo  * Web Application:     http://localhost:5173
echo  * Interactive API Docs: http://127.0.0.1:8000/docs
echo  * Database:            SQLite WAL Mode (udyoga.db)
echo.
echo ---------------------------------------------------------------------
echo  PRELOADED 1-CLICK DEMO PERSONAS
echo ---------------------------------------------------------------------
echo  1. Ramesh Kumar (Micro Borrower):     ramesh  / password123
echo  2. Priya Patel (Growth Borrower):      priya   / password123
echo  3. Vikram Malhotra (Credit Officer):   vikram  / password123
echo  4. Dr. Ananya Sharma (Ethics Auditor): auditor / password123
echo  5. Platform Admin (Super Admin):       admin   / adminpassword123
echo.
echo  Opening http://localhost:5173 in your default browser...
start http://localhost:5173

echo.
echo  To stop the servers, close the backend and frontend terminal windows,
echo  or double-click 'stop_udyoga.bat'.
echo =====================================================================
echo.
pause

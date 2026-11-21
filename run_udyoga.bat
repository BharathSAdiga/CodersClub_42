@echo off
setlocal enabledelayedexpansion
title UDYOGA — Platform Launcher

echo =====================================================================
echo          UDYOGA -- Beyond Credit. Beyond Barriers.
echo     AI-Powered Financial Intelligence Platform for India's MSMEs
echo =====================================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: Check if port 5173 is already running
netstat -aon | findstr /r ":5173.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] UDYOGA is already running on http://localhost:5173!
    echo Opening browser...
    start http://localhost:5173
    goto :done
)

:: 1. Check Python Backend availability
set "HAS_BACKEND=0"
if exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    set "HAS_BACKEND=1"
    echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
    start "UDYOGA Backend [FastAPI :8000]" cmd /k "cd /d ""%ROOT_DIR%"" && call .venv\Scripts\activate.bat && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
) else (
    python -c "import fastapi, uvicorn" >nul 2>&1
    if !errorlevel! equ 0 (
        set "HAS_BACKEND=1"
        echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
        start "UDYOGA Backend [FastAPI :8000]" cmd /k "cd /d ""%ROOT_DIR%"" && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"
    ) else (
        echo [1/3] Python backend not detected - Running in Standalone Engine Mode (All personas active).
    )
)

:: 2. Check frontend dependencies
if not exist "%ROOT_DIR%frontend\node_modules" (
    echo [2/3] Installing frontend dependencies (one-time setup)...
    cd /d "%ROOT_DIR%frontend"
    call npm install
    cd /d "%ROOT_DIR%"
)

:: 3. Start Frontend
echo [2/3] Launching UDYOGA Frontend Application...
start "UDYOGA Frontend [Vite :5173]" cmd /k "cd /d ""%ROOT_DIR%frontend"" && npm run dev"

:: 4. Wait & Open Browser
echo [3/3] Initializing platform services...
timeout /t 3 /nobreak >nul

echo.
echo =====================================================================
echo  UDYOGA APPLICATION LAUNCHED!
echo =====================================================================
echo.
echo  * Web Application URL:   http://localhost:5173
if "!HAS_BACKEND!"=="1" (
    echo  * Backend API Docs:      http://127.0.0.1:8000/docs
)
echo.
echo ---------------------------------------------------------------------
echo  PRE-CONFIGURED 1-CLICK PERSONAS AVAILABLE IN APP:
echo ---------------------------------------------------------------------
echo  * Ramu Kirana (Micro Retailer)       - Zero-collateral flow underwriting
echo  * Priya Patel (Small Manufacturer)    - Export invoice discounting
echo  * Vikram Deshmukh (Credit Officer)    - Underwriter workbench
echo  * Dr. Sunita Rao (Statutory Auditor)  - 7-Step algorithmic fairness trace
echo  * Rajiv Mehta (Platform Admin)        - System health & audit logs
echo ---------------------------------------------------------------------
echo.
echo Opening http://localhost:5173 in your default browser...
start http://localhost:5173

:done
echo.
echo To close the application, run 'stop_udyoga.bat' or close the terminal windows.
echo =====================================================================
echo.
pause

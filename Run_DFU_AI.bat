@echo off
title DFU-AI Health Systems - Clinical Decision-Support Enterprise
cls
echo ================================================================
echo       DFU-AI HEALTH: Enterprise Clinical AI Platform v2.5
echo       Diabetic Limb Preservation & Wagner Staging Suite
echo       Academic Major Project (600 Marks Distinction)
echo ================================================================
echo.
cd /d "%~dp0"

echo [1/3] Verifying Python virtual environment...
if exist "backend\venv\Scripts\python.exe" (
    echo       [OK] Found dedicated virtual environment at backend\venv
    set "PY_CMD=backend\venv\Scripts\python.exe"
) else (
    echo       [INFO] Dedicated venv not found. Using system python...
    set "PY_CMD=python"
)

echo.
echo [2/3] Preparing Unified Healthcare Server (Port 8000)...
:: Free port 8000 if already held by previous instance
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

start "DFU-AI Medical Server (Port 8000)" cmd /k "%PY_CMD% -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

echo       Waiting for clinical inference engine to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [3/3] Opening Enterprise Healthcare Portal in your default browser...
start http://127.0.0.1:8000

echo.
echo ================================================================
echo   DFU-AI HEALTH SYSTEMS IS NOW RUNNING!
echo ================================================================
echo.
echo   * Enterprise Portal: http://127.0.0.1:8000
echo   * Health Check     : http://127.0.0.1:8000/api/health
echo   * API Docs (OpenAPI): http://127.0.0.1:8000/docs
echo.
echo   ----------------------------------------------------------------
echo   IMPORTANT (CACHE REFRESH):
echo   If your browser displays the older layout, press CTRL + SHIFT + R
echo   or CTRL + F5 to perform a hard refresh and load the new assets.
echo   Or open an Incognito / InPrivate window: Ctrl + Shift + N
echo   ----------------------------------------------------------------
echo.
echo   1. DOCTOR LOGIN:
echo      - Email:    dr.sharma@dfu-ai.med  (Dr. Rajesh Sharma, MS, MCh, FACS)
echo      - Password: doctor123
echo      - (Or click any of the 1-Click Demo accounts on screen)
echo.
echo   2. PATIENT PORTAL:
echo      - Switch to "Patient Portal" tab on the login screen
echo      - MRN: AIIDC-2026-8492  |  DOB: 1962-04-12
echo ================================================================
echo Keep the "DFU-AI Medical Server" window open while using the app.
echo.
pause

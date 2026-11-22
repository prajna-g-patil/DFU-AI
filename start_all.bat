@echo off
title DFU-AI Dual-Stack Development Launcher
cls
echo ================================================================
echo       DFU-AI Clinical Decision-Support System (Dev Stack)
echo ================================================================
echo.
cd /d "%~dp0"

echo [1/3] Starting FastAPI Medical Backend on Port 8000...
start "DFU-AI Backend API" cmd /k "start_backend.bat"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Vite React Frontend on Port 5173...
start "DFU-AI Frontend UI" cmd /k "start_frontend.bat"
timeout /t 3 /nobreak >nul

echo [3/3] Opening browser to Vite development portal...
start http://127.0.0.1:5173

echo.
echo ================================================================
echo   DEVELOPMENT STACK INITIALIZED!
echo   * Vite Frontend (HMR) : http://127.0.0.1:5173
echo   * FastAPI Backend     : http://127.0.0.1:8000
echo   * Swagger API Docs    : http://127.0.0.1:8000/docs
echo.
echo   Demo Login: dr.chen@dfu-ai.med / doctor123
echo ================================================================
pause

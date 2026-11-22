@echo off
echo ====================================================
echo Starting DFU-AI React / Vite Frontend on Port 5173
echo ====================================================
cd /d "%~dp0frontend"
if exist "node_modules\vite\bin\vite.js" (
    node node_modules\vite\bin\vite.js --host 0.0.0.0 --port 5173
) else (
    call npm run dev -- --host 0.0.0.0
)
pause

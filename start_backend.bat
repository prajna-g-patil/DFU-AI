@echo off
echo ====================================================
echo Starting DFU-AI FastAPI Medical Backend on Port 8000
echo ====================================================
cd /d "%~dp0"
if exist "backend\venv\Scripts\python.exe" (
    backend\venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
)
pause

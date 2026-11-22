@echo off
cd /d "%~dp0"
echo =====================================================================
echo  DFU-AI HEALTH PLATFORM - PUSH TO GITHUB
echo  Target: https://github.com/prajna-g-patil/DFU-AI.git (branch: main)
echo =====================================================================
echo.
git push -u origin main
echo.
echo =====================================================================
echo  Push complete!
echo =====================================================================
pause

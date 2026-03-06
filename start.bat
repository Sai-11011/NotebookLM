@echo off
REM ─────────────────────────────────────────────────────────
REM  NoteBookLM - Start Backend Server (single server mode)
REM
REM  Usage:
REM    1. Run this script from the project root:
REM         .\start.bat
REM
REM    2. Open http://localhost:5000 in your browser.
REM
REM  NOTE: First time? Run setup.bat first to install deps.
REM ─────────────────────────────────────────────────────────

echo.
echo  [1/2] Building React frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Frontend build failed. Check above for errors.
    pause
    exit /b 1
)

echo.
echo  [2/2] Starting Flask backend on http://localhost:5000...
cd backend
if not exist venv\Scripts\python.exe (
    echo  ERROR: Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)
venv\Scripts\python.exe app.py

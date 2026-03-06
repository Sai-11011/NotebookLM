@echo off
setlocal enabledelayedexpansion

REM ─────────────────────────────────────────────────────────
REM  NoteBookLM - One-Time Setup Script (Simplified)
REM ─────────────────────────────────────────────────────────

echo.
echo  [1/3] Installing Node.js (frontend) dependencies...
call npm install
if !errorlevel! neq 0 (
    echo  ERROR: npm install failed.
    pause
    exit /b !errorlevel!
)

echo.
echo  [2/3] Creating Python virtual environment...

set "PY_CMD="

REM Test python
python --version >nul 2>&1
if !errorlevel! equ 0 (
    set "PY_CMD=python"
) else (
    REM Test py
    py --version >nul 2>&1
    if !errorlevel! equ 0 (
        set "PY_CMD=py"
    ) else (
        REM Test python3
        python3 --version >nul 2>&1
        if !errorlevel! equ 0 (
            set "PY_CMD=python3"
        )
    )
)

if not defined PY_CMD (
    echo.
    echo  ERROR: Python was not found in this terminal!
    echo  Even though you might have it installed, this terminal doesn't see it.
    echo.
    echo  TRY THIS:
    echo  Run these commands manually in your Anaconda Prompt:
    echo    cd /d E:\GenAI\NoteBookLM\backend
    echo    python -m venv venv
    echo    venv\Scripts\activate
    echo    pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

echo  Using command: %PY_CMD%
cd backend
%PY_CMD% -m venv venv
if !errorlevel! neq 0 (
    echo  ERROR: Failed to create venv with %PY_CMD%.
    pause
    exit /b !errorlevel!
)

echo.
echo  [3/3] Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if !errorlevel! neq 0 (
    echo  ERROR: pip install failed.
    pause
    exit /b !errorlevel!
)

echo.
echo  ✓ Setup complete!
echo.
echo  NEXT STEPS:
echo    1. Edit backend\.env and add your GOOGLE_API_KEY
echo    2. Run start.bat to launch the app
echo.
pause

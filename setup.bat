@echo off
echo ========================================
echo AI Tennis Match Predictor - Setup
echo ========================================
echo.
echo This script will set up everything needed to run the app.
echo Run this ONCE before using start_app.bat
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check for Python
echo Checking for Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    echo Please install Python 3.7+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)
python --version
echo.

REM Check for Node.js
echo Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo Make sure to check "Add to PATH" during installation.
    pause
    exit /b 1
)
node --version
echo.

REM Check for npm
echo Checking for npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    echo npm should come with Node.js. Please reinstall Node.js.
    pause
    exit /b 1
)
npm --version
echo.

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo Virtual environment created successfully.
) else (
    echo Virtual environment already exists.
)
echo.

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment!
    pause
    exit /b 1
)
echo.

REM Install Python dependencies
echo Installing Python dependencies...
echo This may take a few minutes...
pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies!
    pause
    exit /b 1
)
echo Python dependencies installed successfully.
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
echo This may take a few minutes...
cd frontend
if not exist "node_modules" (
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies!
        cd ..
        pause
        exit /b 1
    )
    echo Frontend dependencies installed successfully.
) else (
    echo Frontend dependencies already installed.
    echo Updating dependencies...
    npm install
)
cd ..
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You can now run the app using:
echo   - Double-click start_app.bat
echo   - Or run: start_app.ps1 in PowerShell
echo.
pause


@echo off
echo ========================================
echo AI Tennis Match Predictor - Startup
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    echo Please run setup.bat first to install dependencies.
    pause
    exit /b 1
)

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please run setup.bat first to install dependencies.
    pause
    exit /b 1
)

REM Check if virtual environment exists, if not create it
if not exist ".venv" (
    echo Virtual environment not found. Creating it...
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment!
        echo Please run setup.bat first.
        pause
        exit /b 1
    )
)

REM Activate virtual environment
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment!
    echo Please run setup.bat first.
    pause
    exit /b 1
)

REM Check and install Python dependencies
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -q -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install Python dependencies!
        echo Please run setup.bat first.
        pause
        exit /b 1
    )
)

REM Check and install frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install --silent
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies!
        echo Please run setup.bat first.
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo ========================================
echo Starting servers...
echo ========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Opening browser in 10 seconds...
echo Press Ctrl+C to stop both servers
echo.

REM Start Flask backend in a new window
start "Flask Backend" cmd /k "cd /d %~dp0 && .venv\Scripts\activate.bat && python app.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start React frontend in a new window
start "React Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"

REM Wait and open browser
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo Both servers are starting in separate windows.
echo Close those windows to stop the servers.
echo.
pause


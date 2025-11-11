# AI Tennis Match Predictor - Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Tennis Match Predictor - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check for Python
try {
    python --version | Out-Null
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first to install dependencies." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check for Node.js
try {
    node --version | Out-Null
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first to install dependencies." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if virtual environment exists, if not create it
if (-not (Test-Path ".venv")) {
    Write-Host "Virtual environment not found. Creating it..." -ForegroundColor Yellow
    python -m venv .venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create virtual environment!" -ForegroundColor Red
        Write-Host "Please run setup.ps1 first." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Activate virtual environment
& .\.venv\Scripts\Activate.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to activate virtual environment!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check and install Python dependencies
try {
    python -c "import flask" | Out-Null
} catch {
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    pip install -q -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Python dependencies!" -ForegroundColor Red
        Write-Host "Please run setup.ps1 first." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check and install frontend dependencies
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install --silent
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install frontend dependencies!" -ForegroundColor Red
        Write-Host "Please run setup.ps1 first." -ForegroundColor Red
        Set-Location ..
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location ..
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will run on: http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Opening browser in 10 seconds..." -ForegroundColor Yellow
Write-Host "Close the server windows to stop the servers." -ForegroundColor Yellow
Write-Host ""

# Start Flask backend in a new window
$backendScript = @"
cd `"$PSScriptRoot`"
.\.venv\Scripts\Activate.ps1
python app.py
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start React frontend in a new window
$frontendScript = @"
cd `"$PSScriptRoot\frontend`"
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

# Wait and open browser
Start-Sleep -Seconds 10
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
Write-Host ""


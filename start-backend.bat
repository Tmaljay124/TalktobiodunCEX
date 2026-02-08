@echo off
REM Start Backend Server for Crypto Arbitrage Bot

echo ============================================
echo Starting Backend Server...
echo ============================================
echo.

cd backend

REM Activate virtual environment
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo Virtual environment activated
) else (
    echo WARNING: Virtual environment not found
    echo Run setup-windows.bat first
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found
    echo Using default configuration
    echo See WINDOWS_SETUP_GUIDE.md for setup instructions
    echo.
)

echo Starting server on http://localhost:8001
echo Press Ctrl+C to stop
echo.

python server.py

pause

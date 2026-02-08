@echo off
REM Crypto Arbitrage Bot - Windows Setup Script
REM This script helps you set up the bot on Windows

echo ============================================
echo Crypto Arbitrage Bot - Windows Setup
echo ============================================
echo.

REM Check Python
echo [1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://python.org
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)
echo SUCCESS: Python is installed
echo.

REM Check MongoDB
echo [2/5] Checking MongoDB service...
sc query MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB service not found
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    echo Or the bot will use default connection: mongodb://localhost:27017/
)
echo.

REM Check Node.js
echo [3/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo SUCCESS: Node.js is installed
echo.

REM Install backend dependencies
echo [4/5] Installing backend dependencies...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python packages...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo SUCCESS: Backend dependencies installed
cd ..
echo.

REM Install frontend dependencies
echo [5/5] Installing frontend dependencies...
cd frontend

REM Check if yarn is installed, if not use npm
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Yarn not found, installing with npm...
    npm install -g yarn
)

echo Installing Node packages...
yarn install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo SUCCESS: Frontend dependencies installed
cd ..
echo.

echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Configure backend\.env file (see WINDOWS_SETUP_GUIDE.md)
echo 2. Generate encryption key
echo 3. Run start-backend.bat in one window
echo 4. Run start-frontend.bat in another window
echo.
echo For detailed instructions, see:
echo - WINDOWS_SETUP_GUIDE.md
echo - LOCAL_INSTALLATION_COMPLETE_GUIDE.md
echo.
pause

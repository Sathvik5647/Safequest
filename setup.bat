@echo off
REM SafeQuest Setup Script for Windows
REM This script helps you set up the SafeQuest development environment

echo 🛡️  SafeQuest Setup Script for Windows
echo =====================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% == 0 (
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo [SUCCESS] Node.js is installed: !NODE_VERSION!
) else (
    echo [ERROR] Node.js is not installed. Please install Node.js 16.x or higher from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% == 0 (
    for /f %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [SUCCESS] npm is installed: !NPM_VERSION!
) else (
    echo [ERROR] npm is not installed. Please install npm.
    pause
    exit /b 1
)

REM Check if Python is installed
echo [INFO] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% == 0 (
    for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo [SUCCESS] Python is installed: !PYTHON_VERSION!
    set PYTHON_AVAILABLE=1
) else (
    echo [WARNING] Python is not installed. TTS service won't be available.
    set PYTHON_AVAILABLE=0
)

echo.
echo [INFO] Installing dependencies...
echo.

REM Install root dependencies
echo [INFO] Installing root dependencies...
call npm install
if %errorlevel% == 0 (
    echo [SUCCESS] Root dependencies installed successfully
) else (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% == 0 (
    echo [SUCCESS] Backend dependencies installed successfully
) else (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% == 0 (
    echo [SUCCESS] Frontend dependencies installed successfully
) else (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)

REM Setup TTS service (if Python is available)
if %PYTHON_AVAILABLE% == 1 (
    echo [INFO] Setting up TTS service...
    cd ..\tts-service
    
    REM Check if pip is available
    pip --version >nul 2>&1
    if %errorlevel% == 0 (
        pip install -r requirements.txt
        if %errorlevel% == 0 (
            echo [SUCCESS] TTS service dependencies installed successfully
        ) else (
            echo [WARNING] Failed to install TTS service dependencies. You can skip this for now.
        )
    ) else (
        echo [WARNING] pip is not available. Skipping TTS service setup.
    )
)

REM Go back to root directory
cd ..

REM Setup environment file
echo [INFO] Setting up environment configuration...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [SUCCESS] Created .env file from example. Please edit backend\.env with your actual configuration values.
    ) else (
        echo [WARNING] No .env.example found. You'll need to create backend\.env manually.
    )
) else (
    echo [WARNING] backend\.env already exists. Skipping environment setup.
)

echo.
echo 🎉 Setup completed!
echo.
echo Next steps:
echo 1. Edit backend\.env with your API keys and database configuration
echo 2. Make sure MongoDB is running (locally or on Atlas)
echo 3. Start the application with: npm start
echo.
echo Required API Keys:
echo - Groq API Key: https://console.groq.com/
echo - Google Client ID: https://console.cloud.google.com/
echo - HuggingFace API Key: https://huggingface.co/settings/tokens
echo.
echo For detailed setup instructions, see README.md
echo.
echo [SUCCESS] Ready to start your SafeQuest adventure! 🛡️✨
pause
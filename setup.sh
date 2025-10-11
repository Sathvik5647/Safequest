#!/bin/bash

# SafeQuest Setup Script
# This script helps you set up the SafeQuest development environment

echo "🛡️  SafeQuest Setup Script"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 16.x or higher from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
print_status "Checking npm installation..."
if command -v npm > /dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Check if Python is installed
print_status "Checking Python installation..."
if command -v python3 > /dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python is installed: $PYTHON_VERSION"
else
    print_warning "Python 3 is not installed. TTS service won't be available."
fi

echo ""
print_status "Installing dependencies..."
echo ""

# Install root dependencies
print_status "Installing root dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Root dependencies installed successfully"
else
    print_error "Failed to install root dependencies"
    exit 1
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies  
print_status "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Setup TTS service (if Python is available)
if command -v python3 > /dev/null 2>&1; then
    print_status "Setting up TTS service..."
    cd ../tts-service
    
    # Check if pip is available
    if command -v pip3 > /dev/null 2>&1; then
        pip3 install -r requirements.txt
        if [ $? -eq 0 ]; then
            print_success "TTS service dependencies installed successfully"
        else
            print_warning "Failed to install TTS service dependencies. You can skip this for now."
        fi
    else
        print_warning "pip3 is not available. Skipping TTS service setup."
    fi
fi

# Go back to root directory
cd ..

# Setup environment file
print_status "Setting up environment configuration..."
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_success "Created .env file from example. Please edit backend/.env with your actual configuration values."
    else
        print_warning "No .env.example found. You'll need to create backend/.env manually."
    fi
else
    print_warning "backend/.env already exists. Skipping environment setup."
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your API keys and database configuration"
echo "2. Make sure MongoDB is running (locally or on Atlas)"
echo "3. Start the application with: npm start"
echo ""
echo "Required API Keys:"
echo "- Groq API Key: https://console.groq.com/"
echo "- Google Client ID: https://console.cloud.google.com/"
echo "- HuggingFace API Key: https://huggingface.co/settings/tokens"
echo ""
echo "For detailed setup instructions, see README.md"
echo ""
print_success "Ready to start your SafeQuest adventure! 🛡️✨"
#!/bin/bash

echo "🚀 Setting up Notary Video Call POC..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp server/env.example server/.env
    echo "📝 Please edit server/.env with your Twilio credentials:"
    echo "   - TWILIO_ACCOUNT_SID"
    echo "   - TWILIO_API_KEY_SID" 
    echo "   - TWILIO_API_KEY_SECRET"
    echo ""
    echo "You can get these from your Twilio Console:"
    echo "https://console.twilio.com/"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Then open two browser tabs:"
echo "  - http://localhost:5173 (join as Notary)"
echo "  - http://localhost:5173 (join as Client)"
echo ""
echo "Make sure to configure your Twilio credentials in server/.env first!"



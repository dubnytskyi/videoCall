#!/bin/bash

echo "🌐 Starting ngrok for Notary Video Call POC"
echo "==========================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install it first:"
    echo "   https://ngrok.com/download"
    exit 1
fi

echo "🚀 Starting ngrok tunnel for frontend (port 5173)..."
echo "   This will create a public URL for your app"
echo ""

# Start ngrok
ngrok http 5173 --log=stdout



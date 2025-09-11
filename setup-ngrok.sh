#!/bin/bash

echo "🌐 Setting up ngrok for Notary Video Call POC"
echo "=============================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing..."
    
    # Install ngrok
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install ngrok/ngrok/ngrok
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok
    else
        echo "❌ Unsupported OS. Please install ngrok manually:"
        echo "   https://ngrok.com/download"
        exit 1
    fi
fi

echo "✅ ngrok is installed"

# Check if ngrok is authenticated
if ! ngrok config check &> /dev/null; then
    echo "🔑 Please authenticate ngrok:"
    echo "   1. Go to https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "   2. Copy your authtoken"
    echo "   3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    read -p "Press Enter after you've set up your authtoken..."
fi

echo "🚀 Starting ngrok tunnels..."
echo ""

# Start ngrok for both frontend and backend
echo "Starting frontend tunnel (port 5173)..."
ngrok http 5173 --log=stdout &
FRONTEND_PID=$!

echo "Starting backend tunnel (port 4000)..."
ngrok http 4000 --log=stdout &
BACKEND_PID=$!

echo ""
echo "⏳ Waiting for tunnels to start..."
sleep 5

# Get tunnel URLs
echo "🔍 Getting tunnel URLs..."

# Get frontend URL
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.config.addr == "http://localhost:5173") | .public_url' | head -1)
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.config.addr == "http://localhost:4000") | .public_url' | head -1)

if [ -z "$FRONTEND_URL" ] || [ -z "$BACKEND_URL" ]; then
    echo "❌ Failed to get tunnel URLs. Please check ngrok status."
    echo "   Frontend URL: $FRONTEND_URL"
    echo "   Backend URL: $BACKEND_URL"
    exit 1
fi

echo ""
echo "🎉 Tunnels are ready!"
echo "====================="
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo ""
echo "📱 For testing on two laptops:"
echo "   1. First laptop (Notary): $FRONTEND_URL"
echo "   2. Second laptop (Client): $FRONTEND_URL"
echo ""
echo "🔧 Backend API: $BACKEND_URL"
echo ""
echo "Press Ctrl+C to stop all tunnels"

# Wait for user to stop
trap 'echo ""; echo "🛑 Stopping tunnels..."; kill $FRONTEND_PID $BACKEND_PID; exit 0' INT

# Keep running
while true; do
    sleep 1
done



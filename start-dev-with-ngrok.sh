#!/bin/bash

echo "🚀 Starting Development with ngrok + Vercel Server"
echo "================================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Installing..."
    
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

echo "✅ ngrok is ready"

# Check if ngrok is authenticated
if ! ngrok config check &> /dev/null; then
    echo "🔐 Please authenticate ngrok:"
    echo "   1. Go to https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "   2. Copy your authtoken"
    echo "   3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    read -p "Press Enter after you've added your authtoken..."
fi

echo "✅ ngrok is authenticated"

# Start the client
echo "🔨 Starting React client..."
cd client
npm run dev &
CLIENT_PID=$!

# Wait for client to start
echo "⏳ Waiting for client to start..."
sleep 5

# Start ngrok tunnel
echo "🌐 Starting ngrok tunnel..."
ngrok http 5173 --log=stdout &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get ngrok URL
echo "🔍 Getting ngrok URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    kill $CLIENT_PID $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ Development environment ready!"
echo ""
echo "🌐 Frontend (ngrok): $NGROK_URL"
echo "🔧 Backend (Vercel): https://video-call-1rxqdfgut-taldevs-projects-f39a0564.vercel.app"
echo ""
echo "📝 Test the setup:"
echo "   1. Open $NGROK_URL in two browser tabs"
echo "   2. Join as 'Notary' in one tab"
echo "   3. Join as 'Client' in the other tab"
echo "   4. Test video call and PDF editing"
echo ""
echo "🛑 To stop: Press Ctrl+C"

# Wait for user to stop
trap "echo '🛑 Stopping...'; kill $CLIENT_PID $NGROK_PID 2>/dev/null; exit 0" INT
wait







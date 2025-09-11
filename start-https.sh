#!/bin/bash

echo "🔒 Starting HTTPS development server"
echo "===================================="

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed. Installing..."
    
    # Install mkcert
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install mkcert
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
        chmod +x mkcert-v*-linux-amd64
        sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    else
        echo "❌ Unsupported OS. Please install mkcert manually:"
        echo "   https://github.com/FiloSottile/mkcert"
        exit 1
    fi
fi

# Install local CA
echo "📜 Installing local CA..."
mkcert -install

# Generate certificates
echo "🔐 Generating certificates..."
mkcert localhost 127.0.0.1 ::1

# Start HTTPS server
echo "🚀 Starting HTTPS server..."
echo "   Frontend: https://localhost:5173"
echo "   Backend:  https://localhost:4000"
echo ""

# Start both servers with HTTPS
concurrently \
  "cd server && HTTPS=true npm run dev" \
  "cd client && HTTPS=true npm run dev"



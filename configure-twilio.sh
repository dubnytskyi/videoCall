#!/bin/bash

echo "🔧 Twilio Configuration Setup"
echo "=============================="
echo ""

# Check if .env already exists
if [ -f "server/.env" ]; then
    echo "⚠️  .env file already exists in server directory"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuration cancelled"
        exit 1
    fi
fi

echo "📝 Creating .env file..."
cat > server/.env << 'EOF'
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=your_api_key_secret
PORT=4000
CORS_ORIGIN=http://localhost:5173
EOF

echo "✅ .env file created successfully!"
echo ""
echo "🔑 Next steps:"
echo "1. Get your Twilio credentials from: https://console.twilio.com/"
echo "2. Edit server/.env with your actual credentials"
echo "3. Restart the application: npm run dev"
echo ""
echo "📖 For detailed instructions, see TWILIO_SETUP.md"
echo ""
echo "🚀 Quick test after configuration:"
echo "   curl -X POST http://localhost:4000/token \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"identity\":\"test\",\"room\":\"test-room\"}'"



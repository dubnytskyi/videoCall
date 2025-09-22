#!/bin/bash

echo "🧪 Testing Vercel API"
echo "===================="
echo ""

API_URL="https://video-call-1rxqdfgut-taldevs-projects-f39a0564.vercel.app"

echo "🔍 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$API_URL/api/health")
echo "Response: $HEALTH_RESPONSE"

if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    echo "Note: Vercel may require authentication. Try opening in browser:"
    echo "   $API_URL/api/health"
fi

echo ""
echo "🔍 Testing token endpoint..."
TOKEN_RESPONSE=$(curl -s -X POST "$API_URL/api/token" \
    -H "Content-Type: application/json" \
    -d '{"identity":"test","room":"test-room"}')

echo "Response: $TOKEN_RESPONSE"

if [[ $TOKEN_RESPONSE == *"token"* ]]; then
    echo "✅ Token generation works"
else
    echo "❌ Token generation failed"
    echo "Note: Check if Twilio credentials are set correctly"
fi

echo ""
echo "🌐 API URL: $API_URL"
echo "📝 You can test manually in browser or Postman"







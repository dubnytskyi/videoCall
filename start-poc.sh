#!/bin/bash

echo "🚀 Starting Notary Video Call POC (Client-Only Version)"
echo "=================================================="
echo ""
echo "This version runs without a server - everything is on the frontend!"
echo "Make sure to configure your Twilio credentials in client/src/lib/twilioToken.ts"
echo ""
echo "Starting client on http://localhost:5173"
echo ""

cd client && npm run dev

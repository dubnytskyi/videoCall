#!/bin/bash

echo "Clearing Twilio Video room..."

# Load environment variables
if [ -f "server/.env" ]; then
    echo "Loading environment variables from server/.env"
    export $(cat server/.env | grep -v '^#' | xargs)
else
    echo "Warning: server/.env file not found"
    echo "Please make sure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set"
fi

# Check if required environment variables are set
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_API_KEY_SECRET" ]; then
    echo "Error: TWILIO_ACCOUNT_SID and TWILIO_API_KEY_SECRET must be set"
    echo "Please check your server/.env file"
    exit 1
fi

# Run the clear room script
node clear-room.js

echo "Done!"

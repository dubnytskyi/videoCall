# Twilio Setup Guide

## Why You're Getting the Error

The "Failed to connect to video service" error occurs because the Twilio credentials are not configured. The application needs these credentials to generate access tokens for video calls.

## Step 1: Get Twilio Credentials

1. **Sign up for Twilio** (if you haven't already):
   - Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Create a free account (includes $15 credit)

2. **Get your Account SID**:
   - Go to [Twilio Console Dashboard](https://console.twilio.com/)
   - Copy your "Account SID" (starts with "AC...")

3. **Create an API Key**:
   - In the Twilio Console, go to "Account" → "API Keys & Tokens"
   - Click "Create API Key"
   - Give it a name (e.g., "Notary Video POC")
   - Copy the "API Key SID" (starts with "SK...")
   - Copy the "API Key Secret" (long random string)

## Step 2: Configure the Application

1. **Create the .env file**:
   ```bash
   # In the server directory
   cd server
   cp env.example .env
   ```

2. **Edit the .env file** with your credentials:
   ```
   TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
   TWILIO_API_KEY_SID=SK1234567890abcdef1234567890abcdef
   TWILIO_API_KEY_SECRET=your_actual_api_key_secret_here
   PORT=4000
   CORS_ORIGIN=http://localhost:5173
   ```

## Step 3: Enable Video API

1. In Twilio Console, go to "Products" → "Video"
2. Make sure "Programmable Video" is enabled
3. You should see "Video API" in your active products

## Step 4: Test the Configuration

1. **Restart the server** (if it's running):
   ```bash
   # Stop the current process (Ctrl+C)
   npm run dev
   ```

2. **Test the token endpoint**:
   ```bash
   curl -X POST http://localhost:4000/token \
     -H "Content-Type: application/json" \
     -d '{"identity":"test","room":"test-room"}'
   ```

3. **If successful**, you should get a response with a JWT token.

## Step 5: Test the Application

1. Open two browser tabs
2. Go to `http://localhost:5173`
3. Click "Join as Notary" in one tab
4. Click "Join as Client" in the other tab
5. Allow camera/microphone permissions when prompted

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**:
   - Double-check your Account SID and API Key credentials
   - Make sure there are no extra spaces or characters

2. **"Video API not enabled" error**:
   - Go to Twilio Console → Products → Video
   - Enable Programmable Video

3. **"Permission denied" error**:
   - Check that your API Key has the correct permissions
   - Make sure the API Key is active (not expired)

4. **Browser permissions**:
   - Make sure to allow camera and microphone access
   - Try refreshing the page if permissions are denied

### Testing Without Twilio (Development Mode)

If you want to test the UI without Twilio setup, you can modify the client to show a mock interface:

1. Edit `client/src/components/NotaryRoom.tsx`
2. Comment out the token fetching and show a mock interface
3. This will let you test the PDF editing functionality

## Need Help?

- [Twilio Video Documentation](https://www.twilio.com/docs/video)
- [Twilio Console](https://console.twilio.com/)
- [Twilio Support](https://support.twilio.com/)

## Free Tier Limits

- **Video calls**: Up to 2 participants
- **Duration**: Up to 10 minutes per call
- **Storage**: 1GB
- **Credits**: $15 free credit

This should be sufficient for testing the POC!



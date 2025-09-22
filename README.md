# Notary Video Call POC

A proof-of-concept application for video calls between a notary and client with live PDF editing capabilities.

## Features

- **1:1 Video Call**: Real-time video communication between notary and client
- **Live PDF Editing**: Notary can draw and add text annotations to PDF documents
- **Real-time Synchronization**: All changes are synchronized in real-time using Twilio DataTrack
- **Role-based Access**: Notary can edit, client can view
- **Video Recording**: Notary can record the entire session (NEW!)
- **Modern UI**: Clean interface matching the provided mockup
- **Easy Deployment**: Deploy to Vercel with one command

## Architecture

### Frontend (React + TypeScript + Vite)
- Twilio Video SDK integration
- PDF.js for document rendering
- Canvas-based drawing and annotation
- Real-time data synchronization via DataTrack

### Backend (Node.js + Express)
- Twilio Video Access Token generation
- Video recording management via Compositions API
- RESTful API endpoints
- CORS support for frontend integration

### Twilio Services
- Programmable Video for P2P video calls
- DataTrack for real-time collaboration data
- Video Compositions API for session recording

## Quick Start

### 1. Prerequisites
- Node.js (v16 or higher)
- Twilio Account with Video API enabled
- Twilio API Key and Secret

### 2. Install Dependencies
```bash
npm run install-all
```

### 3. Run Locally
```bash
# Start server
cd server && npm run dev

# Start client (in another terminal)
cd client && npm run dev
```

### 4. Deploy to Vercel
```bash
# Deploy to Vercel
./deploy-vercel.sh

# Set environment variables
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_API_KEY_SID
vercel env add TWILIO_API_KEY_SECRET
```

### 5. Access the Application
- **Local**: `http://localhost:5173`
- **Production**: `https://your-app.vercel.app`

## Usage

### For Notary
1. Join the session as "Notary"
2. Wait for client to connect
3. Use drawing tools to annotate the PDF:
   - Select color and stroke width
   - Draw with mouse on the document
   - Add text annotations
   - Clear page if needed

### For Client
1. Join the session as "Client"
2. View the document in real-time
3. See all notary's annotations as they're made
4. Navigate through document pages

## Technical Details

### Data Synchronization
The application uses Twilio DataTrack to send JSON messages containing:
- Drawing operations (paths, colors, stroke width)
- Text annotations (position, content, styling)
- Clear operations (page clearing)

### PDF Rendering
- Uses PDF.js for client-side PDF rendering
- Canvas overlay for drawing and annotations
- Real-time re-rendering when changes occur

### Video Integration
- P2P video calls using Twilio Video
- Local and remote video streams
- Connection status indicators
- Participant role management

### Recording System
- Session recording using Twilio Video Compositions API
- MP4 format with grid layout of all participants
- Notary-controlled recording (start/stop)
- Real-time recording status display
- Automatic completion when room ends

## File Structure

```
notary-poc/
├── server/                     # Node.js backend
│   ├── src/
│   │   └── index.ts           # Express server with token endpoint
│   ├── package.json
│   └── tsconfig.json
└── client/                    # React frontend
    ├── public/
    │   └── sample.pdf         # Sample PDF document
    ├── src/
    │   ├── components/
    │   │   ├── VideoRoom.tsx  # Twilio Video integration
    │   │   ├── PdfCollaborator.tsx # PDF editing component
    │   │   ├── NotaryRoom.tsx # Notary interface
    │   │   └── ClientRoom.tsx # Client interface
    │   ├── types/
    │   │   └── collab.ts      # TypeScript types
    │   └── lib/
    │       └── twilioToken.ts # Token fetching utility
    └── package.json
```

## Troubleshooting

### Common Issues

1. **Token Generation Fails**
   - Check Twilio credentials in `.env` file
   - Ensure Twilio Video API is enabled
   - Verify API key has Video permissions

2. **Video Not Loading**
   - Check browser permissions for camera/microphone
   - Ensure HTTPS in production (required by Twilio)
   - Check browser console for errors

3. **PDF Not Rendering**
   - Check if `sample.pdf` exists in `client/public/`
   - Verify PDF.js worker is loading correctly
   - Check browser console for PDF.js errors

4. **Recording Not Working**
   - Ensure `TWILIO_AUTH_TOKEN` is set in server/.env
   - Check that room has active participants with video/audio
   - Verify Twilio Video Compositions API is enabled
   - Check server logs for recording errors

## Recording Setup

For detailed recording setup instructions, see [RECORDING_SETUP.md](./RECORDING_SETUP.md).

### Quick Recording Setup

1. Add to `server/.env`:
   ```env
   TWILIO_AUTH_TOKEN=your_auth_token
   ```

2. Start recording as notary:
   - Click the red record button in the video panel
   - Recording starts automatically
   - Status is shown in real-time

3. Recording completes when room ends
   - Download link appears when ready
   - Files are stored in Twilio cloud

### Development Tips

- Use browser developer tools to monitor DataTrack messages
- Check Twilio Console for video call logs
- Monitor network tab for API calls
- Use React DevTools for component debugging

## Future Enhancements

- [ ] Support for multiple PDF pages
- [ ] Text input fields for form filling
- [ ] Document signing capabilities
- [ ] Session recording
- [ ] Mobile responsiveness
- [ ] Authentication and user management
- [ ] Document persistence
- [ ] Advanced drawing tools (shapes, arrows, etc.)

## License

This is a proof-of-concept project for demonstration purposes.



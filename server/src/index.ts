import express from "express";
import cors from "cors";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      /^http:\/\/192\.168\.\d+\.\d+:5173$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:5173$/,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:5173$/,
      /^https:\/\/.*\.ngrok\.io$/,
      /^https:\/\/.*\.ngrok-free\.app$/,
      /^https:\/\/.*\.ngrok\.app$/,
      // Deployed client(s)
      "https://video-call-client-lvcp.vercel.app",
      /^https:\/\/.*\.vercel\.app$/,
    ],
    credentials: true,
    // Enhanced CORS settings for better stability
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.post("/api/token", async (req, res) => {
  try {
    const { identity, room } = req.body || {};
    console.log(`Token request for identity: ${identity}, room: ${room}`);

    if (!identity || !room) {
      console.error("Missing required parameters:", { identity, room });
      return res.status(400).json({ error: "identity and room are required" });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const apiKeySid = process.env.TWILIO_API_KEY_SID!;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET!;

    console.log(`Twilio credentials check:`, {
      accountSid: accountSid ? `${accountSid.substring(0, 10)}...` : "MISSING",
      apiKeySid: apiKeySid ? `${apiKeySid.substring(0, 10)}...` : "MISSING",
      apiKeySecret: apiKeySecret
        ? `${apiKeySecret.substring(0, 10)}...`
        : "MISSING",
    });

    if (!accountSid || !apiKeySid || !apiKeySecret) {
      console.error("Twilio credentials not configured");
      return res
        .status(500)
        .json({ error: "Twilio credentials not configured" });
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    // Створюємо токен з правильними параметрами
    // AccessToken(accountSid, apiKeySid, apiKeySecret) - issuer буде accountSid
    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity,
      ttl: 60 * 60 * 4, // 4 години для максимальної стабільності
    });

    const videoGrant = new VideoGrant({
      room,
    });

    token.addGrant(videoGrant);

    const jwtToken = token.toJwt();
    console.log(`Token generated successfully for ${identity}`);

    // Логуємо декодований токен для діагностики
    try {
      const tokenParts = jwtToken.split(".");
      if (tokenParts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString()
        );
        console.log(`Token payload:`, {
          iss: payload.iss,
          sub: payload.sub,
          identity: payload.grants?.identity,
          room: payload.grants?.video?.room,
        });
      }
    } catch (e) {
      console.warn(`Could not decode token for logging:`, e);
    }

    res.json({
      token: jwtToken,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({
      error: "token_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const port = parseInt(process.env.PORT || "4000", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`Token server running on http://0.0.0.0:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Network access: http://192.168.0.150:${port}/api/health`);
});

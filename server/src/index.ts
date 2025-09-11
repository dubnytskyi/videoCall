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
    ],
    credentials: true,
  })
);

app.post("/api/token", async (req, res) => {
  try {
    const { identity, room } = req.body || {};
    if (!identity || !room) {
      return res.status(400).json({ error: "identity and room are required" });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const apiKeySid = process.env.TWILIO_API_KEY_SID!;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET!;

    if (!accountSid || !apiKeySid || !apiKeySecret) {
      return res
        .status(500)
        .json({ error: "Twilio credentials not configured" });
    }

    const AccessToken = (twilio as any).jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity,
      ttl: 60 * 60, // 1 година
    });

    token.addGrant(new VideoGrant({ room }));
    res.json({ token: token.toJwt() });
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ error: "token_failed" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Token server running on http://0.0.0.0:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Network access: http://192.168.0.150:${port}/api/health`);
});

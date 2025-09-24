import express from "express";
import cors from "cors";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Twilio client for recording
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
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

// Start recording endpoint
app.post("/api/recording/start", async (req, res) => {
  try {
    const { roomSid } = req.body;

    if (!roomSid) {
      return res.status(400).json({ error: "roomSid is required" });
    }

    console.log(`Starting recording for room: ${roomSid}`);

    // First, get the room to ensure it exists
    const room = await twilioClient.video.rooms(roomSid).fetch();
    console.log(`Room fetched for recording start:`, {
      sid: room.sid,
      type: (room as any).type,
      status: room.status,
    });

    // Enable recording for all participants via Recording Rules (requires Group/Group Small room)
    try {
      await (twilioClient as any).video
        .rooms(roomSid)
        .recordingRules.update({ rules: [{ type: "include", all: true }] });
      console.log(`Recording rules enabled (include all) for room ${roomSid}`);
    } catch (e) {
      console.warn(
        `Could not enable recording rules for room ${roomSid}. Ensure room type is Group/Group Small.`,
        e
      );
    }

    // Create composition for recording with custom left/right layout
    // Left: two stacked tiles for participants (exclude pdf-canvas)
    // Right: pdf-canvas fills entire right half
    const composition = await (twilioClient as any).video.compositions.create({
      roomSid: roomSid,
      audioSources: ["*"],
      resolution: "1280x720",
      videoLayout: {
        custom: {
          // Top-level list of all possible sources referenced in regions
          video_sources: ["*", "pdf-canvas"],

          // Left top tile (participant 1)
          left_top: {
            z_pos: 1,
            x_pos: 0,
            y_pos: 0,
            width: 640,
            height: 360,
            video_sources: ["*"],
            video_sources_excluded: ["pdf-canvas"],
          },

          // Left bottom tile (participant 2)
          left_bottom: {
            z_pos: 1,
            x_pos: 0,
            y_pos: 360,
            width: 640,
            height: 360,
            video_sources: ["*"],
            video_sources_excluded: ["pdf-canvas"],
          },

          // Right half dedicated to the PDF canvas
          right_full: {
            z_pos: 2,
            x_pos: 640,
            y_pos: 0,
            width: 640,
            height: 720,
            video_sources: ["pdf-canvas"],
          },
        },
      },
      format: "mp4",
      statusCallback: `${
        process.env.SERVER_URL || "http://localhost:4000"
      }/api/recording/status`,
    });

    console.log(`Recording started: ${composition.sid}`);

    res.json({
      recordingSid: composition.sid,
      status: composition.status,
      roomSid: composition.roomSid,
    });
  } catch (err) {
    console.error("Recording start error:", err);
    res.status(500).json({
      error: "recording_start_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Stop recording endpoint
app.post("/api/recording/stop", async (req, res) => {
  try {
    const { recordingSid } = req.body;

    if (!recordingSid) {
      return res.status(400).json({ error: "recordingSid is required" });
    }

    console.log(`Stopping recording: ${recordingSid}`);

    // Fetch the composition first
    let composition = await (twilioClient as any).video
      .compositions(recordingSid)
      .fetch();

    // Do NOT end the room here; finishing the room disconnects participants.

    // Optionally stop recording of new media (keep existing media) by disabling rules
    try {
      const compRoomSid = composition.roomSid;
      if (compRoomSid) {
        await (twilioClient as any).video
          .rooms(compRoomSid)
          .recordingRules.update({ rules: [{ type: "exclude", all: true }] });
        console.log(
          `Recording rules disabled (exclude all) for room ${compRoomSid}`
        );
      }
    } catch (e) {
      console.warn(`Could not disable recording rules.`, e);
    }

    // Poll composition until it's completed or timeout
    const maxAttempts = 15; // ~30s total
    const delayMs = 2000;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      composition = await (twilioClient as any).video
        .compositions(recordingSid)
        .fetch();

      const normalizedStatus =
        composition.status === "completed"
          ? "completed"
          : composition.status === "failed"
          ? "failed"
          : "in-progress";

      // Some SDK versions expose downloadable URL as `url`; otherwise it may be missing until ready
      if (normalizedStatus === "completed" && (composition as any).url) {
        return res.json({
          recordingSid: composition.sid,
          status: normalizedStatus,
          duration: composition.duration,
          size: composition.size,
          url: (composition as any).url,
          roomSid: composition.roomSid,
        });
      }

      if (normalizedStatus === "failed") {
        return res.json({
          recordingSid: composition.sid,
          status: normalizedStatus,
          roomSid: composition.roomSid,
        });
      }

      await delay(delayMs);
    }

    // Timed out waiting for URL, return latest status
    const normalizedStatus =
      composition.status === "completed"
        ? "completed"
        : composition.status === "failed"
        ? "failed"
        : "in-progress";

    res.json({
      recordingSid: composition.sid,
      status: normalizedStatus,
      duration: composition.duration,
      size: composition.size,
      url: (composition as any).url,
      roomSid: composition.roomSid,
    });
  } catch (err) {
    console.error("Recording stop error:", err);
    res.status(500).json({
      error: "recording_stop_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get recording status endpoint
app.get("/api/recording/:recordingSid", async (req, res) => {
  try {
    const { recordingSid } = req.params;

    const composition = await twilioClient.video
      .compositions(recordingSid)
      .fetch();

    res.json({
      recordingSid: composition.sid,
      status: composition.status,
      duration: composition.duration,
      size: composition.size,
      url: composition.url,
      roomSid: composition.roomSid,
    });
  } catch (err) {
    console.error("Recording fetch error:", err);
    res.status(500).json({
      error: "recording_fetch_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Get downloadable media URL (redirect) for a composition
app.get("/api/recording/:recordingSid/media", async (req, res) => {
  try {
    const { recordingSid } = req.params;

    // Use Twilio REST Media endpoint (redirect) with Basic auth
    const mediaEndpoint = `https://video.twilio.com/v1/Compositions/${recordingSid}/Media?Ttl=3600`;
    const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
    const authToken = process.env.TWILIO_AUTH_TOKEN as string;
    if (!accountSid || !authToken) {
      return res.status(500).json({
        error: "config_error",
        message: "Twilio credentials not configured",
      });
    }

    const authHeader = `Basic ${Buffer.from(
      `${accountSid}:${authToken}`
    ).toString("base64")}`;
    const twilioResp = await fetch(mediaEndpoint, {
      method: "GET",
      headers: { Authorization: authHeader },
      redirect: "manual",
    } as any);

    if (twilioResp.status === 302) {
      const location = twilioResp.headers.get("location");
      if (location) return res.redirect(302, location);
    }
    if (twilioResp.status === 404) {
      return res
        .status(404)
        .json({ error: "not_found", message: "Recording not found" });
    }
    if ([409, 423, 425, 202].includes(twilioResp.status)) {
      return res.status(202).json({ status: "processing" });
    }
    if (twilioResp.status === 200) {
      // Some responses may include JSON with media location
      const data: any = await twilioResp.json().catch(() => ({} as any));
      const location = (data?.redirect_to ||
        data?.media_location ||
        data?.location ||
        data?.url) as string | undefined;
      if (location) return res.redirect(302, location);
      return res.status(202).json({ status: "processing" });
    }

    const text = await twilioResp.text().catch(() => "");
    return res.status(500).json({
      error: "recording_media_failed",
      message: `Unexpected status ${twilioResp.status}: ${text}`,
    });
  } catch (err: any) {
    console.error("Recording media fetch error:", err);
    return res.status(500).json({
      error: "recording_media_failed",
      message: err?.message || String(err),
    });
  }
});

// End room endpoint
app.post("/api/room/:roomSid/end", async (req, res) => {
  try {
    const { roomSid } = req.params;

    console.log(`Ending room: ${roomSid}`);

    // Update room status to completed
    await twilioClient.video
      .rooms(roomSid)
      .update({ status: "completed" as any });

    res.json({ success: true, message: "Room ended successfully" });
  } catch (err) {
    console.error("Room end error:", err);
    res.status(500).json({
      error: "room_end_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Disconnect all participants except the provided identity
app.post("/api/room/:roomSid/kick-others", async (req, res) => {
  try {
    const { roomSid } = req.params;
    const { keepIdentity } = req.body || {};
    if (!keepIdentity) {
      return res.status(400).json({ error: "keepIdentity_required" });
    }

    // List participants via REST (participants API is limited; we use Participants list)
    const participants = await (twilioClient as any).video
      .rooms(roomSid)
      .participants.list({ status: "connected", limit: 50 });

    const toDisconnect = participants.filter(
      (p: any) => p.identity !== keepIdentity
    );
    for (const p of toDisconnect) {
      try {
        await (twilioClient as any).video
          .rooms(roomSid)
          .participants(p.sid)
          .update({ status: "disconnected" });
      } catch (e) {
        console.warn(
          `Failed to disconnect participant ${p.identity} (${p.sid})`,
          e
        );
      }
    }

    res.json({
      success: true,
      disconnected: toDisconnect.map((p: any) => p.identity),
    });
  } catch (err) {
    console.error("Kick-others error:", err);
    res.status(500).json({
      error: "kick_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Update recording rules for a room
app.post("/api/room/:roomSid/recording-rules", async (req, res) => {
  try {
    const { roomSid } = req.params;
    const { rules } = req.body || {};
    if (!Array.isArray(rules)) {
      return res
        .status(400)
        .json({ error: "invalid_rules", message: "rules must be an array" });
    }
    const updated = await (twilioClient as any).video
      .rooms(roomSid)
      .recordingRules.update({ rules });
    res.json({ success: true, rules: updated.rules || rules });
  } catch (err) {
    console.error("Recording rules update error:", err);
    res.status(500).json({
      error: "rules_update_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Inspect room details
app.get("/api/room/:roomSid", async (req, res) => {
  try {
    const { roomSid } = req.params;
    const room = await (twilioClient as any).video.rooms(roomSid).fetch();
    // Recording rules fetch is not directly available; expose basic fields
    res.json({
      sid: room.sid,
      uniqueName: room.uniqueName,
      type: (room as any).type,
      status: room.status,
      dateCreated: room.dateCreated,
      dateUpdated: room.dateUpdated,
    });
  } catch (err) {
    console.error("Room fetch error:", err);
    res.status(500).json({
      error: "room_fetch_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// List compositions for a room
app.get("/api/room/:roomSid/compositions", async (req, res) => {
  try {
    const { roomSid } = req.params;
    const comps = await (twilioClient as any).video.compositions.list({
      limit: 20,
      roomSid,
    });
    res.json(
      comps.map((c: any) => ({
        sid: c.sid,
        status: c.status,
        duration: c.duration,
        size: c.size,
        url: c.url,
        dateCreated: c.dateCreated,
      }))
    );
  } catch (err) {
    console.error("Room compositions list error:", err);
    res.status(500).json({
      error: "room_compositions_failed",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// Recording status callback endpoint
app.post("/api/recording/status", (req, res) => {
  console.log("Recording status callback:", req.body);
  res.status(200).send("OK");
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

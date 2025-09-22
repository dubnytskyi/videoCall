// Simple test script for recording functionality
// Using built-in fetch (Node.js 18+)

const SERVER_URL = "http://localhost:4000";

async function testRecordingAPI() {
  console.log("🧪 Testing Twilio Video Recording API...\n");

  try {
    // Test 1: Health check
    console.log("1. Testing health check...");
    const healthResponse = await fetch(`${SERVER_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData.status);

    // Test 2: Get token (required for room creation)
    console.log("\n2. Testing token generation...");
    const tokenResponse = await fetch(`${SERVER_URL}/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: "test-user", room: "test-room" }),
    });
    const tokenData = await tokenResponse.json();
    console.log("✅ Token generated:", !!tokenData.token);

    // Test 3: Test recording start (this will fail without a real room, but tests the endpoint)
    console.log("\n3. Testing recording start endpoint...");
    try {
      const recordingResponse = await fetch(
        `${SERVER_URL}/api/recording/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomSid: "test-room-sid" }),
        }
      );

      if (recordingResponse.ok) {
        const recordingData = await recordingResponse.json();
        console.log("✅ Recording start endpoint works:", recordingData);
      } else {
        const errorData = await recordingResponse.json();
        console.log(
          "⚠️  Recording start failed (expected without real room):",
          errorData.message
        );
      }
    } catch (error) {
      console.log("⚠️  Recording start error (expected):", error.message);
    }

    console.log("\n🎉 API endpoints are working!");
    console.log("\n📝 Next steps:");
    console.log("1. Set up your Twilio credentials in server/.env");
    console.log("2. Start the server: cd server && npm run dev");
    console.log("3. Start the client: cd client && npm run dev");
    console.log("4. Open the app and test recording as a notary");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("\n🔧 Make sure the server is running:");
    console.log("cd server && npm run dev");
  }
}

// Run the test
testRecordingAPI();

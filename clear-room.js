const { Twilio } = require("./server/node_modules/twilio");

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_API_KEY_SECRET;

if (!accountSid || !authToken) {
  console.error(
    "Please set TWILIO_ACCOUNT_SID and TWILIO_API_KEY_SECRET environment variables"
  );
  process.exit(1);
}

const client = new Twilio(accountSid, authToken);

async function clearRoom() {
  try {
    console.log("Clearing room: notary-room");

    // Get all participants in the room
    const participants = await client.video
      .rooms("notary-room")
      .participants.list();

    console.log(`Found ${participants.length} participants`);

    // Disconnect all participants
    for (const participant of participants) {
      console.log(`Disconnecting participant: ${participant.identity}`);
      await participant.update({ status: "disconnected" });
    }

    console.log("Room cleared successfully!");
  } catch (error) {
    if (error.code === 20404) {
      console.log("Room not found or already empty");
    } else {
      console.error("Error clearing room:", error.message);
    }
  }
}

clearRoom();

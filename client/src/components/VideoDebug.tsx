import { useEffect, useState } from "react";
import { connect, createLocalVideoTrack, createLocalAudioTrack } from "twilio-video";

type Props = {
  token: string;
  identity: string;
};

export default function VideoDebug({ token, identity }: Props) {
  const [status, setStatus] = useState<string>("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        addLog("Starting connection test...");
        setStatus("Creating local tracks...");

        // Test local video track creation
        addLog("Creating local video track...");
        const videoTrack = await createLocalVideoTrack();
        addLog("✅ Local video track created successfully");

        // Test local audio track creation
        addLog("Creating local audio track...");
        const audioTrack = await createLocalAudioTrack();
        addLog("✅ Local audio track created successfully");

        setStatus("Connecting to Twilio room...");
        addLog("Connecting to room...");

        // Test room connection
        const room = await connect(token, {
          tracks: [videoTrack, audioTrack],
          name: `debug-room-${Date.now()}`,
          identity: `debug-${Date.now()}`
        });

        addLog("✅ Connected to room successfully");
        setStatus("✅ All tests passed!");

        // Clean up
        room.disconnect();
        videoTrack.stop();
        audioTrack.stop();

      } catch (err: any) {
        addLog(`❌ Error: ${err.message}`);
        setError(err.message);
        setStatus("❌ Connection failed");
        
        if (err.name === "NotAllowedError") {
          addLog("❌ Camera/microphone access denied");
        } else if (err.name === "NotFoundError") {
          addLog("❌ No camera/microphone found");
        } else if (err.name === "NotReadableError") {
          addLog("❌ Camera/microphone is being used by another application");
        } else if (err.message.includes("token")) {
          addLog("❌ Twilio token error - check credentials");
        } else if (err.message.includes("room")) {
          addLog("❌ Room connection error");
        }
      }
    };

    testConnection();
  }, [token, identity]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Video Connection Debug</h3>
      
      <div className="mb-4">
        <p className="text-sm font-medium">Status: {status}</p>
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            Error: {error}
          </div>
        )}
      </div>

      <div className="bg-gray-100 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Identity:</strong> {identity}</p>
        <p><strong>Token:</strong> {token.substring(0, 50)}...</p>
        <p><strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}</p>
        <p><strong>HTTPS:</strong> {window.location.protocol === "https:" ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}

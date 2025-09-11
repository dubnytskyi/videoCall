// Configuration for the client application
export const config = {
  // Server URL - will be set based on environment
  serverUrl: getServerUrl(),

  // Video room name
  roomName: "notary-room",

  // Participant identities
  identities: {
    notary: "Notary",
    client: "Client",
  },
};

// Helper function to get server URL
export function getServerUrl(): string {
  // In production (Vercel), use the deployed API
  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("vercel.app")
  ) {
    return `https://${window.location.hostname}`;
  }

  // In development, use local server
  return "http://localhost:4000";
}

import { getServerUrl } from "../config";

export async function fetchTwilioToken(
  identity: string,
  room: string,
  serverUrl?: string
) {
  const url = serverUrl || `${getServerUrl()}/api/token`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identity, room }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Token error");
  return data.token as string;
}

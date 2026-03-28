const BASE_URL = "http://localhost:8000";

export async function postActivity(payload) {
  const response = await fetch(`${BASE_URL}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send activity payload");
  }

  return response.json();
}

export async function fetchState() {
  const response = await fetch(`${BASE_URL}/state`);
  if (!response.ok) {
    throw new Error("Failed to fetch state");
  }
  return response.json();
}

export async function fetchNotifications() {
  const response = await fetch(`${BASE_URL}/notifications`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

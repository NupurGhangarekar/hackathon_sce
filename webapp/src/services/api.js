const DEFAULT_API_BASE_URL = `http://${window.location.hostname}:8000`;
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;

export async function getState() {
  const response = await fetch(`${BASE_URL}/state`);
  if (!response.ok) {
    throw new Error("Failed to fetch state");
  }
  return response.json();
}

export async function getNotifications() {
  const response = await fetch(`${BASE_URL}/notifications`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

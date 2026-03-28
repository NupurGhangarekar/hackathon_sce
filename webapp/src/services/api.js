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

export async function getActivitySummary(minutes = 60) {
  const response = await fetch(`${BASE_URL}/api/v1/timeline/activity-summary?minutes=${minutes}`);
  if (!response.ok) {
    throw new Error("Failed to fetch activity summary");
  }
  return response.json();
}

export async function getPendingActions() {
  const response = await fetch(`${BASE_URL}/api/v1/actions/pending`);
  if (!response.ok) {
    throw new Error("Failed to fetch pending actions");
  }
  return response.json();
}

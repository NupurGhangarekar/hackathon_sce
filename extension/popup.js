import { fetchNotifications, fetchState } from "./api/apiClient.js";

const focusStateEl = document.getElementById("focusState");
const pendingCountEl = document.getElementById("pendingCount");
const syncInfoEl = document.getElementById("syncInfo");

function renderFallbackFromStorage(storage) {
  if (storage.focusState) {
    focusStateEl.textContent = storage.focusState;
  }
  if (typeof storage.pendingCount === "number") {
    pendingCountEl.textContent = String(storage.pendingCount);
  }
  if (storage.lastSyncAt) {
    syncInfoEl.textContent = `Last sync: ${new Date(storage.lastSyncAt).toLocaleTimeString()}`;
  }
}

async function renderPopupData() {
  try {
    const [state, notifications] = await Promise.all([fetchState(), fetchNotifications()]);
    focusStateEl.textContent = state.focus_state;
    pendingCountEl.textContent = String(notifications.pending_count);
    syncInfoEl.textContent = "Live data from backend";
  } catch (_error) {
    const storage = await chrome.storage.local.get([
      "focusState",
      "pendingCount",
      "lastSyncAt",
      "lastError",
    ]);
    renderFallbackFromStorage(storage);
    if (storage.lastError) {
      syncInfoEl.textContent = `Offline mode: ${storage.lastError}`;
    }
  }
}

renderPopupData();

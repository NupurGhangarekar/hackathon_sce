// Get DOM elements
const statusEl = document.getElementById("status");
const activityCountEl = document.getElementById("activityCount");
const lastSyncEl = document.getElementById("lastSync");
const focusStateEl = document.getElementById("focusState");
const currentDataEl = document.getElementById("currentData");
const statusIndicator = document.getElementById("statusIndicator");
const errorBox = document.getElementById("errorBox");
const errorMessage = document.getElementById("errorMessage");
const dashboardBtn = document.getElementById("dashboardBtn");
const refreshBtn = document.getElementById("refreshBtn");
const deepWorkBtn = document.getElementById("deepWorkBtn");
const pauseBtn = document.getElementById("pauseBtn");
const settingsBtn = document.getElementById("settingsBtn");

// Helper function to format time difference
function formatTimeAgo(timestamp) {
  if (!timestamp) return "Never";
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

// Load button states
function loadButtonStates() {
  chrome.storage.local.get(['deepWorkMode', 'trackingPaused'], (data) => {
    if (data.deepWorkMode) {
      deepWorkBtn.classList.add('btn-active-toggle');
      deepWorkBtn.textContent = '🧠 Deep Work: ON';
    } else {
      deepWorkBtn.classList.remove('btn-active-toggle');
      deepWorkBtn.textContent = '🧠 Deep Work';
    }
    
    if (data.trackingPaused) {
      pauseBtn.classList.add('btn-active-toggle');
      pauseBtn.textContent = '▶️ Resume';
      statusIndicator.className = 'status-indicator paused';
      statusEl.textContent = '⏸️ Paused Tracker';
    } else {
      pauseBtn.classList.remove('btn-active-toggle');
      pauseBtn.textContent = '⏸️ Pause';
    }
  });
}

// Update popup status
async function updateStatus() {
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (!response) return;

    // We check if paused first locally
    chrome.storage.local.get(['trackingPaused'], (data) => {
      if (data.trackingPaused) {
        statusIndicator.className = 'status-indicator paused';
        statusEl.textContent = '⏸️ Paused Tracker';
      } else {
        const indicator = response.status === "active" ? "active" : "error";
        statusIndicator.className = `status-indicator ${indicator}`;
        statusEl.textContent = response.status === "active" ? "✅ Active Monitor" : "❌ Error";
      }
    });
    
    activityCountEl.textContent = response.activityCount || 0;
    lastSyncEl.textContent = formatTimeAgo(response.lastSync);
    focusStateEl.textContent = response.focusState ? `${response.focusState.toUpperCase()}` : "—";
    
    if (response.contextCapsule) {
      const capsule = response.contextCapsule;
      const resume = capsule.cognitiveResume || {};
      
      let cognitiveHtml = "";
      if (resume.summary) {
        const emoji = resume.category ? resume.category.split(" ")[0] : "💭";
        cognitiveHtml = `
<strong style="color: #60a5fa;">🧠 Cognitive Resume:</strong>
${emoji} ${resume.activity}
"${resume.summary}"
Intent: ${resume.intent} (${Math.round(resume.confidence * 100)}% confident)`;
      }
      
      const dataContent = `<strong>Tab:</strong> ${capsule.title.substring(0, 45)}${capsule.title.length > 45 ? "..." : ""}
<strong>Focus:</strong> ${response.focusState || "monitoring"}
<strong>Pending:</strong> ${response.pendingNotifications || 0} notifications
${cognitiveHtml}`;
      
      currentDataEl.innerHTML = `<pre style="font-family: 'Inter', sans-serif; font-size: 11px; white-space: pre-wrap; word-break: break-word;">${dataContent}</pre>`;
    } else if (response.lastSync) {
      const dataContent = `Focus State: ${response.focusState || "unknown"}
Pending Notifications: ${response.pendingNotifications || 0}
Last Synced: ${formatTimeAgo(response.lastSync)}
Status: ${response.status}`;
      currentDataEl.textContent = dataContent;
    } else {
      currentDataEl.innerHTML = '<div class="loading">Waiting for first sync pattern...</div>';
    }
    
    if (response.lastError) {
      errorBox.style.display = "block";
      errorMessage.textContent = `Error: ${response.lastError}`;
    } else {
      errorBox.style.display = "none";
    }
  });
}

// Listeners
if (dashboardBtn) dashboardBtn.addEventListener("click", () => chrome.tabs.create({ url: "http://localhost:5173" }));
if (refreshBtn) refreshBtn.addEventListener("click", () => {
    updateStatus();
    refreshBtn.classList.add('glow');
    setTimeout(() => refreshBtn.classList.remove('glow'), 400);
});

if (deepWorkBtn) {
  deepWorkBtn.addEventListener('click', () => {
    chrome.storage.local.get(['deepWorkMode'], (data) => {
      const newState = !data.deepWorkMode;
      chrome.storage.local.set({ deepWorkMode: newState });
      loadButtonStates();
      // Inform backend if necessary
      chrome.runtime.sendMessage({ action: "toggleDeepWork", state: newState });
    });
  });
}

if (pauseBtn) {
  pauseBtn.addEventListener('click', () => {
    chrome.storage.local.get(['trackingPaused'], (data) => {
      const newState = !data.trackingPaused;
      chrome.storage.local.set({ trackingPaused: newState });
      loadButtonStates();
      // Inform backend
      chrome.runtime.sendMessage({ action: "togglePause", state: newState });
    });
  });
}

if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    alert("Settings pane coming soon! (Aesthetics applied)");
  });
}

// Initial loads
loadButtonStates();
updateStatus();
const updateInterval = setInterval(updateStatus, 2000);

window.addEventListener("beforeunload", () => {
  clearInterval(updateInterval);
});

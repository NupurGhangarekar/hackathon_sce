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

// Update popup status
async function updateStatus() {
  chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
    if (!response) return;

    // Update status indicator
    const indicator = response.status === "active" ? "active" : "error";
    statusIndicator.className = `status-indicator ${indicator}`;
    
    // Update status text
    statusEl.textContent = response.status === "active" ? "✅ Active" : "❌ Error";
    
    // Update activity count
    activityCountEl.textContent = response.activityCount || 0;
    
    // Update last sync
    lastSyncEl.textContent = formatTimeAgo(response.lastSync);
    
    // Update focus state
    focusStateEl.textContent = response.focusState ? 
      `${response.focusState.toUpperCase()}` : "—";
    
    // Show current data
    if (response.contextCapsule) {
      const capsule = response.contextCapsule;
      const resume = capsule.cognitiveResume || {};
      
      let cognitiveHtml = "";
      if (resume.summary) {
        const emoji = resume.category ? resume.category.split(" ")[0] : "💭";
        cognitiveHtml = `
<strong style="color: #3b82f6;">🧠 Cognitive Resume:</strong>
${emoji} ${resume.activity}
"${resume.summary}"
Intent: ${resume.intent} (${Math.round(resume.confidence * 100)}% confident)`;
      }
      
      const dataContent = `<strong>Tab:</strong> ${capsule.title.substring(0, 45)}${capsule.title.length > 45 ? "..." : ""}
<strong>Focus:</strong> ${response.focusState || "monitoring"}
<strong>Pending:</strong> ${response.pendingNotifications || 0} notifications
${cognitiveHtml}`;
      
      currentDataEl.innerHTML = `<pre style="font-family: system-ui; font-size: 12px; white-space: pre-wrap; word-break: break-word;">${dataContent}</pre>`;
    } else if (response.lastSync) {
      const dataContent = `Focus State: ${response.focusState || "unknown"}
Pending Notifications: ${response.pendingNotifications || 0}
Last Synced: ${formatTimeAgo(response.lastSync)}
Status: ${response.status}`;
      currentDataEl.textContent = dataContent;
    } else {
      currentDataEl.innerHTML = '<div class="loading">Waiting for first sync...</div>';
    }
    
    // Show error if any
    if (response.lastError) {
      errorBox.style.display = "block";
      errorMessage.textContent = `Error: ${response.lastError}`;
    } else {
      errorBox.style.display = "none";
    }
  });
}

// Refresh status
function refreshStatus() {
  updateStatus();
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: "http://localhost:5173" });
}

// Add event listeners to buttons
if (dashboardBtn) {
  dashboardBtn.addEventListener("click", openDashboard);
}
if (refreshBtn) {
  refreshBtn.addEventListener("click", refreshStatus);
}

// Update immediately and then every 2 seconds
updateStatus();
const updateInterval = setInterval(updateStatus, 2000);

// Clean up when popup closes
window.addEventListener("beforeunload", () => {
  clearInterval(updateInterval);
});

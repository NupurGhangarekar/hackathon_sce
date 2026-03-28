const trackerState = {
  activeUrl: "",
  tabSwitchCount: 0,
  tabSwitchesLast5s: 0,
  idleSeconds: 0,
  lastActiveAt: Date.now(),
  currentIdleState: "active",
  currentFile: "",
  clipboardSnippet: "",
  lastInterruptionAt: Date.now(),
};

async function updateActiveTabUrl() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  trackerState.activeUrl = activeTab?.url ?? "";
  // Try to extract file name from URL for coding sites
  try {
    const url = new URL(trackerState.activeUrl);
    if (url.hostname.includes("github")) {
      const path = url.pathname;
      trackerState.currentFile = path.split("/").pop() || "";
    }
  } catch (e) {
    // Invalid URL, skip file extraction
  }
}

function onTabActivated() {
  trackerState.tabSwitchCount += 1;
  trackerState.tabSwitchesLast5s += 1;
  trackerState.lastInterruptionAt = Date.now();
  updateActiveTabUrl();
}

function onTabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    trackerState.activeUrl = tab.url ?? trackerState.activeUrl;
  }
}

function onIdleStateChanged(newState) {
  trackerState.currentIdleState = newState;
  if (newState === "active") {
    trackerState.lastActiveAt = Date.now();
    trackerState.idleSeconds = 0;
  }
}

async function refreshIdleTime() {
  const idleState = await chrome.idle.queryState(15);
  trackerState.currentIdleState = idleState;
  if (idleState === "active") {
    trackerState.idleSeconds = 0;
    trackerState.lastActiveAt = Date.now();
    return;
  }

  const elapsed = Math.floor((Date.now() - trackerState.lastActiveAt) / 1000);
  trackerState.idleSeconds = Math.max(0, elapsed);
}

async function captureClipboard() {
  try {
    // Note: Requires clipboard permission in manifest.json
    const text = await navigator.clipboard.readText();
    trackerState.clipboardSnippet = text.substring(0, 100); // Limit to first 100 chars
  } catch (e) {
    // Clipboard access denied or not available
    trackerState.clipboardSnippet = "";
  }
}

export async function initializeActivityTracker() {
  await updateActiveTabUrl();
  await captureClipboard();

  chrome.tabs.onActivated.addListener(onTabActivated);
  chrome.tabs.onUpdated.addListener(onTabUpdated);
  chrome.idle.onStateChanged.addListener(onIdleStateChanged);
}

export async function getActivityPayload() {
  await refreshIdleTime();
  await captureClipboard();

  return {
    active_url: trackerState.activeUrl,
    tab_switch_count: trackerState.tabSwitchCount,
    tab_switches_last_5s: trackerState.tabSwitchesLast5s,
    idle_seconds: trackerState.idleSeconds,
    current_file: trackerState.currentFile,
    clipboard_snippet: trackerState.clipboardSnippet,
    timestamp: new Date().toISOString(),
  };
}

export function resetIntervalCounters() {
  trackerState.tabSwitchesLast5s = 0;
}

export function getTrackerState() {
  return { ...trackerState };
}

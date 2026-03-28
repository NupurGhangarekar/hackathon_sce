import { postActivity } from "./api/apiClient.js";
import {
  getActivityPayload,
  initializeActivityTracker,
  resetIntervalCounters,
  getTrackerState,
} from "./utils/activityTracker.js";
import { generateCognitiveResume } from "./utils/cognitiveAI.js";

const ACTIVITY_ALARM = "send-activity";
let activityCount = 0;
let lastSyncError = null;
let lastContextCapsule = null;

async function sendActivityTick() {
  try {
    const { trackingPaused } = await chrome.storage.local.get("trackingPaused");
    if (trackingPaused) {
      console.log("[Activity Tracker] Tracking is paused. Skipping sync.");
      return;
    }

    const payload = await getActivityPayload();
    
    // Add deep work info to payload if active
    const { deepWorkMode } = await chrome.storage.local.get("deepWorkMode");
    if (deepWorkMode) {
      payload.is_deep_work = true;
    }

    const result = await postActivity(payload);
    
    activityCount++;
    lastSyncError = null;

    // Check if there was an interruption (tab switch)
    const trackerState = getTrackerState();
    if (trackerState.tabSwitchesLast5s > 0) {
      // Create context capsule before interruption
      try {
        await fetch("http://localhost:8000/api/v1/context-capsule/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.log("Could not create context capsule:", e);
      }

      // Record interruption for attention debt tracking
      try {
        const source = trackerState.tabSwitchesLast5s > 2 ? "rapid_tab_switch" : "tab_switch";
        await fetch(
          `http://localhost:8000/api/v1/attention-debt/record-interruption?source=${source}&severity=1.0`,
          { method: "POST" }
        );
      } catch (e) {
        console.log("Could not record interruption:", e);
      }
    }

    await chrome.storage.local.set({
      focusState: result.focus_state,
      pendingCount: result.pending_notifications,
      lastPayload: payload,
      lastSyncAt: new Date().toISOString(),
      activityCount: activityCount,
      lastSyncError: null,
      extensionStatus: "active",
    });
    
    console.log(`[Activity Tracker] Sync #${activityCount}`, result);
  } catch (error) {
    lastSyncError = error.message;
    console.error("[Activity Tracker] Error:", error);
    await chrome.storage.local.set({
      lastError: error.message,
      lastSyncAt: new Date().toISOString(),
      lastSyncError: error.message,
      extensionStatus: "error",
    });
  } finally {
    resetIntervalCounters();
  }
}

async function captureContextCapsule(tabId, tab) {
  try {
    const resume = generateCognitiveResume(tab.title || tab.url || "Untitled", tab.url || "");
    
    const capsule = {
      id: tabId,
      title: tab.title || tab.url || "Untitled",
      url: tab.url || "",
      timestamp: new Date().toISOString(),
      cognitiveResume: resume,
      favicon: tab.favIconUrl || "",
    };

    lastContextCapsule = capsule;

    await chrome.storage.local.set({
      contextCapsule: capsule,
      capsuleHistory: await getCapsuleHistory(capsule),
    });

    console.log("[Context Capsule] Captured:", capsule);
  } catch (error) {
    console.error("[Context Capsule] Error:", error);
  }
}

async function getCapsuleHistory(newCapsule) {
  const { capsuleHistory = [] } = await chrome.storage.local.get("capsuleHistory");
  
  // Add new capsule to history
  const updated = [newCapsule, ...capsuleHistory].slice(0, 10); // Keep last 10
  
  return updated;
}

async function bootstrap() {
  console.log("[Activity Tracker] Initializing...");
  await initializeActivityTracker();

  // More frequent updates: every 5 seconds
  chrome.alarms.create(ACTIVITY_ALARM, { periodInMinutes: 5 / 60 });
  
  await chrome.storage.local.set({
    extensionStatus: "active",
    startTime: new Date().toISOString(),
    activityCount: 0,
  });
  
  console.log("[Activity Tracker] Started. Sending updates every 5 seconds.");
  
  // Send initial tick immediately
  await sendActivityTick();
}

chrome.runtime.onInstalled.addListener(bootstrap);
chrome.runtime.onStartup.addListener(bootstrap);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ACTIVITY_ALARM) {
    sendActivityTick();
  }
});

// Listen for tab activation to capture context
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    await captureContextCapsule(tabId, tab);
  } catch (error) {
    console.error("[Context Capsule] Error capturing context:", error);
  }
});

// Also capture on tab update (URL change)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    try {
      const activeTab = await chrome.tabs.get(tabId);
      await captureContextCapsule(tabId, activeTab);
    } catch (error) {
      console.error("[Context Capsule] Error capturing context:", error);
    }
  }
});

// Make activity tracker available to popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getStatus") {
    chrome.storage.local.get(null, (items) => {
      sendResponse({
        status: items.extensionStatus || "inactive",
        activityCount: items.activityCount || 0,
        lastSync: items.lastSyncAt,
        focusState: items.focusState,
        pendingNotifications: items.pendingCount,
        lastError: items.lastSyncError,
        startTime: items.startTime,
        contextCapsule: items.contextCapsule,
        capsuleHistory: items.capsuleHistory || [],
      });
    });
    return true; // Keep the message channel open
  }
});

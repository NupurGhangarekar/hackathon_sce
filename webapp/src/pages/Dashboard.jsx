import { useEffect, useState } from "react";

import ActivityPanel from "../components/ActivityPanel";
import Navbar from "../components/Navbar";
import NotificationPanel from "../components/NotificationPanel";
import StateCard from "../components/StateCard";
import ContextCapsulePanel from "../components/ContextCapsulePanel";
import AttentionDebtPanel from "../components/AttentionDebtPanel";
import ActionCompressionPanel from "../components/ActionCompressionPanel";
import { getNotifications, getState } from "../services/api";

const INITIAL_STATE = {
  focus_state: "focused",
  active_url: "",
  tab_switch_count: 0,
  tab_switches_last_5s: 0,
  idle_seconds: 0,
};

const INITIAL_NOTIFICATIONS = {
  delayed: [],
  delivered: [],
  pending_count: 0,
};

export default function Dashboard() {
  const [state, setState] = useState(INITIAL_STATE);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [error, setError] = useState("");
  const [extensionConnected, setExtensionConnected] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [stateData, notificationsData] = await Promise.all([
          getState(),
          getNotifications(),
        ]);

        if (!active) return;
        setState(stateData);
        setNotifications(notificationsData);
        
        // Check if we're getting real data from the extension
        if (stateData.tab_switch_count > 0 || notificationsData.pending_count > 0) {
          setExtensionConnected(true);
        }
        
        setError("");
      } catch (_err) {
        if (!active) return;
        setError("Cannot reach backend. Is FastAPI running on port 8000?");
      }
    }

    loadData();
    const timer = window.setInterval(loadData, 2000); // Refresh every 2 seconds

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="layout">
      <Navbar />
      {error ? <p className="error">{error}</p> : null}

      <StateCard state={state.focus_state} />
      <div className="panel-grid">
        <ActivityPanel state={state} />
        <NotificationPanel notifications={notifications} />
      </div>

      <div className="advanced-features-grid">
        <ContextCapsulePanel />
        <AttentionDebtPanel />
        <ActionCompressionPanel />
      </div>
    </div>
  );
}

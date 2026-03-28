import { useEffect, useState } from "react";

import ActivityPanel from "../components/ActivityPanel";
import Navbar from "../components/Navbar";
import NotificationPanel from "../components/NotificationPanel";
import StateCard from "../components/StateCard";
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
        setError("");
      } catch (_err) {
        if (!active) return;
        setError("Cannot reach backend. Is FastAPI running on port 8000?");
      }
    }

    loadData();
    const timer = window.setInterval(loadData, 4000);

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
    </div>
  );
}

export default function ActivityPanel({ state }) {
  return (
    <section className="panel">
      <h3>Activity Metrics</h3>
      <div className="grid-two">
        <div>
          <p className="metric-label">Active URL</p>
          <p className="metric-value small">{state.active_url || "N/A"}</p>
        </div>
        <div>
          <p className="metric-label">Tab Switches (Total)</p>
          <p className="metric-value">{state.tab_switch_count}</p>
        </div>
        <div>
          <p className="metric-label">Tab Switches (Last 5s)</p>
          <p className="metric-value">{state.tab_switches_last_5s}</p>
        </div>
        <div>
          <p className="metric-label">Idle Time</p>
          <p className="metric-value">{state.idle_seconds}s</p>
        </div>
      </div>
    </section>
  );
}

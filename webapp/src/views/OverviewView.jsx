import FocusOrb from '../components/FocusOrb';

export default function OverviewView({ state, notifications, activityData }) {
  const stats = [
    {
      label: 'Active Session',
      value: activityData?.total_time_minutes ? `${activityData.total_time_minutes}m` : '0m',
      change: state.focus_state === 'focused' ? 'Optimal' : null,
      accent: 'cyan'
    },
    {
      label: 'Context Switches',
      value: state.tab_switch_count + '',
      change: 'Today',
      accent: 'blue'
    },
    {
      label: 'Idle Time',
      value: `${state.idle_seconds}s`,
      change: state.idle_seconds > 60 ? '⚠️ High' : 'Low',
      accent: 'purple'
    },
  ];

  return (
    <div className="fade-in perspective-container">
      {/* 3D Focus Orb Hero Section */}
      <div className="focus-hero-section preserve-3d floating-3d">
        <FocusOrb state={state.focus_state} />
        <div className="focus-hero-content depth-layer-2">
          <div className="focus-label">System State</div>
          <h2 className={`focus-value-enhanced ${state.focus_state}`}>
            {state.focus_state.toUpperCase()}
          </h2>
        </div>
      </div>

      <div className="stats-grid preserve-3d">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card hover-scale preserve-3d neon-glow-${stat.accent}`}>
            <div className="glass-layer"></div>
            <div className="stat-label depth-layer-1">{stat.label}</div>
            <div className="stat-value depth-layer-2">{stat.value}</div>
            {stat.change && (
              <div className={`stat-change depth-layer-3 ${stat.accent === 'purple' ? 'warning' : 'positive'}`}>
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2 preserve-3d" style={{ marginTop: '40px' }}>
        <div className="floating-context-panel preserve-3d">
          <div className="panel-header">
            <h3 className="panel-title depth-layer-1">Live Context Monitor</h3>
            <p className="panel-subtitle depth-layer-1">Real-time URL & Interaction Stream</p>
          </div>
          <div className="depth-layer-2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="context-item">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Active Window
              </div>
              <div className="url-badge">
                {state.active_url || 'Idle / System'}
              </div>
            </div>
            <div className="context-item">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                Attention Intensity
              </div>
              <div className="intensity-bar">
                <div className="intensity-fill" style={{ width: state.focus_state === 'focused' ? '90%' : '30%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel preserve-3d">
          <div className="panel-header">
            <h3 className="panel-title depth-layer-1">Notification Pulse</h3>
            <p className="panel-subtitle depth-layer-1">Smart queue status</p>
          </div>
          <div className="depth-layer-2 pulse-grid">
            <div className="pulse-item warning">
              <div className="pulse-value">{notifications.delayed.length}</div>
              <div className="pulse-label">Held</div>
            </div>
            <div className="pulse-item success">
              <div className="pulse-value">{notifications.delivered.length}</div>
              <div className="pulse-label">Released</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from 'react';

export default function ActivityView({ state, activityData }) {
  const activities = activityData?.activities || [];
  const topUrl = activityData?.top_urls?.[0] || null;

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const getTimeAgo = (startTime) => {
    const diff = Math.floor((new Date() - new Date(startTime)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getIcon = (url) => {
    if (url.includes('github')) return '🐙';
    if (url.includes('figma')) return '🎨';
    if (url.includes('google')) return '📝';
    if (url.includes('youtube')) return '🎬';
    if (url.includes('slack')) return '💬';
    return '🌐';
  };

  return (
    <div className="fade-in perspective-container">
      <div className="grid-2 preserve-3d">
        {/* Left: Timeline Vortex */}
        <div className="preserve-3d">
          <div className="panel-header">
            <h3 className="panel-title depth-layer-1">Timeline Vortex</h3>
            <p className="panel-subtitle depth-layer-1">Sequence of recent cognitive engagements</p>
          </div>
          <div className="activity-vortex preserve-3d">
            {activities.length > 0 ? activities.slice(0, 8).map((activity, i) => (
              <div key={i} className="activity-card-vortex preserve-3d">
                <div className="activity-icon depth-layer-2" style={{ fontSize: '24px' }}>{getIcon(activity.url)}</div>
                <div className="activity-meta depth-layer-1">
                  <div className="activity-url">{activity.url}</div>
                  <div className="activity-time">{getTimeAgo(activity.start_time)}</div>
                </div>
                <div className="focus-score-badge depth-layer-2" style={{ fontSize: '10px' }}>
                  {formatDuration(activity.duration_seconds)}
                </div>
              </div>
            )) : <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>No recent activities</div>}
          </div>
        </div>

        {/* Right: Activity Summary */}
        <div className="preserve-3d">
          <div className="panel-header">
            <h3 className="panel-title depth-layer-1">Activity Diagnostic</h3>
            <p className="panel-subtitle depth-layer-1">Daily engagement peaks</p>
          </div>
          
          <div className="activity-summary-3d preserve-3d floating-3d">
            <div className="depth-layer-1" style={{ marginBottom: '30px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Peak Focus Hour
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                11:45 AM
              </div>
            </div>

            <div className="depth-layer-2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div className="metric-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px' }}>Deep Work Session</span>
                    <span style={{ fontSize: '12px', color: 'var(--success)' }}>+22%</span>
                  </div>
                  <div className="intensity-bar"><div className="intensity-fill" style={{ width: '85%' }}></div></div>
               </div>
               <div className="metric-row">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px' }}>Context Switching</span>
                    <span style={{ fontSize: '12px', color: 'var(--error)' }}>Low</span>
                  </div>
                  <div className="intensity-bar"><div className="intensity-fill" style={{ width: '15%', background: 'var(--error)' }}></div></div>
               </div>
            </div>

            <div className="depth-layer-3" style={{ marginTop: '40px' }}>
               <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--accent-blue)', fontWeight: '700' }}>AI INSIGHT</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0 0' }}>
                    {topUrl ? `Your productivity spikes when working on "${topUrl.display_name}". Recommendation: Front-load deep work here.` : `Not enough activity data to generate insights.`}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

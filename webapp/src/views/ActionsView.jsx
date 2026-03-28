import React from 'react';

export default function ActionsView({ actionsData, addToast }) {
  const pendingActions = actionsData?.actions || [];
  // For demo: simulated completed actions
  const completedActions = [
    { description: "Respond to urgent email from Manager", completed: true },
    { description: "Review PR #412", completed: true }
  ];

  return (
    <div className="fade-in perspective-container">
      {/* Estimation Engine Hero */}
      <div className="estimation-engine-hologram floating-3d preserve-3d">
        <div className="depth-layer-1" style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
          Total Estimated Processing Time
        </div>
        <div className="est-time-value depth-layer-2">
          EST: 04H 12M
        </div>
        <div className="depth-layer-1" style={{ fontSize: '12px', color: 'var(--accent-blue)', marginTop: '10px' }}>
          // OPTIMIZATION FLOW ACTIVE
        </div>
      </div>

      <div className="action-category-tabs preserve-3d">
        <div className="tab-3d active">PENDING</div>
        <div className="tab-3d">COMPLETED</div>
        <div className="tab-3d">ARCHIVED</div>
      </div>

      <div className="grid-2-alt preserve-3d" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '30px' }}>
        {pendingActions.map((action, i) => (
          <div key={i} className="task-cube preserve-3d">
            <div className="cube-accent"></div>
            <div className="panel-header" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="panel-title depth-layer-1" style={{ fontSize: '16px' }}>{action.action_text || action.description}</h3>
                <span className="depth-layer-2" style={{ fontSize: '10px', background: 'rgba(224, 64, 251, 0.1)', color: '#E040FB', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(224, 64, 251, 0.2)' }}>
                  {action.estimated_time_minutes ? `${action.estimated_time_minutes}m` : '5m'}
                </span>
              </div>
              <p className="panel-subtitle depth-layer-1">{action.source || action.domain || 'Global Context'}</p>
            </div>
            
            <div className="depth-layer-2" style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', background: 'linear-gradient(135deg, #E040FB, #7000FF)' }}>
                Execute
              </button>
              <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px' }}>
                Postpone
              </button>
            </div>
          </div>
        ))}

        {pendingActions.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
            <h3 style={{ color: 'var(--accent-cyan)' }}>Zero Pending Latency</h3>
            <p style={{ color: 'var(--text-muted)' }}>All context-aware actions have been synchronized.</p>
          </div>
        )}
      </div>

      <div className="completed-section preserve-3d" style={{ marginTop: '60px' }}>
         <h3 className="section-title depth-layer-1" style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Recently Dissolved</h3>
         <div className="preserve-3d" style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.6 }}>
            {completedActions.slice(0, 3).map((action, i) => (
              <div key={i} className="glass-panel-heavy preserve-3d" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div className="depth-layer-1" style={{ fontSize: '13px', textDecoration: 'line-through' }}>{action.description}</div>
                 <div className="depth-layer-1" style={{ fontSize: '11px', color: 'var(--success)' }}>✓ SYNCED</div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

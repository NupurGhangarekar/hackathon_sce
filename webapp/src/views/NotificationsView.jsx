import React from 'react';

export default function NotificationsView({ notifications, addToast }) {
  const handleRelease = () => {
    addToast('Releasing held notifications...', 'success');
  };

  return (
    <div className="fade-in perspective-container">
      <div className="grid-2 preserve-3d">
        {/* Left: Gravity Hub (Held Queue) */}
        <div className="glass-panel-heavy preserve-3d floating-3d" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="panel-header">
            <h3 className="panel-title depth-layer-1">Gravity Hub</h3>
            <p className="panel-subtitle depth-layer-1">Distraction-free notification orbit</p>
          </div>

          <div className="gravity-hub-container preserve-3d">
            <div className="hub-core depth-layer-2">
              <span style={{ fontSize: '24px' }}>🔔</span>
            </div>
            
            <div className="notif-orbit preserve-3d">
              {notifications.delayed.slice(0, 3).map((notif, i) => (
                <div 
                  key={i} 
                  className="hologram-card"
                  style={{
                    top: '0',
                    left: '50%',
                    transform: `rotate(${i * 120}deg) translateY(-140px) rotate(-${i * 120}deg)`
                  }}
                >
                  <div className="depth-layer-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {notif.body || 'New Notification'}
                  </div>
                </div>
              ))}
            </div>

            <div className="notif-orbit preserve-3d" style={{ animationDuration: '25s' }}>
              {/* Additional orbit if needed */}
            </div>
          </div>

          <div className="depth-layer-3">
             <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {notifications.delayed.length} items held in orbit
             </div>
             <button className="release-button-3d" onClick={handleRelease}>
                Release All
             </button>
          </div>
        </div>

        {/* Right: Delivered History */}
        <div className="glass-panel preserve-3d">
          <div className="panel-header">
            <h3 className="panel-title depth-layer-1">Delivered History</h3>
            <p className="panel-subtitle depth-layer-1">Context-safe interactions</p>
          </div>
          
          <div className="depth-layer-2" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.delivered.length > 0 ? (
              notifications.delivered.slice(0, 5).map((notif, i) => (
                <div key={i} className="glass-panel preserve-3d hover-scale" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: '13px', fontWeight: '600' }}>{notif.title || 'System Alert'}</div>
                       <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.body?.substring(0, 40)}...</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No recent history
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

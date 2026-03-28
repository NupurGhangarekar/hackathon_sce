import React from 'react';
import NeuralMap from '../components/NeuralMap';

export default function FocusView({ state }) {
  const optimizationTips = [
    { title: 'Ambient Sound', desc: 'White Noise active', icon: '🔊' },
    { title: 'Digital Silence', desc: 'Notifications muted', icon: '📴' },
    { title: 'Visual Breath', desc: 'Hydration reminder in 15m', icon: '💧' },
  ];

  return (
    <div className="fade-in perspective-container">
      <div className="grid-2 preserve-3d">
        {/* Left Column: Neural Map Hero */}
        <div className="glass-panel-heavy preserve-3d floating-3d" style={{ height: 'min-content' }}>
          <div className="panel-header">
            <h3 className="panel-title depth-layer-1">Neural Focus State</h3>
            <p className="panel-subtitle depth-layer-1">Cognitive load visualization</p>
          </div>
          <div className="depth-layer-2" style={{ padding: '20px 0' }}>
            <NeuralMap state={state.focus_state} />
          </div>
          <div className="focus-state-badge depth-layer-3">
             <span className={`status-dot ${state.focus_state}`}></span>
             {state.focus_state.toUpperCase()}
          </div>
        </div>

        {/* Right Column: Historical & Analysis */}
        <div className="preserve-3d" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel preserve-3d">
            <div className="panel-header">
              <h3 className="panel-title depth-layer-1">Focus History</h3>
              <p className="panel-subtitle depth-layer-1">Intensity over the last 4 hours</p>
            </div>
            <div className="history-graph-simple depth-layer-2">
              <div className="wave-svg">
                <svg viewBox="0 0 100 20" className="neon-graph" style={{ width: '100%', height: '60px' }}>
                  <path d="M0,10 Q10,2 20,10 T40,10 T60,10 T80,10 T100,10" fill="none" stroke="var(--accent-cyan)" strokeWidth="0.5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-panel preserve-3d">
            <div className="panel-header">
              <h3 className="panel-title depth-layer-1">Distraction Sources</h3>
              <p className="panel-subtitle depth-layer-1">Context leakage analysis</p>
            </div>
            <div className="depth-layer-2" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
               <div className="donut-chart-mini"></div>
               <div style={{ flex: 1, fontSize: '12px' }}>
                  <div className="legend-item" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></span> Development
                  </div>
                  <div className="legend-item" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }}></span> Social Media
                  </div>
                  <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></span> System Alerts
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="optimization-section preserve-3d" style={{ marginTop: '40px' }}>
         <h3 className="section-title depth-layer-1" style={{ marginBottom: '20px' }}>Optimization Tips</h3>
         <div className="grid-3 preserve-3d">
            {optimizationTips.map((tip, i) => (
              <div key={i} className="optimization-card preserve-3d hover-scale">
                 <div className="tip-icon depth-layer-2" style={{ fontSize: '24px', marginBottom: '12px' }}>{tip.icon}</div>
                 <div className="tip-title depth-layer-1" style={{ fontWeight: '700', marginBottom: '4px' }}>{tip.title}</div>
                 <div className="tip-desc depth-layer-1" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tip.desc}</div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

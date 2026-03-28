export default function LoadingSkeleton({ type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="glass-panel skeleton-card">
        <div className="skeleton-header">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-subtitle"></div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line"></div>
          <div className="skeleton skeleton-line short"></div>
        </div>
      </div>
    );
  }

  if (type === 'stat') {
    return (
      <div className="glass-panel skeleton-stat">
        <div className="skeleton skeleton-value"></div>
        <div className="skeleton skeleton-label"></div>
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="glass-panel skeleton-chart">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton-chart-area">
          <div className="skeleton-bar"></div>
          <div className="skeleton-bar"></div>
          <div className="skeleton-bar"></div>
          <div className="skeleton-bar"></div>
        </div>
      </div>
    );
  }

  return null;
}

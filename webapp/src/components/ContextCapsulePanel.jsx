import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function ContextCapsulePanel() {
  const [capsule, setCapsule] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContextCapsule();
    fetchHistory();
    const interval = setInterval(() => {
      fetchContextCapsule();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchContextCapsule = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/context-capsule/current');
      const data = await response.json();
      setCapsule(data.context_capsule);
    } catch (error) {
      console.error('Failed to fetch context capsule:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/context-capsule/history?limit=5');
      const data = await response.json();
      setHistory(data.capsules || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch capsule history:', error);
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="panel context-capsule-panel">
      <div className="panel-header">
        <h2>📸 Context Capsule</h2>
        <p className="subtitle">Your work snapshot before interruption</p>
      </div>

      {capsule ? (
        <div className="capsule-container active-capsule">
          <div className="capsule-content">
            <div className="capsule-section">
              <span className="section-label">📱 App/Window:</span>
              <span className="section-value">{capsule.current_app}</span>
            </div>

            <div className="capsule-section">
              <span className="section-label">📄 File:</span>
              <span className="section-value">{capsule.file_name || 'No file'}</span>
            </div>

            <div className="capsule-section">
              <span className="section-label">🔗 URL:</span>
              <span className="section-value url-value">
                {capsule.active_url
                  ? capsule.active_url.substring(0, 40) + '...'
                  : 'No URL'}
              </span>
            </div>

            <div className="capsule-section">
              <span className="section-label">💾 Clipboard:</span>
              <span className="section-value">
                {capsule.clipboard_snippet
                  ? capsule.clipboard_snippet.substring(0, 30) + '...'
                  : 'Empty'}
              </span>
            </div>

            <div className="capsule-highlight">
              <span className="highlight-label">✨ Task Summary:</span>
              <p className="highlight-text">{capsule.inferred_task_summary}</p>
            </div>

            <div className="capsule-meta">
              <span className="meta-item">
                <strong>Source:</strong> {capsule.interruption_source}
              </span>
              <span className="meta-item">
                <strong>Focus:</strong> {capsule.focus_state_before}
              </span>
            </div>

            <p className="timestamp">Captured at {formatTime(capsule.timestamp)}</p>
          </div>
        </div>
      ) : !loading ? (
        <div className="empty-state">
          <p>No context capsule yet. Start working to create one!</p>
        </div>
      ) : null}

      {history.length > 0 && (
        <div className="capsule-history">
          <h3>Recent Capsules</h3>
          <div className="history-list">
            {history.map((h) => (
              <div key={h.id} className="history-item">
                <span className="history-time">{formatTime(h.timestamp)}</span>
                <span className="history-task">{h.inferred_task_summary}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

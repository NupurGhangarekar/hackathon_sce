import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function AttentionDebtPanel() {
  const [debtScore, setDebtScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttentionDebt();
    const interval = setInterval(() => {
      fetchAttentionDebt();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAttentionDebt = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/attention-debt/score');
      const data = await response.json();
      setDebtScore(data.attention_debt);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch attention debt:', error);
      setLoading(false);
    }
  };

  const getDebtLevel = (minutes) => {
    if (minutes < 10) return { level: 'Low', color: '#4CAF50' };
    if (minutes < 30) return { level: 'Medium', color: '#FF9800' };
    if (minutes < 60) return { level: 'High', color: '#FF5722' };
    return { level: 'Critical', color: '#E53935' };
  };

  if (loading || !debtScore) {
    return <div className="panel">Loading attention debt data...</div>;
  }

  const level = getDebtLevel(debtScore.total_time_lost_minutes);

  return (
    <div className="panel attention-debt-panel">
      <div className="panel-header">
        <h2>⏳ Attention Debt Score</h2>
        <p className="subtitle">Cost of interruptions today</p>
      </div>

      <div className="debt-summary">
        <div className="debt-card main-debt">
          <div className="debt-value" style={{ color: level.color }}>
            {debtScore.total_time_lost_minutes.toFixed(1)}
          </div>
          <div className="debt-label">Minutes Lost</div>
          <div className="debt-level" style={{ backgroundColor: level.color }}>
            {level.level} Debt
          </div>
        </div>

        <div className="debt-card">
          <div className="debt-value">{debtScore.total_interruptions_today}</div>
          <div className="debt-label">Interruptions</div>
        </div>

        <div className="debt-card">
          <div className="debt-value">{debtScore.focus_recovery_time_hours.toFixed(1)}h</div>
          <div className="debt-label">Recovery Time</div>
        </div>
      </div>

      <div className="debt-details">
        <div className="detail-item">
          <span className="detail-label">🎯 Most Costly Source:</span>
          <span className="detail-value">{debtScore.most_costly_source}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">📊 Peak Disruption:</span>
          <span className="detail-value">{debtScore.peak_disruption_window}</span>
        </div>
      </div>

      {Object.keys(debtScore.interruptions_by_source).length > 0 && (
        <div className="interruptions-breakdown">
          <h3>Interruptions by Source</h3>
          <div className="breakdown-list">
            {Object.entries(debtScore.interruptions_by_source).map(([source, minutes]) => (
              <div key={source} className="breakdown-item">
                <span className="source-name">{source}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(minutes / debtScore.total_time_lost_minutes) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="source-minutes">{minutes.toFixed(1)}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(debtScore.interruptions_by_hour).length > 0 && (
        <div className="time-distribution">
          <h3>Interruptions by Hour</h3>
          <div className="hours-grid">
            {Object.entries(debtScore.interruptions_by_hour).map(([hour, count]) => (
              <div key={hour} className="hour-box">
                <div className="hour-time">{hour}</div>
                <div className="hour-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="debt-insight">
        <p>
          💡 <strong>Insight:</strong> You've lost approximately{' '}
          <strong>{debtScore.total_time_lost_minutes.toFixed(0)} minutes</strong> today due to{' '}
          <strong>{debtScore.total_interruptions_today}</strong> interruptions. Most disruptions came from{' '}
          <strong>{debtScore.most_costly_source}</strong>.
        </p>
      </div>
    </div>
  );
}

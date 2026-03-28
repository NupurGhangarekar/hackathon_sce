import React, { useState, useEffect } from 'react';
import '../styles.css';

export default function ActionCompressionPanel() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedActions, setCompletedActions] = useState(new Set());

  useEffect(() => {
    fetchCompressedActions();
    const interval = setInterval(() => {
      fetchCompressedActions();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCompressedActions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/actions/pending');
      const data = await response.json();
      setActions(data.actions || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch compressed actions:', error);
      setLoading(false);
    }
  };

  const toggleCompleted = (actionId) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      send: '📤',
      share: '🔗',
      confirm: '✅',
      review: '👁️',
      meeting: '📅',
      deadline: '⏰',
      support: '🆘',
      task: '📝',
    };
    return icons[category] || '📋';
  };

  const getPriorityClass = (priority) => {
    return `priority-${priority}`;
  };

  const uncompletedActions = actions.filter((a) => !completedActions.has(a.id));
  const completedCount = completedActions.size;

  return (
    <div className="panel action-compression-panel">
      <div className="panel-header">
        <h2>🎯 Smart Actions</h2>
        <p className="subtitle">Notifications compressed into actionable tasks</p>
      </div>

      {loading ? (
        <p>Loading actions...</p>
      ) : (
        <>
          <div className="action-stats">
            <div className="stat-item">
              <span className="stat-count">{actions.length}</span>
              <span className="stat-label">Total Actions</span>
            </div>
            <div className="stat-item">
              <span className="stat-count">{uncompletedActions.length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-item">
              <span className="stat-count">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          {uncompletedActions.length > 0 ? (
            <div className="actions-list">
              {uncompletedActions.map((action) => (
                <div key={action.id} className={`action-item ${getPriorityClass(action.priority)}`}>
                  <div className="action-checkbox">
                    <input
                      type="checkbox"
                      checked={completedActions.has(action.id)}
                      onChange={() => toggleCompleted(action.id)}
                      id={`action-${action.id}`}
                    />
                    <label htmlFor={`action-${action.id}`}></label>
                  </div>

                  <div className="action-content">
                    <div className="action-title-row">
                      <span className="action-icon">{getCategoryIcon(action.category)}</span>
                      <p className="action-title">{action.action_text}</p>
                      <span className="priority-badge">{getPriorityIcon(action.priority)} {action.priority}</span>
                    </div>

                    <div className="action-details">
                      <span className="detail-badge">{action.category}</span>
                      <span className="detail-badge time">⏱️ {action.estimated_time_minutes}m</span>
                      <span className="detail-badge source">From: {action.source}</span>
                    </div>

                    {action.original_notification && (
                      <p className="original-text">
                        <em>Original: "{action.original_notification.substring(0, 60)}..."</em>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>🎉 All actions completed! Great job staying focused.</p>
            </div>
          )}

          {completedCount > 0 && (
            <div className="completed-section">
              <h3>✅ Completed ({completedCount})</h3>
              <div className="completed-list">
                {actions
                  .filter((a) => completedActions.has(a.id))
                  .map((action) => (
                    <div key={action.id} className="completed-item">
                      <span className="completed-text">{action.action_text}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {actions.length > 0 && (
            <div className="action-summary">
              <div className="summary-item">
                <span className="summary-label">Estimated Total Time:</span>
                <span className="summary-value">
                  {uncompletedActions
                    .reduce((sum, a) => sum + a.estimated_time_minutes, 0)
                    .toFixed(0)}{' '}
                  minutes
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

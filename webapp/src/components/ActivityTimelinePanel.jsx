import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles.css';

export default function ActivityTimelinePanel() {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(60); // minutes

  useEffect(() => {
    fetchActivityData();
    const interval = setInterval(fetchActivityData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchActivityData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/timeline/activity-summary?minutes=${timeframe}`);
      const data = await response.json();
      
      // Transform data for chart
      const chartData = data.top_urls.map((url, idx) => ({
        name: url.display_name,
        time: url.duration_minutes,
        visits: url.visits,
        fullUrl: url.full_url,
      }));
      
      setActivityData(chartData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel activity-timeline-panel full-width">
      <div className="panel-header">
        <h3 className="panel-title">Activity Timeline</h3>
        <p className="panel-subtitle">Time spent on different tabs/URLs</p>
      </div>

      <div className="tab-control-group">
        {[15, 30, 60, 120].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`tab-control-btn ${timeframe === tf ? 'active' : ''}`}
          >
            {tf}m
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading activity data...</p>
      ) : activityData.length > 0 ? (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#666"
                  label={{ value: 'Time (minutes)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #ccc', borderRadius: '4px' }}
                  formatter={(value) => `${value.toFixed(1)}m`}
                />
                <Legend />
                <Bar dataKey="time" fill="#3b82f6" name="Time (minutes)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="activity-stats">
            <div className="stat-item">
              <span className="stat-count">{activityData.length}</span>
              <span className="stat-label">Active URLs</span>
            </div>
            <div className="stat-item">
              <span className="stat-count">
                {activityData.reduce((sum, item) => sum + item.time, 0).toFixed(1)}
              </span>
              <span className="stat-label">Total Time (m)</span>
            </div>
            <div className="stat-item">
              <span className="stat-count">
                {activityData.reduce((sum, item) => sum + item.visits, 0)}
              </span>
              <span className="stat-label">Total Switches</span>
            </div>
          </div>

          {/* Detailed list */}
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#1f2937' }}>📌 Detailed View</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {activityData.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    marginBottom: '6px',
                    background: idx % 2 === 0 ? '#f9fafb' : '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ flex: 1, fontWeight: '500', color: '#333' }}>
                    {item.name}
                  </div>
                  <div style={{ textAlign: 'right', color: '#666' }}>
                    <span style={{ marginRight: '16px' }}>⏱️ {item.time.toFixed(1)}m</span>
                    <span>🔄 {item.visits}x</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>📭 No activity recorded yet. Start browsing to see your activity timeline.</p>
        </div>
      )}
    </div>
  );
}

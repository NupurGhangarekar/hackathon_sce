import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles.css';

export default function DebtTimelinePanel() {
  const [debtData, setDebtData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('area'); // 'area' or 'line'

  useEffect(() => {
    fetchDebtData();
    const interval = setInterval(fetchDebtData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDebtData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/dashboard/debt-timeline');
      const data = response.json();
      
      data.then(result => {
        if (result.timeline && result.timeline.length > 0) {
          setDebtData(result.timeline);
        }
        setSummaryData(result);
        setLoading(false);
      });
    } catch (error) {
      console.error('Failed to fetch debt data:', error);
      setLoading(false);
    }
  };

  const getDebtColor = (level) => {
    switch (level) {
      case 'low':
        return '#10b981'; // green
      case 'medium':
        return '#f59e0b'; // amber
      case 'high':
        return '#ef4444'; // red
      case 'critical':
        return '#7c2d12'; // dark red
      default:
        return '#6b7280'; // gray
    }
  };

  const getDebtIcon = (level) => {
    switch (level) {
      case 'low':
        return '✅';
      case 'medium':
        return '⚠️';
      case 'high':
        return '🔴';
      case 'critical':
        return '🚨';
      default:
        return '❓';
    }
  };

  return (
    <div className="glass-panel debt-timeline-panel full-width">
      <div className="panel-header">
        <h3 className="panel-title">Attention Debt Tracker</h3>
        <p className="panel-subtitle">Time lost due to interruptions</p>
      </div>

      {loading ? (
        <p>Loading debt metrics...</p>
      ) : summaryData ? (
        <div>
          {/* Summary Cards */}
          <div className="debt-summary-cards">
            <div className="debt-card" style={{ borderLeft: `4px solid ${getDebtColor(summaryData.debt_level)}` }}>
              <div className="card-label">Attention Debt Level</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: getDebtColor(summaryData.debt_level) }}>
                {getDebtIcon(summaryData.debt_level)} {summaryData.debt_level.toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {summaryData.current_debt.toFixed(1)} min debt accumulated
              </div>
            </div>

            <div className="debt-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="card-label">Total Time Lost</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                {summaryData.total_time_lost.toFixed(1)}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                minutes spent recovering from interruptions
              </div>
            </div>

            <div className="debt-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="card-label">Interruptions Today</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {summaryData.interruptions_today}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                disruptions to your focus
              </div>
            </div>
          </div>

          {/* Timeline Chart */}
          {debtData.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>📈 Debt Accumulation Over Time</h3>
                <div className="tab-control-group" style={{ marginBottom: 0 }}>
                  <button
                    onClick={() => setChartType('area')}
                    className={`tab-control-btn ${chartType === 'area' ? 'active' : ''}`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`tab-control-btn ${chartType === 'line' ? 'active' : ''}`}
                  >
                    Line
                  </button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                {chartType === 'area' ? (
                  <AreaChart data={debtData}>
                    <defs>
                      <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="source" 
                      stroke="#666"
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis 
                      stroke="#666"
                      label={{ value: 'Debt (min)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #ccc', borderRadius: '4px' }}
                      formatter={(value, name) => {
                        if (name === 'debt') return [`${value.toFixed(1)}m`, 'Cumulative Debt'];
                        if (name === 'cost') return [`${value.toFixed(1)}m`, 'Interruption Cost'];
                        return [value, name];
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="debt" 
                      stroke="#ef4444" 
                      fillOpacity={1} 
                      fill="url(#colorDebt)"
                      name="Total Debt"
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={debtData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="source" 
                      stroke="#666"
                      style={{ fontSize: '11px' }}
                    />
                    <YAxis 
                      stroke="#666"
                      label={{ value: 'Debt (min)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #ccc', borderRadius: '4px' }}
                      formatter={(value, name) => {
                        if (name === 'debt') return [`${value.toFixed(1)}m`, 'Cumulative Debt'];
                        if (name === 'cost') return [`${value.toFixed(1)}m`, 'Cost per Interruption'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="debt" 
                      stroke="#ef4444" 
                      name="Total Debt"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 4 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>

              <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                <strong>💡 Insight:</strong> Your attention debt is{' '}
                {summaryData.debt_level === 'low' 
                  ? '✅ well managed. Keep up the focus!'
                  : summaryData.debt_level === 'medium'
                  ? '⚠️ building up. Consider reducing interruptions.'
                  : '🔴 critical. Block time for deep work and minimize distractions.'
                }
              </div>
            </div>
          )}

          {/* Interruption Heatmap by Hour */}
          {summaryData.interruptions_by_hour && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
                🕐 Peak Disruption Hours
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {summaryData.interruptions_by_hour.map((count, hour) => (
                  <div
                    key={hour}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      background: getInterruptionColor(count),
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: count > 5 ? '#fff' : '#333',
                    }}
                    title={`Hour ${hour}: ${count} interruptions`}
                  >
                    <div>{hour}h</div>
                    <div>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>📊 No debt data available yet. Continue working to track interruptions.</p>
        </div>
      )}
    </div>
  );
}

function getInterruptionColor(count) {
  if (count === 0) return '#e5e7eb'; // gray
  if (count <= 2) return '#90ee90'; // light green
  if (count <= 5) return '#ffd700'; // gold
  if (count <= 8) return '#ffa500'; // orange
  return '#ff4444'; // red
}

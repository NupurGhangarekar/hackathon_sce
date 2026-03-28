import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [extensionStatus, setExtensionStatus] = useState('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkExtension = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/context-capsule/current');
        if (response.ok) {
          setExtensionStatus('connected');
        } else {
          setExtensionStatus('disconnected');
        }
      } catch (error) {
        setExtensionStatus('disconnected');
      }
    };

    checkExtension();
    const interval = setInterval(checkExtension, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = () => {
    switch (extensionStatus) {
      case 'connected':
        return <span className="status-badge connected">✅ Extension Connected</span>;
      case 'checking':
        return <span className="status-badge checking">⏳ Checking...</span>;
      default:
        return <span className="status-badge disconnected">⚠️ No Extension Detected</span>;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh the page or trigger data reload
      window.location.reload();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="navbar">
      <h1>Context-Aware Notification Dashboard</h1>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {getStatusBadge()}
        <span className="pill">Hackathon Live View</span>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            background: '#0f766e',
            color: 'white',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            opacity: isRefreshing ? 0.7 : 1,
            transition: 'all 0.2s ease',
          }}
          title="Refresh dashboard data"
        >
          {isRefreshing ? '⟳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>
    </header>
  );
}

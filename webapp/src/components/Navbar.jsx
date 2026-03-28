import React, { useState, useEffect } from 'react';

export default function Navbar() {
  const [extensionStatus, setExtensionStatus] = useState('checking');

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

  return (
    <header className="navbar">
      <h1>Context-Aware Notification Dashboard</h1>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {getStatusBadge()}
        <span className="pill">Hackathon Live View</span>
      </div>
    </header>
  );
}

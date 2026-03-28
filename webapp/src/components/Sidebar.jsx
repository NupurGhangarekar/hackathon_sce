import { useState } from 'react';

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: '◉' },
  { id: 'focus', label: 'Focus State', icon: '⦿' },
  { id: 'activity', label: 'Activity', icon: '▣' },
  { id: 'notifications', label: 'Notifications', icon: '▦' },
  { id: 'context', label: 'Context Capsule', icon: '◈' },
  { id: 'debt', label: 'Attention Debt', icon: '◐' },
  { id: 'actions', label: 'Smart Actions', icon: '◎' },
  { id: 'timeline', label: 'Timeline', icon: '▤' },
  { id: 'analytics', label: 'Analytics', icon: '◪' },
];

export default function Sidebar({ activeView, onViewChange, isCollapsed, onToggleCollapse }) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} preserve-3d`}>
      <div className="sidebar-header preserve-3d">
        <div className="logo depth-layer-1">
          <div className="logo-icon floating-3d">◎</div>
          {!isCollapsed && <span className="logo-text">Context AI</span>}
        </div>
        <button className="collapse-btn depth-layer-1" onClick={onToggleCollapse}>
          {isCollapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="sidebar-nav preserve-3d">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''} preserve-3d`}
            onClick={() => onViewChange(item.id)}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon depth-layer-1">{item.icon}</span>
            {!isCollapsed && <span className="nav-label depth-layer-2">{item.label}</span>}
            {activeView === item.id && <div className="active-indicator depth-layer-3" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer preserve-3d">
        {!isCollapsed && (
          <div className="connection-status depth-layer-1">
            <div className="status-dot pulse"></div>
            <span className="status-text">Live</span>
          </div>
        )}
      </div>
    </aside>
  );
}

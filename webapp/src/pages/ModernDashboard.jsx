import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BackgroundEffects from '../components/BackgroundEffects';
import Toast from '../components/Toast';
import LoadingSkeleton from '../components/LoadingSkeleton';

import OverviewView from '../views/OverviewView';
import FocusView from '../views/FocusView';
import ActivityView from '../views/ActivityView';
import NotificationsView from '../views/NotificationsView';
import ContextView from '../views/ContextView';
import DebtView from '../views/DebtView';
import ActionsView from '../views/ActionsView';
import TimelineView from '../views/TimelineView';
import AnalyticsView from '../views/AnalyticsView';

// Start loadData imports
import { getNotifications, getState, getActivitySummary, getPendingActions } from '../services/api';

const INITIAL_STATE = {
  focus_state: 'focused',
  active_url: '',
  tab_switch_count: 0,
  tab_switches_last_5s: 0,
  idle_seconds: 0,
};

const INITIAL_NOTIFICATIONS = {
  delayed: [],
  delivered: [],
  pending_count: 0,
};

const viewTitles = {
  overview: 'Overview',
  focus: 'Focus State',
  activity: 'Activity',
  notifications: 'Notifications',
  context: 'Context Capsule',
  debt: 'Attention Debt',
  actions: 'Smart Actions',
  timeline: 'Timeline',
  analytics: 'Analytics',
};

export default function ModernDashboard() {
  const [state, setState] = useState(INITIAL_STATE);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
// Adding activity and actions states
  const [activeView, setActiveView] = useState('overview');
  const [theme, setTheme] = useState('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activityData, setActivityData] = useState(null);
  const [actionsData, setActionsData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let active = true;

    async function loadData() {
// Parallel fetching
      try {
        const [stateData, notificationsData, activityRes, actionsRes] = await Promise.all([
          getState(),
          getNotifications(),
          getActivitySummary(60),
          getPendingActions()
        ]);

        if (!active) return;
        setState(stateData);
        setNotifications(notificationsData);
        setActivityData(activityRes);
        setActionsData(actionsRes);
        setError('');
        setLoading(false);
      } catch (err) {
        if (!active) return;
        setError('Cannot reach backend');
        setLoading(false);
      }
    }

    loadData();
    const timer = window.setInterval(loadData, 2000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    addToast(`Switched to ${newTheme} theme`, 'success');
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const renderView = () => {
    if (loading) {
      return (
        <div className="grid-2">
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="card" />
          <LoadingSkeleton type="chart" />
        </div>
      );
    }

// passing new props
    const viewProps = { state, notifications, activityData, actionsData, addToast };

    switch (activeView) {
      case 'overview':
        return <OverviewView {...viewProps} />;
      case 'focus':
        return <FocusView {...viewProps} />;
      case 'activity':
        return <ActivityView {...viewProps} />;
      case 'notifications':
        return <NotificationsView {...viewProps} />;
      case 'context':
        return <ContextView {...viewProps} />;
      case 'debt':
        return <DebtView {...viewProps} />;
      case 'actions':
        return <ActionsView {...viewProps} />;
      case 'timeline':
        return <TimelineView {...viewProps} />;
      case 'analytics':
        return <AnalyticsView {...viewProps} />;
      default:
        return <OverviewView {...viewProps} />;
    }
  };

  return (
    <div className="app-container">
      <BackgroundEffects />

      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-wrapper">
          <TopBar
            theme={theme}
            onThemeToggle={handleThemeToggle}
            viewTitle={viewTitles[activeView]}
          />

          {error && (
            <div className="glass-panel" style={{ marginBottom: '24px', borderColor: 'var(--error)' }}>
              <p style={{ color: 'var(--error)', margin: 0 }}>{error}</p>
            </div>
          )}

          {renderView()}
        </div>
      </main>

      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

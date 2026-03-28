export default function TopBar({ theme, onThemeToggle, viewTitle }) {
  return (
    <header className="topbar preserve-3d">
      <div className="topbar-left depth-layer-1">
        <h1 className="view-title">{viewTitle}</h1>
        <div className="breadcrumb">Dashboard / {viewTitle}</div>
      </div>

      <div className="topbar-right depth-layer-1">
        <button className="theme-toggle depth-layer-2" onClick={onThemeToggle} title="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <div className="profile-section depth-layer-2">
          <div className="profile-avatar floating-3d">U</div>
        </div>
      </div>
    </header>
  );
}

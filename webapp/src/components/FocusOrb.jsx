import React from 'react';

const FocusOrb = ({ state }) => {
  const getOrbColor = (focusState) => {
    switch (focusState) {
      case 'focused':
        return 'var(--accent-cyan)';
      case 'distracted':
        return 'var(--error)';
      case 'idle':
        return 'var(--warning)';
      default:
        return 'var(--accent-blue)';
    }
  };

  const orbColor = getOrbColor(state);

  return (
    <div className="focus-orb-container preserve-3d">
      <div className="focus-orb-glow" style={{ backgroundColor: orbColor }}></div>
      <div className="focus-orb floating-3d" style={{ borderColor: orbColor }}>
        <div className="focus-orb-inner">
          <div className="focus-orb-core" style={{ backgroundColor: orbColor }}></div>
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="focus-orb-ring" 
              style={{ 
                borderColor: orbColor, 
                animationDelay: `${i * 1.5}s`,
                width: `${60 + i * 40}px`,
                height: `${60 + i * 40}px`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusOrb;

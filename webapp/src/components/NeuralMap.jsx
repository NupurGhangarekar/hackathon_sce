import React from 'react';

const NeuralMap = ({ state }) => {
  const isFocused = state === 'focused';
  
  return (
    <div className="neural-map-container preserve-3d floating-3d">
      <div className="neural-core"></div>
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className={`neural-ring ${isFocused ? 'fast' : 'slow'}`}
          style={{
            width: `${100 + i * 40}px`,
            height: `${100 + i * 40}px`,
            animationDelay: `${i * 0.5}s`,
            opacity: 1 - (i * 0.15)
          }}
        >
          {[...Array(4)].map((_, j) => (
            <div 
              key={j} 
              className="neural-node"
              style={{
                transform: `rotate(${j * 90}deg) translateY(-${50 + i * 20}px)`
              }}
            ></div>
          ))}
        </div>
      ))}
      <div className="neural-pulse"></div>
    </div>
  );
};

export default NeuralMap;

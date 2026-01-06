
import React from 'react';

const XPLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="xp-progress-container">
        <div className="xp-progress-bar">
          <div className="xp-block"></div>
          <div className="xp-block"></div>
          <div className="xp-block"></div>
        </div>
      </div>
    </div>
  );
};

export default XPLoader;

'use client';

import React, { useState, useEffect } from 'react';

interface ViewportDebugProps {
  /** Whether to show the debug indicator */
  isVisible: boolean;
}

export const ViewportDebug: React.FC<ViewportDebugProps> = ({ isVisible }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  if (!isVisible || !isClient) {
    return null;
  }

  const isIPhoneSE = dimensions.width <= 375 && dimensions.height <= 667;
  const isHeightConstrained = dimensions.height <= 600;
  
  let debugClass = 'viewport-debug';
  if (isIPhoneSE) {
    debugClass += ' iphone-se';
  } else if (isHeightConstrained) {
    debugClass += ' height-constrained';
  }

  return (
    <div className={debugClass}>
      {dimensions.width}×{dimensions.height}
      {isIPhoneSE && ' 📱SE'}
      {isHeightConstrained && ' ⚠️H'}
    </div>
  );
};
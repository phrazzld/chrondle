'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  };

  return (
    <span
      className={`
        ${sizeClasses[size]}
        border-2 rounded-full animate-spin inline-block ${className}
      `}
      style={{
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white'
      }}
      aria-label="Loading"
    />
  );
};
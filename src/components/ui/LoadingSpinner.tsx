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
        border-2 border-gray-300 dark:border-gray-600
        border-t-indigo-600 dark:border-t-indigo-400
        rounded-full
        animate-spin
        inline-block
        ${className}
      `}
      aria-label="Loading"
    />
  );
};
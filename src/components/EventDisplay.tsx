'use client';

import React from 'react';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface EventDisplayProps {
  event: string | null;
  isLoading: boolean;
  error: string | null;
  className?: string;
}

export const EventDisplay: React.FC<EventDisplayProps> = ({
  event,
  isLoading,
  error,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {error ? (
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--error)' }}>Unable to Load Puzzle</h3>
          <p style={{ color: 'var(--muted-foreground)' }}>Please refresh the page to try again.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center" style={{ color: 'var(--muted-foreground)' }}>
          <LoadingSpinner className="mr-3" />
          <span className="text-lg font-medium">Loading puzzle...</span>
        </div>
      ) : (
        <p className="text-lg leading-relaxed" style={{ color: 'var(--foreground)' }}>
          {event || 'No event available'}
        </p>
      )}
    </div>
  );
};
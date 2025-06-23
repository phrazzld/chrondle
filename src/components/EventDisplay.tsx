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
    <div className={`text-center min-h-[120px] flex items-center justify-center ${className}`}>
      {error ? (
        <div>
          <h3 className="text-xl font-bold mb-2 text-white">Unable to Load Puzzle</h3>
          <p className="text-white opacity-80">Please refresh the page to try again.</p>
        </div>
      ) : isLoading ? (
        <div className="text-white">
          <LoadingSpinner className="mr-3" />
          <span className="text-lg font-medium">Loading today&apos;s historical puzzle...</span>
        </div>
      ) : (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-white">
            Historical Event
          </h2>
          <p 
            className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto text-white opacity-95"
          >
            {event || 'No event available'}
          </p>
        </div>
      )}
    </div>
  );
};
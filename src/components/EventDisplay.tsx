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
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-4 text-center min-h-[80px] flex items-center justify-center ${className}`}>
      {error ? (
        <div className="text-red-600 dark:text-red-400">
          <h3 className="text-xl font-bold mb-2">Unable to Load Puzzle</h3>
          <p>Please refresh the page to try again.</p>
        </div>
      ) : isLoading ? (
        <p className="text-lg sm:text-xl font-semibold">
          <LoadingSpinner className="mr-2" />
          Loading today&apos;s historical puzzle...
        </p>
      ) : (
        <p className="text-lg sm:text-xl font-semibold">
          {event || 'No event available'}
        </p>
      )}
    </div>
  );
};
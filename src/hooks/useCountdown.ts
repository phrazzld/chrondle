'use client';

import { useState, useEffect } from 'react';
import { formatCountdown, getTimeUntilMidnight } from '@/lib/utils';

export interface UseCountdownReturn {
  timeString: string;
  isComplete: boolean;
}

export function useCountdown(): UseCountdownReturn {
  const [timeString, setTimeString] = useState('00:00:00');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = getTimeUntilMidnight();
      
      if (remaining <= 0) {
        setTimeString('00:00:00');
        setIsComplete(true);
        return;
      }

      setTimeString(formatCountdown(remaining));
      setIsComplete(false);
    };

    // Update immediately
    updateCountdown();

    // Set up interval
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return { timeString, isComplete };
}
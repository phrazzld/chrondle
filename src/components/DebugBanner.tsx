'use client';

import React from 'react';
import { DEBUG_CONFIG } from '@/lib/constants';

interface DebugBannerProps {
  isVisible: boolean;
  debugParams: string;
  className?: string;
}

export const DebugBanner: React.FC<DebugBannerProps> = ({
  isVisible,
  debugParams,
  className = ''
}) => {
  if (!isVisible) return null;

  return (
    <div className={`bg-yellow-400 dark:bg-yellow-600 text-black p-2 text-center font-bold ${className}`}>
      {DEBUG_CONFIG.BANNER_EMOJI} DEBUG MODE ACTIVE - No progress saved | {debugParams}
    </div>
  );
};
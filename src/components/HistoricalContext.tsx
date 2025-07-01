'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

/**
 * Skeleton component for loading state
 */
export const HistoricalContextSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Card className={`border-2 border-muted/50 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          <div>
            <div className="h-4 bg-muted animate-pulse rounded w-32 mb-1"></div>
            <div className="h-3 bg-muted animate-pulse rounded w-20"></div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-4/5"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
        </div>

        <div className="mt-4 pt-4 border-t border-muted">
          <div className="h-3 bg-muted animate-pulse rounded w-48"></div>
        </div>
      </div>
    </Card>
  );
};

/**
 * Error component for failed context generation
 */
export const HistoricalContextError: React.FC<{ 
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className = '' }) => {
  return (
    <Card className={`border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-600/10 ${className}`}>
      <div className="p-6 text-center">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
          Context Unavailable
        </h3>
        
        <p className="text-red-600 dark:text-red-400 mb-4">
          We couldn&apos;t generate historical context for this year. This might be due to a temporary service issue.
        </p>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </Button>
        )}
      </div>
    </Card>
  );
};
'use client';

import React, { forwardRef } from 'react';
import { CardHeaderProps } from './types';
import { cn } from '@/lib/utils';

/**
 * CardHeader component for consistent header styling
 * 
 * Provides proper spacing and typography for card headers
 * following the design system principles.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col space-y-1.5',
          'text-[var(--card-foreground)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';
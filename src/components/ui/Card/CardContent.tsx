'use client';

import React, { forwardRef } from 'react';
import { CardContentProps } from './types';
import { cn } from '@/lib/utils';

/**
 * CardContent component for consistent content styling
 * 
 * Provides flexible padding options and proper content styling
 * for card body content following design system principles.
 */
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, padding = 'md', ...props }, ref) => {
    
    // Padding variants
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6', 
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          paddingStyles[padding],
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

CardContent.displayName = 'CardContent';
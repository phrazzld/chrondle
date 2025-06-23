'use client';

import React, { forwardRef } from 'react';
import { Card } from './Card';
import { SectionCardProps } from './types';
import { cn } from '@/lib/utils';

/**
 * SectionCard component for numbered sections (01, 02, 03)
 * 
 * Extends the base Card component with section numbering
 * and appropriate styling for the professional game layout.
 */
export const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(
  ({ 
    sectionNumber, 
    sectionLabel,
    children, 
    variant = 'secondary',
    className,
    ...props 
  }, ref) => {
    
    // Format section number consistently
    const formattedNumber = typeof sectionNumber === 'number' 
      ? sectionNumber.toString().padStart(2, '0')
      : sectionNumber;

    // Section badge styles based on variant
    const badgeStyles = {
      primary: 'text-white opacity-90',
      secondary: 'text-[var(--primary)] opacity-90',
      success: 'text-white opacity-90',
    };

    return (
      <Card
        ref={ref}
        variant={variant}
        className={cn('relative', className)}
        {...props}
      >
        {/* Section Number Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span 
            className={cn(
              'text-xl font-bold select-none',
              badgeStyles[variant]
            )}
            aria-label={sectionLabel ? `Section ${formattedNumber}: ${sectionLabel}` : `Section ${formattedNumber}`}
          >
            {formattedNumber}
          </span>
          {sectionLabel && (
            <span 
              className={cn(
                'text-sm font-medium opacity-75',
                variant === 'primary' ? 'text-white' : 'text-[var(--muted-foreground)]'
              )}
            >
              {sectionLabel}
            </span>
          )}
        </div>

        {/* Content with proper top padding to avoid badge overlap */}
        <div className="pt-8">
          {children}
        </div>
      </Card>
    );
  }
);

SectionCard.displayName = 'SectionCard';
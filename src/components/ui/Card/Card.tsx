'use client';

import React, { forwardRef } from 'react';
import { BaseCardProps } from './types';
import { cn } from '@/lib/utils';

/**
 * Base Card component following design system principles
 * 
 * Provides consistent styling, theming, and interaction patterns
 * for all card-based UI elements in the application.
 */
export const Card = forwardRef<HTMLDivElement, BaseCardProps>(
  ({ 
    children, 
    variant = 'secondary', 
    size = 'md', 
    className, 
    elevated = false,
    interactive = false,
    ...props 
  }, ref) => {
    
    // Base styles using CSS custom properties for consistent theming
    const baseStyles = [
      'rounded-lg',
      'transition-all duration-200 ease-in-out',
      'border',
    ];

    // Variant-specific styles
    const variantStyles = {
      primary: [
        'bg-[var(--primary)]',
        'text-white',
        'border-[var(--primary)]',
        'shadow-md',
      ],
      secondary: [
        'bg-[var(--card)]',
        'text-[var(--card-foreground)]',
        'border-[var(--border)]',
        'shadow-sm',
      ],
      success: [
        'bg-[var(--success)]',
        'text-white',
        'border-[var(--success)]',
        'shadow-md',
      ],
    };

    // Size-specific padding
    const sizeStyles = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    // Elevation and interaction styles
    const enhancementStyles = [];
    
    if (elevated) {
      enhancementStyles.push('shadow-lg');
    }
    
    if (interactive) {
      enhancementStyles.push(
        'cursor-pointer',
        'hover:shadow-lg',
        'hover:-translate-y-1',
        'active:translate-y-0',
        'active:shadow-md'
      );
    }

    // Combine all styles
    const cardClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      enhancementStyles,
      className
    );

    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
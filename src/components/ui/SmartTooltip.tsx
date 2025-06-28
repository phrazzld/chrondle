'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SmartTooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({
  content,
  children,
  delay = 500,
  className,
  side = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window && window.innerWidth < 768);
    };
    
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isMobile) {
      // On mobile, toggle tooltip on tap
      setIsVisible(!isVisible);
      
      // Auto-hide after 3 seconds on mobile
      if (!isVisible) {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    } else {
      // On desktop, show after delay
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!isMobile) {
      setIsVisible(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    switch (side) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (side) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-muted border-t-8 border-x-transparent border-x-8 border-b-0';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-muted border-b-8 border-x-transparent border-x-8 border-t-0';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-muted border-l-8 border-y-transparent border-y-8 border-r-0';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-muted border-r-8 border-y-transparent border-y-8 border-l-0';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-muted border-t-8 border-x-transparent border-x-8 border-b-0';
    }
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={isMobile ? showTooltip : undefined}
        className={isMobile ? 'cursor-pointer' : ''}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-3 py-2 text-sm text-foreground bg-muted border border-border rounded-lg shadow-lg transition-opacity duration-200',
            'max-w-xs whitespace-nowrap',
            getPositionClasses(),
            className
          )}
          role="tooltip"
          aria-live="polite"
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0',
              getArrowClasses()
            )}
          />
        </div>
      )}
    </div>
  );
};
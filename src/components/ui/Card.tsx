'use client';

import React from 'react';

// Card variant types matching the design system
type CardVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

interface SectionCardProps extends CardProps {
  sectionNumber?: string;
  sectionLabel?: string;
}

// Base Card Component
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  hover = true,
  padding = 'md',
  style
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6', 
    lg: 'p-8'
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--primary)',
          color: 'white',
          border: 'none'
        };
      case 'secondary':
        return {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '2px solid var(--border)'
        };
      case 'success':
        return {
          background: 'var(--success)',
          color: 'white',
          border: 'none'
        };
      case 'warning':
        return {
          background: 'var(--warning)',
          color: 'white',
          border: 'none'
        };
      case 'info':
        return {
          background: 'var(--info)',
          color: 'white',
          border: 'none'
        };
      default:
        return {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)'
        };
    }
  };

  return (
    <div
      className={`
        rounded-lg shadow-lg transition-all duration-200
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
        ${className}
      `}
      style={{ ...getVariantStyles(), ...style }}
    >
      {children}
    </div>
  );
};

// Section Card with numbered badge
export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  sectionNumber,
  sectionLabel,
  variant = 'secondary',
  className = '',
  ...props
}) => {
  return (
    <Card
      variant={variant}
      className={`relative ${className}`}
      {...props}
    >
      {sectionNumber && (
        <div className="absolute top-4 left-4">
          <span 
            className="text-xl font-bold opacity-90"
            style={{ 
              color: variant === 'primary' ? 'white' : 'var(--primary)' 
            }}
          >
            {sectionNumber}
          </span>
          {sectionLabel && (
            <div 
              className="text-xs font-medium mt-1 opacity-75"
              style={{ 
                color: variant === 'primary' ? 'white' : 'var(--muted-foreground)' 
              }}
            >
              {sectionLabel}
            </div>
          )}
        </div>
      )}
      <div className={sectionNumber ? 'pt-8' : ''}>
        {children}
      </div>
    </Card>
  );
};

// Specialized card variants for common use cases
export const PrimaryCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="primary" {...props} />
);

export const SecondaryCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="secondary" {...props} />
);

export const SuccessCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="success" {...props} />
);

// Game-specific card components
export const GameSection: React.FC<{
  children: React.ReactNode;
  number: string;
  title?: string;
  variant?: CardVariant;
  className?: string;
}> = ({ children, number, title, variant = 'secondary', className = '' }) => (
  <SectionCard
    sectionNumber={number}
    sectionLabel={title}
    variant={variant}
    className={className}
    padding="lg"
  >
    {children}
  </SectionCard>
);
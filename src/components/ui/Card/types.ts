import { ReactNode, HTMLAttributes } from 'react';

/**
 * Card variant types following the design system
 */
export type CardVariant = 'primary' | 'secondary' | 'success';

/**
 * Card size variants for different use cases
 */
export type CardSize = 'sm' | 'md' | 'lg';

/**
 * Base card properties extending HTML div attributes
 */
export interface BaseCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
}

/**
 * Properties for cards with section numbering
 */
export interface SectionCardProps extends BaseCardProps {
  sectionNumber: string | number;
  sectionLabel?: string;
}

/**
 * Card header component properties
 */
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  className?: string;
}

/**
 * Card content component properties
 */
export interface CardContentProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Design tokens for consistent styling
 */
export interface CardDesignTokens {
  spacing: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: string;
  shadow: {
    base: string;
    elevated: string;
    interactive: string;
  };
  border: {
    width: string;
    color: string;
  };
}
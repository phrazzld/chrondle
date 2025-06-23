/**
 * Card System Components
 * 
 * Modular, composable card components following Dan Abramov's
 * component composition patterns and design system principles.
 * 
 * @example Basic Card
 * ```tsx
 * <Card variant="primary" size="lg">
 *   <CardContent>
 *     Your content here
 *   </CardContent>
 * </Card>
 * ```
 * 
 * @example Section Card with Number
 * ```tsx
 * <SectionCard sectionNumber={1} variant="primary">
 *   <EventDisplay />
 * </SectionCard>
 * ```
 * 
 * @example Composed Card
 * ```tsx
 * <Card variant="secondary" interactive>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardContent padding="lg">
 *     Main content area
 *   </CardContent>
 * </Card>
 * ```
 */

// Core components
export { Card } from './Card';
export { SectionCard } from './SectionCard';

// Composition components
export { CardHeader } from './CardHeader';
export { CardContent } from './CardContent';

// Demo component (for development and documentation)
export { CardDemo } from './CardDemo';

// Type definitions
export type {
  BaseCardProps,
  SectionCardProps,
  CardHeaderProps,
  CardContentProps,
  CardVariant,
  CardSize,
  CardDesignTokens,
} from './types';
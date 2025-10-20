/**
 * Animation Constants for Chrondle
 *
 * Centralized timing configuration for deliberate, premium-feeling animations.
 * All values in milliseconds unless otherwise noted.
 *
 * Design Philosophy:
 * - Animations add contemplation time organically (~1.6s total per guess)
 * - Non-blocking: visual choreography doesn't delay state updates
 * - Mobile-first: 60fps performance required
 * - Accessible: Respects prefers-reduced-motion
 */

// Re-export useReducedMotion for convenience
export { useReducedMotion } from "motion/react";

/**
 * Animation durations for different UI components
 *
 * These timings are carefully choreographed to create a satisfying
 * flow from guess submission → feedback → next hint reveal
 */
export const ANIMATION_DURATIONS = {
  // Button interactions - Quick and responsive
  /** Button press animation duration (enhanced from 150ms to 300ms for deliberate feel) */
  BUTTON_PRESS: 300,
  /** Button hover transition duration */
  BUTTON_HOVER: 200,
  /** Input field transitions */
  INPUT_TRANSITION: 200,

  // Guess flow sequence - Deliberate pacing (NEW)
  /** Timeline marker appearance animation (400ms) */
  TIMELINE_UPDATE: 400,
  /** Proximity feedback fade-in duration (300ms) */
  PROXIMITY_FADE: 300,
  /** Hint transition animation duration (400ms) */
  HINT_TRANSITION: 400,

  // Stagger delays - Creates visual choreography (NEW)
  /** Delay before proximity display animates in (300ms after button) */
  PROXIMITY_DELAY: 300,
  /** Delay before new hint animates in (600ms after button) */
  HINT_DELAY: 600,

  // Copy/share feedback
  /** Duration to show "copied" feedback */
  COPY_FEEDBACK: 2000,

  // Modal and notification timings
  /** Achievement modal auto-close duration */
  ACHIEVEMENT_MODAL_AUTO_CLOSE: 4000,
  /** Heartbeat notification duration */
  HEARTBEAT_NOTIFICATION: 3000,

  // Game animations (legacy)
  /** Timeline animation duration */
  TIMELINE_ANIMATION: 800,
  /** Victory celebration duration */
  CELEBRATION_DURATION: 3000,
  /** Number ticker animation duration */
  NUMBER_TICKER_DEFAULT: 400,

  // Text animations
  /** Default text animation duration */
  TEXT_ANIMATE_DEFAULT: 300,

  // Ripple effects
  /** Default ripple effect duration */
  RIPPLE_DEFAULT: 600,

  // Total expected flow - For testing and debugging (NEW)
  /** Total animation choreography duration (~1.6s visual flow) */
  GUESS_FLOW_TOTAL: 1600,
} as const;

/**
 * Spring animation presets for natural motion feel (NEW)
 *
 * Based on physics: stiffness = spring tension, damping = friction
 * Higher stiffness = faster/snappier, lower damping = more bounce
 */
export const ANIMATION_SPRINGS = {
  /** Bouncy spring for playful elements (high stiffness, low damping) */
  BOUNCY: { stiffness: 400, damping: 20 },
  /** Smooth spring for most animations (balanced) */
  SMOOTH: { stiffness: 300, damping: 25 },
  /** Gentle spring for subtle animations (low stiffness, high damping) */
  GENTLE: { stiffness: 200, damping: 30 },
} as const;

/**
 * Easing curves for non-spring animations (NEW)
 *
 * Cubic bezier curves [x1, y1, x2, y2] for custom timing functions
 * See: https://cubic-bezier.com/
 */
export const ANIMATION_EASINGS = {
  /** Anticipation curve - overshoots slightly for emphasis */
  ANTICIPATION: [0.34, 1.56, 0.64, 1] as const,
  /** Smooth ease-out - decelerates at end */
  SMOOTH_OUT: [0.16, 1, 0.3, 1] as const,
  /** Smooth ease-in-out - accelerates then decelerates */
  SMOOTH_IN_OUT: [0.45, 0, 0.55, 1] as const,
} as const;

// CSS class transition durations (for Tailwind classes)
export const CSS_DURATIONS = {
  TRANSITION_200: "duration-200",
  TRANSITION_300: "duration-300",
  TRANSITION_600: "duration-600",
} as const;

// Helper function to convert ms to seconds for CSS/animation libraries
export const msToSeconds = (ms: number): number => ms / 1000;

// Helper function to format ms as CSS duration string
export const formatCssDuration = (ms: number): string => `${ms}ms`;

/**
 * Type exports for TypeScript safety (NEW)
 */
export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;
export type AnimationSpring = keyof typeof ANIMATION_SPRINGS;
export type AnimationEasing = keyof typeof ANIMATION_EASINGS;

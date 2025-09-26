/**
 * Centralized animation timing constants
 * All durations are in milliseconds for JavaScript timers
 * CSS durations should use these values converted to strings with 'ms' suffix
 */

// Feedback animations
export const ANIMATION_DURATIONS = {
  // Quick feedback for user interactions
  BUTTON_PRESS: 150,
  INPUT_TRANSITION: 200,

  // Copy/share feedback
  COPY_FEEDBACK: 2000,

  // Modal and notification timings
  ACHIEVEMENT_MODAL_AUTO_CLOSE: 4000,
  HEARTBEAT_NOTIFICATION: 3000,

  // Game animations
  TIMELINE_ANIMATION: 800,
  CELEBRATION_DURATION: 3000,
  NUMBER_TICKER_DEFAULT: 400,

  // Text animations
  TEXT_ANIMATE_DEFAULT: 300, // 0.3s in decimal

  // Ripple effects
  RIPPLE_DEFAULT: 600,
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

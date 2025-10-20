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
 *
 * @example
 * // Using in Framer Motion transitions
 * <motion.div
 *   transition={{
 *     duration: ANIMATION_DURATIONS.HINT_TRANSITION / 1000,
 *     delay: ANIMATION_DURATIONS.HINT_DELAY / 1000
 *   }}
 * />
 */
export const ANIMATION_DURATIONS = {
  // Button interactions - Quick and responsive
  /**
   * Button press animation duration (enhanced from 150ms to 300ms for deliberate feel)
   * Used in: GuessInput.tsx
   * Creates satisfying tactile feedback without feeling sluggish
   */
  BUTTON_PRESS: 300,

  /**
   * Button hover transition duration
   * Used for smooth hover state transitions on interactive elements
   */
  BUTTON_HOVER: 200,

  /**
   * Input field transitions
   * Used for focus states and value changes in form inputs
   */
  INPUT_TRANSITION: 200,

  // Guess flow sequence - Deliberate pacing
  /**
   * Timeline marker appearance animation (400ms)
   * Used in: Timeline.tsx
   * Markers scale in with spring physics after 100ms delay from button press
   * Creates visual confirmation of guess placement on timeline
   */
  TIMELINE_UPDATE: 400,

  /**
   * Proximity feedback fade-in duration (300ms)
   * Used in: ProximityDisplay.tsx
   * Container fades in after button press, setting stage for staggered content reveal
   */
  PROXIMITY_FADE: 300,

  /**
   * Hint transition animation duration (400ms)
   * Used in: HintsDisplay.tsx
   * Applied to both layout transitions (previous hints stacking up) and new hint reveal
   * Uses ANTICIPATION easing for polished feel
   */
  HINT_TRANSITION: 400,

  // Stagger delays - Creates visual choreography
  /**
   * Delay before proximity display animates in (300ms after button)
   * Used in: ProximityDisplay.tsx
   * Coordinates with button press animation to create sequential flow
   * Followed by emoji (400ms) and text (500ms) for three-part reveal
   */
  PROXIMITY_DELAY: 300,

  /**
   * Delay before new hint animates in (600ms after button)
   * Used in: HintsDisplay.tsx (PastHint component)
   * Longest delay in sequence, creating crescendo effect
   * Ensures user processes proximity feedback before seeing new hint
   */
  HINT_DELAY: 600,

  // Copy/share feedback
  /**
   * Duration to show "copied" feedback (2 seconds)
   * Used for clipboard success messages
   * Long enough to be noticed but not intrusive
   */
  COPY_FEEDBACK: 2000,

  // Modal and notification timings
  /**
   * Achievement modal auto-close duration (4 seconds)
   * Used in: AchievementModal.tsx
   * Balances celebration time with gameplay flow
   */
  ACHIEVEMENT_MODAL_AUTO_CLOSE: 4000,

  /**
   * Heartbeat notification duration (3 seconds)
   * Used for brief status notifications
   */
  HEARTBEAT_NOTIFICATION: 3000,

  // Game animations (legacy - pre-enhanced animation system)
  /**
   * Timeline animation duration (legacy)
   * NOTE: New timeline animations use TIMELINE_UPDATE (400ms) instead
   */
  TIMELINE_ANIMATION: 800,

  /**
   * Victory celebration duration (3 seconds)
   * Used for confetti and completion animations
   */
  CELEBRATION_DURATION: 3000,

  /**
   * Number ticker animation duration
   * Used for animated number transitions in stats
   */
  NUMBER_TICKER_DEFAULT: 400,

  // Text animations
  /**
   * Default text animation duration
   * Generic fallback for text transitions
   */
  TEXT_ANIMATE_DEFAULT: 300,

  // Ripple effects
  /**
   * Default ripple effect duration
   * Used for interactive feedback animations
   */
  RIPPLE_DEFAULT: 600,

  // Total expected flow - For testing and debugging
  /**
   * Total animation choreography duration (~1.6s visual flow)
   * Represents complete guess sequence from button press to hint reveal
   * Non-blocking: state updates happen immediately, animations are purely visual
   *
   * Breakdown:
   * - Button press: 300ms
   * - Timeline marker: 400ms @ 100ms delay = 500ms total
   * - Proximity container: 300ms @ 300ms delay = 600ms total
   * - Proximity emoji: spring @ 400ms delay = ~500ms total
   * - Proximity text: slide @ 500ms delay = ~600ms total
   * - Hint layout: 400ms (concurrent with above)
   * - New hint: 400ms @ 600ms delay = 1000ms total
   * Peak animation activity: ~1600ms
   */
  GUESS_FLOW_TOTAL: 1600,
} as const;

/**
 * Spring animation presets for natural motion feel
 *
 * Based on physics simulation: stiffness = spring tension, damping = friction
 * - Higher stiffness = faster/snappier motion
 * - Lower damping = more bounce/oscillation
 * - Balance creates natural, organic movement
 *
 * @example
 * // Using with Framer Motion
 * <motion.div
 *   transition={{
 *     type: "spring",
 *     ...ANIMATION_SPRINGS.SMOOTH
 *   }}
 * />
 */
export const ANIMATION_SPRINGS = {
  /**
   * Bouncy spring for playful elements (high stiffness, low damping)
   * Used in: ProximityDisplay.tsx (emoji pop animation)
   * Creates energetic, attention-grabbing motion with noticeable overshoot
   * Best for celebratory or emphasis animations
   */
  BOUNCY: { stiffness: 400, damping: 20 },

  /**
   * Smooth spring for most animations (balanced stiffness and damping)
   * Used in: Timeline.tsx (marker animations)
   * Creates natural, fluid motion without excessive bounce
   * Ideal for most UI transitions - responsive but not distracting
   */
  SMOOTH: { stiffness: 300, damping: 25 },

  /**
   * Gentle spring for subtle animations (low stiffness, high damping)
   * Reserved for background or ambient animations
   * Creates soft, understated motion with minimal bounce
   * Best for elements that shouldn't draw too much attention
   */
  GENTLE: { stiffness: 200, damping: 30 },
} as const;

/**
 * Easing curves for non-spring animations
 *
 * Cubic bezier curves defined as [x1, y1, x2, y2] for custom timing functions
 * These create more controlled animation curves than spring physics
 *
 * Visualize at: https://cubic-bezier.com/
 *
 * @example
 * // Using with Framer Motion
 * <motion.div
 *   transition={{
 *     duration: 0.4,
 *     ease: ANIMATION_EASINGS.ANTICIPATION
 *   }}
 * />
 */
export const ANIMATION_EASINGS = {
  /**
   * Anticipation curve - overshoots slightly for emphasis [0.34, 1.56, 0.64, 1]
   * Used in: HintsDisplay.tsx (new hint reveal)
   * Creates dramatic reveal by briefly overshooting target position
   * The overshoot (y > 1.0) adds polish and draws attention to new content
   * Best for important reveals that warrant extra emphasis
   */
  ANTICIPATION: [0.34, 1.56, 0.64, 1] as const,

  /**
   * Smooth ease-out - decelerates at end [0.16, 1, 0.3, 1]
   * Standard deceleration curve for elements entering the viewport
   * Starts fast and slows down naturally, like an object coming to rest
   * Best for slide-in and fade-in animations
   */
  SMOOTH_OUT: [0.16, 1, 0.3, 1] as const,

  /**
   * Smooth ease-in-out - accelerates then decelerates [0.45, 0, 0.55, 1]
   * Symmetric curve for animations that need smooth start and end
   * Creates polished, professional motion without abruptness
   * Best for transitions between states or position changes
   */
  SMOOTH_IN_OUT: [0.45, 0, 0.55, 1] as const,
} as const;

/**
 * CSS class transition durations for Tailwind utility classes
 *
 * Use these when applying Tailwind's duration utilities for consistency
 * with JavaScript-based animations
 */
export const CSS_DURATIONS = {
  /** Tailwind duration-200 class (200ms) - Quick transitions */
  TRANSITION_200: "duration-200",
  /** Tailwind duration-300 class (300ms) - Standard transitions */
  TRANSITION_300: "duration-300",
  /** Tailwind duration-600 class (600ms) - Slower, more noticeable transitions */
  TRANSITION_600: "duration-600",
} as const;

/**
 * Converts milliseconds to seconds for CSS/animation library compatibility
 *
 * Many animation libraries (including Framer Motion) expect durations in seconds
 * while our constants are defined in milliseconds for clarity
 *
 * @param ms - Duration in milliseconds
 * @returns Duration in seconds
 *
 * @example
 * // Convert HINT_DELAY for Framer Motion
 * <motion.div
 *   transition={{ delay: msToSeconds(ANIMATION_DURATIONS.HINT_DELAY) }}
 * />
 */
export const msToSeconds = (ms: number): number => ms / 1000;

/**
 * Formats milliseconds as a CSS duration string
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted CSS duration string (e.g., "300ms")
 *
 * @example
 * // Use in inline styles or CSS-in-JS
 * const style = {
 *   transitionDuration: formatCssDuration(ANIMATION_DURATIONS.BUTTON_PRESS)
 * };
 */
export const formatCssDuration = (ms: number): string => `${ms}ms`;

/**
 * Type exports for TypeScript safety
 *
 * These types allow for autocomplete and type checking when referencing
 * animation constant keys in other parts of the codebase
 */

/** Union type of all available animation duration keys */
export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;

/** Union type of all available spring preset keys */
export type AnimationSpring = keyof typeof ANIMATION_SPRINGS;

/** Union type of all available easing curve keys */
export type AnimationEasing = keyof typeof ANIMATION_EASINGS;

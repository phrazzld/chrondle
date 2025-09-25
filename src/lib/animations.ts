/**
 * Shared animation constants and utilities for Chrondle
 * Provides consistent timing, easing, and animation configurations
 */

// ===========================
// Animation Timing Standards
// ===========================

export const ANIMATION_DURATION = {
  // Micro interactions (100-200ms)
  INSTANT: 100,
  QUICK: 150,
  FAST: 200,

  // State transitions (200-300ms)
  NORMAL: 250,
  SMOOTH: 300,

  // Page transitions (300-500ms)
  MEDIUM: 400,
  SLOW: 500,

  // Celebrations (500-1000ms)
  CELEBRATE: 600,
  LONG_CELEBRATE: 800,
  EPIC: 1000,

  // Special animations
  CONFETTI: 5000,
  VICTORY_FLASH: 600,
  STREAK_ROLL: 600,
  MILESTONE_PULSE: 3600, // 3 pulses at 1.2s each
} as const;

// ===========================
// Easing Functions
// ===========================

export const ANIMATION_EASING = {
  // Standard easings
  LINEAR: "linear",
  EASE: "ease",
  EASE_IN: "ease-in",
  EASE_OUT: "ease-out",
  EASE_IN_OUT: "ease-in-out",

  // Custom cubic-bezier easings
  SMOOTH: "cubic-bezier(0.4, 0, 0.2, 1)",
  SPRING: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  BOUNCE: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  SHARP: "cubic-bezier(0.4, 0, 0.6, 1)",
} as const;

// ===========================
// Spring Configurations
// ===========================

export const SPRING_CONFIG = {
  // Default spring
  DEFAULT: {
    stiffness: 200,
    damping: 20,
  },
  // Bouncy spring
  BOUNCY: {
    stiffness: 300,
    damping: 15,
  },
  // Stiff spring
  STIFF: {
    stiffness: 400,
    damping: 25,
  },
  // Soft spring
  SOFT: {
    stiffness: 150,
    damping: 18,
  },
} as const;

// ===========================
// Animation Delays
// ===========================

export const ANIMATION_DELAY = {
  // Stagger delays for sequential animations
  STAGGER_QUICK: 30,
  STAGGER_NORMAL: 50,
  STAGGER_SLOW: 100,

  // Cascade delays
  CASCADE_QUICK: 150,
  CASCADE_NORMAL: 200,
  CASCADE_SLOW: 300,

  // Hint text word stagger
  WORD_STAGGER: 30,
} as const;

// ===========================
// Animation Class Names
// ===========================

export const ANIMATION_CLASS = {
  // Victory animations
  VICTORY_FLASH: "animate-victory-flash",
  CONFETTI_EXPLODE: "animate-confetti-explode",

  // Streak animations
  FLAME_MILD: "animate-flame-mild",
  FLAME_FLICKER: "animate-flame-flicker",
  FLAME_HOT: "animate-flame-hot",
  NUMBER_ROLL: "animate-number-roll",
  MILESTONE_PULSE: "animate-milestone-pulse",
  MILESTONE_PULSE_GOLD: "animate-milestone-pulse-gold",

  // UI feedback animations
  BUTTON_PRESS: "animate-button-press",
  INPUT_PULSE: "animate-input-pulse",
  DOT_FILL: "animate-dot-fill",
  DOT_POP: "animate-dot-pop",

  // Loading animations
  PULSE: "animate-pulse",
  SPIN: "animate-spin",
  SHIMMER: "animate-shimmer",
  TYPING_DOTS: "animate-typing-dots",

  // Transition animations
  FADE_IN: "animate-fade-in",
  FADE_UP: "animate-fade-up",
  SCALE_IN: "animate-scale-in",
  SLIDE_IN: "animate-slide-in",

  // Hover animations
  HEARTBEAT: "animate-heartbeat",
} as const;

// ===========================
// Keyframe Configurations
// ===========================

export const KEYFRAMES = {
  VICTORY_FLASH: {
    "0%": { backgroundColor: "var(--background)" },
    "20%": { backgroundColor: "oklch(from var(--background) calc(l + 0.08) c h)" },
    "100%": { backgroundColor: "var(--background)" },
  },
  FLAME_FLICKER: {
    "0%, 100%": {
      transform: "rotate(-2deg) scale(1)",
      opacity: "0.9",
    },
    "25%": {
      transform: "rotate(1deg) scale(1.05)",
      opacity: "1",
    },
    "50%": {
      transform: "rotate(-1deg) scale(0.98)",
      opacity: "0.85",
    },
    "75%": {
      transform: "rotate(2deg) scale(1.02)",
      opacity: "0.95",
    },
  },
  NUMBER_ROLL: {
    "0%": { transform: "translateY(100%)", opacity: "0" },
    "50%": { transform: "translateY(-10%)", opacity: "0.5" },
    "100%": { transform: "translateY(0)", opacity: "1" },
  },
} as const;

// ===========================
// Performance Optimizations
// ===========================

export const ANIMATION_PERFORMANCE = {
  // CSS properties for will-change
  WILL_CHANGE: {
    TRANSFORM: "transform",
    OPACITY: "opacity",
    TRANSFORM_OPACITY: "transform, opacity",
    AUTO: "auto",
  },

  // GPU-accelerated properties (use these for best performance)
  GPU_ACCELERATED: ["transform", "opacity", "filter", "backdrop-filter"],

  // Properties to avoid animating (trigger layout recalculation)
  AVOID_ANIMATING: [
    "width",
    "height",
    "padding",
    "margin",
    "top",
    "left",
    "right",
    "bottom",
    "font-size",
    "line-height",
  ],
} as const;

// ===========================
// Utility Functions
// ===========================

/**
 * Get animation duration in milliseconds
 */
export function getDuration(type: keyof typeof ANIMATION_DURATION): number {
  return ANIMATION_DURATION[type];
}

/**
 * Get animation duration as CSS string
 */
export function getDurationCSS(type: keyof typeof ANIMATION_DURATION): string {
  return `${ANIMATION_DURATION[type]}ms`;
}

/**
 * Create a stagger delay for index
 */
export function getStaggerDelay(
  index: number,
  type: keyof typeof ANIMATION_DELAY = "STAGGER_NORMAL",
): number {
  return index * ANIMATION_DELAY[type];
}

/**
 * Check if animations should be disabled based on media query
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Apply will-change optimization for animation
 */
export function applyWillChange(
  element: HTMLElement,
  property: keyof typeof ANIMATION_PERFORMANCE.WILL_CHANGE,
): void {
  element.style.willChange = ANIMATION_PERFORMANCE.WILL_CHANGE[property];
}

/**
 * Remove will-change after animation completes
 */
export function removeWillChange(element: HTMLElement): void {
  element.style.willChange = ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO;
}

// ===========================
// Animation Presets
// ===========================

export const ANIMATION_PRESETS = {
  // Fade in with scale
  fadeInScale: {
    duration: ANIMATION_DURATION.NORMAL,
    easing: ANIMATION_EASING.SMOOTH,
    initial: { opacity: 0, transform: "scale(0.95)" },
    animate: { opacity: 1, transform: "scale(1)" },
  },

  // Slide up and fade
  slideUpFade: {
    duration: ANIMATION_DURATION.SMOOTH,
    easing: ANIMATION_EASING.SMOOTH,
    initial: { opacity: 0, transform: "translateY(20px)" },
    animate: { opacity: 1, transform: "translateY(0)" },
  },

  // Bounce in
  bounceIn: {
    duration: ANIMATION_DURATION.MEDIUM,
    easing: ANIMATION_EASING.BOUNCE,
    initial: { transform: "scale(0)" },
    animate: { transform: "scale(1)" },
  },

  // Pulse
  pulse: {
    duration: ANIMATION_DURATION.NORMAL,
    easing: ANIMATION_EASING.EASE_IN_OUT,
    animate: {
      transform: ["scale(1)", "scale(1.05)", "scale(1)"],
    },
  },
} as const;

// ===========================
// Animation Breakpoints
// ===========================

export const ANIMATION_BREAKPOINTS = {
  // Disable complex animations on these viewport widths
  DISABLE_COMPLEX: 640, // Below sm breakpoint
  // Reduce particle count on these viewport widths
  REDUCE_PARTICLES: 768, // Below md breakpoint
} as const;

/**
 * Check if complex animations should be disabled based on viewport
 */
export function shouldDisableComplexAnimations(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < ANIMATION_BREAKPOINTS.DISABLE_COMPLEX;
}

/**
 * Get adjusted particle count based on viewport
 */
export function getAdjustedParticleCount(baseCount: number): number {
  if (typeof window === "undefined") return baseCount;
  if (window.innerWidth < ANIMATION_BREAKPOINTS.REDUCE_PARTICLES) {
    return Math.floor(baseCount * 0.6); // Reduce by 40% on mobile
  }
  return baseCount;
}

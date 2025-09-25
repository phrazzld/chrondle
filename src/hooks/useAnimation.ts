"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { useAnimationSettings, useAnimationsDisabled } from "@/contexts/AnimationSettingsContext";
import {
  ANIMATION_DURATION,
  ANIMATION_EASING,
  SPRING_CONFIG,
  ANIMATION_DELAY,
  ANIMATION_CLASS,
  ANIMATION_PRESETS,
  getDuration,
  getDurationCSS,
  getStaggerDelay,
  shouldReduceMotion,
  applyWillChange,
  removeWillChange,
  shouldDisableComplexAnimations,
  getAdjustedParticleCount,
} from "@/lib/animations";

/**
 * Animation state for tracking
 */
interface AnimationState {
  isAnimating: boolean;
  animationId: string | null;
  startTime: number | null;
  duration: number | null;
}

/**
 * Options for animation configuration
 */
interface AnimationOptions {
  duration?: keyof typeof ANIMATION_DURATION | number;
  easing?: keyof typeof ANIMATION_EASING | string;
  delay?: number;
  onComplete?: () => void;
  respectReducedMotion?: boolean;
  willChange?: "transform" | "opacity" | "transform, opacity";
}

/**
 * Return type for useAnimation hook
 */
interface UseAnimationReturn {
  // Animation state
  isAnimating: boolean;
  shouldAnimate: boolean;
  animationsDisabled: boolean;

  // Animation utilities
  animate: (element: HTMLElement | null, options?: AnimationOptions) => void;
  cancelAnimation: () => void;

  // Timing utilities
  getDuration: (type: keyof typeof ANIMATION_DURATION) => number;
  getDurationCSS: (type: keyof typeof ANIMATION_DURATION) => string;
  getStaggerDelay: (index: number, type?: keyof typeof ANIMATION_DELAY) => number;

  // Spring configurations
  springs: typeof SPRING_CONFIG;

  // Easing functions
  easings: typeof ANIMATION_EASING;

  // Animation classes
  classes: typeof ANIMATION_CLASS;

  // Animation presets
  presets: typeof ANIMATION_PRESETS;

  // Performance utilities
  shouldDisableComplex: boolean;
  getParticleCount: (baseCount: number) => number;
}

/**
 * Hook for managing animations with consistent timing and configuration
 * Respects user preferences for reduced motion and animation settings
 */
export function useAnimation(): UseAnimationReturn {
  // Get animation settings from context
  const { animationsEnabled } = useAnimationSettings();
  const animationsDisabled = useAnimationsDisabled();

  // Track animation state
  const animationRef = useRef<AnimationState>({
    isAnimating: false,
    animationId: null,
    startTime: null,
    duration: null,
  });

  const animationFrameRef = useRef<number | null>(null);

  // Check if animations should run
  const shouldAnimate = useMemo(() => {
    return animationsEnabled && !animationsDisabled;
  }, [animationsEnabled, animationsDisabled]);

  // Check if complex animations should be disabled
  const shouldDisableComplex = useMemo(() => {
    return shouldDisableComplexAnimations();
  }, []);

  /**
   * Animate an element with options
   */
  const animate = useCallback(
    (element: HTMLElement | null, options: AnimationOptions = {}) => {
      if (!element || !shouldAnimate) {
        // Call onComplete even if not animating
        options.onComplete?.();
        return;
      }

      // Cancel any existing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Parse options
      const {
        duration = "NORMAL",
        easing = "SMOOTH",
        delay = 0,
        onComplete,
        respectReducedMotion = true,
        willChange,
      } = options;

      // Check reduced motion preference
      if (respectReducedMotion && shouldReduceMotion()) {
        onComplete?.();
        return;
      }

      // Get actual duration value
      const durationValue = typeof duration === "number" ? duration : getDuration(duration);

      // Get actual easing value
      const easingValue =
        typeof easing === "string" && easing in ANIMATION_EASING
          ? ANIMATION_EASING[easing as keyof typeof ANIMATION_EASING]
          : easing;

      // Apply will-change if specified
      if (willChange) {
        applyWillChange(
          element,
          willChange === "transform, opacity"
            ? "TRANSFORM_OPACITY"
            : willChange === "transform"
              ? "TRANSFORM"
              : "OPACITY",
        );
      }

      // Set up animation state
      animationRef.current = {
        isAnimating: true,
        animationId: `animation-${Date.now()}`,
        startTime: Date.now() + delay,
        duration: durationValue,
      };

      // Apply animation with delay
      setTimeout(() => {
        if (!element || !animationRef.current.isAnimating) return;

        // Apply transition
        element.style.transition = `all ${durationValue}ms ${easingValue}`;

        // Clean up after animation
        const cleanup = setTimeout(() => {
          if (element) {
            element.style.transition = "";
            if (willChange) {
              removeWillChange(element);
            }
          }

          animationRef.current = {
            isAnimating: false,
            animationId: null,
            startTime: null,
            duration: null,
          };

          onComplete?.();
        }, durationValue);

        // Store cleanup timeout
        animationFrameRef.current = cleanup as unknown as number;
      }, delay);
    },
    [shouldAnimate],
  );

  /**
   * Cancel the current animation
   */
  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    animationRef.current = {
      isAnimating: false,
      animationId: null,
      startTime: null,
      duration: null,
    };
  }, []);

  /**
   * Get adjusted particle count for performance
   */
  const getParticleCount = useCallback(
    (baseCount: number): number => {
      if (!shouldAnimate) return 0;
      return getAdjustedParticleCount(baseCount);
    },
    [shouldAnimate],
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelAnimation();
    };
  }, [cancelAnimation]);

  return {
    // Animation state
    isAnimating: animationRef.current.isAnimating,
    shouldAnimate,
    animationsDisabled,

    // Animation utilities
    animate,
    cancelAnimation,

    // Timing utilities
    getDuration,
    getDurationCSS,
    getStaggerDelay,

    // Spring configurations
    springs: SPRING_CONFIG,

    // Easing functions
    easings: ANIMATION_EASING,

    // Animation classes
    classes: ANIMATION_CLASS,

    // Animation presets
    presets: ANIMATION_PRESETS,

    // Performance utilities
    shouldDisableComplex,
    getParticleCount,
  };
}

/**
 * Hook for stagger animations with consistent timing
 */
export function useStaggerAnimation(
  itemCount: number,
  staggerType: keyof typeof ANIMATION_DELAY = "STAGGER_NORMAL",
) {
  const animation = useAnimation();

  const getItemDelay = useCallback(
    (index: number) => {
      return animation.getStaggerDelay(index, staggerType);
    },
    [animation, staggerType],
  );

  const getTotalDuration = useCallback(
    (itemDuration: keyof typeof ANIMATION_DURATION = "NORMAL") => {
      return animation.getDuration(itemDuration) + getItemDelay(itemCount - 1);
    },
    [animation, itemCount, getItemDelay],
  );

  return {
    getItemDelay,
    getTotalDuration,
    shouldAnimate: animation.shouldAnimate,
  };
}

/**
 * Hook for spring animations using motion/framer-motion
 */
export function useSpringAnimation(springType: keyof typeof SPRING_CONFIG = "DEFAULT") {
  const animation = useAnimation();

  const springConfig = useMemo(() => {
    if (!animation.shouldAnimate) {
      // Return instant transition if animations disabled
      return { type: "tween", duration: 0 };
    }
    return {
      type: "spring",
      ...SPRING_CONFIG[springType],
    };
  }, [animation.shouldAnimate, springType]);

  return {
    springConfig,
    shouldAnimate: animation.shouldAnimate,
  };
}

/**
 * Hook for fade animations with consistent timing
 */
export function useFadeAnimation(options: AnimationOptions = {}) {
  const animation = useAnimation();
  const elementRef = useRef<HTMLElement | null>(null);

  const fadeIn = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.style.opacity = "0";
      animation.animate(elementRef.current, {
        duration: "NORMAL",
        easing: "SMOOTH",
        ...options,
      });
      requestAnimationFrame(() => {
        if (elementRef.current) {
          elementRef.current.style.opacity = "1";
        }
      });
    }
  }, [animation, options]);

  const fadeOut = useCallback(() => {
    if (elementRef.current) {
      elementRef.current.style.opacity = "1";
      animation.animate(elementRef.current, {
        duration: "NORMAL",
        easing: "SMOOTH",
        ...options,
        onComplete: () => {
          if (elementRef.current) {
            elementRef.current.style.opacity = "0";
          }
          options.onComplete?.();
        },
      });
    }
  }, [animation, options]);

  return {
    elementRef,
    fadeIn,
    fadeOut,
    shouldAnimate: animation.shouldAnimate,
  };
}

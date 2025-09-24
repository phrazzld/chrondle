"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ConfettiRef } from "@/components/magicui/confetti";

interface UseVictoryConfettiOptions {
  /** Whether the player has won the game */
  hasWon: boolean;
  /** Whether the game is complete (won or lost) */
  isGameComplete: boolean;
  /** Whether the component is mounted (to prevent SSR issues) */
  isMounted: boolean;
  /** Optional: Number of guesses made (for tracking new wins) */
  guessCount?: number;
  /** Optional: Disable confetti entirely (e.g., for debug mode) */
  disabled?: boolean;
  /** Optional: Custom colors for confetti */
  colors?: string[];
}

interface UseVictoryConfettiReturn {
  /** Trigger confetti manually if needed */
  triggerConfetti: () => void;
  /** Whether confetti has been fired for this victory */
  hasFiredConfetti: boolean;
}

/**
 * Hook to manage victory confetti celebrations
 *
 * Features:
 * - Automatically fires confetti on victory
 * - Respects reduced motion preferences
 * - Prevents duplicate firing for same victory
 * - Prevents auto-fire when loading already-won games
 * - Provides manual trigger for custom scenarios
 */
export function useVictoryConfetti(
  confettiRef: React.RefObject<ConfettiRef>,
  options: UseVictoryConfettiOptions,
): UseVictoryConfettiReturn {
  const {
    hasWon,
    isGameComplete,
    isMounted,
    guessCount = 0,
    disabled = false,
    colors = ["#d4a574", "#27ae60", "#3498db", "#f39c12"],
  } = options;

  // Track if we've fired confetti for this specific victory
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);

  // Track the guess count when we last fired confetti
  const lastFireGuessCount = useRef<number | null>(null);

  // Manual trigger function
  const triggerConfetti = useCallback(async () => {
    if (!confettiRef.current || disabled) return;

    try {
      // Check for reduced motion preference
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        // Simple, less intensive confetti for users who prefer reduced motion
        await confettiRef.current.fire({
          particleCount: 30,
          spread: 45,
          origin: { x: 0.5, y: 0.6 },
          colors: colors.slice(0, 2), // Use fewer colors for reduced motion
          gravity: 1.2,
          drift: 0,
        });
      } else {
        // Calculate particle count based on guess count
        // 1 guess = 200 particles total, 6 guesses = 60 particles total
        // Formula: 260 - (guessCount * 40) ensures linear scaling
        const actualGuessCount = Math.max(1, Math.min(6, guessCount || 1));
        const baseParticleCount = 260 - actualGuessCount * 40;

        // Split particles between bursts (70% first, 30% second)
        const firstBurstCount = Math.round(baseParticleCount * 0.7);
        const secondBurstCount = Math.round(baseParticleCount * 0.3);

        // Adjust spread based on guess count (tighter spread for better performance)
        const spreadMultiplier = 1 + (6 - actualGuessCount) * 0.1; // 1.5x for 1 guess, 1.0x for 6

        // Full confetti celebration for users who enjoy motion
        // First burst from center
        await confettiRef.current.fire({
          particleCount: firstBurstCount,
          spread: 70 * spreadMultiplier,
          origin: { x: 0.5, y: 0.6 },
          colors,
          // Add velocity boost for fewer guesses
          startVelocity: 30 + (6 - actualGuessCount) * 4, // 50 for 1 guess, 30 for 6
        });

        // Second burst with different spread after a delay
        setTimeout(async () => {
          if (confettiRef.current) {
            await confettiRef.current.fire({
              particleCount: secondBurstCount,
              spread: 120 * spreadMultiplier,
              origin: { x: 0.5, y: 0.7 },
              colors,
              // Slightly less velocity for second burst
              startVelocity: 25 + (6 - actualGuessCount) * 3,
            });
          }
        }, 250);

        // Add third burst for perfect guesses (1 guess only)
        if (actualGuessCount === 1) {
          setTimeout(async () => {
            if (confettiRef.current) {
              await confettiRef.current.fire({
                particleCount: 30,
                spread: 360, // Full circle spread
                origin: { x: 0.5, y: 0.5 },
                colors,
                startVelocity: 45,
                ticks: 100, // Longer duration for dramatic effect
              });
            }
          }, 500);
        }
      }

      setHasFiredConfetti(true);
      lastFireGuessCount.current = guessCount;
    } catch (error) {
      console.error("Victory confetti error:", error);
    }
  }, [confettiRef, disabled, guessCount, colors]);

  // Auto-fire confetti on victory
  useEffect(() => {
    // Check all conditions for auto-firing confetti
    const shouldFireConfetti =
      hasWon &&
      isGameComplete &&
      isMounted &&
      !disabled &&
      !hasFiredConfetti &&
      confettiRef.current &&
      // Prevent firing if this is an already-won game being loaded
      // (guessCount > 0 ensures at least one guess was made in this session)
      (guessCount > 0 || lastFireGuessCount.current === null);

    if (shouldFireConfetti) {
      triggerConfetti();
    }
  }, [
    hasWon,
    isGameComplete,
    isMounted,
    disabled,
    hasFiredConfetti,
    confettiRef,
    guessCount,
    triggerConfetti,
  ]);

  // Reset fired state when game state changes significantly
  useEffect(() => {
    // Reset if we're no longer in a won state
    if (!hasWon || !isGameComplete) {
      setHasFiredConfetti(false);
      lastFireGuessCount.current = null;
    }
  }, [hasWon, isGameComplete]);

  return {
    triggerConfetti,
    hasFiredConfetti,
  };
}

/**
 * Game Statistics Module
 * Provides statistical analysis for game performance and guess accuracy
 */

import { logger } from "@/lib/logger";

/**
 * Result of closest guess calculation
 */
export interface ClosestGuessResult {
  guess: number;
  distance: number;
}

/**
 * Calculates the guess that was closest to the target year
 * Used for performance analysis and enhanced sharing features
 *
 * @param guesses - Array of year guesses made by the player
 * @param targetYear - The target year to compare against
 * @returns Object with closest guess and distance, or null if invalid input
 *
 * @example
 * calculateClosestGuess([1960, 1970, 1980], 1969);
 * // { guess: 1970, distance: 1 }
 *
 * @example
 * calculateClosestGuess([1900, 1950, 2000], 1969);
 * // { guess: 1950, distance: 19 }
 */
export function calculateClosestGuess(
  guesses: number[],
  targetYear: number,
): ClosestGuessResult | null {
  if (!Array.isArray(guesses) || guesses.length === 0 || typeof targetYear !== "number") {
    return null;
  }

  try {
    let closestDistance = Infinity;
    let closestGuess = guesses[0];

    for (const guess of guesses) {
      if (typeof guess !== "number" || !isFinite(guess)) {
        continue;
      }

      const distance = Math.abs(guess - targetYear);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestGuess = guess;
      }
    }

    return { guess: closestGuess, distance: closestDistance };
  } catch (error) {
    logger.error("Closest guess calculation failed:", error);
    return null;
  }
}

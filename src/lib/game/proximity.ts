/**
 * Game Proximity Feedback Module
 * Provides visual and textual feedback about guess accuracy
 */

/**
 * Direction information for a guess relative to the target
 */
export interface GuessDirectionInfo {
  direction: "correct" | "earlier" | "later";
  icon: string;
  text: string;
}

/**
 * Determines direction feedback for a year guess
 * Provides visual (icon) and textual feedback to guide the player
 *
 * @param guess - The year guessed by the player
 * @param target - The target year to find
 * @returns Direction info with icon and guidance text
 *
 * @example
 * getGuessDirectionInfo(1970, 1969);
 * // { direction: "earlier", icon: "▼", text: "Too late - try an earlier year" }
 *
 * @example
 * getGuessDirectionInfo(1969, 1969);
 * // { direction: "correct", icon: "🎯", text: "Perfect! You found it!" }
 */
export function getGuessDirectionInfo(guess: number, target: number): GuessDirectionInfo {
  const difference = guess - target;
  if (difference === 0) {
    return { direction: "correct", icon: "🎯", text: "Perfect! You found it!" };
  } else if (difference > 0) {
    return {
      direction: "earlier",
      icon: "▼",
      text: "Too late - try an earlier year",
    };
  } else {
    return {
      direction: "later",
      icon: "▲",
      text: "Too early - try a later year",
    };
  }
}

/**
 * Generates a single emoji representing proximity to the target
 * Uses temperature metaphor: hot (close) to cold (far)
 *
 * Thresholds aligned with ProximityDisplay component for consistency:
 * - 🎯 Perfect (0 years)
 * - 🔥 Very hot (1-10 years)
 * - ♨️ Hot (11-50 years)
 * - 🌡️ Warm (51-150 years)
 * - ❄️ Cold (151-500 years)
 * - 🧊 Very cold (500+ years)
 *
 * @param guess - The year guessed
 * @param targetYear - The target year
 * @returns Single emoji character representing proximity
 *
 * @example
 * generateWordleBoxes(1969, 1969); // "🎯"
 * generateWordleBoxes(1970, 1969); // "🔥"
 * generateWordleBoxes(2000, 1969); // "♨️"
 */
export function generateWordleBoxes(guess: number, targetYear: number): string {
  const distance = Math.abs(guess - targetYear);

  // Use same thresholds as ProximityDisplay component for consistency
  if (distance === 0) return "🎯"; // Perfect
  if (distance <= 10) return "🔥"; // Very hot
  if (distance <= 50) return "♨️"; // Hot
  if (distance <= 150) return "🌡️"; // Warm
  if (distance <= 500) return "❄️"; // Cold
  return "🧊"; // Very cold
}

/**
 * Social Sharing Content Generator
 * Generates formatted text for sharing game results on social media
 */

import { generateWordleBoxes } from "@/lib/game/proximity";
import { calculateClosestGuess } from "@/lib/utils";

/**
 * Formats the closest guess message with achievement indicators
 * Internal helper for share text generation
 *
 * @param closestData - Closest guess data (guess and distance)
 * @param hasWon - Whether the player won
 * @returns Formatted message string with achievement emoji
 */
function formatClosestGuessMessage(
  closestData: { guess: number; distance: number } | null,
  hasWon: boolean,
): string {
  // Don't show closest guess if user won
  if (hasWon || !closestData) {
    return "";
  }

  const { distance } = closestData;

  if (typeof distance !== "number" || !isFinite(distance) || distance < 0) {
    console.warn("Invalid distance in formatClosestGuessMessage:", distance);
    return "";
  }

  try {
    // Add achievement indicators for exceptional accuracy
    if (distance === 1) {
      return ` (Closest: 1 year off! 🎯)`;
    } else if (distance <= 5) {
      return ` (Closest: ${distance} years off 🏆)`;
    } else if (distance <= 25) {
      return ` (Closest: ${distance} years off 🎖️)`;
    } else {
      return ` (Closest: ${distance} years off)`;
    }
  } catch (error) {
    console.error("Error formatting closest guess message:", error);
    return "";
  }
}

/**
 * Generates a visual emoji timeline representing guess progression
 * Each emoji indicates proximity to the target year
 *
 * @param guesses - Array of year guesses
 * @param targetYear - The target year to compare against
 * @returns Space-separated emoji sequence (e.g., "🧊 ❄️ 🔥 🎯")
 *
 * @example
 * generateEmojiTimeline([1900, 1950, 1969], 1969);
 * // "🧊 ❄️ 🎯"
 */
export function generateEmojiTimeline(guesses: number[], targetYear: number): string {
  return guesses
    .map((guess) => {
      return generateWordleBoxes(guess, targetYear);
    })
    .join(" ");
}

/**
 * Generates formatted share text for social media
 * Includes date, score, first hint, emoji timeline, and closest guess stats
 *
 * @param guesses - Array of year guesses made
 * @param targetYear - The target year
 * @param hasWon - Whether the player won
 * @param puzzleEvents - Optional array of hint events (first one shown in share)
 * @param puzzleNumber - Optional puzzle number for display
 * @returns Formatted share text ready for clipboard
 *
 * @example
 * generateShareText([1960, 1965, 1969], 1969, true, ["Event 1"], 42);
 * // "Chrondle #42: November 16, 2024 - 3/6
 * //  Event 1
 * //
 * //  🌡️ ♨️ 🎯
 * //
 * //  https://www.chrondle.app"
 */
export function generateShareText(
  guesses: number[],
  targetYear: number,
  hasWon: boolean,
  puzzleEvents?: string[],
  puzzleNumber?: number,
): string {
  try {
    // Validate inputs
    if (
      !Array.isArray(guesses) ||
      typeof targetYear !== "number" ||
      typeof hasWon !== "boolean" ||
      (puzzleNumber !== undefined && typeof puzzleNumber !== "number")
    ) {
      console.error("Invalid inputs to generateShareText");
      return "Chrondle share text generation failed";
    }

    const today = new Date();
    const dateString = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emojiTimeline = generateEmojiTimeline(guesses, targetYear);
    const score = hasWon ? `${guesses.length}/6` : "X/6";

    // Calculate closest guess for enhanced sharing with error handling
    let closestMessage = "";
    try {
      const closestData = calculateClosestGuess(guesses, targetYear);
      closestMessage = formatClosestGuessMessage(closestData, hasWon);
    } catch (error) {
      console.warn("Failed to calculate closest guess for sharing:", error);
      // Continue without closest guess message
    }

    let result = `Chrondle ${puzzleNumber ? `#${puzzleNumber}` : ""}: ${dateString} - ${score}${closestMessage}\n`;

    // Add first hint if available (directly below the top line)
    if (puzzleEvents && Array.isArray(puzzleEvents) && puzzleEvents.length > 0 && puzzleEvents[0]) {
      result += `${puzzleEvents[0]}\n`;
    }

    result += `\n${emojiTimeline}`;
    result += "\n\nhttps://www.chrondle.app";

    return result;
  } catch (error) {
    console.error("Failed to generate share text:", error);
    // Fallback to basic share text
    return `Chrondle: ${hasWon ? "Won" : "Lost"} in ${guesses.length}/6 guesses\nhttps://www.chrondle.app`;
  }
}

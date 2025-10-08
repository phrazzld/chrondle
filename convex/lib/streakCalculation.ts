/**
 * Pure streak calculation logic shared between client and server
 *
 * This module provides deterministic streak calculation based on UTC dates.
 * It has zero dependencies and handles all edge cases for consecutive day tracking.
 *
 * Module Responsibility: Calculate streaks from dates - the "what" not "how to persist"
 * Hidden Complexity: UTC timezone handling, date comparison edge cases, null handling
 */

/**
 * Result of streak calculation
 */
export interface StreakCalculationResult {
  currentStreak: number;
  lastCompletedDate: string;
}

/**
 * Get current date as UTC string in ISO format (YYYY-MM-DD)
 *
 * @param date - Optional date to convert, defaults to now
 * @returns ISO date string in UTC timezone
 *
 * @example
 * getUTCDateString() // "2025-10-08"
 * getUTCDateString(new Date('2024-12-25')) // "2024-12-25"
 */
export function getUTCDateString(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Validate ISO date string format
 *
 * @param dateString - Date string to validate
 * @returns true if valid ISO format (YYYY-MM-DD)
 */
function isValidDateString(dateString: string): boolean {
  if (!dateString || typeof dateString !== "string") {
    return false;
  }

  // Check format: YYYY-MM-DD
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDatePattern.test(dateString)) {
    return false;
  }

  // Verify it's a real date (not 2024-13-45)
  const date = new Date(dateString + "T00:00:00.000Z");
  return !isNaN(date.getTime()) && getUTCDateString(date) === dateString;
}

/**
 * Check if two dates are consecutive (second date is exactly one day after first)
 *
 * @param firstDate - Earlier date (ISO string YYYY-MM-DD)
 * @param secondDate - Later date (ISO string YYYY-MM-DD)
 * @returns true if secondDate is exactly one day after firstDate
 *
 * @throws Error if date strings are invalid
 *
 * @example
 * isConsecutiveDay("2025-10-07", "2025-10-08") // true
 * isConsecutiveDay("2025-10-07", "2025-10-09") // false (gap)
 * isConsecutiveDay("2025-10-07", "2025-10-07") // false (same day)
 */
export function isConsecutiveDay(firstDate: string, secondDate: string): boolean {
  if (!isValidDateString(firstDate)) {
    throw new Error(`Invalid first date: ${firstDate}`);
  }
  if (!isValidDateString(secondDate)) {
    throw new Error(`Invalid second date: ${secondDate}`);
  }

  // Parse both dates in UTC
  const first = new Date(firstDate + "T00:00:00.000Z");
  const second = new Date(secondDate + "T00:00:00.000Z");

  // Calculate expected next day
  const expectedNext = new Date(first);
  expectedNext.setUTCDate(expectedNext.getUTCDate() + 1);

  // Compare UTC timestamps (ignores time component since we set to 00:00:00)
  return getUTCDateString(expectedNext) === getUTCDateString(second);
}

/**
 * Calculate streak based on last completion date and current game result
 *
 * This is a pure function with deterministic output based solely on inputs.
 *
 * Rules:
 * - First play (null lastCompletedDate) + win → streak = 1
 * - First play (null lastCompletedDate) + loss → streak = 0
 * - Same day completion (todayDate === lastCompletedDate) → no change, return { currentStreak: 0, lastCompletedDate }
 * - Consecutive day (yesterday) + win → streak + 1
 * - Consecutive day (yesterday) + loss → streak = 0
 * - Gap (>1 day) + win → reset to 1
 * - Gap (>1 day) + loss → reset to 0
 *
 * @param lastCompletedDate - Date of last puzzle completion (ISO YYYY-MM-DD) or null
 * @param currentStreak - Current streak count before this game
 * @param todayDate - Date of current game completion (ISO YYYY-MM-DD)
 * @param hasWon - Whether the player won this game
 * @returns New streak count and completion date
 *
 * @throws Error if date strings are invalid format
 *
 * @example
 * // First play, won
 * calculateStreak(null, 0, "2025-10-08", true)
 * // → { currentStreak: 1, lastCompletedDate: "2025-10-08" }
 *
 * @example
 * // Consecutive day, won
 * calculateStreak("2025-10-07", 5, "2025-10-08", true)
 * // → { currentStreak: 6, lastCompletedDate: "2025-10-08" }
 *
 * @example
 * // Same day (already played today)
 * calculateStreak("2025-10-08", 3, "2025-10-08", true)
 * // → { currentStreak: 0, lastCompletedDate: "2025-10-08" }
 *
 * @example
 * // Gap, reset
 * calculateStreak("2025-10-05", 10, "2025-10-08", true)
 * // → { currentStreak: 1, lastCompletedDate: "2025-10-08" }
 *
 * @example
 * // Lost game
 * calculateStreak("2025-10-07", 5, "2025-10-08", false)
 * // → { currentStreak: 0, lastCompletedDate: "2025-10-08" }
 */
export function calculateStreak(
  lastCompletedDate: string | null,
  currentStreak: number,
  todayDate: string,
  hasWon: boolean,
): StreakCalculationResult {
  // Validate today's date
  if (!isValidDateString(todayDate)) {
    throw new Error(`Invalid today date: ${todayDate}`);
  }

  // If player lost, reset streak to 0
  if (!hasWon) {
    return {
      currentStreak: 0,
      lastCompletedDate: todayDate,
    };
  }

  // First play ever - start streak at 1
  if (!lastCompletedDate) {
    return {
      currentStreak: 1,
      lastCompletedDate: todayDate,
    };
  }

  // Validate last completed date
  if (!isValidDateString(lastCompletedDate)) {
    throw new Error(`Invalid last completed date: ${lastCompletedDate}`);
  }

  // Same day - already played today, return special marker
  // The caller should handle this by not updating the streak
  if (lastCompletedDate === todayDate) {
    return {
      currentStreak: 0, // Signal: no update needed
      lastCompletedDate: todayDate,
    };
  }

  // Check if consecutive day (yesterday → today)
  if (isConsecutiveDay(lastCompletedDate, todayDate)) {
    return {
      currentStreak: currentStreak + 1,
      lastCompletedDate: todayDate,
    };
  }

  // Gap detected - reset streak to 1
  return {
    currentStreak: 1,
    lastCompletedDate: todayDate,
  };
}

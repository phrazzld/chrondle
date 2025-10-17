/**
 * Display Formatting Utilities
 * Pure functions for formatting time-related values
 */

/**
 * Calculates milliseconds until next midnight local time
 * Used for countdown timers to next daily puzzle
 *
 * @returns Milliseconds until midnight (00:00:00)
 *
 * @example
 * const ms = getTimeUntilMidnight();
 * logger.debug(`${Math.floor(ms / 1000 / 60)} minutes until next puzzle`);
 */
export function getTimeUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

/**
 * Formats milliseconds into HH:MM:SS countdown format
 * Always displays with 2-digit padding for consistent width
 *
 * @param milliseconds - Time in milliseconds to format
 * @returns Formatted string in "HH:MM:SS" format
 *
 * @example
 * formatCountdown(3661000); // "01:01:01"
 * formatCountdown(59000);   // "00:00:59"
 * formatCountdown(0);       // "00:00:00"
 */
export function formatCountdown(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

import { SUPPORTED_YEARS } from "./puzzleData";
import { getDailyYear } from "./gameState";

/**
 * Calculate puzzle number for a given year based on its position in SUPPORTED_YEARS
 * @param year The year to get puzzle number for
 * @returns Puzzle number (1-indexed) or null if year not found
 */
export function getPuzzleNumberForYear(year: number): number | null {
  const index = SUPPORTED_YEARS.indexOf(year);
  return index !== -1 ? index + 1 : null;
}

/**
 * Get puzzle number for today's daily puzzle
 * @param debugYear Optional debug year
 * @param isDebugMode Whether debug mode is active
 * @returns Today's puzzle number
 */
export function getTodaysPuzzleNumber(
  debugYear?: string,
  isDebugMode?: boolean,
): number {
  const today = getDailyYear(debugYear, isDebugMode);
  return getPuzzleNumberForYear(today) || 1;
}

/**
 * Format puzzle number for display
 * @param num The puzzle number
 * @returns Formatted puzzle number string
 */
export function formatPuzzleNumber(num: number): string {
  return `#${num}`;
}

/**
 * Get puzzle year from puzzle number
 * @param puzzleNumber The puzzle number (1-indexed)
 * @returns The year for that puzzle number, or null if invalid
 */
export function getYearFromPuzzleNumber(puzzleNumber: number): number | null {
  const index = puzzleNumber - 1;
  if (index >= 0 && index < SUPPORTED_YEARS.length) {
    return SUPPORTED_YEARS[index];
  }
  return null;
}

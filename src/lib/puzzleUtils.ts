import { getIndexFromYear } from "./puzzleData";
import { getDailyYear } from "./gameState";

/**
 * Calculate puzzle number for a given year
 * @param year The year to get puzzle number for
 * @returns Puzzle number (1-indexed) or null if year not found
 */
export function getPuzzleNumberForYear(year: number): number | null {
  const index = getIndexFromYear(year);
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getYearFromPuzzleNumber(puzzleNumber: number): number | null {
  // TODO: This function needs to query Convex for the puzzle by number
  // Puzzle numbers are no longer tied to specific years
  console.warn("🚧 getYearFromPuzzleNumber() - Needs Convex migration");
  return null;
}

// Static Puzzle Database for Chrondle
// Ultra-minimal schema: just year -> events mapping with metadata

import puzzleDataJson from "@/data/puzzles.json";
import { logger } from "./logger";
import type { Puzzle } from "./gameState";

// Re-export Puzzle type for convenience
export type { Puzzle } from "./gameState";

// --- TYPE DEFINITIONS ---

export interface PuzzleMeta {
  version: string;
  total_puzzles: number;
  date_range: string;
}

export interface PuzzleDatabase {
  meta: PuzzleMeta;
  puzzles: Record<string, string[]>;
}

// --- STATIC DATA ---

export const puzzleData: PuzzleDatabase = puzzleDataJson;

// Pre-computed array of all puzzles for index-based access
// Sorted by year (ascending) for consistent ordering
export const ALL_PUZZLE_YEARS = Object.keys(puzzleData.puzzles)
  .map(Number)
  .sort((a, b) => a - b);

// Create a map for O(1) year to index lookup
export const YEAR_TO_INDEX_MAP = new Map<number, number>(
  ALL_PUZZLE_YEARS.map((year, index) => [year, index]),
);

// Total number of puzzles
export const TOTAL_PUZZLES = ALL_PUZZLE_YEARS.length;

// Backwards compatibility alias (to be removed)
export const SUPPORTED_YEARS = ALL_PUZZLE_YEARS;

// --- CORE FUNCTIONS ---

/**
 * Get puzzle events for a specific year
 * @param year - The year to get events for
 * @returns Array of events, or empty array if year not found
 */
export function getPuzzleForYear(year: number): string[] {
  const yearStr = year.toString();
  const events = puzzleData.puzzles[yearStr];

  if (!events || events.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`🔍 DEBUG: No puzzle found for year ${year}`);
    }
    return [];
  }

  // Just return the events as-is - they're already curated!
  return [...events]; // Return copy to prevent mutations
}

/**
 * Get all available puzzle years in descending order
 * @returns Array of years that have puzzles, sorted newest to oldest
 */
export function getPuzzleYears(): number[] {
  return Object.keys(puzzleData.puzzles)
    .map(Number)
    .sort((a, b) => b - a);
}

/**
 * Get puzzle data for a specific year
 * @param year - The year to get puzzle for
 * @returns Puzzle object with date, year, and events, or null if not found
 */
export function getPuzzleByYear(year: number): Puzzle | null {
  const events = puzzleData.puzzles[year.toString()];
  if (!events) return null;

  return {
    year,
    events,
    puzzleId: year.toString(),
  };
}

/**
 * Check if a year has a puzzle available
 * @param year - The year to check
 * @returns True if puzzle exists for this year
 */
export function hasPuzzleForYear(year: number): boolean {
  return puzzleData.puzzles.hasOwnProperty(year.toString());
}

/**
 * Get all supported years
 * @returns Sorted array of all years with puzzles
 */
export function getSupportedYears(): number[] {
  return [...ALL_PUZZLE_YEARS]; // Return copy to prevent mutations
}

// --- NEW INDEX-BASED FUNCTIONS ---

/**
 * Get puzzle by index (0-based)
 * @param index - The puzzle index (0 to TOTAL_PUZZLES-1)
 * @returns Puzzle object or null if index is invalid
 */
export function getPuzzleByIndex(index: number): Puzzle | null {
  if (index < 0 || index >= TOTAL_PUZZLES) return null;

  const year = ALL_PUZZLE_YEARS[index];
  const events = puzzleData.puzzles[year.toString()];

  if (!events || events.length === 0) return null;

  return {
    year,
    events: [...events], // Return copy to prevent mutations
    puzzleId: `puzzle-${index + 1}`, // 1-based puzzle ID for display
  };
}

/**
 * Get puzzle index from year
 * @param year - The year to look up
 * @returns 0-based index or -1 if year not found
 */
export function getIndexFromYear(year: number): number {
  return YEAR_TO_INDEX_MAP.get(year) ?? -1;
}

/**
 * Get year from puzzle index
 * @param index - The puzzle index (0-based)
 * @returns Year or null if index is invalid
 */
export function getYearFromIndex(index: number): number | null {
  if (index < 0 || index >= TOTAL_PUZZLES) return null;
  return ALL_PUZZLE_YEARS[index];
}

/**
 * Get puzzle database metadata
 * @returns Metadata about the puzzle collection
 */
export function getPuzzleMeta(): PuzzleMeta {
  return { ...puzzleData.meta }; // Return copy to prevent mutations
}

/**
 * Validate puzzle data structure at runtime
 * @returns True if all puzzles are valid, false otherwise
 */
export function validatePuzzleData(): boolean {
  try {
    let isValid = true;

    // Check metadata
    if (!puzzleData.meta || typeof puzzleData.meta.version !== "string") {
      console.error("🔍 DEBUG: Invalid puzzle metadata");
      isValid = false;
    }

    // Check puzzles object
    if (!puzzleData.puzzles || typeof puzzleData.puzzles !== "object") {
      console.error("🔍 DEBUG: Invalid puzzles object");
      isValid = false;
    }

    // Validate each puzzle
    for (const [yearStr, events] of Object.entries(puzzleData.puzzles)) {
      // Check year format
      const year = parseInt(yearStr, 10);
      if (isNaN(year) || year.toString() !== yearStr) {
        console.error(`🔍 DEBUG: Invalid year format: ${yearStr}`);
        isValid = false;
        continue;
      }

      // Check events array
      if (!Array.isArray(events)) {
        console.error(`🔍 DEBUG: Events for year ${year} is not an array`);
        isValid = false;
        continue;
      }

      // Check event count
      if (events.length < 6) {
        console.error(
          `🔍 DEBUG: Year ${year} has ${events.length} events, expected at least 6`,
        );
        isValid = false;
        continue;
      } else if (events.length > 6) {
        logger.debug(
          `Year ${year} has ${events.length} events (>6), will select 6 deterministically`,
        );
      }

      // Check each event
      events.forEach((event, index) => {
        if (typeof event !== "string") {
          console.error(
            `🔍 DEBUG: Year ${year}, event ${index} is not a string`,
          );
          isValid = false;
        } else if (event.length < 15 || event.length > 200) {
          console.error(
            `🔍 DEBUG: Year ${year}, event ${index} length (${event.length}) outside 15-200 range`,
          );
          isValid = false;
        }
      });
    }

    if (isValid) {
      logger.info(
        `Puzzle data validation passed - ${Object.keys(puzzleData.puzzles).length} valid puzzles`,
      );
    }

    return isValid;
  } catch (error) {
    console.error("🔍 DEBUG: Puzzle data validation failed:", error);
    return false;
  }
}

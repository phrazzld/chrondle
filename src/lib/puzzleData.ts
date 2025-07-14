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

// Pre-computed supported years for efficient daily selection (only years with ≥6 events, but can have more)
export const SUPPORTED_YEARS = Object.keys(puzzleData.puzzles)
  .map(Number)
  .filter((year) => {
    const events = puzzleData.puzzles[year.toString()];
    return events && events.length >= 6;
  })
  .sort((a, b) => a - b);

// --- CORE FUNCTIONS ---

/**
 * Get puzzle events for a specific year
 * @param year - The year to get events for
 * @returns Array of exactly 6 events, or empty array if year not supported
 */
export function getPuzzleForYear(year: number): string[] {
  const yearStr = year.toString();
  const events = puzzleData.puzzles[yearStr];

  if (!events) {
    console.warn(`🔍 DEBUG: No puzzle found for year ${year}`);
    return [];
  }

  if (events.length < 6) {
    console.error(
      `🔍 DEBUG: Invalid puzzle for year ${year}: expected at least 6 events, got ${events.length}`,
    );
    return [];
  }

  // If exactly 6 events, return all
  if (events.length === 6) {
    logger.debug(`Loaded puzzle for year ${year} with ${events.length} events`);
    return [...events]; // Return copy to prevent mutations
  }

  // If more than 6 events, deterministically select 6
  logger.debug(
    `Year ${year} has ${events.length} events, selecting 6 deterministically`,
  );

  // Create deterministic selection based on current date and year
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD

  // Generate hash from date + year for consistent selection
  const seedString = `${dateString}-${year}`;
  const seed = Math.abs(
    [...seedString].reduce((a, b) => (a << 5) + a + b.charCodeAt(0), 5381),
  );

  // Select 6 unique indices deterministically
  const selectedIndices: number[] = [];
  let currentSeed = seed;

  while (selectedIndices.length < 6) {
    const index = currentSeed % events.length;
    if (!selectedIndices.includes(index)) {
      selectedIndices.push(index);
    }
    // Update seed for next iteration
    currentSeed = Math.abs((currentSeed * 1103515245 + 12345) % 2 ** 31);
  }

  // Sort indices to maintain consistent order
  selectedIndices.sort((a, b) => a - b);

  const selectedEvents = selectedIndices.map((i) => events[i]);
  logger.debug(
    `Selected events at indices [${selectedIndices.join(", ")}] for year ${year}`,
  );

  return selectedEvents;
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
  return [...SUPPORTED_YEARS]; // Return copy to prevent mutations
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

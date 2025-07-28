// Static Puzzle Database for Chrondle
// TEMPORARY: This file needs to be updated to use Convex data
// TODO: Complete migration to Convex-based puzzle data

import { logger } from "./logger";
import type { Puzzle } from "./gameState";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

// Re-export Puzzle type for convenience
export type { Puzzle } from "./gameState";

// Singleton Convex client with lazy initialization
let convexClient: ConvexHttpClient | null = null;

/**
 * Get or create the Convex client instance
 * @returns ConvexHttpClient instance
 * @throws Error if NEXT_PUBLIC_CONVEX_URL is not configured
 */
function getConvexClient(): ConvexHttpClient {
  if (!convexClient) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      const errorMsg = "NEXT_PUBLIC_CONVEX_URL environment variable is not set";
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      convexClient = new ConvexHttpClient(convexUrl);
      logger.debug("Convex client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Convex client", error);
      throw error;
    }
  }

  return convexClient;
}

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

// --- TEMPORARY EMPTY DATA ---
// This is a temporary stub to make the code compile after deleting puzzles.json
// The next task will properly implement Convex-based data fetching

export const puzzleData: PuzzleDatabase = {
  meta: {
    version: "2.0.0",
    total_puzzles: 0,
    date_range: "migrating to Convex",
  },
  puzzles: {},
};

// Cache for total puzzles count
let cachedTotalPuzzles: number | null = null;
let totalPuzzlesFetchPromise: Promise<number> | null = null;

/**
 * Get the total number of puzzles from Convex
 * This function caches the result for performance
 * @returns Total number of puzzles, or 0 if Convex is unavailable
 */
async function fetchTotalPuzzles(): Promise<number> {
  // Return cached value if available
  if (cachedTotalPuzzles !== null) {
    return cachedTotalPuzzles;
  }

  // If already fetching, wait for that promise
  if (totalPuzzlesFetchPromise) {
    return totalPuzzlesFetchPromise;
  }

  // Start new fetch
  totalPuzzlesFetchPromise = (async () => {
    try {
      const result = await getConvexClient().query(api.puzzles.getTotalPuzzles);
      cachedTotalPuzzles = result.count;
      return result.count;
    } catch (error) {
      logger.error("Failed to fetch total puzzles from Convex", error);
      // Return 0 to prevent crashes, but log the error
      return 0;
    } finally {
      totalPuzzlesFetchPromise = null;
    }
  })();

  return totalPuzzlesFetchPromise;
}

// Total number of puzzles - NOW DYNAMIC!
// For synchronous access (legacy compatibility), default to 0
// Components should use fetchTotalPuzzles() for accurate count
export const TOTAL_PUZZLES = 0; // This will be replaced by server-side fetching

// --- CORE FUNCTIONS ---

/**
 * Get puzzle events for a specific year
 * @param year - The year to get events for
 * @returns Array of events, or empty array if year not found
 */
export function getPuzzleForYear(year: number): string[] {
  // TODO: Fetch from Convex
  console.warn(`🚧 getPuzzleForYear(${year}) - Convex migration in progress`);
  return [];
}

/**
 * Get all available puzzle years in descending order
 * @returns Array of years that have puzzles, sorted newest to oldest
 */
export function getPuzzleYears(): number[] {
  // TODO: Fetch from Convex
  console.warn("🚧 getPuzzleYears() - Convex migration in progress");
  return [];
}

/**
 * Get puzzle data for a specific year
 * @param year - The year to get puzzle for
 * @returns Puzzle object with date, year, and events, or null if not found
 */
export function getPuzzleByYear(year: number): Puzzle | null {
  // TODO: Fetch from Convex
  console.warn(`🚧 getPuzzleByYear(${year}) - Convex migration in progress`);
  return null;
}

/**
 * Check if a year has a puzzle available
 * @param year - The year to check
 * @returns True if puzzle exists for this year
 */
export function hasPuzzleForYear(year: number): boolean {
  // TODO: Check in Convex
  console.warn(`🚧 hasPuzzleForYear(${year}) - Convex migration in progress`);
  return false;
}

/**
 * Get all supported years
 * @returns Sorted array of all years with puzzles
 */
export function getSupportedYears(): number[] {
  // TODO: Fetch from Convex
  console.warn("🚧 getSupportedYears() - Convex migration in progress");
  return [];
}

// --- NEW INDEX-BASED FUNCTIONS ---

/**
 * Get puzzle by index (0-based)
 * @param index - The puzzle index (0 to TOTAL_PUZZLES-1)
 * @returns Puzzle object or null if index is invalid
 */
export function getPuzzleByIndex(index: number): Puzzle | null {
  // TODO: Fetch from Convex
  console.warn(`🚧 getPuzzleByIndex(${index}) - Convex migration in progress`);
  return null;
}

/**
 * Get puzzle index from year
 * @param year - The year to look up
 * @returns 0-based index or -1 if year not found
 */
export function getIndexFromYear(year: number): number {
  // TODO: Implement with Convex data
  console.warn(`🚧 getIndexFromYear(${year}) - Convex migration in progress`);
  return -1;
}

/**
 * Get year from puzzle index
 * @param index - The puzzle index (0-based)
 * @returns Year or null if index is invalid
 */
export function getYearFromIndex(index: number): number | null {
  // TODO: Implement with Convex data
  console.warn(`🚧 getYearFromIndex(${index}) - Convex migration in progress`);
  return null;
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
  // TODO: Validate Convex data instead
  logger.warn("🚧 validatePuzzleData() - Convex migration in progress");
  return true; // Assume valid during migration
}

// Export the dynamic puzzle count fetcher
export { fetchTotalPuzzles };

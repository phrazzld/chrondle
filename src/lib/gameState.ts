// Game State Management for Chrondle
// Static puzzle database with pre-curated historical events

import { getPuzzleForYear } from "./puzzleData";
import { logger } from "./logger";
import { Id } from "convex/_generated/dataModel";
// Storage imports removed - using in-memory state only
// Authenticated users should use Convex for persistence

export interface Puzzle {
  year: number;
  events: string[];
  puzzleId: Id<"puzzles"> | string; // Convex ID for new system, string for legacy compatibility
  puzzleNumber?: number; // The sequential puzzle number from Convex
}

export interface GameState {
  puzzle: Puzzle | null;
  guesses: number[];
  maxGuesses: number;
  isGameOver: boolean;
}

export interface Progress {
  guesses: number[];
  isGameOver: boolean;
  puzzleId: Id<"puzzles"> | string | null; // Convex ID for new system, string for legacy compatibility
  puzzleYear: number | null;
  timestamp: string;
  // Closest guess tracking for enhanced sharing
  closestGuess?: number;
  closestDistance?: number;
}

export interface GameSettings {
  darkMode: boolean;
  colorBlindMode: boolean;
}

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    puzzle: null,
    guesses: [],
    maxGuesses: 6,
    isGameOver: false,
  };
}

// Deterministic daily year selection from pre-curated puzzle database
export function getDailyYear(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debugYear?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isDebugMode?: boolean,
): number {
  // This function is deprecated - daily puzzles are now handled by Convex
  logger.warn(
    "🚧 getDailyYear() is deprecated - use Convex getDailyPuzzle instead",
  );

  // Return placeholder year for backward compatibility
  // This should not be used in production
  return 2000;
}

// Initialize daily puzzle from static database
// DEPRECATED: Use Convex-based puzzle loading instead (useChrondle hook)
export function initializePuzzle(
  debugYear?: string,
  isDebugMode?: boolean,
): Puzzle {
  // Get the daily year (with debug support)
  const targetYear = getDailyYear(debugYear, isDebugMode);

  // Load events from static database
  const events = getPuzzleForYear(targetYear);

  if (events.length === 0) {
    // This should never happen with a properly curated database
    throw new Error(
      `No puzzle found for year ${targetYear}. This indicates a bug in the puzzle database or daily selection logic.`,
    );
  }

  logger.debug(
    `🔍 DEBUG: Loaded ${events.length} events for year ${targetYear} from static database`,
  );

  // Generate simple puzzle ID for today (just the date)
  // NOTE: This creates a date-string ID that is NOT compatible with Convex system
  // Convex system uses proper document IDs (Id<"puzzles">)
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD

  // Create puzzle object
  const puzzle: Puzzle = {
    year: targetYear,
    events: events, // Events are already in the correct order in the database!
    puzzleId: dateString, // Legacy date-string ID for backward compatibility
  };

  logger.debug(`🔍 DEBUG: Puzzle initialized successfully:`, puzzle);
  return puzzle;
}

// Local Storage Management
export function getStorageKey(): string {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const storageKey = `chrondle-progress-${dateString}`;
  logger.debug(`Storage key generated: ${storageKey}`);
  return storageKey;
}

export function saveProgress(
  gameState: GameState,
  isDebugMode?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _archiveYear?: number,
): boolean {
  if (isDebugMode) {
    logger.debug("Debug mode: skipping localStorage save");
    return true;
  }

  // Calculate closest guess for persistence
  let closestGuess: number | undefined;
  let closestDistance: number | undefined;

  if (gameState.guesses.length > 0 && gameState.puzzle) {
    try {
      let bestDistance = Infinity;
      let bestGuess = gameState.guesses[0];

      for (const guess of gameState.guesses) {
        const distance = Math.abs(guess - gameState.puzzle.year);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestGuess = guess;
        }
      }

      closestGuess = bestGuess;
      closestDistance = bestDistance;
    } catch (error) {
      console.warn("Failed to calculate closest guess for save:", error);
    }
  }

  const progress: Progress = {
    guesses: gameState.guesses,
    isGameOver: gameState.isGameOver,
    puzzleId: gameState.puzzle ? gameState.puzzle.puzzleId : null,
    puzzleYear: gameState.puzzle ? gameState.puzzle.year : null,
    timestamp: new Date().toISOString(),
    closestGuess,
    closestDistance,
  };

  logger.debug(`Saving progress:`, progress);

  // No localStorage persistence - authenticated users use Convex
  logger.debug("Progress save skipped - no localStorage persistence");

  return false;
}

export function loadProgress(
  gameState: GameState,
  isDebugMode?: boolean,
): void {
  if (isDebugMode) {
    logger.debug("Debug mode: skipping localStorage load");
    return;
  }

  if (typeof window === "undefined") return;

  // No localStorage persistence - authenticated users use Convex
  logger.debug("Progress load skipped - no localStorage persistence");

  // Always start with fresh state for anonymous users
  gameState.guesses = [];
  gameState.isGameOver = false;
}

// Settings Management
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function saveSettings(_settings: GameSettings): void {
  // No localStorage persistence - settings should be stored in Convex for authenticated users
  logger.debug("Settings save skipped - no localStorage persistence");
}

export function loadSettings(): GameSettings | null {
  // No localStorage persistence - settings should be loaded from Convex for authenticated users
  logger.debug("Settings load skipped - no localStorage persistence");
  return null;
}

// Storage cleanup
export function cleanupOldStorage(): void {
  // No localStorage to clean up
  logger.debug("Storage cleanup skipped - no localStorage persistence");
}

// Mark first time player
export function markFirstTimePlayer(): void {
  // No localStorage tracking - use Convex for user state
  logger.debug("First time player tracking skipped - use Convex");
}

// Check if player has played before
export function hasPlayedBefore(): boolean {
  // No localStorage tracking - use Convex for user state
  logger.debug("Player history check skipped - use Convex");
  return false;
}

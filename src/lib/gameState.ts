// Game State Management for Chrondle
// Static puzzle database with pre-curated historical events

import { getPuzzleForYear } from "./puzzleData";
import { logger } from "./logger";
import {
  saveGameProgress,
  loadGameProgress,
  saveSettings as saveSettingsUtil,
  loadSettings as loadSettingsUtil,
  safeRemoveItem,
  cleanupOldStorage as cleanupOldStorageUtil,
  clearAllChrondleStorage,
  getAllChronldeEntries,
  markPlayerAsPlayed,
  hasPlayerPlayedBefore,
} from "./storage";

export interface Puzzle {
  year: number;
  events: string[];
  puzzleId: string;
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
  puzzleId: string | null;
  puzzleYear: number | null;
  timestamp: string;
  // Closest guess tracking for enhanced sharing
  closestGuess?: number;
  closestDistance?: number;
}

export interface Settings {
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
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD

  // Create puzzle object
  const puzzle: Puzzle = {
    year: targetYear,
    events: events, // Events are already in the correct order in the database!
    puzzleId: dateString,
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
  archiveYear?: number,
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

  if (typeof window !== "undefined") {
    return saveGameProgress(progress, isDebugMode, archiveYear);
  }

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

  const progress = loadGameProgress<Progress>(isDebugMode);

  if (progress) {
    logger.debug(`Parsed progress:`, progress);

    // Validate that the saved progress matches the current puzzle
    const currentPuzzleId = gameState.puzzle ? gameState.puzzle.puzzleId : null;
    const currentPuzzleYear = gameState.puzzle ? gameState.puzzle.year : null;

    logger.debug(
      `Current puzzle - ID: ${currentPuzzleId}, Year: ${currentPuzzleYear}`,
    );
    logger.debug(
      `Saved puzzle - ID: ${progress.puzzleId}, Year: ${progress.puzzleYear}`,
    );

    // Check if this progress belongs to the current puzzle
    const isValidProgress =
      progress.puzzleId === currentPuzzleId &&
      progress.puzzleYear === currentPuzzleYear;

    if (isValidProgress) {
      logger.debug(`Progress is valid for current puzzle`);
      gameState.guesses = progress.guesses || [];
      gameState.isGameOver = progress.isGameOver || false;
      logger.debug(
        `Loaded ${gameState.guesses.length} guesses, game over: ${gameState.isGameOver}`,
      );
    } else {
      logger.debug(
        `Progress is invalid for current puzzle - clearing old progress`,
      );
      // Clear the invalid progress
      safeRemoveItem(getStorageKey());
      // Reset game state to fresh start
      gameState.guesses = [];
      gameState.isGameOver = false;
    }
  } else {
    logger.debug(`No saved progress found for today`);
  }
}

// Settings Management
export function saveSettings(settings: Settings): void {
  if (typeof window !== "undefined") {
    saveSettingsUtil(settings);
  }
}

export function loadSettings(): Settings | null {
  if (typeof window === "undefined") return null;

  return loadSettingsUtil<Settings>();
}

// Storage cleanup
export function cleanupOldStorage(): void {
  if (typeof window === "undefined") return;

  cleanupOldStorageUtil();
}

// Debug utilities (for window.chrondle object)
export function createDebugUtilities(gameState: GameState) {
  return {
    reset: () => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    },
    state: () => logger.info("Game state:", gameState),
    clearStorage: () => {
      if (typeof window === "undefined") return [];

      return clearAllChrondleStorage();
    },
    setYear: (year: number) => {
      if (gameState.puzzle) {
        gameState.puzzle.year = year;
        logger.info(`Forced year to ${year}`);
      }
    },
    testYear: (year: number) => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("debug", "true");
        url.searchParams.set("year", year.toString());
        window.location.href = url.toString();
      }
    },
    debug: () => {
      logger.info("🔍 Current date:", new Date().toISOString());
      logger.info("🔍 Storage key:", getStorageKey());
      logger.info("🔍 Game state:", gameState);

      if (typeof window !== "undefined") {
        const allChrondles = getAllChronldeEntries();
        logger.info("🔍 All chrondle localStorage:", allChrondles);
      }
    },
  };
}

// Mark first time player
export function markFirstTimePlayer(): void {
  if (typeof window !== "undefined") {
    markPlayerAsPlayed();
  }
}

// Check if player has played before
export function hasPlayedBefore(): boolean {
  if (typeof window === "undefined") return false;
  return hasPlayerPlayedBefore();
}

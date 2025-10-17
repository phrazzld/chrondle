import { GameState, Puzzle } from "@/types/gameState";
import { GAME_CONFIG } from "@/lib/constants";

/**
 * Data sources from the orthogonal hooks
 */
export interface DataSources {
  puzzle: {
    puzzle: Puzzle | null;
    isLoading: boolean;
    error: Error | null;
  };
  auth: {
    userId: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  progress: {
    progress: {
      guesses: number[];
      completedAt: number | null;
    } | null;
    isLoading: boolean;
  };
  session: {
    sessionGuesses: number[];
    addGuess: (n: number) => void;
    clearGuesses: () => void;
  };
}

/**
 * Merges server guesses with session guesses
 * Server guesses take precedence as they are the source of truth
 * Session guesses are appended but duplicates are removed
 * Total is capped at MAX_GUESSES (6)
 *
 * Performance: O(n+m) linear complexity using Set for deduplication
 * Previously O(n*m) due to .includes() in loop - now optimized for future archive mode
 *
 * @param serverGuesses - Guesses from the server (persisted)
 * @param sessionGuesses - Guesses from the current session (not yet persisted)
 * @returns Merged array of guesses, capped at MAX_GUESSES
 */
export function mergeGuesses(serverGuesses: number[], sessionGuesses: number[]): number[] {
  // Return empty array if both inputs are empty
  if (serverGuesses.length === 0 && sessionGuesses.length === 0) {
    return [];
  }

  // Start with server guesses (source of truth)
  const merged = [...serverGuesses];

  // Use Set for O(1) duplicate checking instead of O(n) .includes()
  const serverSet = new Set(serverGuesses);

  // Add session guesses that aren't duplicates
  for (const guess of sessionGuesses) {
    if (!serverSet.has(guess)) {
      merged.push(guess);
      serverSet.add(guess); // Track added guesses to avoid duplicates within session
    }
  }

  // Cap at MAX_GUESSES
  return merged.slice(0, GAME_CONFIG.MAX_GUESSES);
}

/**
 * Pure function to derive game state from orthogonal data sources
 * Handles loading priorities and merges data to produce a consistent game state
 *
 * Loading priority:
 * 1. Puzzle must load first
 * 2. Then authentication state
 * 3. Then user progress (only if authenticated)
 *
 * @param sources - All data sources from the orthogonal hooks
 * @returns Discriminated union representing the current game state
 * @throws Error if derivation fails due to invalid data
 */
export function deriveGameState(sources: DataSources): GameState {
  try {
    const { puzzle, auth, progress, session } = sources;

    // Priority 1: Check if puzzle is loading
    if (puzzle.isLoading) {
      return { status: "loading-puzzle" };
    }

    // Handle puzzle error
    if (puzzle.error) {
      return {
        status: "error",
        error: puzzle.error.message || "Failed to load puzzle",
      };
    }

    // Handle missing puzzle
    if (!puzzle.puzzle) {
      return {
        status: "error",
        error: "No puzzle available",
      };
    }

    // Priority 2: Check if auth is loading
    if (auth.isLoading) {
      return { status: "loading-auth" };
    }

    // Priority 3: Check if progress is loading (only matters if authenticated)
    if (auth.isAuthenticated && progress.isLoading) {
      return { status: "loading-progress" };
    }

    // At this point, all necessary data is loaded
    // Now derive the ready state

    // Get server guesses from progress (if user is authenticated and has progress)
    const serverGuesses =
      auth.isAuthenticated && progress.progress ? progress.progress.guesses : [];

    // Get session guesses
    const sessionGuesses = session.sessionGuesses;

    // Merge guesses (server first, then session without duplicates)
    const allGuesses = mergeGuesses(serverGuesses, sessionGuesses);

    // Calculate completion status
    // Complete if:
    // 1. Server has completedAt timestamp OR
    // 2. Last guess equals target year OR
    // 3. Used all guesses
    const hasServerCompletion =
      auth.isAuthenticated &&
      progress.progress?.completedAt !== null &&
      progress.progress?.completedAt !== undefined;

    const lastGuess = allGuesses[allGuesses.length - 1];
    const guessedCorrectly = lastGuess === puzzle.puzzle.targetYear;
    const usedAllGuesses = allGuesses.length >= GAME_CONFIG.MAX_GUESSES;

    const isComplete = hasServerCompletion || guessedCorrectly || usedAllGuesses;

    // Calculate win status
    // Won if: completed AND last guess matches target year
    const hasWon = isComplete && guessedCorrectly;

    // Calculate remaining guesses
    const remainingGuesses = Math.max(0, GAME_CONFIG.MAX_GUESSES - allGuesses.length);

    // Return ready state with all derived values
    return {
      status: "ready",
      puzzle: puzzle.puzzle,
      guesses: allGuesses,
      isComplete,
      hasWon,
      remainingGuesses,
    };
  } catch (error) {
    // Log the error for debugging
    console.error("Error deriving game state:", error);

    // Return error state with helpful message
    return {
      status: "error",
      error:
        error instanceof Error
          ? `State derivation failed: ${error.message}`
          : "Failed to calculate game state",
    };
  }
}

/**
 * Discriminated union type for all possible game states
 * Each state represents a specific phase in the data loading and game lifecycle
 */

/**
 * Puzzle data structure (aligned with usePuzzleData hook)
 */
export interface Puzzle {
  id: string;
  targetYear: number;
  events: string[];
  puzzleNumber: number;
}

/**
 * Game is loading the puzzle data
 * Occurs when: Application starts or puzzle number changes
 */
export interface LoadingPuzzleState {
  status: "loading-puzzle";
}

/**
 * Game is loading authentication state
 * Occurs when: Puzzle loaded but auth state not yet determined
 */
export interface LoadingAuthState {
  status: "loading-auth";
}

/**
 * Game is loading user progress data
 * Occurs when: Puzzle and auth loaded, fetching user's play history
 */
export interface LoadingProgressState {
  status: "loading-progress";
}

/**
 * Game is ready to play with all data loaded
 * Occurs when: All data sources have resolved successfully
 */
export interface ReadyState {
  status: "ready";
  puzzle: Puzzle;
  guesses: number[];
  isComplete: boolean;
  hasWon: boolean;
  remainingGuesses: number;
}

/**
 * An error occurred during data loading
 * Occurs when: Any data source fails to load
 */
export interface ErrorState {
  status: "error";
  error: string;
}

/**
 * Discriminated union of all possible game states
 * Use the status field to determine which state is active
 */
export type GameState =
  | LoadingPuzzleState
  | LoadingAuthState
  | LoadingProgressState
  | ReadyState
  | ErrorState;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if game state is loading puzzle
 */
export function isLoadingPuzzle(state: GameState): state is LoadingPuzzleState {
  return state.status === "loading-puzzle";
}

/**
 * Type guard to check if game state is loading auth
 */
export function isLoadingAuth(state: GameState): state is LoadingAuthState {
  return state.status === "loading-auth";
}

/**
 * Type guard to check if game state is loading progress
 */
export function isLoadingProgress(
  state: GameState,
): state is LoadingProgressState {
  return state.status === "loading-progress";
}

/**
 * Type guard to check if game is ready to play
 * @example
 * const gameState = deriveGameState(data);
 * if (isReady(gameState)) {
 *   console.log(`Playing puzzle #${gameState.puzzle.puzzleNumber}`);
 *   console.log(`Guesses: ${gameState.guesses.length}/${6}`);
 * }
 */
export function isReady(state: GameState): state is ReadyState {
  return state.status === "ready";
}

/**
 * Type guard to check if an error occurred
 */
export function isError(state: GameState): state is ErrorState {
  return state.status === "error";
}

/**
 * Type guard to check if game is in any loading state
 */
export function isLoading(state: GameState): boolean {
  return (
    state.status === "loading-puzzle" ||
    state.status === "loading-auth" ||
    state.status === "loading-progress"
  );
}

/**
 * Helper to get a user-friendly loading message
 */
export function getLoadingMessage(state: GameState): string | null {
  switch (state.status) {
    case "loading-puzzle":
      return "Loading puzzle...";
    case "loading-auth":
      return "Checking authentication...";
    case "loading-progress":
      return "Loading your progress...";
    default:
      return null;
  }
}

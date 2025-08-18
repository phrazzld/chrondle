/**
 * Game-related type definitions
 */

/**
 * Closest guess tracking interface
 * Used for displaying the user's closest guess in the UI
 */
export interface ClosestGuessData {
  guess: number;
  distance: number;
  guessIndex: number; // Which attempt (0-based)
}

"use client";

import { useState, useCallback, useMemo } from "react";
import { api } from "../../../convex/_generated/api";
import { DataSources } from "@/lib/deriveGameState";
import { GAME_CONFIG } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { assertConvexId, isConvexIdValidationError } from "@/lib/validation";
import { useMutationWithRetry } from "@/hooks/useMutationWithRetry";
import { logger } from "@/lib/logger";

/**
 * Return type for the useGameActions hook
 */
export interface UseGameActionsReturn {
  submitGuess: (guess: number) => Promise<boolean>;
  resetGame: () => void;
  isSubmitting: boolean;
}

/**
 * Hook for all game mutations with optimistic updates
 *
 * This hook provides actions for submitting guesses and resetting the game.
 * It implements optimistic updates for instant feedback and handles errors gracefully.
 *
 * @param sources - Data sources from the orthogonal hooks
 * @returns Object containing game action functions and submission state
 *
 * @example
 * const { submitGuess, resetGame, isSubmitting } = useGameActions(sources);
 *
 * // Submit a guess with optimistic update
 * const success = await submitGuess(1969);
 * if (success) {
 *   logger.debug("Guess submitted successfully");
 * }
 *
 * // Reset the game (clears session only)
 * resetGame();
 */
export function useGameActions(sources: DataSources): UseGameActionsReturn {
  const { puzzle, auth, session } = sources;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastContext = useToast();

  // Convex mutation for submitting guesses with retry logic
  const submitGuessMutation = useMutationWithRetry(api.puzzles.submitGuess, {
    maxRetries: 3,
    baseDelayMs: 1000,
    onRetry: (attempt, error) => {
      logger.error(`[useGameActions] Retrying submitGuess (attempt ${attempt}/3):`, error.message);
      // Optionally show a toast to the user about the retry
      if (attempt === 3 && "addToast" in toastContext) {
        toastContext.addToast({
          title: "Connection issues",
          description: "Having trouble connecting to the server. Retrying...",
          variant: "default",
        });
      }
    },
  });

  /**
   * Submit a guess with optimistic updates
   * Adds to session immediately for instant feedback
   * Persists to server if authenticated
   */
  const submitGuess = useCallback(
    async (guess: number): Promise<boolean> => {
      // Validate inputs
      if (!puzzle.puzzle) {
        if ("addToast" in toastContext) {
          toastContext.addToast({
            title: "Error",
            description: "No puzzle loaded",
            variant: "destructive",
          });
        }
        return false;
      }

      // Validate guess is a valid year
      const currentYear = new Date().getFullYear();
      if (guess < -9999 || guess > currentYear) {
        if ("addToast" in toastContext) {
          toastContext.addToast({
            title: "Invalid Year",
            description: `Please enter a year between -9999 and ${currentYear}`,
            variant: "destructive",
          });
        }
        return false;
      }

      // Check if already at max guesses
      const totalGuesses = session.sessionGuesses.length;
      if (totalGuesses >= GAME_CONFIG.MAX_GUESSES) {
        if ("addToast" in toastContext) {
          toastContext.addToast({
            title: "No Guesses Remaining",
            description: "You've used all 6 guesses for this puzzle",
            variant: "destructive",
          });
        }
        return false;
      }

      // Prevent double-submission
      if (isSubmitting) {
        return false;
      }

      // Optimistic update - add to session immediately for instant feedback
      session.addGuess(guess);

      // If authenticated, persist to server
      if (auth.isAuthenticated && auth.userId) {
        setIsSubmitting(true);

        try {
          // Validate and assert IDs with proper error handling
          const validPuzzleId = assertConvexId(puzzle.puzzle.id, "puzzles");
          const validUserId = assertConvexId(auth.userId, "users");

          await submitGuessMutation({
            puzzleId: validPuzzleId,
            userId: validUserId,
            guess,
          });

          // Success - guess is already in session from optimistic update
          return true;
        } catch (error) {
          // Check if it's a validation error
          if (isConvexIdValidationError(error)) {
            logger.error("Invalid ID format detected:", error.id, "for type:", error.type);

            if ("addToast" in toastContext) {
              toastContext.addToast({
                title: "Authentication Error",
                description: "There was an issue with your user session. Please refresh the page.",
                variant: "destructive",
              });
            }

            // Still return true to keep the guess in session
            return true;
          }

          // Other errors - keep the guess in session for eventual consistency
          // The guess stays in the session, allowing the user to see it
          // and it will be merged properly when the page refreshes
          logger.error("Failed to persist guess to server:", error);

          if ("addToast" in toastContext) {
            toastContext.addToast({
              title: "Connection Issue",
              description: "Your guess was saved locally but couldn't sync to the server",
              variant: "destructive",
            });
          }

          // Return true because the guess was added to session successfully
          // This maintains eventual consistency - the guess will sync later
          return true;
        } finally {
          setIsSubmitting(false);
        }
      }

      // Not authenticated - guess only saved in session
      return true;
    },
    [
      puzzle.puzzle,
      auth.isAuthenticated,
      auth.userId,
      session,
      isSubmitting,
      submitGuessMutation,
      toastContext,
    ],
  );

  /**
   * Reset the game by clearing session state only
   * Server state is preserved as historical record
   */
  const resetGame = useCallback(() => {
    // Clear session guesses only
    // Server state (if any) is preserved as historical record
    session.clearGuesses();

    // No need to reload puzzle or refetch data
    // The game state will automatically update through derivation
  }, [session]);

  // Memoize the return value to prevent object recreation on every render
  return useMemo(
    () => ({
      submitGuess,
      resetGame,
      isSubmitting,
    }),
    [submitGuess, resetGame, isSubmitting],
  );
}

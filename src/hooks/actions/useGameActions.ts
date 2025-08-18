"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { DataSources } from "@/lib/deriveGameState";
import { GAME_CONFIG } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

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
 *   console.log("Guess submitted successfully");
 * }
 *
 * // Reset the game (clears session only)
 * resetGame();
 */
export function useGameActions(sources: DataSources): UseGameActionsReturn {
  const { puzzle, auth, session } = sources;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastContext = useToast();

  // Convex mutation for submitting guesses
  const submitGuessMutation = useMutation(api.puzzles.submitGuess);

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
          await submitGuessMutation({
            puzzleId: puzzle.puzzle.id as Id<"puzzles">,
            userId: auth.userId as Id<"users">,
            guess,
          });

          // Success - guess is already in session from optimistic update
          return true;
        } catch (error) {
          // Error - keep the guess in session for eventual consistency
          // The guess stays in the session, allowing the user to see it
          // and it will be merged properly when the page refreshes
          console.error("Failed to persist guess to server:", error);

          if ("addToast" in toastContext) {
            toastContext.addToast({
              title: "Connection Issue",
              description:
                "Your guess was saved locally but couldn't sync to the server",
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

  return {
    submitGuess,
    resetGame,
    isSubmitting,
  };
}

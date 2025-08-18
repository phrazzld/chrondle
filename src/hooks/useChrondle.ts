"use client";

import { useMemo, useEffect, useRef } from "react";
import { usePuzzleData } from "@/hooks/data/usePuzzleData";
import { useAuthState } from "@/hooks/data/useAuthState";
import { useUserProgress } from "@/hooks/data/useUserProgress";
import { useLocalSession } from "@/hooks/data/useLocalSession";
import {
  useGameActions,
  UseGameActionsReturn,
} from "@/hooks/actions/useGameActions";
import { deriveGameState, DataSources } from "@/lib/deriveGameState";
import { GameState, isReady } from "@/types/gameState";
import { useAnalytics, usePerformanceTracking } from "@/hooks/useAnalytics";

/**
 * Return type for the useChrondle hook
 */
export interface UseChronldeReturn extends UseGameActionsReturn {
  gameState: GameState;
}

/**
 * Main composition hook for the Chrondle game
 *
 * This hook orchestrates all data sources and derives the game state
 * using pure functional derivation. It solves the race condition problem
 * by treating state as a projection of orthogonal data sources rather
 * than something to initialize imperatively.
 *
 * @param puzzleNumber - Optional puzzle number for archive puzzles
 * @returns Combined game state and action handlers
 *
 * @example
 * // For daily puzzle
 * const { gameState, submitGuess, resetGame, isSubmitting } = useChrondle();
 *
 * if (isReady(gameState)) {
 *   console.log(`Playing puzzle #${gameState.puzzle.puzzleNumber}`);
 *   console.log(`Guesses: ${gameState.guesses.length}/${gameState.remainingGuesses + gameState.guesses.length}`);
 * }
 *
 * @example
 * // For archive puzzle
 * const { gameState, submitGuess } = useChrondle(42);
 */
export function useChrondle(puzzleNumber?: number): UseChronldeReturn {
  // Compose all orthogonal data sources
  // Hooks must be called unconditionally due to React rules
  const puzzle = usePuzzleData(puzzleNumber);
  const auth = useAuthState();
  const progress = useUserProgress(auth.userId, puzzle.puzzle?.id || null);
  const session = useLocalSession(puzzle.puzzle?.id || null);

  // Create data sources object for derivation and actions
  const dataSources: DataSources = useMemo(
    () => ({
      puzzle,
      auth,
      progress,
      session,
    }),
    [puzzle, auth, progress, session],
  );

  // Performance tracking for state derivation
  const { measureDerivation } = usePerformanceTracking();

  // Derive game state from data sources using pure function with performance tracking
  // The deriveGameState function has error handling built in
  const gameState = useMemo(
    () => measureDerivation(() => deriveGameState(dataSources)),
    [dataSources, measureDerivation],
  );

  // Get game actions (submitGuess, resetGame, isSubmitting)
  const actions = useGameActions(dataSources);

  // Analytics tracking for state transitions and divergence detection
  useAnalytics({
    gameState,
    userId: auth.userId,
    puzzleNumber: puzzle.puzzle?.puzzleNumber,
    sessionGuesses: session.sessionGuesses,
    serverGuesses: progress.progress?.guesses || [],
    enabled:
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true",
  });

  // Development-only state transition logging
  useStateTransitionLogger(gameState);

  // Return combined state and actions with perfect memoization
  return useMemo(
    () => ({
      gameState,
      ...actions,
    }),
    [gameState, actions],
  );
}

/**
 * Development-only hook for logging state transitions
 * Helps debug state changes and race conditions
 */
function useStateTransitionLogger(gameState: GameState): void {
  const prevStateRef = useRef<GameState | null>(null);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    const prevState = prevStateRef.current;
    const timestamp = new Date().toLocaleTimeString();

    // Skip first render
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      // Development-only state transition logging
      // eslint-disable-next-line no-console
      console.groupCollapsed(`[${timestamp}] useChrondle: Initial state`);
      // eslint-disable-next-line no-console
      console.log("Status:", gameState.status);
      if (isReady(gameState)) {
        // eslint-disable-next-line no-console
        console.log("Puzzle:", gameState.puzzle.puzzleNumber);
        // eslint-disable-next-line no-console
        console.log("Guesses:", gameState.guesses);
        // eslint-disable-next-line no-console
        console.log("Complete:", gameState.isComplete);
        // eslint-disable-next-line no-console
        console.log("Won:", gameState.hasWon);
      }
      // eslint-disable-next-line no-console
      console.groupEnd();
      prevStateRef.current = gameState;
      return;
    }

    // Log status changes
    if (!prevState || prevState.status !== gameState.status) {
      // eslint-disable-next-line no-console
      console.groupCollapsed(`[${timestamp}] useChrondle: Status change`);
      // eslint-disable-next-line no-console
      console.log("Previous:", prevState?.status || "none");
      // eslint-disable-next-line no-console
      console.log("Current:", gameState.status);
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    // Log guess changes (only in ready state)
    if (isReady(gameState) && prevState && isReady(prevState)) {
      const prevGuesses = prevState.guesses;
      const currGuesses = gameState.guesses;

      if (JSON.stringify(prevGuesses) !== JSON.stringify(currGuesses)) {
        // eslint-disable-next-line no-console
        console.groupCollapsed(`[${timestamp}] useChrondle: Guesses changed`);
        // eslint-disable-next-line no-console
        console.log("Previous:", prevGuesses);
        // eslint-disable-next-line no-console
        console.log("Current:", currGuesses);
        // eslint-disable-next-line no-console
        console.log("Remaining:", gameState.remainingGuesses);
        // eslint-disable-next-line no-console
        console.groupEnd();
      }

      // Log completion state changes
      if (prevState.isComplete !== gameState.isComplete) {
        // eslint-disable-next-line no-console
        console.groupCollapsed(
          `[${timestamp}] useChrondle: Completion changed`,
        );
        // eslint-disable-next-line no-console
        console.log("Is Complete:", gameState.isComplete);
        // eslint-disable-next-line no-console
        console.log("Has Won:", gameState.hasWon);
        // eslint-disable-next-line no-console
        console.log("Final Guesses:", gameState.guesses);
        // eslint-disable-next-line no-console
        console.groupEnd();
      }
    }

    // Update ref for next comparison
    prevStateRef.current = gameState;
  }, [gameState]);
}

"use client";

import { useMemo, useEffect, useRef, useDeferredValue } from "react";
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
import { isValidConvexId } from "@/lib/validation";
import { useDebouncedValues } from "@/hooks/useDebouncedValue";
import { useAnonymousGameState } from "@/hooks/useAnonymousGameState";

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
 * @param initialPuzzle - Optional initial puzzle data (for SSR/preloading)
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
 *
 * @example
 * // With preloaded puzzle data from server
 * const { gameState, submitGuess } = useChrondle(undefined, serverPuzzle);
 */
export function useChrondle(
  puzzleNumber?: number,
  initialPuzzle?: unknown,
): UseChronldeReturn {
  // Compose all orthogonal data sources
  // Hooks must be called unconditionally due to React rules
  const puzzle = usePuzzleData(puzzleNumber, initialPuzzle);
  const auth = useAuthState();

  // Defensive validation: Only pass userId if it's a valid Convex ID format
  // This prevents any potential race conditions where an invalid ID might be passed
  const validatedUserId = useMemo(() => {
    if (!auth.userId) {
      return null;
    }

    // Validate the ID format before passing it to useUserProgress
    if (!isValidConvexId(auth.userId)) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "[useChrondle] Invalid user ID format detected - skipping progress query:",
          {
            userId: auth.userId,
            isAuthenticated: auth.isAuthenticated,
            isLoading: auth.isLoading,
          },
        );
      }
      return null; // Don't attempt to query with invalid ID
    }

    return auth.userId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.userId]); // Only auth.userId is used in the memo function

  // Memoize the parameters object to prevent recreation on every render
  // This is critical - without memoization, the object reference changes on every render
  // causing useDebouncedValues to think the values have changed even when they haven't
  const progressParams = useMemo(
    () => ({
      userId: validatedUserId,
      puzzleId: puzzle.puzzle?.id || null,
    }),
    [validatedUserId, puzzle.puzzle?.id],
  );

  // Debounce the useUserProgress parameters to prevent rapid-fire queries during auth transitions
  // This prevents queries from firing when userId or puzzleId change rapidly
  const debouncedProgressParams = useDebouncedValues(
    progressParams,
    100, // 100ms delay to group rapid parameter changes
  );

  // Use debounced parameters for the progress query
  const progress = useUserProgress(
    debouncedProgressParams.userId,
    debouncedProgressParams.puzzleId,
  );
  const session = useLocalSession(puzzle.puzzle?.id || null);

  // Anonymous game state persistence
  const anonymousGameState = useAnonymousGameState();

  // Load anonymous state on mount if not authenticated
  useEffect(() => {
    // Only load if not authenticated and we have a puzzle
    if (!auth.isAuthenticated && !auth.isLoading && puzzle.puzzle) {
      const savedState = anonymousGameState.loadGameState();

      // If we have saved state for this puzzle, restore the guesses
      if (savedState && savedState.puzzleId === puzzle.puzzle.id) {
        // Add each saved guess to the session
        savedState.guesses.forEach((guess) => {
          // Check if guess not already in session to avoid duplicates
          if (!session.sessionGuesses.includes(guess)) {
            session.addGuess(guess);
          }
        });
      }
    }
    // Only run on mount and when auth/puzzle state stabilizes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.isLoading, puzzle.puzzle?.id]);

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

  // Save anonymous game state after changes
  useEffect(() => {
    // Only save if not authenticated and game is ready
    if (!auth.isAuthenticated && isReady(gameState)) {
      anonymousGameState.saveGameState({
        puzzleId: gameState.puzzle.id,
        guesses: gameState.guesses,
        isComplete: gameState.isComplete,
        hasWon: gameState.hasWon,
        timestamp: Date.now(),
      });
    }
  }, [auth.isAuthenticated, gameState, anonymousGameState]);

  // Get game actions (submitGuess, resetGame, isSubmitting)
  const actions = useGameActions(dataSources);

  // Defer non-critical updates for analytics and logging
  // These don't affect user interaction so can be batched by React
  const deferredGameState = useDeferredValue(gameState);
  const deferredSessionGuesses = useDeferredValue(session.sessionGuesses);
  const deferredServerGuesses = useDeferredValue(
    progress.progress?.guesses || [],
  );

  // Analytics tracking for state transitions and divergence detection
  // Uses deferred values to prevent blocking user interactions
  useAnalytics({
    gameState: deferredGameState,
    userId: auth.userId,
    puzzleNumber: puzzle.puzzle?.puzzleNumber,
    sessionGuesses: deferredSessionGuesses,
    serverGuesses: deferredServerGuesses,
    enabled:
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true",
  });

  // Development-only state transition logging
  // Uses deferred state to avoid blocking renders
  useStateTransitionLogger(deferredGameState);

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

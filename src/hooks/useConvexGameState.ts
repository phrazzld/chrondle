"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import {
  GameState,
  createInitialGameState,
  saveProgress,
  cleanupOldStorage,
} from "@/lib/gameState";
// Storage import removed - using Convex for persistence
import { GAME_CONFIG } from "@/lib/constants";

// Re-export interfaces from original hook
export interface ClosestGuessData {
  guess: number;
  distance: number;
  guessIndex: number;
}

export interface UseGameStateReturn {
  gameState: GameState;
  isLoading: boolean;
  error: string | null;
  makeGuess: (guess: number) => void;
  resetGame: () => void;
  remainingGuesses: number;
  isGameComplete: boolean;
  hasWon: boolean;
  currentEvent: string | null;
  currentHintIndex: number;
  nextHint: string | null;
  closestGuess: ClosestGuessData | null;
  isCurrentGuessClosest: boolean;
}

// Utility function to find the closest guess
function findClosestGuess(
  guesses: number[],
  targetYear: number,
): ClosestGuessData | null {
  if (
    !Array.isArray(guesses) ||
    guesses.length === 0 ||
    typeof targetYear !== "number"
  ) {
    return null;
  }

  try {
    let closestDistance = Infinity;
    let closestGuess = guesses[0];
    let closestIndex = 0;

    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i];
      if (typeof guess !== "number" || !isFinite(guess)) continue;

      const distance = Math.abs(guess - targetYear);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestGuess = guess;
        closestIndex = i;
      }
    }

    return {
      guess: closestGuess,
      distance: closestDistance,
      guessIndex: closestIndex,
    };
  } catch (error) {
    console.error("Closest guess calculation failed:", error);
    return null;
  }
}

/**
 * Hook to manage game state with Convex backend integration
 * @param debugMode - Enable debug mode for testing
 * @param archivePuzzleNumber - Optional puzzle number for archive mode (loads specific puzzle instead of daily)
 * @returns Game state and actions
 */
export function useConvexGameState(
  debugMode: boolean = false,
  archivePuzzleNumber?: number,
): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isSignedIn } = useUser();

  // Try to use Convex - these will be undefined if provider not available
  // Only fetch today's puzzle if not in archive mode
  const todaysPuzzle = useQuery(
    api.puzzles.getDailyPuzzle,
    archivePuzzleNumber ? "skip" : undefined,
  );

  // Fetch archive puzzle if in archive mode
  const archivePuzzle = useQuery(
    api.puzzles.getPuzzleByNumber,
    archivePuzzleNumber ? { puzzleNumber: archivePuzzleNumber } : "skip",
  );

  // Get current user for mutation calls
  const currentUser = useQuery(api.users.getCurrentUser);

  // Get the active puzzle (archive or daily)
  const activePuzzle = archivePuzzleNumber ? archivePuzzle : todaysPuzzle;

  // Get existing play data for the current puzzle and user
  const existingPlay = useQuery(
    api.puzzles.getUserPlay,
    currentUser && activePuzzle && activePuzzle._id
      ? { puzzleId: activePuzzle._id, userId: currentUser._id }
      : "skip",
  );

  // JIT user creation mutation
  const getOrCreateUser = useMutation(api.users.getOrCreateCurrentUser);

  // Track user creation status
  const [userCreated, setUserCreated] = useState(false);
  const [userCreationLoading, setUserCreationLoading] = useState(false);

  // Mutation for submitting guesses
  const submitGuessMutation = useMutation(api.puzzles.submitGuess);

  // In archive mode, we wait for archive puzzle; in daily mode, we wait for today's puzzle
  // Also wait for existing play data to load if user is signed in
  const puzzleLoading = archivePuzzleNumber
    ? archivePuzzle === undefined || (currentUser && existingPlay === undefined)
    : todaysPuzzle === undefined || (currentUser && existingPlay === undefined);

  // JIT user creation effect - trigger when signed in but no user exists
  useEffect(() => {
    async function ensureUserExists() {
      if (
        isSignedIn &&
        !currentUser &&
        !puzzleLoading &&
        !userCreated &&
        !userCreationLoading
      ) {
        // Debug: Triggering JIT user creation

        try {
          setUserCreationLoading(true);
          await getOrCreateUser();
          setUserCreated(true);
          // console.log("[useConvexGameState] User creation completed successfully");
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("[useConvexGameState] User creation failed:", {
            error: errorMessage,
            timestamp: new Date().toISOString(),
          });
          // Don't block the game if user creation fails
        } finally {
          setUserCreationLoading(false);
        }
      }
    }

    ensureUserExists();
  }, [
    isSignedIn,
    currentUser,
    puzzleLoading,
    userCreated,
    userCreationLoading,
    getOrCreateUser,
  ]);

  // Set userCreated to true if user already exists
  useEffect(() => {
    if (currentUser && !userCreated && !userCreationLoading) {
      setUserCreated(true);
      console.warn(
        "[useConvexGameState] Existing user detected, setting userCreated = true",
      );
    }
  }, [currentUser, userCreated, userCreationLoading]);

  // Reset user creation status when signing out
  useEffect(() => {
    if (!isSignedIn) {
      setUserCreated(false);
      setUserCreationLoading(false);
    }
  }, [isSignedIn]);

  // Initialize puzzle on mount or when Convex puzzle loads
  useEffect(() => {
    async function initGame() {
      try {
        setIsLoading(true);
        setError(null);

        // Clean up old storage entries
        cleanupOldStorage();

        // Get the current puzzle that should be loaded
        const targetPuzzle = archivePuzzleNumber ? archivePuzzle : todaysPuzzle;

        // Check if we already have this puzzle loaded to prevent reinitialization
        if (
          gameState.puzzle?.puzzleId &&
          targetPuzzle?._id &&
          gameState.puzzle.puzzleId === targetPuzzle._id
        ) {
          // Puzzle already loaded, don't reinitialize
          setIsLoading(false);
          return;
        }

        if (archivePuzzle && archivePuzzleNumber) {
          // Initialize with archive puzzle
          const baseState = createInitialGameState();

          // If there's existing play data, restore it
          if (existingPlay && existingPlay.guesses) {
            const restoredState: GameState = {
              ...baseState,
              puzzle: {
                year: archivePuzzle.targetYear,
                events: archivePuzzle.events,
                puzzleId: archivePuzzle._id,
              },
              guesses: existingPlay.guesses || [],
              isGameOver:
                existingPlay.completedAt !== null &&
                existingPlay.completedAt !== undefined,
            };
            setGameState(restoredState);
          } else {
            // No existing play, create fresh state
            const newState = {
              ...baseState,
              puzzle: {
                year: archivePuzzle.targetYear,
                events: archivePuzzle.events,
                puzzleId: archivePuzzle._id,
              },
            };
            setGameState(newState);
          }
          saveProgress(gameState, debugMode, archivePuzzleNumber);
        } else if (todaysPuzzle && !archivePuzzleNumber) {
          // Initialize with daily puzzle
          const baseState = createInitialGameState();

          // If there's existing play data, restore it
          if (existingPlay && existingPlay.guesses) {
            const restoredState: GameState = {
              ...baseState,
              puzzle: {
                year: todaysPuzzle.targetYear,
                events: todaysPuzzle.events,
                puzzleId: todaysPuzzle._id,
              },
              guesses: existingPlay.guesses || [],
              isGameOver:
                existingPlay.completedAt !== null &&
                existingPlay.completedAt !== undefined,
            };
            setGameState(restoredState);
          } else {
            // No existing play, create fresh state
            const newState = {
              ...baseState,
              puzzle: {
                year: todaysPuzzle.targetYear,
                events: todaysPuzzle.events,
                puzzleId: todaysPuzzle._id,
              },
            };
            setGameState(newState);
          }
          saveProgress(gameState, debugMode, undefined);
        } else if (!puzzleLoading) {
          // No fallback - wait for Convex data
          // Show loading or error state instead
          if (archivePuzzleNumber && archivePuzzle === null) {
            setError(`Puzzle #${archivePuzzleNumber} not found`);
          } else {
            setError("Unable to load puzzle data");
          }
        }
      } catch (err) {
        console.error("Game initialization error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize game",
        );
        // No fallback on error - display the error to the user
        // Users need to know if Convex is unavailable
      } finally {
        if (!puzzleLoading) {
          setIsLoading(false);
        }
      }
    }

    // Run initGame when puzzle is not loading
    if (!puzzleLoading) {
      initGame();
    }
  }, [
    debugMode,
    todaysPuzzle,
    archivePuzzle,
    puzzleLoading,
    archivePuzzleNumber,
    existingPlay,
    gameState.puzzle?.puzzleId, // Only track the puzzle ID to prevent reinit
  ]);

  // Save progress whenever game state changes
  useEffect(() => {
    if (gameState.puzzle && !isLoading) {
      saveProgress(gameState, debugMode, archivePuzzleNumber);
    }
  }, [gameState, debugMode, isLoading, archivePuzzleNumber]);

  // Make a guess
  const makeGuess = useCallback(
    async (guess: number) => {
      if (!gameState.puzzle || gameState.isGameOver) return;

      const newGuesses = [...gameState.guesses, guess];
      const isCorrect = guess === gameState.puzzle.year;
      const isGameOver =
        isCorrect || newGuesses.length >= GAME_CONFIG.MAX_GUESSES;

      // Update local state immediately
      setGameState((prevState) => ({
        ...prevState,
        guesses: newGuesses,
        isGameOver,
      }));

      // Save guess to Convex if user is signed in
      console.warn("[DEBUG] Mutation eligibility check:", {
        isSignedIn,
        hasCurrentUser: !!currentUser,
        userCreated,
        userCreationLoading,
        hasPuzzleId: !!gameState.puzzle?.puzzleId,
        willExecute:
          isSignedIn &&
          currentUser &&
          userCreated &&
          !userCreationLoading &&
          gameState.puzzle?.puzzleId,
      });

      if (
        isSignedIn &&
        currentUser &&
        userCreated &&
        !userCreationLoading &&
        gameState.puzzle?.puzzleId
      ) {
        try {
          console.warn("[DEBUG] Submitting guess to Convex:", {
            puzzleId: gameState.puzzle.puzzleId,
            userId: currentUser._id,
            guess,
            isCorrect,
            isGameOver,
          });

          await submitGuessMutation({
            puzzleId: gameState.puzzle.puzzleId as Id<"puzzles">,
            userId: currentUser._id,
            guess,
          });

          console.warn("[DEBUG] Guess submitted successfully to Convex");
        } catch (error) {
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          console.error("[DEBUG] Failed to save guess to Convex:", {
            error: errorObj.message,
            errorType: errorObj.constructor.name,
            stack: errorObj.stack,
            puzzleId: gameState.puzzle.puzzleId,
            userId: currentUser._id,
            guess,
          });
          // Don't block the game if saving fails - just log the error
        }
      } else {
        console.warn("[DEBUG] Mutation NOT executed - missing requirements:", {
          reasons: {
            notSignedIn: !isSignedIn,
            noCurrentUser: !currentUser,
            userNotCreated: !userCreated,
            userCreationInProgress: userCreationLoading,
            noPuzzleId: !gameState.puzzle?.puzzleId,
          },
          gameState: {
            hasGameState: !!gameState,
            hasPuzzle: !!gameState.puzzle,
            puzzleId: gameState.puzzle?.puzzleId,
          },
        });
      }
    },
    [
      gameState,
      isSignedIn,
      currentUser,
      userCreated,
      userCreationLoading,
      submitGuessMutation,
      setGameState,
      archivePuzzleNumber,
      debugMode,
    ],
  );

  // Reset game
  const resetGame = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  // Derived state using useMemo for performance
  const derivedState = useMemo(() => {
    const remainingGuesses = GAME_CONFIG.MAX_GUESSES - gameState.guesses.length;
    const isGameComplete = gameState.isGameOver;
    const hasWon = gameState.puzzle
      ? gameState.guesses.includes(gameState.puzzle.year)
      : false;

    const currentHintIndex = Math.min(gameState.guesses.length, 5);
    const currentEvent = gameState.puzzle?.events[currentHintIndex] || null;
    const nextHint = gameState.puzzle?.events[currentHintIndex + 1] || null;

    const closestGuess = gameState.puzzle
      ? findClosestGuess(gameState.guesses, gameState.puzzle.year)
      : null;

    const currentGuess = gameState.guesses[gameState.guesses.length - 1];
    const isCurrentGuessClosest =
      closestGuess && currentGuess
        ? closestGuess.guess === currentGuess
        : false;

    return {
      remainingGuesses,
      isGameComplete,
      hasWon,
      currentEvent,
      currentHintIndex,
      nextHint,
      closestGuess,
      isCurrentGuessClosest,
    };
  }, [gameState.guesses, gameState.isGameOver, gameState.puzzle]);

  return {
    gameState,
    isLoading: isLoading || puzzleLoading || userCreationLoading,
    error,
    makeGuess,
    resetGame,
    ...derivedState,
  };
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  GameState,
  Progress,
  createInitialGameState,
  initializePuzzle,
  saveProgress,
  cleanupOldStorage,
} from "@/lib/gameState";
import { loadGameProgress } from "@/lib/storage";
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

export function useConvexGameState(
  debugMode: boolean = false,
): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isSignedIn } = useUser();

  // Try to use Convex - these will be undefined if provider not available
  const todaysPuzzle = useQuery(api.puzzles.getTodaysPuzzle);
  const recordGuessMutation = useMutation(api.puzzles.recordGuess);
  const updateStreakMutation = useMutation(api.users.updateUserStreak);

  const puzzleLoading = todaysPuzzle === undefined;

  // Initialize puzzle on mount or when Convex puzzle loads
  useEffect(() => {
    async function initGame() {
      try {
        setIsLoading(true);
        setError(null);

        // Clean up old storage entries
        cleanupOldStorage();

        // First try to load from localStorage
        const savedProgress = loadGameProgress<Progress>();
        let savedState: GameState | null = null;

        if (savedProgress && savedProgress.puzzleYear) {
          // Reconstruct game state from saved progress
          const puzzle = initializePuzzle(undefined, debugMode);
          if (puzzle && puzzle.year === savedProgress.puzzleYear) {
            savedState = {
              ...createInitialGameState(),
              puzzle,
              guesses: savedProgress.guesses || [],
              isGameOver: savedProgress.isGameOver || false,
            };
          }
        }

        if (savedState) {
          setGameState(savedState);
        } else if (todaysPuzzle) {
          // Initialize with Convex puzzle
          const newState = {
            ...createInitialGameState(),
            puzzle: {
              year: todaysPuzzle.year,
              events: todaysPuzzle.events,
              puzzleId: todaysPuzzle.date,
            },
          };
          setGameState(newState);
          saveProgress(newState, debugMode);
        } else if (!puzzleLoading) {
          // Fallback to traditional initialization
          const puzzle = initializePuzzle(undefined, debugMode);
          const initializedState = {
            ...createInitialGameState(),
            puzzle,
          };
          setGameState(initializedState);
          saveProgress(initializedState, debugMode);
        }
      } catch (err) {
        console.error("Game initialization error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize game",
        );
        // Fallback on error
        const puzzle = initializePuzzle(undefined, debugMode);
        const fallbackState = {
          ...createInitialGameState(),
          puzzle,
        };
        setGameState(fallbackState);
        saveProgress(fallbackState, debugMode);
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
  }, [debugMode, todaysPuzzle, puzzleLoading]);

  // Save progress whenever game state changes
  useEffect(() => {
    if (gameState.puzzle && !isLoading) {
      saveProgress(gameState, debugMode);
    }
  }, [gameState, debugMode, isLoading]);

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

      // If signed in and Convex available, save to Convex
      if (
        isSignedIn &&
        todaysPuzzle?.date &&
        recordGuessMutation &&
        updateStreakMutation
      ) {
        try {
          await recordGuessMutation({
            date: todaysPuzzle.date,
            year: gameState.puzzle.year,
            guess,
            guesses: newGuesses,
            completed: isCorrect,
          });

          // Update streak if game is over
          if (isGameOver) {
            await updateStreakMutation({ completed: isCorrect });
          }
        } catch (error) {
          console.error("Failed to save progress to Convex:", error);
        }
      }
    },
    [
      gameState.puzzle,
      gameState.isGameOver,
      gameState.guesses,
      isSignedIn,
      todaysPuzzle,
      recordGuessMutation,
      updateStreakMutation,
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
    isLoading: isLoading || puzzleLoading,
    error,
    makeGuess,
    resetGame,
    ...derivedState,
  };
}

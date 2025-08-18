"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GAME_CONFIG } from "@/lib/constants";

/**
 * Return type for the useLocalSession hook
 */
interface UseLocalSessionReturn {
  sessionGuesses: number[];
  addGuess: (n: number) => void;
  clearGuesses: () => void;
}

/**
 * Hook to manage current game session guesses before persistence
 *
 * This hook is completely orthogonal - it has no knowledge of persistence,
 * authentication, or any other concerns. Its single responsibility is managing
 * the current session's guesses in memory. The session resets when the puzzle changes.
 *
 * @param puzzleId - The puzzle's ID (null if puzzle not loaded)
 * @returns Object containing session guesses and mutation functions
 *
 * @example
 * const { sessionGuesses, addGuess, clearGuesses } = useLocalSession(puzzleId);
 *
 * // Add a guess (won't add duplicates or exceed 6 guesses)
 * addGuess(1969);
 *
 * // Clear all session guesses
 * clearGuesses();
 *
 * // Session automatically resets when puzzleId changes
 * // puzzleId changes -> sessionGuesses becomes []
 */
export function useLocalSession(
  puzzleId: string | null,
): UseLocalSessionReturn {
  const [sessionGuesses, setSessionGuesses] = useState<number[]>([]);

  // Reset session when puzzle changes
  useEffect(() => {
    if (puzzleId) {
      // Clear guesses when we get a new puzzle
      setSessionGuesses([]);
    }
  }, [puzzleId]);

  // Add a guess to the session
  const addGuess = useCallback((guess: number) => {
    setSessionGuesses((prevGuesses) => {
      // Don't exceed max guesses
      if (prevGuesses.length >= GAME_CONFIG.MAX_GUESSES) {
        return prevGuesses;
      }

      // Don't add duplicates
      if (prevGuesses.includes(guess)) {
        return prevGuesses;
      }

      // Add the new guess
      return [...prevGuesses, guess];
    });
  }, []);

  // Clear all session guesses
  const clearGuesses = useCallback(() => {
    setSessionGuesses([]);
  }, []);

  // Memoize the return value to ensure stable references
  return useMemo<UseLocalSessionReturn>(
    () => ({
      sessionGuesses,
      addGuess,
      clearGuesses,
    }),
    [sessionGuesses, addGuess, clearGuesses],
  );
}

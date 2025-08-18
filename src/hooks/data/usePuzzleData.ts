"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Puzzle data structure returned from Convex
 */
interface ConvexPuzzle {
  _id: string;
  targetYear: number;
  events: string[];
  puzzleNumber: number;
  date?: string;
}

/**
 * Normalized puzzle data for consumption by the application
 */
interface PuzzleData {
  id: string;
  targetYear: number;
  events: string[];
  puzzleNumber: number;
}

/**
 * Return type for the usePuzzleData hook
 */
interface UsePuzzleDataReturn {
  puzzle: PuzzleData | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch puzzle data from Convex
 *
 * This hook is completely orthogonal - it has no knowledge of authentication,
 * users, or any other concerns. Its single responsibility is fetching puzzle data.
 *
 * @param puzzleNumber - Optional puzzle number for archive puzzles. If not provided, fetches today's daily puzzle.
 * @returns Object containing puzzle data, loading state, and error state
 *
 * @example
 * // Fetch today's daily puzzle
 * const { puzzle, isLoading, error } = usePuzzleData();
 *
 * @example
 * // Fetch a specific archive puzzle
 * const { puzzle, isLoading, error } = usePuzzleData(42);
 */
export function usePuzzleData(puzzleNumber?: number): UsePuzzleDataReturn {
  // Fetch daily puzzle if no puzzle number provided
  const dailyPuzzle = useQuery(
    api.puzzles.getDailyPuzzle,
    puzzleNumber !== undefined ? "skip" : undefined,
  ) as ConvexPuzzle | null | undefined;

  // Fetch archive puzzle if puzzle number provided
  const archivePuzzle = useQuery(
    api.puzzles.getPuzzleByNumber,
    puzzleNumber !== undefined ? { puzzleNumber } : "skip",
  ) as ConvexPuzzle | null | undefined;

  // Select the appropriate puzzle based on parameters
  const convexPuzzle = puzzleNumber !== undefined ? archivePuzzle : dailyPuzzle;

  // Memoize the return value to ensure stable references
  return useMemo<UsePuzzleDataReturn>(() => {
    // Handle loading state
    if (convexPuzzle === undefined) {
      return {
        puzzle: null,
        isLoading: true,
        error: null,
      };
    }

    // Handle null result (puzzle not found)
    if (convexPuzzle === null) {
      const errorMessage =
        puzzleNumber !== undefined
          ? `Puzzle #${puzzleNumber} not found`
          : "No daily puzzle available";

      return {
        puzzle: null,
        isLoading: false,
        error: new Error(errorMessage),
      };
    }

    // Normalize the puzzle data
    const normalizedPuzzle: PuzzleData = {
      id: convexPuzzle._id,
      targetYear: convexPuzzle.targetYear,
      events: convexPuzzle.events,
      puzzleNumber: convexPuzzle.puzzleNumber,
    };

    // Return successful result
    return {
      puzzle: normalizedPuzzle,
      isLoading: false,
      error: null,
    };
  }, [convexPuzzle, puzzleNumber]);
}

"use client";

import { useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { PuzzleWithContext } from "@/types/puzzle";
import { logger } from "@/lib/logger";

/**
 * Puzzle data structure returned from Convex
 */
interface ConvexPuzzle {
  _id: string;
  targetYear: number;
  events: string[];
  puzzleNumber: number;
  date?: string;
  historicalContext?: string;
}

/**
 * Return type for the usePuzzleData hook
 */
interface UsePuzzleDataReturn {
  puzzle: PuzzleWithContext | null;
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
 * @param initialData - Optional initial puzzle data to skip loading state (for SSR)
 * @returns Object containing puzzle data, loading state, and error state
 *
 * @example
 * // Fetch today's daily puzzle
 * const { puzzle, isLoading, error } = usePuzzleData();
 *
 * @example
 * // Fetch a specific archive puzzle
 * const { puzzle, isLoading, error } = usePuzzleData(42);
 *
 * @example
 * // Use with preloaded data from server
 * const { puzzle, isLoading, error } = usePuzzleData(undefined, preloadedPuzzle);
 */
export function usePuzzleData(puzzleNumber?: number, initialData?: unknown): UsePuzzleDataReturn {
  // If initial data is provided, skip queries and use it directly
  const shouldSkipQuery = initialData !== undefined;

  // Fetch daily puzzle if no puzzle number provided and no initial data
  const dailyPuzzle = useQuery(
    api.puzzles.getDailyPuzzle,
    puzzleNumber !== undefined || shouldSkipQuery ? "skip" : undefined,
  ) as ConvexPuzzle | null | undefined;

  // Mutation for on-demand puzzle generation
  const ensurePuzzle = useMutation(api.puzzles.ensureTodaysPuzzle);

  // Trigger on-demand generation if daily puzzle is null (not loading)
  useEffect(() => {
    if (
      puzzleNumber === undefined &&
      !shouldSkipQuery &&
      dailyPuzzle === null // null means query returned but no puzzle exists
    ) {
      // Trigger on-demand generation for today
      logger.warn(`[usePuzzleData] No daily puzzle found, triggering on-demand generation`);

      ensurePuzzle().catch((error) => {
        logger.error("[usePuzzleData] Failed to generate puzzle on-demand:", error);
      });
    }
  }, [dailyPuzzle, puzzleNumber, shouldSkipQuery, ensurePuzzle]);

  // Fetch archive puzzle if puzzle number provided and no initial data
  const archivePuzzle = useQuery(
    api.puzzles.getPuzzleByNumber,
    puzzleNumber !== undefined && !shouldSkipQuery ? { puzzleNumber } : "skip",
  ) as ConvexPuzzle | null | undefined;

  // Select the appropriate puzzle based on parameters
  const convexPuzzle = shouldSkipQuery
    ? (initialData as ConvexPuzzle | null | undefined)
    : puzzleNumber !== undefined
      ? archivePuzzle
      : dailyPuzzle;

  // Memoize the return value to ensure stable references
  return useMemo<UsePuzzleDataReturn>(() => {
    // When using initial data, never show loading state
    if (shouldSkipQuery && initialData !== undefined) {
      if (initialData === null) {
        // Initial data explicitly null means no puzzle
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

      // Type guard to ensure initialData is a ConvexPuzzle
      const puzzleData = initialData as ConvexPuzzle;

      // Normalize the initial data
      const normalizedPuzzle: PuzzleWithContext = {
        id: puzzleData._id as Id<"puzzles">,
        targetYear: puzzleData.targetYear,
        events: puzzleData.events,
        puzzleNumber: puzzleData.puzzleNumber,
        historicalContext: puzzleData.historicalContext,
      };

      return {
        puzzle: normalizedPuzzle,
        isLoading: false,
        error: null,
      };
    }

    // Handle loading state when fetching from server
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
    const normalizedPuzzle: PuzzleWithContext = {
      id: convexPuzzle._id as Id<"puzzles">,
      targetYear: convexPuzzle.targetYear,
      events: convexPuzzle.events,
      puzzleNumber: convexPuzzle.puzzleNumber,
      historicalContext: convexPuzzle.historicalContext,
    };

    // Return successful result
    return {
      puzzle: normalizedPuzzle,
      isLoading: false,
      error: null,
    };
  }, [convexPuzzle, puzzleNumber, shouldSkipQuery, initialData]);
}

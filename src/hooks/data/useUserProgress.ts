"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

/**
 * User progress data structure from Convex
 */
interface ConvexPlay {
  _id: Id<"plays">;
  userId: Id<"users">;
  puzzleId: Id<"puzzles">;
  guesses: number[];
  completedAt?: number | undefined;
  updatedAt: number;
}

/**
 * Normalized progress data for consumption by the application
 */
interface ProgressData {
  guesses: number[];
  completedAt: number | null;
}

/**
 * Return type for the useUserProgress hook
 */
interface UseUserProgressReturn {
  progress: ProgressData | null;
  isLoading: boolean;
}

/**
 * Hook to fetch user's play data for a specific puzzle from Convex
 *
 * This hook is completely orthogonal - it has no knowledge of game logic,
 * sessions, or any other concerns. Its single responsibility is fetching
 * user progress data when both userId and puzzleId are available.
 *
 * @param userId - The user's ID (null if not authenticated)
 * @param puzzleId - The puzzle's ID (null if puzzle not loaded)
 * @returns Object containing progress data and loading state
 *
 * @example
 * // Fetch progress when both IDs are available
 * const { progress, isLoading } = useUserProgress(userId, puzzleId);
 *
 * if (isLoading) return <div>Loading progress...</div>;
 * if (progress) {
 *   console.log(`User has made ${progress.guesses.length} guesses`);
 *   if (progress.completedAt) {
 *     console.log(`Completed at ${new Date(progress.completedAt)}`);
 *   }
 * }
 *
 * @example
 * // When prerequisites aren't met (no loading state)
 * const { progress, isLoading } = useUserProgress(null, puzzleId);
 * // progress === null, isLoading === false (skipped)
 */
export function useUserProgress(
  userId: string | null,
  puzzleId: string | null,
): UseUserProgressReturn {
  // Only query Convex when both userId AND puzzleId are non-null
  // Use "skip" pattern to avoid unnecessary queries
  const shouldQuery = userId !== null && puzzleId !== null;

  const convexPlay = useQuery(
    api.puzzles.getUserPlay,
    shouldQuery
      ? {
          userId: userId as Id<"users">,
          puzzleId: puzzleId as Id<"puzzles">,
        }
      : "skip",
  ) as ConvexPlay | null | undefined;

  // Memoize the return value to ensure stable references
  return useMemo<UseUserProgressReturn>(() => {
    // If we skipped the query, return stable null without loading state
    if (!shouldQuery) {
      return {
        progress: null,
        isLoading: false,
      };
    }

    // Handle loading state (query in progress)
    if (convexPlay === undefined) {
      return {
        progress: null,
        isLoading: true,
      };
    }

    // Handle null result (no play record found - user hasn't played this puzzle)
    if (convexPlay === null) {
      return {
        progress: null,
        isLoading: false,
      };
    }

    // Normalize the progress data
    const normalizedProgress: ProgressData = {
      guesses: convexPlay.guesses,
      completedAt: convexPlay.completedAt ?? null,
    };

    // Return successful result
    return {
      progress: normalizedProgress,
      isLoading: false,
    };
  }, [convexPlay, shouldQuery]);
}

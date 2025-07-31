import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { getPuzzleForYear } from "@/lib/puzzleData";
import { useEffect, useState } from "react";

interface PuzzleData {
  year: number;
  events: string[];
  date?: string;
}

export function useConvexPuzzle(date?: string): {
  puzzle: PuzzleData | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [fallbackPuzzle, setFallbackPuzzle] = useState<PuzzleData | null>(null);
  const [isLoadingFallback, setIsLoadingFallback] = useState(false);

  // Try to get puzzle from Convex
  // TODO: getPuzzleByDate doesn't exist in new schema - need to implement or refactor
  const convexPuzzle = null; // Temporarily disabled

  const todaysPuzzle = useQuery(api.puzzles.getDailyPuzzle, date ? "skip" : {});

  const puzzle = date ? convexPuzzle : todaysPuzzle;

  // Fallback to JSON if Convex fails or returns null
  useEffect(() => {
    if (puzzle === null && !isLoadingFallback) {
      setIsLoadingFallback(true);

      // For today's puzzle, we need to calculate the year
      const targetYear = date
        ? parseInt(date.split("-")[0])
        : calculateTodaysYear();

      try {
        const jsonPuzzle = getPuzzleForYear(targetYear);
        if (jsonPuzzle) {
          setFallbackPuzzle({
            year: targetYear,
            events: jsonPuzzle,
            date: date || new Date().toISOString().split("T")[0],
          });
        }
      } catch (error) {
        console.error("Error loading fallback puzzle:", error);
      }

      setIsLoadingFallback(false);
    }
  }, [puzzle, date, isLoadingFallback]);

  // Return Convex puzzle if available, otherwise fallback
  const finalPuzzle = puzzle || fallbackPuzzle;

  return {
    puzzle: finalPuzzle
      ? {
          year:
            "targetYear" in finalPuzzle
              ? finalPuzzle.targetYear
              : finalPuzzle.year,
          events: finalPuzzle.events,
          date: finalPuzzle.date,
        }
      : null,
    isLoading: puzzle === undefined || isLoadingFallback,
    error: null,
  };
}

// Helper function to calculate today's puzzle year
// This should match the logic in your game
function calculateTodaysYear(): number {
  // This is a placeholder - implement your actual logic
  const years = [1969, 1776, 1492, 1066, 476, -776];
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return years[dayOfYear % years.length];
}

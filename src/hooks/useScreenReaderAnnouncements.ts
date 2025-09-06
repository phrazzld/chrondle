import { useState, useEffect } from "react";
import { getGuessDirectionInfo } from "@/lib/utils";
import { formatYear } from "@/lib/displayFormatting";
import { getEnhancedProximityFeedback } from "@/lib/enhancedFeedback";

interface UseScreenReaderAnnouncementsProps {
  guesses: number[];
  puzzle: { year: number; events: string[] } | null;
  lastGuessCount: number;
  setLastGuessCount: (count: number) => void;
}

/**
 * Custom hook to handle screen reader announcements for guess feedback
 * Moves the announcement effect logic out of the main component to reduce effect depth
 */
export function useScreenReaderAnnouncements({
  guesses,
  puzzle,
  lastGuessCount,
  setLastGuessCount,
}: UseScreenReaderAnnouncementsProps) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const currentGuessCount = guesses.length;

    // Only announce when a new guess has been made
    if (currentGuessCount > lastGuessCount && currentGuessCount > 0 && puzzle) {
      const latestGuess = guesses[currentGuessCount - 1];
      const targetYear = puzzle.year;

      if (latestGuess === targetYear) {
        setAnnouncement(
          `Correct! The year was ${formatYear(targetYear)}. Congratulations!`,
        );
      } else {
        const directionInfo = getGuessDirectionInfo(latestGuess, targetYear);
        const enhancedFeedback = getEnhancedProximityFeedback(
          latestGuess,
          targetYear,
          {
            previousGuesses: guesses.slice(0, -1),
            includeHistoricalContext: true,
            includeProgressiveTracking: true,
          },
        );
        const cleanDirection = directionInfo.direction
          .toLowerCase()
          .replace("▲", "")
          .replace("▼", "")
          .trim();
        setAnnouncement(
          `${formatYear(latestGuess)} is ${cleanDirection}. ${enhancedFeedback.encouragement}${enhancedFeedback.historicalHint ? ` ${enhancedFeedback.historicalHint}` : ""}${enhancedFeedback.progressMessage ? ` ${enhancedFeedback.progressMessage}` : ""}`,
        );
      }

      setLastGuessCount(currentGuessCount);
    }
  }, [guesses, puzzle, lastGuessCount, setLastGuessCount]);

  return announcement;
}

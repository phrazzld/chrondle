import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions for the game
export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  }
  return `${year} AD`;
}

export function getGuessDirectionInfo(guess: number, target: number) {
  const difference = guess - target;
  if (difference === 0) {
    return { direction: "correct", icon: "🎯", text: "Perfect! You found it!" };
  } else if (difference > 0) {
    return {
      direction: "earlier",
      icon: "▼",
      text: "Too late - try an earlier year",
    };
  } else {
    return {
      direction: "later",
      icon: "▲",
      text: "Too early - try a later year",
    };
  }
}

export function getTimeUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

// Calculate closest guess for sharing and display
export function calculateClosestGuess(
  guesses: number[],
  targetYear: number,
): { guess: number; distance: number } | null {
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

    for (const guess of guesses) {
      if (typeof guess !== "number" || !isFinite(guess)) {
        continue;
      }

      const distance = Math.abs(guess - targetYear);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestGuess = guess;
      }
    }

    return { guess: closestGuess, distance: closestDistance };
  } catch (error) {
    console.error("Closest guess calculation failed:", error);
    return null;
  }
}

// Format closest guess message for sharing
export function formatClosestGuessMessage(
  closestData: { guess: number; distance: number } | null,
  hasWon: boolean,
): string {
  // Defensive programming: handle all edge cases
  if (!closestData || hasWon || closestData.distance === 0) {
    return "";
  }

  // Validate distance is a valid number
  const { distance } = closestData;
  if (typeof distance !== "number" || !isFinite(distance) || distance < 0) {
    console.warn("Invalid distance in formatClosestGuessMessage:", distance);
    return "";
  }

  try {
    // Add achievement indicators for exceptional accuracy
    if (distance === 1) {
      return ` (Closest: 1 year off! 🎯)`;
    } else if (distance <= 5) {
      return ` (Closest: ${distance} years off 🏆)`;
    } else if (distance <= 25) {
      return ` (Closest: ${distance} years off 🎖️)`;
    } else {
      return ` (Closest: ${distance} years off)`;
    }
  } catch (error) {
    console.error("Error formatting closest guess message:", error);
    return "";
  }
}

export function formatCountdown(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function generateShareText(
  guesses: number[],
  targetYear: number,
  hasWon: boolean,
  puzzleEvents?: string[],
  puzzleNumber?: number,
): string {
  try {
    // Validate inputs
    if (
      !Array.isArray(guesses) ||
      typeof targetYear !== "number" ||
      typeof hasWon !== "boolean" ||
      (puzzleNumber !== undefined && typeof puzzleNumber !== "number")
    ) {
      console.error("Invalid inputs to generateShareText");
      return "Chrondle share text generation failed";
    }

    const today = new Date();
    const dateString = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emojiTimeline = generateEmojiTimeline(guesses, targetYear);
    const score = hasWon ? `${guesses.length}/6` : "X/6";

    // Calculate closest guess for enhanced sharing with error handling
    let closestMessage = "";
    try {
      const closestData = calculateClosestGuess(guesses, targetYear);
      closestMessage = formatClosestGuessMessage(closestData, hasWon);
    } catch (error) {
      console.warn("Failed to calculate closest guess for sharing:", error);
      // Continue without closest guess message
    }

    let result = `Chrondle ${puzzleNumber ? `#${puzzleNumber}` : ""}: ${dateString} - ${score}${closestMessage}\n`;

    // Add first hint if available (directly below the top line)
    if (
      puzzleEvents &&
      Array.isArray(puzzleEvents) &&
      puzzleEvents.length > 0 &&
      puzzleEvents[0]
    ) {
      result += `${puzzleEvents[0]}\n`;
    }

    result += `\n${emojiTimeline}`;
    result += "\n\nhttps://www.chrondle.app";

    return result;
  } catch (error) {
    console.error("Failed to generate share text:", error);
    // Fallback to basic share text
    return `Chrondle: ${hasWon ? "Won" : "Lost"} in ${guesses.length}/6 guesses\nhttps://www.chrondle.app`;
  }
}

export function generateWordleBoxes(guess: number, targetYear: number): string {
  const distance = Math.abs(guess - targetYear);

  // Use same thresholds as ProximityDisplay component for consistency
  if (distance === 0) return "🎯"; // Perfect
  if (distance <= 10) return "🔥"; // Very hot
  if (distance <= 50) return "♨️"; // Hot
  if (distance <= 150) return "🌡️"; // Warm
  if (distance <= 500) return "❄️"; // Cold
  return "🧊"; // Very cold
}

export function generateEmojiTimeline(
  guesses: number[],
  targetYear: number,
): string {
  return guesses
    .map((guess) => {
      return generateWordleBoxes(guess, targetYear);
    })
    .join(" ");
}

export interface StreakColorClasses {
  textColor: string;
  borderColor: string;
  milestone?: string;
}

export function getStreakColorClasses(streak: number): StreakColorClasses {
  if (streak <= 0) {
    return {
      textColor: "text-muted-foreground",
      borderColor: "border-muted",
    };
  }

  if (streak <= 2) {
    return {
      textColor: "text-foreground",
      borderColor: "border-muted",
    };
  }

  if (streak <= 6) {
    return {
      textColor: "text-status-info",
      borderColor: "border-muted",
      milestone: streak === 3 ? "Building momentum!" : undefined,
    };
  }

  if (streak <= 13) {
    return {
      textColor: "text-feedback-correct",
      borderColor: "border-muted",
      milestone: streak === 7 ? "One week streak! 🔥" : undefined,
    };
  }

  if (streak <= 29) {
    return {
      textColor: "text-status-warning",
      borderColor: "border-muted",
      milestone: streak === 14 ? "Two weeks strong! ⚡" : undefined,
    };
  }

  if (streak <= 99) {
    return {
      textColor: "text-status-error",
      borderColor: "border-muted",
      milestone:
        streak === 30
          ? "One month champion! 🏆"
          : streak === 50
            ? "Incredible dedication! 💎"
            : undefined,
    };
  }

  // 100+ days - Elite status
  return {
    textColor: "text-primary",
    borderColor: "border-muted",
    milestone: streak === 100 ? "Century club! 👑" : undefined,
  };
}

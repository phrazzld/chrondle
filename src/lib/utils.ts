import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateWordleBoxes } from "@/lib/game/proximity";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility functions for the game

// Calculate closest guess for sharing and display
export function calculateClosestGuess(
  guesses: number[],
  targetYear: number,
): { guess: number; distance: number } | null {
  if (!Array.isArray(guesses) || guesses.length === 0 || typeof targetYear !== "number") {
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

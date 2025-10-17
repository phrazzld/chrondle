import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

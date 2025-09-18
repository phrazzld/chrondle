"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { STREAK_CONFIG } from "@/lib/constants";
// Storage imports removed - streak data in-memory only
// Authenticated users should use Convex for persistence

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalGamesPlayed: number;
  lastPlayedDate: string;
  playedDates: string[];
  achievements: string[];
}

// Default streak data (in-memory)
let inMemoryStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  totalGamesPlayed: 0,
  lastPlayedDate: "",
  playedDates: [],
  achievements: [],
};

/**
 * Get a date string in local timezone (YYYY-MM-DD format)
 * This ensures streak calculations work correctly across timezones
 */
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// In-memory replacements for storage functions
function loadStreakData(): StreakData {
  return { ...inMemoryStreakData };
}

function calculateCurrentStreak(playedDates: string[]): number {
  if (playedDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const checkDate = new Date(today);

  // Walk backwards from today until we hit a gap
  while (streak < STREAK_CONFIG.MAX_STREAK_HISTORY) {
    const dateString = getLocalDateString(checkDate);

    if (playedDates.includes(dateString)) {
      streak++;
    } else {
      // Gap found - but handle the "haven't played today yet" case
      if (checkDate.getTime() === today.getTime()) {
        // Today not played yet - that's OK, keep checking yesterday
      } else {
        // Found an actual gap in the past
        break;
      }
    }

    // Move to previous day
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

function recordGamePlayed(hasWon: boolean): StreakData {
  const today = getLocalDateString();
  const streakData = { ...inMemoryStreakData };

  // Don't double-count if already played today
  if (streakData.playedDates.includes(today)) {
    return streakData;
  }

  // Add today to played dates if won
  if (hasWon) {
    streakData.playedDates.push(today);
    streakData.lastPlayedDate = today;

    // Recalculate current streak
    streakData.currentStreak = calculateCurrentStreak(streakData.playedDates);
    streakData.longestStreak = Math.max(
      streakData.longestStreak,
      streakData.currentStreak,
    );
  } else {
    // Game played but not won - breaks streak
    if (streakData.playedDates.length > 0) {
      streakData.currentStreak = 0;
    }
  }

  streakData.totalGamesPlayed++;

  // Cleanup old data to prevent unbounded growth
  if (streakData.playedDates.length > STREAK_CONFIG.MAX_STREAK_HISTORY) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - STREAK_CONFIG.MAX_STREAK_HISTORY);
    const cutoffString = getLocalDateString(cutoffDate);

    // Remove dates older than our retention window
    streakData.playedDates = streakData.playedDates.filter(
      (date) => date >= cutoffString,
    );
  }

  // Update in-memory data
  inMemoryStreakData = { ...streakData };
  return streakData;
}

interface UseStreakReturn {
  streakData: StreakData;
  updateStreak: (hasWon: boolean) => StreakData;
  hasNewAchievement: boolean;
  newAchievement: string | null;
  clearNewAchievement: () => void;
}

export function useStreak(): UseStreakReturn {
  const [streakData, setStreakData] = useState<StreakData>(() =>
    loadStreakData(),
  );
  const [hasNewAchievement, setHasNewAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  // Load streak data on mount
  useEffect(() => {
    const data = loadStreakData();
    setStreakData(data);
  }, []);

  const updateStreak = useCallback(
    (hasWon: boolean): StreakData => {
      const oldStreak = streakData.currentStreak;
      const newStreakData = recordGamePlayed(hasWon);

      // Check for new achievements if won and streak increased
      if (hasWon && newStreakData.currentStreak > oldStreak) {
        const achievement = STREAK_CONFIG.ACHIEVEMENTS.find(
          (a) =>
            a.threshold === newStreakData.currentStreak &&
            !newStreakData.achievements.includes(a.name),
        );

        if (achievement) {
          // Add achievement to the data
          newStreakData.achievements.push(achievement.name);
          setNewAchievement(`${achievement.emoji} ${achievement.description}`);
          setHasNewAchievement(true);
        }
      }

      setStreakData(newStreakData);
      return newStreakData;
    },
    [streakData.currentStreak],
  );

  const clearNewAchievement = useCallback(() => {
    setHasNewAchievement(false);
    setNewAchievement(null);
  }, []);

  return useMemo(
    () => ({
      streakData,
      updateStreak,
      hasNewAchievement,
      newAchievement,
      clearNewAchievement,
    }),
    [
      streakData,
      updateStreak,
      hasNewAchievement,
      newAchievement,
      clearNewAchievement,
    ],
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { anonymousStreakStorage } from "@/lib/secureStorage";
import { calculateStreak, getUTCDateString } from "../../convex/lib/streakCalculation";
import { STREAK_CONFIG } from "@/lib/constants";

/**
 * Streak data structure (compatible with existing interface)
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalGamesPlayed: number;
  lastPlayedDate: string;
  playedDates: string[]; // Kept for compatibility, but not used
  achievements: string[];
}

/**
 * Return type for the useStreak hook
 */
interface UseStreakReturn {
  streakData: StreakData;
  updateStreak: (hasWon: boolean) => StreakData;
  hasNewAchievement: boolean;
  newAchievement: string | null;
  clearNewAchievement: () => void;
}

/**
 * Dual-mode streak hook: Convex for authenticated, localStorage for anonymous
 *
 * This hook provides streak tracking for both authenticated and anonymous users:
 * - Authenticated: Reads from Convex users table, updates via submitGuess mutation
 * - Anonymous: Reads from localStorage, updates locally with same calculation logic
 * - Migration: Automatically merges anonymous streaks when user signs in
 *
 * Module Responsibility: Provide streak data and update mechanism regardless of auth state
 * Hidden Complexity: Auth state branching, migration logic, dual persistence layers
 */
export function useStreak(): UseStreakReturn {
  // Clerk authentication state
  const { isSignedIn, user: clerkUser } = useUser();

  // Convex user data (authenticated users only)
  const convexUser = useQuery(api.users.getCurrentUser);

  // Anonymous streak from localStorage
  const [anonymousStreak, setAnonymousStreak] = useState(() => {
    if (typeof window === "undefined") {
      return { currentStreak: 0, lastCompletedDate: "" };
    }
    const stored = anonymousStreakStorage.get();
    return stored || { currentStreak: 0, lastCompletedDate: "" };
  });

  // Achievement state
  const [hasNewAchievement, setHasNewAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  // Migration state - track if we've already migrated this session
  const hasMigratedRef = useRef(false);

  // Convex mutation for merging anonymous streaks
  const mergeStreakMutation = useMutation(api.users.mergeAnonymousStreak);

  // Derive streak data based on auth state
  const streakData = useMemo((): StreakData => {
    if (isSignedIn && convexUser) {
      // Authenticated: use Convex data
      return {
        currentStreak: convexUser.currentStreak,
        longestStreak: convexUser.longestStreak,
        totalGamesPlayed: convexUser.totalPlays,
        lastPlayedDate: convexUser.lastCompletedDate || "",
        playedDates: [], // Not used, kept for compatibility
        achievements: [], // TODO: Implement achievements in Convex
      };
    } else {
      // Anonymous: use localStorage data
      return {
        currentStreak: anonymousStreak.currentStreak,
        longestStreak: anonymousStreak.currentStreak, // No history for anonymous
        totalGamesPlayed: 0, // Not tracked for anonymous
        lastPlayedDate: anonymousStreak.lastCompletedDate,
        playedDates: [], // Not used
        achievements: [], // Not tracked for anonymous
      };
    }
  }, [isSignedIn, convexUser, anonymousStreak]);

  // Update streak function - routes to correct persistence layer
  const updateStreak = useCallback(
    (hasWon: boolean): StreakData => {
      if (isSignedIn && convexUser) {
        // Authenticated: streak is already updated by submitGuess mutation
        // This is essentially a no-op since the backend handles it
        // Just return current streak data from Convex
        return {
          currentStreak: convexUser.currentStreak,
          longestStreak: convexUser.longestStreak,
          totalGamesPlayed: convexUser.totalPlays,
          lastPlayedDate: convexUser.lastCompletedDate || "",
          playedDates: [],
          achievements: [],
        };
      } else {
        // Anonymous: calculate and save to localStorage using functional update
        // This prevents the callback from depending on anonymousStreak state
        let resultData: StreakData | null = null;

        setAnonymousStreak((prev) => {
          const today = getUTCDateString();
          const result = calculateStreak(
            prev.lastCompletedDate || null,
            prev.currentStreak,
            today,
            hasWon,
          );

          const newStreak = {
            currentStreak: result.currentStreak,
            lastCompletedDate: result.lastCompletedDate,
          };

          // Save to localStorage
          anonymousStreakStorage.set(newStreak);

          // Capture result for return value
          resultData = {
            currentStreak: result.currentStreak,
            longestStreak: result.currentStreak,
            totalGamesPlayed: 0,
            lastPlayedDate: result.lastCompletedDate,
            playedDates: [],
            achievements: [],
          };

          return newStreak;
        });

        // Return the calculated result
        // If resultData is null (shouldn't happen), return default
        return (
          resultData || {
            currentStreak: 0,
            longestStreak: 0,
            totalGamesPlayed: 0,
            lastPlayedDate: "",
            playedDates: [],
            achievements: [],
          }
        );
      }
    },
    [isSignedIn, convexUser], // Removed anonymousStreak dependency
  );

  // Trigger migration when user signs in
  useEffect(() => {
    // Only migrate once per session
    if (hasMigratedRef.current) {
      return;
    }

    // Only migrate if signed in and have anonymous streak
    if (!isSignedIn || !clerkUser) {
      return;
    }

    // Only migrate if there's an anonymous streak to merge
    if (anonymousStreak.currentStreak === 0 || !anonymousStreak.lastCompletedDate) {
      return;
    }

    // Mark as migrated immediately to prevent double-migration
    hasMigratedRef.current = true;

    // Trigger migration
    mergeStreakMutation({
      anonymousStreak: anonymousStreak.currentStreak,
      anonymousLastCompletedDate: anonymousStreak.lastCompletedDate,
    })
      .then((result) => {
        console.warn("[useStreak] Streak migration successful:", result);
        // Clear localStorage after successful migration
        anonymousStreakStorage.remove();
        setAnonymousStreak({ currentStreak: 0, lastCompletedDate: "" });
      })
      .catch((error) => {
        console.error("[useStreak] Streak migration failed:", error);
        // Don't clear hasMigrated flag - we tried once, don't spam retries
      });
  }, [isSignedIn, clerkUser, anonymousStreak, mergeStreakMutation]);

  // Achievement checking (when streak increases)
  useEffect(() => {
    if (streakData.currentStreak > 0) {
      const achievement = STREAK_CONFIG.ACHIEVEMENTS.find(
        (a) => a.threshold === streakData.currentStreak,
      );

      if (achievement && !streakData.achievements.includes(achievement.name)) {
        setNewAchievement(`${achievement.emoji} ${achievement.description}`);
        setHasNewAchievement(true);
      }
    }
  }, [streakData.currentStreak, streakData.achievements]);

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
    [streakData, updateStreak, hasNewAchievement, newAchievement, clearNewAchievement],
  );
}

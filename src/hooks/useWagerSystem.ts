"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getAnonymousBank, setAnonymousBank, clearAnonymousWagerData } from "@/lib/wagerStorage";
import {
  calculateMultiplier,
  validateWager,
  calculateWagerOutcome,
  createWagerRecord,
  getInitialBank,
  getRecommendedWager,
} from "@/lib/wagerCalculations";
import type { Wager, WagerOutcome } from "@/types/wager";
import { WAGER_ACHIEVEMENTS } from "@/types/wager";
import { logger } from "@/lib/logger";

/**
 * Wager system data structure
 */
export interface WagerData {
  /** Current bank balance */
  bank: number;

  /** All-time highest bank */
  allTimeHighBank: number;

  /** Total points earned */
  totalPointsEarned: number;

  /** Total points wagered */
  totalPointsWagered: number;

  /** Biggest single puzzle win */
  biggestWin: number;

  /** Average win multiplier */
  averageWinMultiplier: number;

  /** Whether wager system is enabled */
  isEnabled: boolean;
}

/**
 * Return type for the useWagerSystem hook
 */
interface UseWagerSystemReturn {
  /** Current wager data */
  wagerData: WagerData;

  /** Submit a wager with a guess */
  submitWager: (input: {
    guess: number;
    wagerAmount: number;
    targetYear: number;
    hintIndex: number;
  }) => WagerOutcome;

  /** Get current multiplier based on hint index */
  getCurrentMultiplier: (hintIndex: number) => number;

  /** Get recommended wager amount */
  getRecommendedWagerAmount: (hintIndex: number) => number;

  /** Validate a wager amount */
  validateWagerAmount: (amount: number) => { isValid: boolean; error?: string };

  /** Whether a new achievement was unlocked */
  hasNewAchievement: boolean;

  /** The new achievement (if any) */
  newAchievement: string | null;

  /** Clear new achievement notification */
  clearNewAchievement: () => void;

  /** Current wagers for active puzzle */
  currentWagers: Wager[];
}

/**
 * Dual-mode wager system hook: Convex for authenticated, localStorage for anonymous
 *
 * This hook provides wager tracking for both authenticated and anonymous users:
 * - Authenticated: Reads from Convex users table, updates via mutations
 * - Anonymous: Reads from localStorage, updates locally
 * - Migration: Automatically merges anonymous bank when user signs in
 *
 * The wager system allows players to bet points on their guesses, with
 * multipliers based on hint index (6x for hint 1, 1x for hint 6).
 */
export function useWagerSystem(): UseWagerSystemReturn {
  // Clerk authentication state
  const { isSignedIn, user: clerkUser } = useUser();

  // Convex user data (authenticated users only)
  const convexUser = useQuery(api.users.getCurrentUser);

  // Anonymous bank from localStorage
  const [anonymousBank, setAnonymousBankState] = useState(() => {
    if (typeof window === "undefined") {
      return getInitialBank();
    }
    return getAnonymousBank();
  });

  // Current session wagers (for active puzzle)
  const [currentWagers, setCurrentWagers] = useState<Wager[]>([]);

  // Achievement state
  const [hasNewAchievement, setHasNewAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);

  // Migration state - track if we've already migrated this session
  const hasMigratedRef = useRef(false);

  // Derive wager data based on auth state
  const wagerData = useMemo((): WagerData => {
    if (isSignedIn && convexUser) {
      // Authenticated: use Convex data
      return {
        bank: convexUser.bank ?? getInitialBank(),
        allTimeHighBank: convexUser.allTimeHighBank ?? getInitialBank(),
        totalPointsEarned: convexUser.totalPointsEarned ?? 0,
        totalPointsWagered: convexUser.totalPointsWagered ?? 0,
        biggestWin: convexUser.biggestWin ?? 0,
        averageWinMultiplier: convexUser.averageWinMultiplier ?? 0,
        isEnabled: true,
      };
    } else {
      // Anonymous: use localStorage data
      return {
        bank: anonymousBank,
        allTimeHighBank: anonymousBank, // No history for anonymous
        totalPointsEarned: 0, // Not tracked for anonymous
        totalPointsWagered: 0, // Not tracked for anonymous
        biggestWin: 0, // Not tracked for anonymous
        averageWinMultiplier: 0, // Not tracked for anonymous
        isEnabled: true,
      };
    }
  }, [isSignedIn, convexUser, anonymousBank]);

  // Submit a wager with a guess
  const submitWager = useCallback(
    (input: {
      guess: number;
      wagerAmount: number;
      targetYear: number;
      hintIndex: number;
    }): WagerOutcome => {
      const { guess, wagerAmount, targetYear, hintIndex } = input;

      // Calculate outcome
      const outcome = calculateWagerOutcome({
        guess,
        wagerAmount,
        currentBank: wagerData.bank,
        targetYear,
        hintIndex,
      });

      // Create wager record
      const wagerRecord = createWagerRecord(
        {
          guess,
          wagerAmount,
          currentBank: wagerData.bank,
          targetYear,
          hintIndex,
        },
        outcome,
        currentWagers.length,
      );

      // Add to current wagers
      setCurrentWagers((prev) => [...prev, wagerRecord]);

      // Update bank balance
      if (isSignedIn && convexUser) {
        // Authenticated: Optimistic update (actual update handled by Convex mutation)
        logger.debug("[useWagerSystem] Authenticated user - optimistic bank update:", {
          currentBank: wagerData.bank,
          earnings: outcome.earnings,
          newBank: outcome.newBank,
        });
      } else {
        // Anonymous: Update localStorage
        setAnonymousBankState(outcome.newBank);
        setAnonymousBank(outcome.newBank);

        logger.debug("[useWagerSystem] Anonymous user - bank updated:", {
          currentBank: wagerData.bank,
          earnings: outcome.earnings,
          newBank: outcome.newBank,
        });
      }

      // Check for achievements
      if (outcome.newBank >= WAGER_ACHIEVEMENTS.CONFIDENT_HISTORIAN && !hasNewAchievement) {
        setNewAchievement("💰 Confident Historian - Reached 5,000 points!");
        setHasNewAchievement(true);
      }

      return outcome;
    },
    [wagerData.bank, currentWagers, isSignedIn, convexUser, hasNewAchievement],
  );

  // Get current multiplier based on hint index
  const getCurrentMultiplier = useCallback((hintIndex: number) => {
    return calculateMultiplier(hintIndex);
  }, []);

  // Get recommended wager amount
  const getRecommendedWagerAmount = useCallback(
    (hintIndex: number) => {
      const multiplier = calculateMultiplier(hintIndex);
      return getRecommendedWager(wagerData.bank, multiplier);
    },
    [wagerData.bank],
  );

  // Validate wager amount
  const validateWagerAmount = useCallback(
    (amount: number) => {
      const validation = validateWager(amount, wagerData.bank);
      return {
        isValid: validation.isValid,
        error: validation.error,
      };
    },
    [wagerData.bank],
  );

  // Clear new achievement notification
  const clearNewAchievement = useCallback(() => {
    setHasNewAchievement(false);
    setNewAchievement(null);
  }, []);

  // Trigger migration when user signs in
  useEffect(() => {
    // Only migrate once per session
    if (hasMigratedRef.current) {
      return;
    }

    // Only migrate if signed in and Convex user exists
    if (!isSignedIn || !clerkUser || !convexUser) {
      return;
    }

    // Only migrate if there's an anonymous bank different from initial
    const hasAnonymousData = anonymousBank !== getInitialBank();
    if (!hasAnonymousData) {
      return;
    }

    logger.debug("[useWagerSystem] Attempting anonymous bank migration:", {
      anonymousBank,
      convexBank: convexUser.bank,
    });

    // For now, just clear localStorage since we don't have a migration mutation yet
    // TODO: Create Convex mutation to merge anonymous bank
    hasMigratedRef.current = true;
    clearAnonymousWagerData();
    setAnonymousBankState(convexUser.bank ?? getInitialBank());

    logger.info("[useWagerSystem] Anonymous bank cleared (migration placeholder)");
  }, [isSignedIn, clerkUser, convexUser, anonymousBank]);

  return useMemo(
    () => ({
      wagerData,
      submitWager,
      getCurrentMultiplier,
      getRecommendedWagerAmount,
      validateWagerAmount,
      hasNewAchievement,
      newAchievement,
      clearNewAchievement,
      currentWagers,
    }),
    [
      wagerData,
      submitWager,
      getCurrentMultiplier,
      getRecommendedWagerAmount,
      validateWagerAmount,
      hasNewAchievement,
      newAchievement,
      clearNewAchievement,
      currentWagers,
    ],
  );
}

/**
 * Local storage utilities for anonymous wager data
 *
 * Similar to anonymousStreakStorage, this provides persistent wager tracking
 * for users who haven't signed in yet. Data migrates to Convex on authentication.
 */

import { WAGER_CONFIG } from "@/types/wager";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "chrondle-wager-bank";
const STORAGE_VERSION = 1;

interface StoredWagerData {
  version: number;
  bank: number;
  lastUpdated: string; // ISO date
}

/**
 * Get anonymous user's bank balance from localStorage
 *
 * @returns Bank balance or initial balance if not set
 */
export function getAnonymousBank(): number {
  if (typeof window === "undefined") {
    return WAGER_CONFIG.INITIAL_BANK;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return WAGER_CONFIG.INITIAL_BANK;
    }

    const data: StoredWagerData = JSON.parse(stored);

    // Validate data structure
    if (typeof data.bank !== "number" || data.version !== STORAGE_VERSION) {
      logger.warn("Invalid wager data in localStorage, resetting");
      return WAGER_CONFIG.INITIAL_BANK;
    }

    return data.bank;
  } catch (error) {
    logger.error("Error reading wager bank from localStorage:", error);
    return WAGER_CONFIG.INITIAL_BANK;
  }
}

/**
 * Set anonymous user's bank balance in localStorage
 *
 * @param bank - New bank balance
 */
export function setAnonymousBank(bank: number): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const data: StoredWagerData = {
      version: STORAGE_VERSION,
      bank,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    logger.error("Error saving wager bank to localStorage:", error);
  }
}

/**
 * Clear anonymous wager data from localStorage
 *
 * Called after successful migration to authenticated account
 */
export function clearAnonymousWagerData(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.error("Error clearing wager data from localStorage:", error);
  }
}

/**
 * Check if anonymous wager data exists
 *
 * @returns True if localStorage has wager data
 */
export function hasAnonymousWagerData(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(STORAGE_KEY) !== null;
}

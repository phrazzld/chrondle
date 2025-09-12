/**
 * Debug utilities for development environment only
 * These utilities are completely removed from production builds through tree-shaking
 */

import { GameState } from "@/lib/gameState";
import { logger } from "@/lib/logger";

/**
 * Type for debug utilities exposed to window object
 */
export interface DebugUtilities {
  reset: () => void;
  state: () => void;
  clearStorage: () => string[];
  setYear: (year: number) => void;
  testYear: (year: number) => void;
  debug: () => void;
}

/**
 * Check if debug mode should be enabled
 * Always returns false in production
 */
export function isDebugEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  // Only enable in development
  return process.env.NODE_ENV === "development";
}

/**
 * Create debug utilities for development environment
 * Returns null in production builds
 */
export function createDebugUtilities(
  gameState: GameState,
): DebugUtilities | null {
  // Completely disable in production
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // Only create utilities in development
  if (!isDebugEnabled()) {
    return null;
  }

  return {
    reset: () => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    },

    state: () => {
      logger.info("Game state:", gameState);
    },

    clearStorage: () => {
      logger.debug("Clear storage - no localStorage persistence");
      return [];
    },

    setYear: (year: number) => {
      if (gameState.puzzle) {
        gameState.puzzle.year = year;
        logger.info(`Forced year to ${year}`);
      }
    },

    testYear: (year: number) => {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("debug", "true");
        url.searchParams.set("year", year.toString());
        window.location.href = url.toString();
      }
    },

    debug: () => {
      logger.info("🔍 Current date:", new Date().toISOString());
      logger.info("🔍 Game state:", gameState);
      if (gameState.puzzle) {
        logger.info("🔍 Puzzle year:", gameState.puzzle.year);
        logger.info("🔍 Events count:", gameState.puzzle.events.length);
      }
    },
  };
}

/**
 * Install debug utilities on window object
 * Only works in development environment
 */
export function installDebugUtilities(utilities: DebugUtilities | null): void {
  // Never install in production
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (!isDebugEnabled() || !utilities) {
    return;
  }

  if (typeof window !== "undefined") {
    window.chrondle = utilities;
    logger.info("🔧 Debug utilities installed: window.chrondle");
  }
}

/**
 * Remove debug utilities from window object
 */
export function removeDebugUtilities(): void {
  if (typeof window !== "undefined" && "chrondle" in window) {
    delete window.chrondle;
    logger.debug("🔧 Debug utilities removed");
  }
}

/**
 * Type augmentation for window object (development only)
 */
declare global {
  interface Window {
    chrondle?: DebugUtilities;
  }
}

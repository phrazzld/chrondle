import { useCallback, useMemo } from "react";
import { useAuthState } from "@/hooks/data/useAuthState";
import { GAME_CONFIG } from "@/lib/constants";

/**
 * Game state structure for anonymous users
 * Stored in localStorage for persistence across sessions
 */
export interface AnonymousGameState {
  puzzleId: string;
  guesses: number[];
  isComplete: boolean;
  hasWon: boolean;
  timestamp: number;
}

/**
 * Return type for useAnonymousGameState hook
 */
export interface UseAnonymousGameStateReturn {
  /**
   * Save game state to localStorage for anonymous users
   * Does nothing if user is authenticated
   */
  saveGameState: (state: AnonymousGameState) => void;

  /**
   * Load game state from localStorage for anonymous users
   * Returns null if user is authenticated or no saved state exists
   */
  loadGameState: () => AnonymousGameState | null;

  /**
   * Clear anonymous game state from localStorage
   * Used when migrating to authenticated account
   */
  clearAnonymousState: () => void;

  /**
   * Check if anonymous state exists for migration
   */
  hasAnonymousState: () => boolean;
}

const STORAGE_KEY = "chrondle-game-state";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hook for managing anonymous user game state persistence
 * Saves game progress to localStorage for users who haven't signed in
 *
 * @returns Functions to save, load, and clear anonymous game state
 */
export function useAnonymousGameState(): UseAnonymousGameStateReturn {
  const { isAuthenticated, isLoading } = useAuthState();

  /**
   * Save game state to localStorage
   * Only saves if user is not authenticated
   */
  const saveGameState = useCallback(
    (state: AnonymousGameState) => {
      // Don't save if user is authenticated or auth is still loading
      if (isAuthenticated || isLoading) {
        return;
      }

      // Don't save if we're not in a browser environment
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }

      try {
        const stateWithTimestamp = {
          ...state,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp));
      } catch (error) {
        // Silently fail if localStorage is unavailable (e.g., private browsing)
        console.warn("Failed to save anonymous game state:", error);
      }
    },
    [isAuthenticated, isLoading],
  );

  /**
   * Load game state from localStorage
   * Returns null if user is authenticated or no valid state exists
   */
  const loadGameState = useCallback((): AnonymousGameState | null => {
    // Don't load if user is authenticated
    if (isAuthenticated) {
      return null;
    }

    // Don't load if we're not in a browser environment
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as AnonymousGameState;

      // Check if state is too old (more than 24 hours)
      if (parsed.timestamp && Date.now() - parsed.timestamp > MAX_AGE_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Validate the structure
      if (
        !parsed.puzzleId ||
        !Array.isArray(parsed.guesses) ||
        typeof parsed.isComplete !== "boolean" ||
        typeof parsed.hasWon !== "boolean"
      ) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Validate guesses are within reasonable bounds
      if (parsed.guesses.length > GAME_CONFIG.MAX_GUESSES) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch (error) {
      // If parsing fails, remove the corrupted data
      console.warn("Failed to load anonymous game state:", error);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore removal errors
      }
      return null;
    }
  }, [isAuthenticated]);

  /**
   * Clear anonymous game state from localStorage
   * Used when migrating to authenticated account
   */
  const clearAnonymousState = useCallback(() => {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear anonymous game state:", error);
    }
  }, []);

  /**
   * Check if anonymous state exists for migration
   */
  const hasAnonymousState = useCallback((): boolean => {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }

    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }, []);

  // Return memoized object to maintain stable reference
  return useMemo(
    () => ({
      saveGameState,
      loadGameState,
      clearAnonymousState,
      hasAnonymousState,
    }),
    [saveGameState, loadGameState, clearAnonymousState, hasAnonymousState],
  );
}

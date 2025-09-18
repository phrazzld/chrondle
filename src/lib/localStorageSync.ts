/**
 * Utilities for syncing localStorage with React using useSyncExternalStore
 * This provides a single source of truth for anonymous game state
 */

import { gameStateStorage } from "@/lib/secureStorage";
import type { AnonymousGameState } from "@/hooks/useAnonymousGameState";

/**
 * Storage key for session guesses
 */
const STORAGE_KEY = "chrondle_game_state";

/**
 * Subscribe to storage events for cross-tab synchronization
 * Returns an unsubscribe function
 */
export function subscribeToStorage(callback: () => void): () => void {
  // Listen for storage events from other tabs
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };

  // Also listen for custom events from the same tab
  const handleCustomEvent = () => {
    callback();
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("chrondle-storage-change", handleCustomEvent);

  // Return cleanup function
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("chrondle-storage-change", handleCustomEvent);
  };
}

// Cache for array references to avoid infinite loops in useSyncExternalStore
const EMPTY_ARRAY: readonly number[] = Object.freeze([]);
let lastSnapshot: { puzzleId: string | null; guesses: number[] } | null = null;

/**
 * Get snapshot of storage state
 * Returns the current guesses from localStorage for the given puzzle
 * Caches the array reference to avoid infinite loops
 */
export function getStorageSnapshot(puzzleId: string | null): number[] {
  // Check cache first to avoid unnecessary localStorage reads
  if (lastSnapshot && lastSnapshot.puzzleId === puzzleId) {
    // If we have a cached snapshot for this puzzle, verify it's still current
    if (!puzzleId) {
      return EMPTY_ARRAY as number[];
    }

    // Don't try to read localStorage on server
    if (typeof window === "undefined") {
      return EMPTY_ARRAY as number[];
    }

    const state = gameStateStorage.get();
    if (state && state.puzzleId === puzzleId) {
      const guesses = state.guesses || [];
      if (arraysEqual(lastSnapshot.guesses, guesses)) {
        return lastSnapshot.guesses;
      }
      // Update cache with new guesses
      lastSnapshot = { puzzleId, guesses };
      return guesses;
    }
  }

  if (!puzzleId) {
    lastSnapshot = { puzzleId: null, guesses: EMPTY_ARRAY as number[] };
    return EMPTY_ARRAY as number[];
  }

  // Don't try to read localStorage on server
  if (typeof window === "undefined") {
    return EMPTY_ARRAY as number[];
  }

  const state = gameStateStorage.get();

  // Only return guesses if they're for the current puzzle
  if (state && state.puzzleId === puzzleId) {
    const guesses = state.guesses || [];
    // Update cache
    lastSnapshot = { puzzleId, guesses };
    return guesses;
  }

  // Cache the empty result
  lastSnapshot = { puzzleId, guesses: EMPTY_ARRAY as number[] };
  return EMPTY_ARRAY as number[];
}

/**
 * Helper to check if two arrays are equal
 */
function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Get server snapshot for SSR
 * Always returns empty array since localStorage isn't available on server
 */
export function getServerSnapshot(): number[] {
  return EMPTY_ARRAY as number[];
}

/**
 * Update localStorage with new guesses
 * Dispatches a custom event for same-tab updates
 */
export function updateStorage(
  puzzleId: string,
  guesses: number[],
  isComplete: boolean = false,
  hasWon: boolean = false,
): void {
  const state: AnonymousGameState = {
    puzzleId,
    guesses,
    isComplete,
    hasWon,
    timestamp: Date.now(),
  };

  const success = gameStateStorage.set(state);

  if (success) {
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("chrondle-storage-change"));
  }
}

/**
 * Clear storage for a puzzle
 */
export function clearStorage(puzzleId: string): void {
  const state = gameStateStorage.get();

  // Only clear if it's for the current puzzle
  if (state && state.puzzleId === puzzleId) {
    gameStateStorage.remove();
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event("chrondle-storage-change"));
  }
}

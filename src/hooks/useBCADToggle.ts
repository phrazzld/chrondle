"use client";

import { useState, useEffect, useCallback } from "react";

// Constants for storage keys and defaults
const STORAGE_KEY = "chrondle-bcad-input-enabled";
const DEFAULT_ENABLED = true; // New BC/AD system is default

export interface UseBCADToggleReturn {
  isEnabled: boolean;
  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
  isLoading: boolean;
}

/**
 * Custom hook for managing BC/AD input toggle feature flag
 * Persists preference in localStorage for authenticated users
 * Falls back to sessionStorage for anonymous users
 */
export function useBCADToggle(): UseBCADToggleReturn {
  const [isEnabled, setIsEnabled] = useState<boolean>(DEFAULT_ENABLED);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load saved preference on mount
  useEffect(() => {
    try {
      // Try localStorage first (persistent)
      const localValue = localStorage.getItem(STORAGE_KEY);
      if (localValue !== null) {
        setIsEnabled(localValue === "true");
      } else {
        // Fall back to sessionStorage for anonymous users
        const sessionValue = sessionStorage.getItem(STORAGE_KEY);
        if (sessionValue !== null) {
          setIsEnabled(sessionValue === "true");
        }
      }
    } catch (error) {
      console.error("Error loading BC/AD toggle preference:", error);
      // Use default on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preference when it changes
  const savePreference = useCallback((enabled: boolean) => {
    try {
      // Try localStorage first (persistent)
      try {
        localStorage.setItem(STORAGE_KEY, enabled.toString());
      } catch {
        // Fall back to sessionStorage if localStorage fails
        sessionStorage.setItem(STORAGE_KEY, enabled.toString());
      }
    } catch (error) {
      console.error("Error saving BC/AD toggle preference:", error);
    }
  }, []);

  // Toggle function
  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const newValue = !prev;
      savePreference(newValue);
      return newValue;
    });
  }, [savePreference]);

  // Explicit setter
  const setEnabled = useCallback(
    (enabled: boolean) => {
      setIsEnabled(enabled);
      savePreference(enabled);
    },
    [savePreference],
  );

  return {
    isEnabled,
    toggle,
    setEnabled,
    isLoading,
  };
}

/**
 * Helper function to check if BC/AD input is enabled
 * Can be used in components that don't need the full hook functionality
 */
export function isBCADInputEnabled(): boolean {
  try {
    const localValue = localStorage.getItem(STORAGE_KEY);
    if (localValue !== null) {
      return localValue === "true";
    }

    const sessionValue = sessionStorage.getItem(STORAGE_KEY);
    if (sessionValue !== null) {
      return sessionValue === "true";
    }
  } catch {
    // Return default on error
  }

  return DEFAULT_ENABLED;
}

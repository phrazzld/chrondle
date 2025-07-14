"use client";

import { useState, useLayoutEffect } from "react";
import { safeGetJSON, safeSetJSON } from "@/lib/storage";

/**
 * Theme override hook with localStorage persistence
 *
 * CSS handles system theme detection via media queries.
 * JavaScript manages user theme preferences with persistence.
 *
 * Behavior:
 * - Page load: Check localStorage for saved preference, otherwise use system theme
 * - User toggle: Override to opposite theme and persist to localStorage
 * - Refresh: Restore saved preference if exists
 */

type ThemeOverride = "light" | "dark" | null;

interface UseSessionThemeReturn {
  override: ThemeOverride;
  systemTheme: "light" | "dark";
  currentTheme: "light" | "dark";
  toggle: () => void;
  isMounted: boolean;
}

const THEME_STORAGE_KEY = "chrondle-theme-preference";

// Helper function to detect system theme synchronously
function getInitialSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

// Helper function to get initial override synchronously
function getInitialOverride(): ThemeOverride {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return safeGetJSON<ThemeOverride>(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function useSessionTheme(): UseSessionThemeReturn {
  // Initialize with synchronously detected values to reduce flashing
  const [override, setOverride] = useState<ThemeOverride>(getInitialOverride);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getInitialSystemTheme,
  );
  const [isMounted, setIsMounted] = useState(false);

  // Use layout effect for theme-critical initialization that affects rendering
  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      setIsMounted(true);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    // Re-check system theme in case it changed since initial detection
    updateSystemTheme();

    // Re-check saved override in case it changed
    const savedTheme = safeGetJSON<ThemeOverride>(THEME_STORAGE_KEY);
    if (savedTheme !== override) {
      setOverride(savedTheme);
    }

    setIsMounted(true);

    // Listen for system theme changes
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateSystemTheme);
    };
  }, [override]); // Run when override changes

  // Current resolved theme: override takes precedence, otherwise system
  const currentTheme = override || systemTheme;

  // Toggle: set override to opposite of current theme and persist
  const toggle = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setOverride(newTheme);
    safeSetJSON(THEME_STORAGE_KEY, newTheme);
  };

  return {
    override,
    systemTheme,
    currentTheme,
    toggle,
    isMounted,
  };
}

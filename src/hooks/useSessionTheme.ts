"use client";

import { useState, useEffect } from "react";
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

export function useSessionTheme(): UseSessionThemeReturn {
  const [override, setOverride] = useState<ThemeOverride>(null);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = useState(false);

  // Detect system theme on mount and listen for changes
  useEffect(() => {
    if (typeof window === "undefined") {
      setSystemTheme("light");
      setIsMounted(true);
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light");
    };

    // Set initial system theme
    updateSystemTheme();

    // Load saved theme preference from localStorage
    const savedTheme = safeGetJSON<ThemeOverride>(THEME_STORAGE_KEY);
    if (savedTheme) {
      setOverride(savedTheme);
    }

    setIsMounted(true);

    // Listen for system theme changes
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateSystemTheme);
    };
  }, []);

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

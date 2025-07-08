"use client";

import { useState, useEffect } from "react";

/**
 * Session-only theme override hook
 *
 * Follows Carmack's principle: CSS handles system theme detection,
 * JavaScript only manages temporary session overrides.
 *
 * Behavior:
 * - Page load: Always start with system theme (no override)
 * - User toggle: Override to opposite theme for current session
 * - Refresh: Back to system theme (no persistence)
 */

type ThemeOverride = "light" | "dark" | null;

interface UseSessionThemeReturn {
  override: ThemeOverride;
  systemTheme: "light" | "dark";
  currentTheme: "light" | "dark";
  toggle: () => void;
  isMounted: boolean;
}

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
    setIsMounted(true);

    // Listen for system theme changes
    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateSystemTheme);
    };
  }, []);

  // Current resolved theme: override takes precedence, otherwise system
  const currentTheme = override || systemTheme;

  // Toggle: set override to opposite of current theme
  const toggle = () => {
    setOverride(currentTheme === "light" ? "dark" : "light");
  };

  return {
    override,
    systemTheme,
    currentTheme,
    toggle,
    isMounted,
  };
}

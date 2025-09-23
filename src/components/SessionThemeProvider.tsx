"use client";

import { createContext, useContext, useEffect } from "react";
import { useSessionTheme } from "@/hooks/useSessionTheme";

/**
 * Session Theme Provider - The Carmack Approach
 *
 * CSS handles system theme detection via media queries.
 * JavaScript only applies override classes for session-only user choices.
 *
 * No localStorage, no complex state management, no 3-state toggle.
 * Just applies .light or .dark class to html element when user overrides.
 */

interface SessionThemeContextType {
  override: "light" | "dark" | null;
  systemTheme: "light" | "dark";
  currentTheme: "light" | "dark";
  toggle: () => void;
  isMounted: boolean;

  // Legacy compatibility for existing components
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const SessionThemeContext = createContext<SessionThemeContextType | undefined>(undefined);

export function useSessionThemeContext() {
  const context = useContext(SessionThemeContext);
  if (context === undefined) {
    throw new Error("useSessionThemeContext must be used within a SessionThemeProvider");
  }
  return context;
}

interface SessionThemeProviderProps {
  children: React.ReactNode;
}

export function SessionThemeProvider({ children }: SessionThemeProviderProps) {
  const sessionTheme = useSessionTheme();

  // Apply theme classes immediately to prevent flash
  useEffect(() => {
    const html = document.documentElement;

    // Remove any existing theme classes
    html.classList.remove("light", "dark");

    // Apply override class if user has chosen one
    if (sessionTheme.override) {
      html.classList.add(sessionTheme.override);
    }
    // If no override, CSS media query will handle system theme automatically
  }, [sessionTheme.override]);

  // Initialize theme class on first mount for immediate application
  useEffect(() => {
    const html = document.documentElement;

    // Ensure we have a theme class set immediately
    if (sessionTheme.override) {
      html.classList.add(sessionTheme.override);
    } else {
      // Apply system theme class to prevent flash during SSR hydration
      const systemTheme = sessionTheme.systemTheme;
      if (systemTheme && !html.classList.contains("light") && !html.classList.contains("dark")) {
        html.classList.add(systemTheme);
      }
    }

    // Add theme-loaded class for smooth transitions after initial load
    setTimeout(() => {
      html.classList.add("theme-loaded");
    }, 100); // Brief delay to ensure initial theme is applied
  }, [sessionTheme.override, sessionTheme.systemTheme]); // Run when override or system theme changes

  const value: SessionThemeContextType = {
    ...sessionTheme,

    // Legacy compatibility - many components expect these
    darkMode: sessionTheme.currentTheme === "dark",
    toggleDarkMode: sessionTheme.toggle,
  };

  // Always render content - no more visibility hiding
  return <SessionThemeContext.Provider value={value}>{children}</SessionThemeContext.Provider>;
}

// Legacy compatibility export - existing components can keep using useTheme
export const useTheme = useSessionThemeContext;

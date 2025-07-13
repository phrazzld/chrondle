"use client";

import { createContext, useContext, useEffect } from "react";
import { useSessionTheme } from "@/hooks/useSessionTheme";
import {
  useNotifications,
  UseNotificationsReturn,
} from "@/hooks/useNotifications";

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
  notifications: UseNotificationsReturn;

  // Legacy compatibility for existing components
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const SessionThemeContext = createContext<SessionThemeContextType | undefined>(
  undefined,
);

export function useSessionThemeContext() {
  const context = useContext(SessionThemeContext);
  if (context === undefined) {
    throw new Error(
      "useSessionThemeContext must be used within a SessionThemeProvider",
    );
  }
  return context;
}

interface SessionThemeProviderProps {
  children: React.ReactNode;
}

export function SessionThemeProvider({ children }: SessionThemeProviderProps) {
  const sessionTheme = useSessionTheme();
  const notifications = useNotifications();

  // Apply override classes to HTML element
  useEffect(() => {
    if (!sessionTheme.isMounted) return;

    const html = document.documentElement;

    // Remove any existing theme classes
    html.classList.remove("light", "dark");

    // Apply override class if user has chosen one
    if (sessionTheme.override) {
      html.classList.add(sessionTheme.override);
    }
    // If no override, CSS media query will handle system theme automatically
  }, [sessionTheme.override, sessionTheme.isMounted]);

  const value: SessionThemeContextType = {
    ...sessionTheme,
    notifications,

    // Legacy compatibility - many components expect these
    darkMode: sessionTheme.currentTheme === "dark",
    toggleDarkMode: sessionTheme.toggle,
  };

  // Prevent flash of unstyled content
  if (!sessionTheme.isMounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <SessionThemeContext.Provider value={value}>
      {children}
    </SessionThemeContext.Provider>
  );
}

// Legacy compatibility export - existing components can keep using useTheme
export const useTheme = useSessionThemeContext;

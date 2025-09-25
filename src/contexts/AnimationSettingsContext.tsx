"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AnimationSettingsContextType {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const AnimationSettingsContext = createContext<AnimationSettingsContextType | undefined>(undefined);

const STORAGE_KEY = "chrondle-animations-enabled";

export function AnimationSettingsProvider({ children }: { children: ReactNode }) {
  // Default to true (animations enabled) unless user has explicitly disabled
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setAnimationsEnabled(stored === "true");
      }

      // Also check for reduced motion preference as initial default
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion && stored === null) {
        // If user prefers reduced motion and hasn't set a preference, disable animations
        setAnimationsEnabled(false);
        localStorage.setItem(STORAGE_KEY, "false");
      }
    } catch (error) {
      console.error("Error loading animation preference:", error);
    }
    setMounted(true);
  }, []);

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, String(animationsEnabled));

        // Apply or remove the CSS class that disables animations
        if (animationsEnabled) {
          document.documentElement.classList.remove("no-animations");
        } else {
          document.documentElement.classList.add("no-animations");
        }
      } catch (error) {
        console.error("Error saving animation preference:", error);
      }
    }
  }, [animationsEnabled, mounted]);

  const toggleAnimations = () => {
    setAnimationsEnabled((prev) => !prev);
  };

  return (
    <AnimationSettingsContext.Provider
      value={{
        animationsEnabled,
        toggleAnimations,
        setAnimationsEnabled,
      }}
    >
      {children}
    </AnimationSettingsContext.Provider>
  );
}

export function useAnimationSettings() {
  const context = useContext(AnimationSettingsContext);
  if (context === undefined) {
    throw new Error("useAnimationSettings must be used within an AnimationSettingsProvider");
  }
  return context;
}

// Hook to check if animations should be disabled (either by setting or reduced motion)
export function useAnimationsDisabled() {
  const { animationsEnabled } = useAnimationSettings();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Animations are disabled if either the setting is off OR user prefers reduced motion
  return !animationsEnabled || prefersReducedMotion;
}

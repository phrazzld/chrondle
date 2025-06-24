// Enhanced Theme Hook for Chrondle
// Provides system preference detection and smooth theme transitions

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ThemeMode, 
  ResolvedTheme, 
  getSystemTheme, 
  resolveTheme, 
  getThemeClass,
  createSystemThemeListener,
  getNextThemeMode
} from '@/lib/enhancedTheme';
import { loadSettings, saveSettings } from '@/lib/storage';

export interface UseEnhancedThemeReturn {
  // Current theme state
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  colorBlindMode: boolean;
  smoothTransitions: boolean;
  
  // Theme actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  toggleColorBlindMode: () => void;
  toggleSmoothTransitions: () => void;
  
  // System state
  isSystemDark: boolean;
  isMounted: boolean;
}

/**
 * Enhanced theme hook with system preference detection and smooth transitions
 */
export function useEnhancedTheme(): UseEnhancedThemeReturn {
  // State management
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [smoothTransitions, setSmoothTransitions] = useState(true);
  const [isSystemDark, setIsSystemDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Derived state
  const resolvedTheme = resolveTheme(themeMode);

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = loadSettings() as { mode?: ThemeMode; colorBlindMode?: boolean; smoothTransitions?: boolean } | null;
    
    setThemeModeState(settings?.mode || 'system');
    setColorBlindMode(Boolean(settings?.colorBlindMode));
    setSmoothTransitions(Boolean(settings?.smoothTransitions ?? true));
    setIsSystemDark(getSystemTheme() === 'dark');
    setIsMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const cleanup = createSystemThemeListener((systemTheme) => {
      setIsSystemDark(systemTheme === 'dark');
    });

    return cleanup;
  }, []);

  // Apply theme to document when state changes
  useEffect(() => {
    if (!isMounted) return;

    const html = document.documentElement;
    
    // Remove existing theme classes
    html.classList.remove('light', 'dark');
    
    // Add resolved theme class
    const themeClass = getThemeClass(resolvedTheme);
    if (themeClass) {
      html.classList.add(themeClass);
    }

    // Manage color-blind mode class
    if (colorBlindMode) {
      html.classList.add('color-blind');
    } else {
      html.classList.remove('color-blind');
    }

    // Manage smooth transitions class
    if (smoothTransitions) {
      html.classList.add('smooth-transitions');
    } else {
      html.classList.remove('smooth-transitions');
    }

    // Maintain backward compatibility with existing settings structure
    const compatibleSettings = {
      darkMode: resolvedTheme === 'dark', // For backward compatibility
      colorBlindMode,
      // Enhanced settings
      mode: themeMode,
      smoothTransitions,
    };

    saveSettings(compatibleSettings);
  }, [themeMode, resolvedTheme, colorBlindMode, smoothTransitions, isMounted]);

  // Theme mode setter with validation
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  // Toggle theme through three states: light -> dark -> system -> light
  const toggleTheme = useCallback(() => {
    setThemeModeState(current => getNextThemeMode(current));
  }, []);

  // Toggle color blind mode
  const toggleColorBlindMode = useCallback(() => {
    setColorBlindMode(current => !current);
  }, []);

  // Toggle smooth transitions
  const toggleSmoothTransitions = useCallback(() => {
    setSmoothTransitions(current => !current);
  }, []);

  return {
    themeMode,
    resolvedTheme,
    colorBlindMode,
    smoothTransitions,
    setThemeMode,
    toggleTheme,
    toggleColorBlindMode,
    toggleSmoothTransitions,
    isSystemDark,
    isMounted,
  };
}
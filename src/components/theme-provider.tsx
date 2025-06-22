'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '@/lib/storage';

interface ThemeContextType {
  darkMode: boolean;
  colorBlindMode: boolean;
  toggleDarkMode: () => void;
  toggleColorBlindMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = loadSettings();
    if (settings) {
      setDarkMode(settings.darkMode || false);
      setColorBlindMode(settings.colorBlindMode || false);
    }
    setMounted(true);
  }, []);

  // Update html classes when theme state changes
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    
    // Manage dark mode class
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Manage color-blind mode class
    if (colorBlindMode) {
      html.classList.add('color-blind');
    } else {
      html.classList.remove('color-blind');
    }

    // Save settings to localStorage
    saveSettings({
      darkMode,
      colorBlindMode
    });
  }, [darkMode, colorBlindMode, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleColorBlindMode = () => {
    setColorBlindMode(!colorBlindMode);
  };

  const value = {
    darkMode,
    colorBlindMode,
    toggleDarkMode,
    toggleColorBlindMode,
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
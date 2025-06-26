'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { loadSettings, saveSettings } from '@/lib/storage';
import { useNotifications, UseNotificationsReturn } from '@/hooks/useNotifications';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  notifications: UseNotificationsReturn;
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
  const [mounted, setMounted] = useState(false);
  
  // Initialize notification hook
  const notifications = useNotifications();

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = loadSettings();
    if (settings && typeof settings === 'object') {
      setDarkMode(Boolean(settings.darkMode));
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

    // Save settings to localStorage
    saveSettings({
      darkMode
    });
  }, [darkMode, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const value = {
    darkMode,
    toggleDarkMode,
    notifications,
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
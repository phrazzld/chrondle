'use client';

import { createContext, useContext } from 'react';
import { useEnhancedTheme, UseEnhancedThemeReturn } from '@/hooks/useEnhancedTheme';
import { useNotifications, UseNotificationsReturn } from '@/hooks/useNotifications';

interface EnhancedThemeContextType extends UseEnhancedThemeReturn {
  notifications: UseNotificationsReturn;
  // Legacy compatibility
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);

export function useEnhancedThemeContext() {
  const context = useContext(EnhancedThemeContext);
  if (context === undefined) {
    throw new Error('useEnhancedThemeContext must be used within an EnhancedThemeProvider');
  }
  return context;
}

interface EnhancedThemeProviderProps {
  children: React.ReactNode;
}

export function EnhancedThemeProvider({ children }: EnhancedThemeProviderProps) {
  const themeControls = useEnhancedTheme();
  const notifications = useNotifications();

  const value: EnhancedThemeContextType = {
    ...themeControls,
    notifications,
    // Legacy compatibility
    darkMode: themeControls.resolvedTheme === 'dark',
    toggleDarkMode: themeControls.toggleTheme,
  };

  // Prevent flash of unstyled content
  if (!themeControls.isMounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <EnhancedThemeContext.Provider value={value}>
      {children}
    </EnhancedThemeContext.Provider>
  );
}

// Legacy compatibility export
export const useTheme = useEnhancedThemeContext;
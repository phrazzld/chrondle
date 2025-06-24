// Enhanced Theme System for Chrondle
// Provides system preference detection and smooth theme transitions

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/**
 * Detect current system color scheme preference
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'; // Default fallback for SSR or unsupported browsers
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches ? 'dark' : 'light';
}

/**
 * Resolve theme mode to actual theme considering system preferences
 * @param mode - Theme mode preference ('light', 'dark', or 'system')
 * @returns Resolved theme ('light' or 'dark')
 */
export function resolveTheme(mode: ThemeMode | undefined): ResolvedTheme {
  switch (mode) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    case 'system':
    case undefined:
      return getSystemTheme();
    default:
      return getSystemTheme(); // Fallback for invalid modes
  }
}

/**
 * Get CSS class name for theme
 * @param theme - Resolved theme
 * @returns CSS class name
 */
export function getThemeClass(theme: ResolvedTheme): string {
  switch (theme) {
    case 'dark':
      return 'dark';
    case 'light':
      return 'light';
    default:
      return ''; // Invalid theme
  }
}

/**
 * Create a media query listener for system theme changes
 * @param callback - Function to call when system theme changes
 * @returns Cleanup function to remove the listener
 */
export function createSystemThemeListener(
  callback: (theme: ResolvedTheme) => void
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // No-op for SSR or unsupported browsers
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}

/**
 * Enhanced theme settings interface
 */
export interface EnhancedThemeSettings {
  mode: ThemeMode;
  colorBlindMode: boolean;
  smoothTransitions: boolean;
}

/**
 * Default enhanced theme settings
 */
export const DEFAULT_ENHANCED_THEME_SETTINGS: EnhancedThemeSettings = {
  mode: 'system',
  colorBlindMode: false,
  smoothTransitions: true,
};

/**
 * Validate theme mode
 * @param mode - Mode to validate
 * @returns True if valid theme mode
 */
export function isValidThemeMode(mode: unknown): mode is ThemeMode {
  return mode === 'light' || mode === 'dark' || mode === 'system';
}

/**
 * Get next theme mode in cycle (for toggle button)
 * @param current - Current theme mode
 * @returns Next theme mode in cycle
 */
export function getNextThemeMode(current: ThemeMode): ThemeMode {
  switch (current) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'system';
    case 'system':
      return 'light';
    default:
      return 'system';
  }
}

/**
 * Get theme mode display name for UI
 * @param mode - Theme mode
 * @returns Human-readable display name
 */
export function getThemeModeDisplayName(mode: ThemeMode): string {
  switch (mode) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'system':
      return 'System';
    default:
      return 'System';
  }
}

/**
 * Get theme mode icon for UI
 * @param mode - Theme mode
 * @returns Icon string/emoji for the theme mode
 */
export function getThemeModeIcon(mode: ThemeMode): string {
  switch (mode) {
    case 'light':
      return '☀️';
    case 'dark':
      return '🌙';
    case 'system':
      return '💻';
    default:
      return '💻';
  }
}
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getSystemTheme, 
  resolveTheme, 
  getThemeClass,
  type ThemeMode,
  type ResolvedTheme
} from '../enhancedTheme';

// Mock matchMedia for system preference testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Enhanced Theme System', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMatchMedia = window.matchMedia as ReturnType<typeof vi.fn>;
    mockMatchMedia.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSystemTheme', () => {
    it('should return "dark" when system prefers dark mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const theme = getSystemTheme();
      expect(theme).toBe('dark');
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should return "light" when system prefers light mode', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const theme = getSystemTheme();
      expect(theme).toBe('light');
    });

    it('should return "light" as fallback when matchMedia not available', () => {
      // Temporarily remove matchMedia
      const originalMatchMedia = window.matchMedia;
      delete (window as unknown as { matchMedia?: unknown }).matchMedia;

      const theme = getSystemTheme();
      expect(theme).toBe('light');

      // Restore
      window.matchMedia = originalMatchMedia;
    });
  });

  describe('resolveTheme', () => {
    it('should return explicit light theme when set', () => {
      mockMatchMedia.mockReturnValue({ 
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }); // System is dark
      
      const resolved = resolveTheme('light');
      expect(resolved).toBe('light');
    });

    it('should return explicit dark theme when set', () => {
      mockMatchMedia.mockReturnValue({ 
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }); // System is light
      
      const resolved = resolveTheme('dark');
      expect(resolved).toBe('dark');
    });

    it('should follow system theme when mode is "system"', () => {
      // Test system dark
      mockMatchMedia.mockReturnValue({ 
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      expect(resolveTheme('system')).toBe('dark');

      // Test system light
      mockMatchMedia.mockReturnValue({ 
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      expect(resolveTheme('system')).toBe('light');
    });

    it('should default to system theme for undefined mode', () => {
      mockMatchMedia.mockReturnValue({ 
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      expect(resolveTheme(undefined)).toBe('dark');

      mockMatchMedia.mockReturnValue({ 
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      expect(resolveTheme(undefined)).toBe('light');
    });
  });

  describe('getThemeClass', () => {
    it('should return "dark" class for dark theme', () => {
      const className = getThemeClass('dark');
      expect(className).toBe('dark');
    });

    it('should return "light" class for light theme', () => {
      const className = getThemeClass('light');
      expect(className).toBe('light');
    });

    it('should return empty string for invalid theme', () => {
      const className = getThemeClass('invalid' as ResolvedTheme);
      expect(className).toBe('');
    });
  });

  describe('Theme mode validation', () => {
    it('should accept valid theme modes', () => {
      // Set up mock for this test
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const validModes: ThemeMode[] = ['light', 'dark', 'system'];
      
      validModes.forEach(mode => {
        expect(() => resolveTheme(mode)).not.toThrow();
      });
    });
  });

  describe('System preference change handling', () => {
    it('should provide consistent results for same system state', () => {
      mockMatchMedia.mockReturnValue({ 
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      
      const theme1 = getSystemTheme();
      const theme2 = getSystemTheme();
      const resolved1 = resolveTheme('system');
      const resolved2 = resolveTheme('system');
      
      expect(theme1).toBe(theme2);
      expect(resolved1).toBe(resolved2);
    });
  });
});
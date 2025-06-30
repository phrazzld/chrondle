import { describe, it, expect } from 'vitest';
import { isValidYear, isDebugYear, GAME_CONFIG } from '../constants';

describe('Constants Module', () => {
  describe('isValidYear', () => {
    it('should accept year 0', () => {
      expect(isValidYear(0)).toBe(true);
    });

    it('should accept positive years within range', () => {
      expect(isValidYear(1)).toBe(true);
      expect(isValidYear(1000)).toBe(true);
      expect(isValidYear(2000)).toBe(true);
      expect(isValidYear(new Date().getFullYear())).toBe(true);
    });

    it('should accept negative years (BC) within range', () => {
      expect(isValidYear(-1)).toBe(true);
      expect(isValidYear(-100)).toBe(true);
      expect(isValidYear(-1000)).toBe(true);
      expect(isValidYear(-2999)).toBe(true);
    });

    it('should accept boundary values', () => {
      expect(isValidYear(GAME_CONFIG.MIN_YEAR)).toBe(true);
      expect(isValidYear(GAME_CONFIG.MAX_YEAR)).toBe(true);
    });

    it('should reject years below minimum', () => {
      expect(isValidYear(GAME_CONFIG.MIN_YEAR - 1)).toBe(false);
      expect(isValidYear(-3001)).toBe(false);
      expect(isValidYear(-5000)).toBe(false);
    });

    it('should reject years above maximum', () => {
      expect(isValidYear(GAME_CONFIG.MAX_YEAR + 1)).toBe(false);
      expect(isValidYear(3000)).toBe(false);
      expect(isValidYear(9999)).toBe(false);
    });

    it('should handle edge cases around year 0', () => {
      expect(isValidYear(-1)).toBe(true);  // 1 BC
      expect(isValidYear(0)).toBe(true);   // Year 0 (astronomical)
      expect(isValidYear(1)).toBe(true);   // 1 AD
    });

    it('should maintain consistency with game configuration', () => {
      // Verify that the validation bounds match the game config
      expect(isValidYear(GAME_CONFIG.MIN_YEAR)).toBe(true);
      expect(isValidYear(GAME_CONFIG.MAX_YEAR)).toBe(true);
      expect(isValidYear(GAME_CONFIG.MIN_YEAR - 1)).toBe(false);
      expect(isValidYear(GAME_CONFIG.MAX_YEAR + 1)).toBe(false);
    });
  });

  describe('isDebugYear', () => {
    it('should identify debug scenario years correctly', () => {
      expect(isDebugYear(1500)).toBe(true);
      expect(isDebugYear(1800)).toBe(true);
      expect(isDebugYear(1900)).toBe(true);
      expect(isDebugYear(1950)).toBe(true);
      expect(isDebugYear(2000)).toBe(true);
    });

    it('should reject non-debug years', () => {
      expect(isDebugYear(1969)).toBe(false);
      expect(isDebugYear(2024)).toBe(false);
      expect(isDebugYear(0)).toBe(false);
      expect(isDebugYear(-776)).toBe(false);
    });
  });

  describe('GAME_CONFIG validation', () => {
    it('should have consistent configuration', () => {
      expect(GAME_CONFIG.MIN_YEAR).toBe(-3000);
      expect(GAME_CONFIG.MAX_YEAR).toBe(new Date().getFullYear());
      expect(GAME_CONFIG.MAX_GUESSES).toBe(6);
      expect(GAME_CONFIG.MIN_EVENTS_REQUIRED).toBe(6);
    });

    it('should have year validation bounds matching game config', () => {
      expect(GAME_CONFIG.YEAR_VALIDATION_BOUNDS.MIN).toBe(GAME_CONFIG.MIN_YEAR);
      expect(GAME_CONFIG.YEAR_VALIDATION_BOUNDS.MAX).toBe(GAME_CONFIG.MAX_YEAR);
    });
  });
});
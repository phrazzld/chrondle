import { describe, it, expect } from 'vitest';
import { 
  classifyPuzzleTheme, 
  getThemeMetadata, 
  filterPuzzlesByTheme,
  type Theme
} from '../themeSupport';
import { getPuzzleForYear, SUPPORTED_YEARS } from '../puzzleData';

describe('Theme Support', () => {
  describe('Phase 1: Theme Classification', () => {
    it('should classify ancient civilization puzzles correctly', () => {
      // Olympic Games 776 BC
      const theme = classifyPuzzleTheme(-776, [
        "Coroebus of Elis, a cook, wins first recorded footrace",
        "Sacred truce allows safe passage for athletes across Greece"
      ]);
      expect(theme).toBe('ancient-civilizations');
    });

    it('should classify scientific revolution puzzles correctly', () => {
      // Moon landing 1969
      const events = getPuzzleForYear(1969);
      const theme = classifyPuzzleTheme(1969, events);
      expect(theme).toBe('science');
    });

    it('should classify art and culture puzzles correctly', () => {
      // Renaissance period around 1503
      const events = getPuzzleForYear(1503);
      const theme = classifyPuzzleTheme(1503, events);
      expect(theme).toBe('art');
    });

    it('should classify war and conflict puzzles correctly', () => {
      // WWII era
      const events = getPuzzleForYear(1945);
      const theme = classifyPuzzleTheme(1945, events);
      expect(theme).toBe('conflict');
    });

    it('should handle puzzles that dont fit clear themes', () => {
      // Mixed theme puzzles should get general classification
      const theme = classifyPuzzleTheme(1234, ["Generic historical event"]);
      expect(theme).toBe('general');
    });
  });

  describe('Phase 2: Theme Metadata', () => {
    it('should provide metadata for all supported themes', () => {
      const metadata = getThemeMetadata();
      
      expect(metadata).toHaveProperty('ancient-civilizations');
      expect(metadata).toHaveProperty('science');
      expect(metadata).toHaveProperty('art');
      expect(metadata).toHaveProperty('conflict');
      expect(metadata).toHaveProperty('general');
      
      // Check metadata structure
      const ancientTheme = metadata['ancient-civilizations'];
      expect(ancientTheme).toHaveProperty('name');
      expect(ancientTheme).toHaveProperty('description');
      expect(ancientTheme).toHaveProperty('icon');
      expect(ancientTheme).toHaveProperty('color');
      expect(typeof ancientTheme.yearCount).toBe('number');
      expect(Array.isArray(ancientTheme.years)).toBe(true);
    });

    it('should have consistent theme counts across all supported years', () => {
      const metadata = getThemeMetadata();
      const totalThemeYears = Object.values(metadata)
        .reduce((sum, theme) => sum + theme.yearCount, 0);
      
      // Each year should be classified into exactly one theme
      expect(totalThemeYears).toBe(SUPPORTED_YEARS.length);
    });
  });

  describe('Phase 3: Theme Filtering', () => {
    it('should filter puzzles by theme correctly', () => {
      const sciencePuzzles = filterPuzzlesByTheme('science');
      
      expect(sciencePuzzles.length).toBeGreaterThan(0);
      expect(sciencePuzzles.every(puzzle => puzzle.theme === 'science')).toBe(true);
      
      // Verify puzzles have correct structure
      sciencePuzzles.forEach(puzzle => {
        expect(puzzle).toHaveProperty('year');
        expect(puzzle).toHaveProperty('events');
        expect(puzzle).toHaveProperty('theme');
        expect(Array.isArray(puzzle.events)).toBe(true);
        expect(puzzle.events).toHaveLength(6);
      });
    });

    it('should return empty array for invalid theme', () => {
      const invalidPuzzles = filterPuzzlesByTheme('invalid-theme' as Theme);
      expect(invalidPuzzles).toEqual([]);
    });

    it('should maintain all puzzles across theme filtering', () => {
      const allThemes: Theme[] = ['ancient-civilizations', 'science', 'art', 'conflict', 'general'];
      const allFilteredPuzzles = allThemes
        .map(theme => filterPuzzlesByTheme(theme))
        .flat();
      
      expect(allFilteredPuzzles).toHaveLength(SUPPORTED_YEARS.length);
    });
  });

  describe('Phase 4: Backwards Compatibility', () => {
    it('should not break existing puzzle loading', () => {
      // Test that existing puzzle system works unchanged
      const puzzle = getPuzzleForYear(1969);
      expect(puzzle).toHaveLength(6);
      expect(typeof puzzle[0]).toBe('string');
    });

    it('should preserve all supported years', () => {
      // Ensure no years are lost during theme classification
      const themeMetadata = getThemeMetadata();
      const allThemeYears = Object.values(themeMetadata)
        .flatMap(theme => theme.years)
        .sort((a, b) => a - b);
      
      expect(allThemeYears).toEqual(SUPPORTED_YEARS);
    });
  });

  describe('Phase 5: Performance', () => {
    it('should classify themes efficiently', () => {
      const startTime = performance.now();
      
      // Classify all supported years
      SUPPORTED_YEARS.forEach(year => {
        const events = getPuzzleForYear(year);
        classifyPuzzleTheme(year, events);
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete all classifications in reasonable time
      expect(totalTime).toBeLessThan(100); // 100ms for all 100 puzzles
    });
  });
});
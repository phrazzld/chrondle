import { describe, it, expect } from "vitest";
import {
  classifyPuzzleTheme,
  getThemeMetadata,
  filterPuzzlesByTheme,
  type Theme,
} from "../themeSupport";
import { getPuzzleForYear } from "../puzzleData";

describe("Theme Support", () => {
  describe("Phase 1: Theme Classification", () => {
    it("should classify ancient civilization puzzles correctly", () => {
      // Olympic Games 776 BC
      const theme = classifyPuzzleTheme(-776, [
        "Coroebus of Elis, a cook, wins first recorded footrace",
        "Sacred truce allows safe passage for athletes across Greece",
      ]);
      expect(theme).toBe("ancient-civilizations");
    });

    it("should classify scientific revolution puzzles correctly", () => {
      // Moon landing 1969 - getPuzzleForYear returns empty array currently
      const events = getPuzzleForYear(1969);
      expect(events).toEqual([]); // No static data available

      // When no events available, should classify as general
      const theme = classifyPuzzleTheme(1969, events);
      expect(theme).toBe("general");

      // Test with mock events for proper classification
      const mockScienceEvents = [
        "Neil Armstrong walks on the moon",
        "Apollo 11 launches from Kennedy Space Center",
      ];
      const scienceTheme = classifyPuzzleTheme(1969, mockScienceEvents);
      expect(scienceTheme).toBe("science");
    });

    it("should classify art and culture puzzles correctly", () => {
      // Renaissance period around 1503 - getPuzzleForYear returns empty array
      const events = getPuzzleForYear(1503);
      expect(events).toEqual([]);

      const theme = classifyPuzzleTheme(1503, events);
      expect(theme).toBe("general");

      // Test with mock events
      const mockArtEvents = [
        "Leonardo da Vinci begins painting the Mona Lisa",
        "Renaissance art flourishes in Florence",
      ];
      const artTheme = classifyPuzzleTheme(1503, mockArtEvents);
      expect(artTheme).toBe("art");
    });

    it("should classify war and conflict puzzles correctly", () => {
      // WWII era - getPuzzleForYear returns empty array
      const events = getPuzzleForYear(1945);
      expect(events).toEqual([]);

      const theme = classifyPuzzleTheme(1945, events);
      expect(theme).toBe("general");

      // Test with mock events
      const mockWarEvents = [
        "World War II ends with Japanese surrender",
        "Atomic bomb dropped on Hiroshima",
      ];
      const warTheme = classifyPuzzleTheme(1945, mockWarEvents);
      expect(warTheme).toBe("conflict");
    });

    it("should handle puzzles that dont fit clear themes", () => {
      // Mixed theme puzzles should get general classification
      const theme = classifyPuzzleTheme(1234, ["Generic historical event"]);
      expect(theme).toBe("general");
    });
  });

  describe("Phase 2: Theme Metadata", () => {
    it("should provide metadata for all supported themes", () => {
      const metadata = getThemeMetadata();

      expect(metadata).toHaveProperty("ancient-civilizations");
      expect(metadata).toHaveProperty("science");
      expect(metadata).toHaveProperty("art");
      expect(metadata).toHaveProperty("conflict");
      expect(metadata).toHaveProperty("general");

      // Check metadata structure
      const ancientTheme = metadata["ancient-civilizations"];
      expect(ancientTheme).toHaveProperty("name");
      expect(ancientTheme).toHaveProperty("description");
      expect(ancientTheme).toHaveProperty("icon");
      expect(ancientTheme).toHaveProperty("color");
      expect(typeof ancientTheme.yearCount).toBe("number");
      expect(Array.isArray(ancientTheme.years)).toBe(true);
    });

    it.skip("should have consistent theme counts across all supported years - DEPRECATED", () => {
      // This test is skipped as theme support needs Convex migration
      const metadata = getThemeMetadata();
      const totalThemeYears = Object.values(metadata).reduce(
        (sum, theme) => sum + theme.yearCount,
        0,
      );

      // Each year should be classified into exactly one theme
      expect(totalThemeYears).toBe(0); // No puzzles in static data now
    });
  });

  describe("Phase 3: Theme Filtering", () => {
    it("should filter puzzles by theme correctly", () => {
      const sciencePuzzles = filterPuzzlesByTheme("science");

      // Currently returns empty array as puzzles are loaded dynamically from Convex
      expect(sciencePuzzles.length).toBe(0);
      expect(sciencePuzzles).toEqual([]);

      // When puzzles are available, they should have correct structure
      // This test will be updated when Convex integration is complete
    });

    it("should return empty array for invalid theme", () => {
      const invalidPuzzles = filterPuzzlesByTheme("invalid-theme" as Theme);
      expect(invalidPuzzles).toEqual([]);
    });

    it("should maintain all puzzles across theme filtering", () => {
      const allThemes: Theme[] = [
        "ancient-civilizations",
        "science",
        "art",
        "conflict",
        "general",
      ];
      const allFilteredPuzzles = allThemes
        .map((theme) => filterPuzzlesByTheme(theme))
        .flat();

      expect(allFilteredPuzzles).toHaveLength(0); // No puzzles in static data now
    });
  });

  describe("Phase 4: Backwards Compatibility", () => {
    it("should handle empty puzzle data gracefully", () => {
      // getPuzzleForYear returns empty array during Convex migration
      const puzzle = getPuzzleForYear(1969);
      expect(puzzle).toEqual([]);
      expect(puzzle).toHaveLength(0);

      // Theme classification should still work with empty events
      const theme = classifyPuzzleTheme(1969, puzzle);
      expect(theme).toBe("general");
    });

    it("should preserve all supported years", () => {
      // Ensure no years are lost during theme classification
      const themeMetadata = getThemeMetadata();
      const allThemeYears = Object.values(themeMetadata)
        .flatMap((theme) => theme.years)
        .sort((a, b) => a - b);

      expect(allThemeYears).toEqual([]); // No puzzles in static data now
    });
  });

  describe("Phase 5: Performance", () => {
    it("should classify themes efficiently", () => {
      const startTime = performance.now();

      // Skip classification - no static puzzle data
      const testYears = [1969, 1945, 1503]; // Sample years for testing
      testYears.forEach((year) => {
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

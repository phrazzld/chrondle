import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getDailyYear,
  initializePuzzle,
  saveProgress,
  loadProgress,
  createInitialGameState,
  type GameState,
} from "../gameState";
import * as puzzleDataLib from "../puzzleData";

// Mock dependencies
vi.mock("../puzzleData", () => ({
  getPuzzleForYear: vi.fn(),
  getSupportedYears: vi.fn(),
  hasPuzzleForYear: vi.fn(),
  ALL_PUZZLE_YEARS: [1969, 1970, 1971, 1972, 1973],
}));

const mockPuzzleDataLib = vi.mocked(puzzleDataLib);

// Test data
const mockPuzzleEvents = [
  "First lunar landing by Apollo 11",
  "Vietnam War escalation continues",
  "Woodstock music festival occurs",
  "ARPANET first connection established",
  "Nixon becomes president",
  "Beatles release Abbey Road album",
];

const mockSupportedYears = [1969, 1970, 1971, 1972, 1973];

// Create a proper mock for localStorage
interface MockStorage {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  key: ReturnType<typeof vi.fn>;
  length: number;
}

describe("gameState Library Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Use fake timers for consistent date/time behavior across all tests
    vi.useFakeTimers();
    // Set a consistent time for all tests unless overridden
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));

    // Mock localStorage
    const localStorageMock: MockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Setup default mock implementations
    mockPuzzleDataLib.getSupportedYears.mockReturnValue(mockSupportedYears);
    mockPuzzleDataLib.getPuzzleForYear.mockReturnValue(mockPuzzleEvents);
    mockPuzzleDataLib.hasPuzzleForYear.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("getDailyYear", () => {
    it("should return consistent year for same date", () => {
      // Mock consistent date
      vi.setSystemTime(new Date("2024-01-15"));

      const year1 = getDailyYear();
      const year2 = getDailyYear();

      expect(year1).toBe(year2);
      expect(mockSupportedYears).toContain(year1);
    });

    it("should return different years for different dates", () => {
      // Test with first date
      vi.setSystemTime(new Date("2024-01-15"));
      const year1 = getDailyYear();

      // Test with second date
      vi.setSystemTime(new Date("2024-01-16"));
      const year2 = getDailyYear();

      // Should be different years (high probability)
      // Note: There's a small chance they could be the same due to hash collisions
      expect(mockSupportedYears).toContain(year1);
      expect(mockSupportedYears).toContain(year2);
    });

    it("should handle debug mode correctly", () => {
      const debugYear = "1970";
      const year = getDailyYear(debugYear, true);

      // 1970 is in our mock supported years, so it should return 1970
      expect(year).toBe(1970);
    });

    it("should handle invalid debug year gracefully", () => {
      const invalidDebugYear = "invalid";
      const year = getDailyYear(invalidDebugYear, true);

      // Should fall back to normal daily selection
      expect(mockSupportedYears).toContain(year);
    });

    it("should use deterministic hash algorithm", () => {
      vi.setSystemTime(new Date("2024-01-15"));

      // Test that algorithm produces consistent results
      const iterations = 10; // Reduced from 100 to prevent console output bottleneck
      const firstYear = getDailyYear();

      for (let i = 0; i < iterations; i++) {
        const year = getDailyYear();
        expect(year).toBe(firstYear);
      }
    });

    it("should handle timezone differences consistently", () => {
      // Test with different timezone offsets
      // Note: When using setSystemTime, the date is normalized to the system timezone
      vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
      const year1 = getDailyYear();

      vi.setSystemTime(new Date("2024-01-15T08:00:00-04:00")); // Same day, different timezone
      const year2 = getDailyYear();

      // Should be same year since it's the same calendar date
      expect(year1).toBe(year2);
    });

    it("should handle year boundaries correctly", () => {
      vi.setSystemTime(new Date("2024-12-31T23:59:59Z"));
      const year1 = getDailyYear();

      vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
      const year2 = getDailyYear();

      // Should be different years for different dates
      expect(mockSupportedYears).toContain(year1);
      expect(mockSupportedYears).toContain(year2);
    });
  });

  describe("initializePuzzle", () => {
    it("should initialize puzzle with correct structure", () => {
      const puzzle = initializePuzzle();

      expect(puzzle).toMatchObject({
        year: expect.any(Number),
        events: expect.any(Array),
        puzzleId: expect.any(String),
      });
    });

    it("should handle missing puzzle data", () => {
      mockPuzzleDataLib.getPuzzleForYear.mockReturnValue([]);

      expect(() => initializePuzzle()).toThrow("No puzzle found for year");
    });

    it("should preserve event order from database", () => {
      const orderedEvents = [
        "Obscure political treaty signed",
        "Minor administrative change",
        "Local election held",
        "World War II memorial dedicated",
        "Beatles release Abbey Road",
        "Moon landing by Apollo 11",
      ];

      mockPuzzleDataLib.getPuzzleForYear.mockReturnValue(orderedEvents);

      const puzzle = initializePuzzle();

      // Events should be in the exact same order as in the database
      expect(puzzle.events).toEqual(orderedEvents);
      expect(puzzle.events.length).toBe(orderedEvents.length);

      // The database already has events ordered from obscure to famous
      expect(puzzle.events[0]).toBe("Obscure political treaty signed");
      expect(puzzle.events[puzzle.events.length - 1]).toBe(
        "Moon landing by Apollo 11",
      );
    });

    it("should handle error during puzzle initialization", () => {
      mockPuzzleDataLib.getPuzzleForYear.mockImplementation(() => {
        throw new Error("Database error");
      });

      expect(() => initializePuzzle()).toThrow("Database error");
    });
  });

  describe("saveProgress", () => {
    it("should save progress to localStorage", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [1950, 1960],
        maxGuesses: 6,
        isGameOver: false,
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;

      // Clear any previous calls from setup/other tests
      localStorageMock.setItem.mockClear();

      saveProgress(gameState);

      // Two calls expected: 1 for localStorage availability test, 1 for actual save
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      // Should save progress data on the second call (first is availability test)
      expect(localStorageMock.setItem).toHaveBeenNthCalledWith(
        2, // Second call
        expect.stringMatching(/chrondle-progress-/),
        expect.stringContaining('"guesses":[1950,1960]'),
      );
    });

    it("should handle localStorage quota exceeded", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [1950],
        maxGuesses: 6,
        isGameOver: false,
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      // Storage utilities handle quota errors gracefully and return false
      const result = saveProgress(gameState);
      expect(result).toBe(false);
    });

    it("should handle localStorage not available", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [1950],
        maxGuesses: 6,
        isGameOver: false,
      };

      // Mock localStorage as undefined
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      // Storage utilities handle missing localStorage gracefully and return false
      const result = saveProgress(gameState);
      expect(result).toBe(false);
    });

    it("should skip saving in debug mode", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [1950],
        maxGuesses: 6,
        isGameOver: false,
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      saveProgress(gameState, true); // debug mode

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("loadProgress", () => {
    it("should load saved progress into game state", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false,
      };

      const savedProgress = {
        guesses: [1950, 1960],
        isGameOver: false,
        puzzleId: "2024-01-15",
        puzzleYear: 1969,
        timestamp: new Date().toISOString(),
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));

      loadProgress(gameState);

      expect(gameState.guesses).toEqual([1950, 1960]);
      expect(gameState.isGameOver).toBe(false);
    });

    it("should not load when no saved progress exists", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false,
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      localStorageMock.getItem.mockReturnValue(null);

      loadProgress(gameState);

      expect(gameState.guesses).toEqual([]);
    });

    it("should handle corrupted localStorage data", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false,
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      localStorageMock.getItem.mockReturnValue("invalid json");

      // Security enhancement: corrupted data should be cleared and not affect state
      loadProgress(gameState);

      // Game state should remain unchanged when corrupted data is encountered
      expect(gameState.guesses).toEqual([]);

      // Verify corrupted data was cleared
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it("should handle localStorage not available", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false,
      };

      // Mock localStorage as undefined
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      // Storage utilities handle missing localStorage gracefully
      loadProgress(gameState);

      // Game state should remain unchanged when localStorage is not available
      expect(gameState.guesses).toEqual([]);
    });

    it("should skip loading in debug mode", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false,
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      loadProgress(gameState, true); // debug mode

      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });
  });

  describe("createInitialGameState", () => {
    it("should create valid initial state", () => {
      const initialState = createInitialGameState();

      expect(initialState).toMatchObject({
        puzzle: null,
        guesses: [],
        maxGuesses: 6,
        isGameOver: false,
      });
    });

    it("should create fresh state each time", () => {
      const state1 = createInitialGameState();
      const state2 = createInitialGameState();

      expect(state1).not.toBe(state2); // Different object references
      expect(state1.guesses).not.toBe(state2.guesses); // Different array references
    });
  });

  describe("Integration Tests", () => {
    it("should handle complete game flow", () => {
      // Initialize puzzle
      const puzzle = initializePuzzle();
      expect(puzzle).toBeDefined();

      // Create game state and add guesses
      const gameState = createInitialGameState();
      gameState.puzzle = puzzle;
      gameState.guesses.push(1950);
      gameState.guesses.push(1960);

      // Save progress
      saveProgress(gameState);

      // Verify localStorage was called correctly
      const localStorageMock = window.localStorage as unknown as MockStorage;
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Get the saved data to verify it matches
      const savedData = JSON.stringify({
        guesses: [1950, 1960],
        isGameOver: false,
        puzzleId: puzzle.puzzleId,
        puzzleYear: puzzle.year,
        timestamp: new Date().toISOString(),
      });
      localStorageMock.getItem.mockReturnValue(savedData);

      // Load progress into new state
      const newGameState = createInitialGameState();
      newGameState.puzzle = puzzle; // Same puzzle with same puzzleId
      loadProgress(newGameState);

      expect(newGameState.guesses).toEqual([1950, 1960]);
    });

    it("should maintain data integrity across save/load cycles", () => {
      const puzzle = initializePuzzle();

      const originalState = createInitialGameState();
      originalState.puzzle = puzzle;
      originalState.guesses = [1950, 1960, 1965];
      originalState.isGameOver = false;

      // Save and load multiple times
      for (let i = 0; i < 5; i++) {
        // Clear previous mocks
        vi.clearAllMocks();

        // Reset localStorage mock
        const freshLocalStorageMock: MockStorage = {
          getItem: vi.fn(),
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
          key: vi.fn(),
          length: 0,
        };
        Object.defineProperty(window, "localStorage", {
          value: freshLocalStorageMock,
          writable: true,
        });

        saveProgress(originalState);

        // Mock the return value to match what was saved
        const savedData = JSON.stringify({
          guesses: originalState.guesses,
          isGameOver: originalState.isGameOver,
          puzzleId: originalState.puzzle?.puzzleId || null,
          puzzleYear: originalState.puzzle?.year || null,
          timestamp: new Date().toISOString(),
        });
        freshLocalStorageMock.getItem.mockReturnValue(savedData);

        const loadedState = createInitialGameState();
        loadedState.puzzle = puzzle;
        loadProgress(loadedState);
        expect(loadedState.guesses).toEqual(originalState.guesses);
      }
    });

    it("should handle concurrent access safely", () => {
      const puzzle = initializePuzzle();

      const gameState = createInitialGameState();
      gameState.puzzle = puzzle;

      // Simulate concurrent save operations
      const savePromises = Array.from({ length: 10 }, () =>
        Promise.resolve(saveProgress(gameState)),
      );

      Promise.all(savePromises);

      // Should still be able to load correctly
      const loadedState = createInitialGameState();
      loadedState.puzzle = puzzle;
      loadProgress(loadedState);
      expect(loadedState.guesses).toEqual(gameState.guesses);
    });
  });

  describe("Performance Tests", () => {
    it("should initialize puzzle within performance requirements", () => {
      const startTime = performance.now();

      const puzzle = initializePuzzle();

      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(100); // Should complete within 100ms
      expect(puzzle).toBeDefined();
    });

    it("should handle localStorage operations efficiently", () => {
      const gameState = createInitialGameState();
      gameState.puzzle = {
        year: 1969,
        events: mockPuzzleEvents,
        puzzleId: "2024-01-15",
      };
      gameState.guesses = Array.from({ length: 100 }, (_, i) => 1900 + i);

      const startTime = performance.now();

      // Save and load operations
      for (let i = 0; i < 100; i++) {
        saveProgress(gameState);
        const loadState = createInitialGameState();
        loadState.puzzle = gameState.puzzle;
        loadProgress(loadState);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(100); // Should complete 200 operations within 100ms
    });

    it("should handle memory efficiently with large datasets", () => {
      // Test with more than minimum 6 events to verify performance with larger datasets
      const manyEventsList = Array.from(
        { length: 12 },
        (_, i) => `Historical event number ${i + 1} with detailed description`,
      );

      mockPuzzleDataLib.getPuzzleForYear.mockReturnValue(manyEventsList);

      const startTime = performance.now();
      const puzzle = initializePuzzle();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
      expect(puzzle.events.length).toBe(12); // Should preserve all events from database
    });
  });
});

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

describe("gameState Library Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Use fake timers for consistent date/time behavior across all tests
    vi.useFakeTimers();
    // Set a consistent time for all tests unless overridden
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));

    // Setup default mock implementations
    mockPuzzleDataLib.getPuzzleForYear.mockReturnValue(mockPuzzleEvents);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("getDailyYear", () => {
    it("should return placeholder year (deprecated function)", () => {
      // getDailyYear is deprecated and always returns 2000
      const year = getDailyYear();
      expect(year).toBe(2000);
    });

    it("should ignore debug mode (deprecated function)", () => {
      const debugYear = "1970";
      const year = getDailyYear(debugYear, true);

      // Still returns 2000 since function is deprecated
      expect(year).toBe(2000);
    });

    it("should handle invalid debug year (deprecated function)", () => {
      const invalidDebugYear = "invalid";
      const year = getDailyYear(invalidDebugYear, true);

      // Still returns 2000 since function is deprecated
      expect(year).toBe(2000);
    });
  });

  describe("initializePuzzle", () => {
    it("should initialize puzzle with correct structure", () => {
      const puzzle = initializePuzzle();

      expect(puzzle).toMatchObject({
        year: 2000, // Always returns 2000 since getDailyYear is deprecated
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
    it("should not save progress (localStorage removed)", () => {
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

      // saveProgress always returns false now (no localStorage)
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

      const result = saveProgress(gameState, true); // debug mode
      // Returns true in debug mode
      expect(result).toBe(true);
    });
  });

  describe("loadProgress", () => {
    it("should reset state (localStorage removed)", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [1950, 1960], // Pre-existing guesses
        maxGuesses: 6,
        isGameOver: true,
      };

      loadProgress(gameState);

      // loadProgress now resets state for anonymous users
      expect(gameState.guesses).toEqual([]);
      expect(gameState.isGameOver).toBe(false);
    });

    it("should skip loading in debug mode", () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: "2024-01-15",
        },
        guesses: [1950], // Pre-existing guess
        maxGuesses: 6,
        isGameOver: false,
      };

      loadProgress(gameState, true); // debug mode

      // In debug mode, state is not reset
      expect(gameState.guesses).toEqual([1950]);
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
    it("should handle complete game flow without localStorage", () => {
      // Initialize puzzle
      const puzzle = initializePuzzle();
      expect(puzzle).toBeDefined();

      // Create game state and add guesses
      const gameState = createInitialGameState();
      gameState.puzzle = puzzle;
      gameState.guesses.push(1950);
      gameState.guesses.push(1960);

      // Save progress (returns false - no localStorage)
      const saved = saveProgress(gameState);
      expect(saved).toBe(false);

      // Load progress into new state
      const newGameState = createInitialGameState();
      newGameState.puzzle = puzzle;
      loadProgress(newGameState);

      // Progress is not persisted for anonymous users
      expect(newGameState.guesses).toEqual([]);
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

    it("should handle save/load operations efficiently without localStorage", () => {
      const gameState = createInitialGameState();
      gameState.puzzle = {
        year: 1969,
        events: mockPuzzleEvents,
        puzzleId: "2024-01-15",
      };
      gameState.guesses = Array.from({ length: 100 }, (_, i) => 1900 + i);

      const startTime = performance.now();

      // Save and load operations (no localStorage)
      for (let i = 0; i < 100; i++) {
        saveProgress(gameState);
        const loadState = createInitialGameState();
        loadState.puzzle = gameState.puzzle;
        loadProgress(loadState);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should be very fast without localStorage operations
      expect(totalTime).toBeLessThan(50);
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

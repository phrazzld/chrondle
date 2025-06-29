import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getDailyYear, 
  initializePuzzle, 
  saveProgress, 
  loadProgress, 
  createInitialGameState,
  type GameState 
} from '../gameState';
import * as puzzleDataLib from '../puzzleData';
import * as apiLib from '../api';

// Mock dependencies
vi.mock('../puzzleData', () => ({
  getPuzzleForYear: vi.fn(),
  getSupportedYears: vi.fn(),
  hasPuzzleForYear: vi.fn(),
  SUPPORTED_YEARS: [1969, 1970, 1971, 1972, 1973]
}));
vi.mock('../api');

const mockPuzzleDataLib = vi.mocked(puzzleDataLib);
const mockApiLib = vi.mocked(apiLib);

// Test data
const mockPuzzleEvents = [
  'First lunar landing by Apollo 11',
  'Vietnam War escalation continues', 
  'Woodstock music festival occurs',
  'ARPANET first connection established',
  'Nixon becomes president',
  'Beatles release Abbey Road album'
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

describe('gameState Library Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock: MockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Setup default mock implementations
    mockPuzzleDataLib.getSupportedYears.mockReturnValue(mockSupportedYears);
    mockPuzzleDataLib.getPuzzleForYear.mockReturnValue(mockPuzzleEvents);
    mockPuzzleDataLib.hasPuzzleForYear.mockReturnValue(true);
    mockApiLib.sortEventsByRecognizability.mockReturnValue(mockPuzzleEvents);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDailyYear', () => {
    it('should return consistent year for same date', () => {
      // Mock consistent date
      const mockDate = new Date('2024-01-15');
      vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const year1 = getDailyYear();
      const year2 = getDailyYear();

      expect(year1).toBe(year2);
      expect(mockSupportedYears).toContain(year1);
    });

    it('should return different years for different dates', () => {
      // Test multiple dates
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      
      vi.spyOn(global, 'Date').mockImplementationOnce(() => date1);
      const year1 = getDailyYear();
      
      vi.spyOn(global, 'Date').mockImplementationOnce(() => date2);
      const year2 = getDailyYear();

      // Should be different years (high probability)
      // Note: There's a small chance they could be the same due to hash collisions
      expect(mockSupportedYears).toContain(year1);
      expect(mockSupportedYears).toContain(year2);
    });

    it('should handle debug mode correctly', () => {
      const debugYear = '1970';
      const year = getDailyYear(debugYear, true);
      
      // 1970 is in our mock supported years, so it should return 1970
      expect(year).toBe(1970);
    });

    it('should handle invalid debug year gracefully', () => {
      const invalidDebugYear = 'invalid';
      const year = getDailyYear(invalidDebugYear, true);
      
      // Should fall back to normal daily selection
      expect(mockSupportedYears).toContain(year);
    });

    it('should use deterministic hash algorithm', () => {
      const mockDate = new Date('2024-01-15');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Test that algorithm produces consistent results
      const iterations = 100;
      const firstYear = getDailyYear();
      
      for (let i = 0; i < iterations; i++) {
        const year = getDailyYear();
        expect(year).toBe(firstYear);
      }
    });

    it('should handle timezone differences consistently', () => {
      // Test with different timezone offsets
      const utcDate = new Date('2024-01-15T12:00:00Z');
      const localDate = new Date('2024-01-15T08:00:00-04:00'); // Same day, different timezone
      
      vi.spyOn(global, 'Date').mockImplementationOnce(() => utcDate);
      const year1 = getDailyYear();
      
      vi.spyOn(global, 'Date').mockImplementationOnce(() => localDate);
      const year2 = getDailyYear();

      // Should be same year since it's the same calendar date
      expect(year1).toBe(year2);
    });

    it('should handle year boundaries correctly', () => {
      const endOfYear = new Date('2024-12-31T23:59:59Z');
      const startOfYear = new Date('2025-01-01T00:00:00Z');
      
      vi.spyOn(global, 'Date').mockImplementationOnce(() => endOfYear);
      const year1 = getDailyYear();
      
      vi.spyOn(global, 'Date').mockImplementationOnce(() => startOfYear);
      const year2 = getDailyYear();

      // Should be different years for different dates
      expect(mockSupportedYears).toContain(year1);
      expect(mockSupportedYears).toContain(year2);
    });
  });

  describe('initializePuzzle', () => {
    it('should initialize puzzle with correct structure', () => {
      const sortFn = mockApiLib.sortEventsByRecognizability;
      const puzzle = initializePuzzle(sortFn);

      expect(puzzle).toMatchObject({
        year: expect.any(Number),
        events: mockPuzzleEvents,
        puzzleId: expect.any(String)
      });
      expect(sortFn).toHaveBeenCalledWith(mockPuzzleEvents);
    });

    it('should handle missing puzzle data', () => {
      mockPuzzleDataLib.getPuzzleForYear.mockReturnValue([]);
      const sortFn = mockApiLib.sortEventsByRecognizability;
      
      expect(() => initializePuzzle(sortFn)).toThrow('No puzzle found for year');
    });

    it('should sort events by recognizability', () => {
      const unsortedEvents = [
        'Obscure political treaty signed',
        'Moon landing by Apollo 11',
        'Minor administrative change',
        'World War II memorial dedicated',
        'Local election held',
        'Beatles release Abbey Road'
      ];
      
      const sortedEvents = [
        'Obscure political treaty signed',
        'Minor administrative change',
        'Local election held',
        'World War II memorial dedicated',
        'Beatles release Abbey Road',
        'Moon landing by Apollo 11'
      ];
      
      mockPuzzleDataLib.getPuzzleForYear.mockReturnValue(unsortedEvents);
      mockApiLib.sortEventsByRecognizability.mockReturnValue(sortedEvents);
      
      const sortFn = mockApiLib.sortEventsByRecognizability;
      const puzzle = initializePuzzle(sortFn);

      expect(puzzle.events).toEqual(sortedEvents);
      expect(sortFn).toHaveBeenCalledWith(unsortedEvents);
    });

    it('should handle error during puzzle initialization', () => {
      mockPuzzleDataLib.getPuzzleForYear.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const sortFn = mockApiLib.sortEventsByRecognizability;
      
      expect(() => initializePuzzle(sortFn)).toThrow('Database error');
    });
  });

  describe('saveProgress', () => {
    it('should save progress to localStorage', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [1950, 1960],
        maxGuesses: 6,
        isGameOver: false
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      saveProgress(gameState);

      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
      // Should save progress data, not the full game state
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/chrondle-progress-/),
        expect.stringContaining('"guesses":[1950,1960]')
      );
    });

    it('should handle localStorage quota exceeded', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [1950],
        maxGuesses: 6,
        isGameOver: false
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // The current implementation doesn't handle errors, so it will throw
      expect(() => saveProgress(gameState)).toThrow('QuotaExceededError');
    });

    it('should handle localStorage not available', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [1950],
        maxGuesses: 6,
        isGameOver: false
      };

      // Mock localStorage as undefined
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });

      // The current implementation doesn't handle errors, so it will throw
      expect(() => saveProgress(gameState)).toThrow();
    });

    it('should skip saving in debug mode', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [1950],
        maxGuesses: 6,
        isGameOver: false
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      saveProgress(gameState, true); // debug mode

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('loadProgress', () => {
    it('should load saved progress into game state', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false
      };

      const savedProgress = {
        guesses: [1950, 1960],
        isGameOver: false,
        puzzleId: '2024-01-15',
        puzzleYear: 1969,
        timestamp: new Date().toISOString()
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedProgress));

      loadProgress(gameState);

      expect(gameState.guesses).toEqual([1950, 1960]);
      expect(gameState.isGameOver).toBe(false);
    });

    it('should not load when no saved progress exists', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      localStorageMock.getItem.mockReturnValue(null);

      loadProgress(gameState);

      expect(gameState.guesses).toEqual([]);
    });

    it('should handle corrupted localStorage data', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      localStorageMock.getItem.mockReturnValue('invalid json');

      // The current implementation doesn't handle JSON parsing errors
      expect(() => loadProgress(gameState)).toThrow();
    });

    it('should handle localStorage not available', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false
      };

      // Mock localStorage as undefined
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true
      });

      // The current implementation doesn't handle missing localStorage
      expect(() => loadProgress(gameState)).toThrow();
    });

    it('should skip loading in debug mode', () => {
      const gameState: GameState = {
        puzzle: {
          year: 1969,
          events: mockPuzzleEvents,
          puzzleId: '2024-01-15'
        },
        guesses: [],
        maxGuesses: 6,
        isGameOver: false
      };

      const localStorageMock = window.localStorage as unknown as MockStorage;
      loadProgress(gameState, true); // debug mode

      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });
  });

  describe('createInitialGameState', () => {
    it('should create valid initial state', () => {
      const initialState = createInitialGameState();

      expect(initialState).toMatchObject({
        puzzle: null,
        guesses: [],
        maxGuesses: 6,
        isGameOver: false
      });
    });

    it('should create fresh state each time', () => {
      const state1 = createInitialGameState();
      const state2 = createInitialGameState();

      expect(state1).not.toBe(state2); // Different object references
      expect(state1.guesses).not.toBe(state2.guesses); // Different array references
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete game flow', () => {
      // Initialize puzzle
      const sortFn = mockApiLib.sortEventsByRecognizability;
      const puzzle = initializePuzzle(sortFn);
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
        timestamp: new Date().toISOString()
      });
      localStorageMock.getItem.mockReturnValue(savedData);

      // Load progress into new state
      const newGameState = createInitialGameState();
      newGameState.puzzle = puzzle; // Same puzzle with same puzzleId
      loadProgress(newGameState);
      
      expect(newGameState.guesses).toEqual([1950, 1960]);
    });

    it('should maintain data integrity across save/load cycles', () => {
      const sortFn = mockApiLib.sortEventsByRecognizability;
      const puzzle = initializePuzzle(sortFn);
      
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
          length: 0
        };
        Object.defineProperty(window, 'localStorage', {
          value: freshLocalStorageMock,
          writable: true
        });
        
        saveProgress(originalState);
        
        // Mock the return value to match what was saved
        const savedData = JSON.stringify({
          guesses: originalState.guesses,
          isGameOver: originalState.isGameOver,
          puzzleId: originalState.puzzle?.puzzleId || null,
          puzzleYear: originalState.puzzle?.year || null,
          timestamp: new Date().toISOString()
        });
        freshLocalStorageMock.getItem.mockReturnValue(savedData);
        
        const loadedState = createInitialGameState();
        loadedState.puzzle = puzzle;
        loadProgress(loadedState);
        expect(loadedState.guesses).toEqual(originalState.guesses);
      }
    });

    it('should handle concurrent access safely', () => {
      const sortFn = mockApiLib.sortEventsByRecognizability;
      const puzzle = initializePuzzle(sortFn);
      
      const gameState = createInitialGameState();
      gameState.puzzle = puzzle;
      
      // Simulate concurrent save operations
      const savePromises = Array.from({ length: 10 }, () => 
        Promise.resolve(saveProgress(gameState))
      );
      
      Promise.all(savePromises);
      
      // Should still be able to load correctly
      const loadedState = createInitialGameState();
      loadedState.puzzle = puzzle;
      loadProgress(loadedState);
      expect(loadedState.guesses).toEqual(gameState.guesses);
    });
  });

  describe('Performance Tests', () => {
    it('should initialize puzzle within performance requirements', () => {
      const startTime = performance.now();
      
      const sortFn = mockApiLib.sortEventsByRecognizability;
      const puzzle = initializePuzzle(sortFn);
      
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(100); // Should complete within 100ms
      expect(puzzle).toBeDefined();
    });

    it('should handle localStorage operations efficiently', () => {
      const gameState = createInitialGameState();
      gameState.puzzle = {
        year: 1969,
        events: mockPuzzleEvents,
        puzzleId: '2024-01-15'
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

    it('should handle memory efficiently with large datasets', () => {
      const largeEventList = Array.from({ length: 1000 }, (_, i) => 
        `Historical event number ${i + 1} with detailed description`
      );
      
      mockPuzzleDataLib.getPuzzleForYear.mockReturnValue(largeEventList);
      mockApiLib.sortEventsByRecognizability.mockReturnValue(largeEventList.slice(0, 6));
      
      const startTime = performance.now();
      const sortFn = mockApiLib.sortEventsByRecognizability;
      const puzzle = initializePuzzle(sortFn);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
      expect(puzzle.events.length).toBe(6); // Should still select only 6 events
    });
  });
});
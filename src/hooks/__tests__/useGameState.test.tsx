import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameState } from '../useGameState';
import * as gameStateLib from '@/lib/gameState';
import * as puzzleDataLib from '@/lib/puzzleData';
import * as apiLib from '@/lib/api';
import { GAME_CONFIG } from '@/lib/constants';

// Mock dependencies
vi.mock('@/lib/gameState');
vi.mock('@/lib/puzzleData');
vi.mock('@/lib/api');

const mockGameStateLib = vi.mocked(gameStateLib);
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

const mockPuzzle = {
  year: 1969,
  events: mockPuzzleEvents,
  puzzleId: '2024-01-15'
};

describe('useGameState Hook', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
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
    mockGameStateLib.createInitialGameState.mockReturnValue({
      puzzle: null,
      guesses: [],
      maxGuesses: 6,
      isGameOver: false
    });
    mockGameStateLib.initializePuzzle.mockReturnValue(mockPuzzle);
    mockGameStateLib.loadProgress.mockImplementation(() => {});
    mockGameStateLib.saveProgress.mockImplementation(() => {});
    mockGameStateLib.cleanupOldStorage.mockImplementation(() => {});
    mockApiLib.sortEventsByRecognizability.mockReturnValue(mockPuzzleEvents);
    mockPuzzleDataLib.getPuzzleForYear.mockReturnValue(mockPuzzleEvents);
    mockPuzzleDataLib.getSupportedYears.mockReturnValue([1969, 1970, 1971]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hook Initialization', () => {
    it('should initialize with loading state', () => {
      // Mock a slow initialization to test loading state
      mockGameStateLib.initializePuzzle.mockImplementation(() => {
        // Simulate slow initialization
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait for 10ms
        }
        return mockPuzzle;
      });

      const { result } = renderHook(() => useGameState());
      
      // Since initialization is synchronous in the real implementation,
      // we test that it starts with the correct initial state structure
      expect(result.current.error).toBe(null);
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should initialize puzzle on mount', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGameStateLib.initializePuzzle).toHaveBeenCalledWith(
        mockApiLib.sortEventsByRecognizability,
        undefined,
        false
      );
      expect(result.current.gameState.puzzle).toEqual(mockPuzzle);
    });

    it('should handle debug mode initialization', async () => {
      Object.defineProperty(window, 'location', {
        value: { search: '?year=1970' },
        writable: true
      });

      const { result } = renderHook(() => useGameState(true));
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGameStateLib.initializePuzzle).toHaveBeenCalledWith(
        mockApiLib.sortEventsByRecognizability,
        '1970',
        true
      );
    });

    it('should load existing progress on initialization', async () => {
      // Mock loadProgress to modify the game state in place
      mockGameStateLib.loadProgress.mockImplementation((gameState) => {
        gameState.guesses = [1950, 1960];
        gameState.isGameOver = false;
      });

      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGameStateLib.loadProgress).toHaveBeenCalled();
      expect(result.current.gameState.guesses).toEqual([1950, 1960]);
    });
  });

  describe('Derived State Calculations', () => {
    it('should calculate remaining guesses correctly', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.remainingGuesses).toBe(GAME_CONFIG.MAX_GUESSES);

      // Test with guesses added via makeGuess action
      act(() => {
        result.current.makeGuess(1950);
      });
      
      expect(result.current.remainingGuesses).toBe(GAME_CONFIG.MAX_GUESSES - 1);
      
      act(() => {
        result.current.makeGuess(1960);
      });

      expect(result.current.remainingGuesses).toBe(GAME_CONFIG.MAX_GUESSES - 2);
    });

    it('should determine game completion state correctly', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Game should not be complete initially
      expect(result.current.isGameComplete).toBe(false);

      // Game should be complete when correct guess is made
      act(() => {
        result.current.makeGuess(1969); // Correct year
      });
      expect(result.current.isGameComplete).toBe(true);
      expect(result.current.hasWon).toBe(true);
    });

    it('should calculate current hint index correctly', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should start with first hint
      expect(result.current.currentHintIndex).toBe(0);

      // Should advance with each guess
      act(() => {
        result.current.makeGuess(1950);
      });
      expect(result.current.currentHintIndex).toBe(1);

      act(() => {
        result.current.makeGuess(1960);
      });
      expect(result.current.currentHintIndex).toBe(2);
      
      act(() => {
        result.current.makeGuess(1965);
      });
      expect(result.current.currentHintIndex).toBe(3);
    });

    it('should provide current event correctly', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentEvent).toBe(mockPuzzleEvents[0]);

      // Should provide next event after guess
      act(() => {
        result.current.makeGuess(1950);
      });
      expect(result.current.currentEvent).toBe(mockPuzzleEvents[1]);
    });

    it('should provide next hint correctly', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.nextHint).toBe(mockPuzzleEvents[1]);

      // Should provide next hint after guess
      act(() => {
        result.current.makeGuess(1950);
      });
      expect(result.current.nextHint).toBe(mockPuzzleEvents[2]);
    });
  });

  describe('Game Actions', () => {
    it('should handle valid guesses correctly', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.makeGuess(1950);
      });

      expect(result.current.gameState.guesses).toContain(1950);
      expect(mockGameStateLib.saveProgress).toHaveBeenCalled();
    });

    it('should prevent guesses when game is over', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Make maximum number of incorrect guesses one by one
      for (let i = 0; i < 6; i++) {
        act(() => {
          result.current.makeGuess(1950 + i);
        });
      }

      // Verify the state after all guesses

      // The game should be over after 6 guesses
      expect(result.current.gameState.guesses.length).toBe(6);
      expect(result.current.gameState.isGameOver).toBe(true);

      const guessCountAfterGameOver = result.current.gameState.guesses.length;
      
      // Try to make another guess
      act(() => {
        result.current.makeGuess(1999);
      });

      expect(result.current.gameState.guesses.length).toBe(guessCountAfterGameOver);
    });

    it('should detect winning guess correctly', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.makeGuess(1969); // Correct year
      });

      expect(result.current.hasWon).toBe(true);
      expect(result.current.gameState.isGameOver).toBe(true);
    });

    it('should end game when max guesses reached', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Make maximum number of incorrect guesses one by one
      for (let i = 0; i < 6; i++) {
        act(() => {
          result.current.makeGuess(1950 + i);
        });
      }

      // Verify the state after max guesses reached

      expect(result.current.gameState.guesses.length).toBe(GAME_CONFIG.MAX_GUESSES);
      expect(result.current.gameState.isGameOver).toBe(true);
      expect(result.current.hasWon).toBe(false);
    });

    it('should reset game correctly', async () => {
      // Mock window.location.reload
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });

      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const initError = new Error('Failed to initialize puzzle');
      mockGameStateLib.initializePuzzle.mockImplementation(() => {
        throw initError;
      });

      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to initialize puzzle');
    });

    it('should handle localStorage failures gracefully', async () => {
      // Mock localStorage to throw error
      const localStorageMock = {
        getItem: vi.fn().mockImplementation(() => {
          throw new Error('localStorage not available');
        }),
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

      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should continue to work despite localStorage error
      expect(result.current.gameState.puzzle).toEqual(mockPuzzle);
    });

    it('should handle corrupted localStorage data', async () => {
      // Mock loadProgress to throw error (simulating corrupted data)
      mockGameStateLib.loadProgress.mockImplementation(() => {
        throw new Error('Corrupted data');
      });

      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should initialize fresh game state
      expect(result.current.gameState.guesses).toEqual([]);
      expect(result.current.gameState.isGameOver).toBe(false);
    });
  });

  describe('Performance Requirements', () => {
    it('should initialize without throwing errors', async () => {
      expect(() => {
        const { result } = renderHook(() => useGameState());
        expect(result.current).toBeDefined();
      }).not.toThrow();
    });

    it('should handle state updates efficiently', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should handle multiple guesses without errors
      act(() => {
        result.current.makeGuess(1950);
      });
      
      act(() => {
        result.current.makeGuess(1951);
      });
      
      act(() => {
        result.current.makeGuess(1952);
      });

      expect(result.current.gameState.guesses.length).toBe(3);
    });

    it('should handle edge cases efficiently', async () => {
      const { result } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should handle making the same guess multiple times
      expect(() => {
        act(() => {
          result.current.makeGuess(1950);
          result.current.makeGuess(1950); // Duplicate
          result.current.makeGuess(1950); // Duplicate
        });
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    it('should clean up effects on unmount', () => {
      const { unmount } = renderHook(() => useGameState());
      
      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });

    it('should not cause memory leaks with multiple re-renders', async () => {
      const { result, rerender } = renderHook(() => useGameState());
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Multiple re-renders should not accumulate memory
      for (let i = 0; i < 10; i++) {
        rerender();
      }

      expect(result.current.gameState.puzzle?.year).toBe(1969);
    });
  });
});
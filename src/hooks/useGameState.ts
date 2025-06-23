'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, createInitialGameState, initializePuzzle, saveProgress, loadProgress, cleanupOldStorage } from '@/lib/gameState';
import { sortEventsByRecognizability } from '@/lib/api';
import { GAME_CONFIG } from '@/lib/constants';

export interface UseGameStateReturn {
  gameState: GameState;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  makeGuess: (guess: number) => void;
  resetGame: () => void;
  
  // Derived state
  remainingGuesses: number;
  isGameComplete: boolean;
  hasWon: boolean;
  currentEvent: string | null;
  currentHintIndex: number;
  nextHint: string | null;
}

export function useGameState(debugMode: boolean = false): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize puzzle on mount
  useEffect(() => {
    function initGame() {
      try {
        setIsLoading(true);
        setError(null);

        // Clean up old storage entries
        cleanupOldStorage();

        // Parse URL parameters for debug mode
        let debugYear: string | undefined;
        if (typeof window !== 'undefined' && debugMode) {
          const urlParams = new URLSearchParams(window.location.search);
          debugYear = urlParams.get('year') || undefined;
        }

        // Initialize puzzle from static database (synchronous)
        const puzzle = initializePuzzle(sortEventsByRecognizability, debugYear, debugMode);

        // Create new game state with puzzle
        const newGameState = { ...createInitialGameState(), puzzle };
        
        // Load progress after puzzle is set
        loadProgress(newGameState, debugMode);
        
        setGameState(newGameState);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize game';
        console.error('Game initialization error:', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    initGame();
  }, [debugMode]);

  // Save progress whenever game state changes
  useEffect(() => {
    if (gameState.puzzle && !isLoading) {
      saveProgress(gameState, debugMode);
    }
  }, [gameState, debugMode, isLoading]);

  // Make a guess
  const makeGuess = useCallback((guess: number) => {
    if (!gameState.puzzle || gameState.isGameOver) return;

    const newGuesses = [...gameState.guesses, guess];
    const isCorrect = guess === gameState.puzzle.year;
    const isLastGuess = newGuesses.length >= GAME_CONFIG.MAX_GUESSES;
    const isGameOver = isCorrect || isLastGuess;

    setGameState(prevState => ({
      ...prevState,
      guesses: newGuesses,
      isGameOver
    }));
  }, [gameState.puzzle, gameState.isGameOver, gameState.guesses]);

  // Reset game (primarily for debug purposes)
  const resetGame = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  // Derived state using useMemo for performance
  const derivedState = useMemo(() => {
    const remainingGuesses = GAME_CONFIG.MAX_GUESSES - gameState.guesses.length;
    const isGameComplete = gameState.isGameOver;
    const hasWon = gameState.puzzle ? gameState.guesses.includes(gameState.puzzle.year) : false;
    
    // Current hint index: start with 0, then add 1 for each guess made
    const currentHintIndex = Math.min(gameState.guesses.length, 5); // max index is 5 (for 6 hints)
    
    // Current event: the hint that should be shown now
    const currentEvent = gameState.puzzle?.events[currentHintIndex] || null;
    
    // Next hint (event corresponding to next reveal)
    const nextHint = gameState.puzzle?.events[currentHintIndex + 1] || null;

    return {
      remainingGuesses,
      isGameComplete,
      hasWon,
      currentEvent,
      currentHintIndex,
      nextHint
    };
  }, [gameState.guesses, gameState.isGameOver, gameState.puzzle]);

  return {
    gameState,
    isLoading,
    error,
    makeGuess,
    resetGame,
    ...derivedState
  };
}
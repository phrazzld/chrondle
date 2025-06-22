'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, createInitialGameState, initializePuzzle, saveProgress, loadProgress, cleanupOldStorage } from '@/lib/gameState';
import { getHistoricalEvents, sortEventsByRecognizability } from '@/lib/api';
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
  nextHint: string | null;
}

export function useGameState(debugMode: boolean = false): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize puzzle on mount
  useEffect(() => {
    let isCancelled = false;

    async function initGame() {
      try {
        setIsLoading(true);
        setError(null);

        // Clean up old storage entries
        cleanupOldStorage();

        // Initialize puzzle
        const puzzle = await initializePuzzle(getHistoricalEvents, sortEventsByRecognizability);
        
        if (isCancelled) return;

        setGameState(prevState => ({
          ...prevState,
          puzzle
        }));

        // Load progress after puzzle is set
        const newGameState = { ...createInitialGameState(), puzzle };
        loadProgress(newGameState, debugMode);
        
        if (isCancelled) return;
        
        setGameState(newGameState);

      } catch (err) {
        if (isCancelled) return;
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize game';
        console.error('Game initialization error:', err);
        setError(errorMessage);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    initGame();

    return () => {
      isCancelled = true;
    };
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
    
    // Current event (always the first event)
    const currentEvent = gameState.puzzle?.events[0] || null;
    
    // Next hint (event corresponding to current guess count)
    const nextHint = gameState.puzzle?.events[gameState.guesses.length + 1] || null;

    return {
      remainingGuesses,
      isGameComplete,
      hasWon,
      currentEvent,
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
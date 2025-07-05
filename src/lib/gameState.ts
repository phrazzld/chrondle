// Game State Management for Chrondle
// Static puzzle database with pre-curated historical events

import { getPuzzleForYear, SUPPORTED_YEARS } from './puzzleData';
import { logger } from './logger';

export interface Puzzle {
  year: number;
  events: string[];
  puzzleId: string;
}

export interface GameState {
  puzzle: Puzzle | null;
  guesses: number[];
  maxGuesses: number;
  isGameOver: boolean;
}

export interface Progress {
  guesses: number[];
  isGameOver: boolean;
  puzzleId: string | null;
  puzzleYear: number | null;
  timestamp: string;
  // Closest guess tracking for enhanced sharing
  closestGuess?: number;
  closestDistance?: number;
}

export interface Settings {
  darkMode: boolean;
  colorBlindMode: boolean;
}

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    puzzle: null,
    guesses: [],
    maxGuesses: 6,
    isGameOver: false,
  };
}

// Deterministic daily year selection from pre-curated puzzle database
export function getDailyYear(debugYear?: string, isDebugMode?: boolean): number {
  // Handle debug mode forced year
  if (debugYear && isDebugMode) {
    const parsedYear = parseInt(debugYear, 10);
    if (!isNaN(parsedYear)) {
      // Check if debug year has a puzzle in the static database
      if (SUPPORTED_YEARS.includes(parsedYear)) {
        return parsedYear;
      } else {
      }
    } else {
    }
  }

  const today = new Date();
  
  
  // Reset time to midnight to ensure consistency across timezones
  today.setHours(0, 0, 0, 0);
  
  // Generate deterministic hash from date
  const dateHash = Math.abs([...today.toISOString().slice(0,10)].reduce((a,b)=>(a<<5)+a+b.charCodeAt(0),5381));
  
  // Select from years that have puzzles (20 years)
  const yearIndex = dateHash % SUPPORTED_YEARS.length;
  const selectedYear = SUPPORTED_YEARS[yearIndex];
  
  
  return selectedYear;
}

// Initialize daily puzzle from static database
export function initializePuzzle(
  sortEventsByRecognizability: (events: string[]) => string[],
  debugYear?: string,
  isDebugMode?: boolean
): Puzzle {
  
  // Get the daily year (with debug support)
  const targetYear = getDailyYear(debugYear, isDebugMode);
  
  // Load events from static database
  const events = getPuzzleForYear(targetYear);
  
  if (events.length === 0) {
    // This should never happen with a properly curated database
    throw new Error(`No puzzle found for year ${targetYear}. This indicates a bug in the puzzle database or daily selection logic.`);
  }
  
  logger.debug(`🔍 DEBUG: Loaded ${events.length} events for year ${targetYear} from static database`);
  
  // Sort events by recognizability (most obscure first, easiest last)
  const sortedEvents = sortEventsByRecognizability(events);
  logger.debug(`🔍 DEBUG: Sorted ${sortedEvents.length} events by difficulty (obscure to obvious) for year ${targetYear}`);
  
  // Generate simple puzzle ID for today (just the date)
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
  
  // Create puzzle object
  const puzzle: Puzzle = {
    year: targetYear,
    events: sortedEvents, // Already exactly 6 events from database
    puzzleId: dateString
  };
  
  logger.debug(`🔍 DEBUG: Puzzle initialized successfully:`, puzzle);
  return puzzle;
}

// Local Storage Management
export function getStorageKey(): string {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const storageKey = `chrondle-progress-${dateString}`;
  logger.debug(`Storage key generated: ${storageKey}`);
  return storageKey;
}

export function saveProgress(gameState: GameState, isDebugMode?: boolean): void {
  if (isDebugMode) { 
    logger.debug('Debug mode: skipping localStorage save'); 
    return; 
  }

  // Calculate closest guess for persistence
  let closestGuess: number | undefined;
  let closestDistance: number | undefined;
  
  if (gameState.guesses.length > 0 && gameState.puzzle) {
    try {
      let bestDistance = Infinity;
      let bestGuess = gameState.guesses[0];
      
      for (const guess of gameState.guesses) {
        const distance = Math.abs(guess - gameState.puzzle.year);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestGuess = guess;
        }
      }
      
      closestGuess = bestGuess;
      closestDistance = bestDistance;
    } catch (error) {
      console.warn('Failed to calculate closest guess for save:', error);
    }
  }

  const progress: Progress = {
    guesses: gameState.guesses,
    isGameOver: gameState.isGameOver,
    puzzleId: gameState.puzzle ? gameState.puzzle.puzzleId : null,
    puzzleYear: gameState.puzzle ? gameState.puzzle.year : null,
    timestamp: new Date().toISOString(),
    closestGuess,
    closestDistance
  };
  
  logger.debug(`Saving progress:`, progress);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(getStorageKey(), JSON.stringify(progress));
  }
}

export function loadProgress(gameState: GameState, isDebugMode?: boolean): void {
  if (isDebugMode) { 
    logger.debug('Debug mode: skipping localStorage load'); 
    return; 
  }

  if (typeof window === 'undefined') return;

  const storageKey = getStorageKey();
  const savedProgress = localStorage.getItem(storageKey);
  logger.debug(`Loading progress for key: ${storageKey}`);
  logger.debug(`Found saved progress:`, savedProgress);
  
  // DEBUG: Log all chrondle keys in localStorage
  const allChrondles: Array<{key: string, value: string | null}> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chrondle-')) {
      allChrondles.push({key, value: localStorage.getItem(key)});
    }
  }
  logger.debug(`All chrondle localStorage entries:`, allChrondles);
  
  if (savedProgress) {
    const progress: Progress = JSON.parse(savedProgress);
    logger.debug(`Parsed progress:`, progress);
    
    // Validate that the saved progress matches the current puzzle
    const currentPuzzleId = gameState.puzzle ? gameState.puzzle.puzzleId : null;
    const currentPuzzleYear = gameState.puzzle ? gameState.puzzle.year : null;
    
    logger.debug(`Current puzzle - ID: ${currentPuzzleId}, Year: ${currentPuzzleYear}`);
    logger.debug(`Saved puzzle - ID: ${progress.puzzleId}, Year: ${progress.puzzleYear}`);
    
    // Check if this progress belongs to the current puzzle
    const isValidProgress = progress.puzzleId === currentPuzzleId && 
                          progress.puzzleYear === currentPuzzleYear;
    
    if (isValidProgress) {
      logger.debug(`Progress is valid for current puzzle`);
      gameState.guesses = progress.guesses || [];
      gameState.isGameOver = progress.isGameOver || false;
      logger.debug(`Loaded ${gameState.guesses.length} guesses, game over: ${gameState.isGameOver}`);
    } else {
      logger.debug(`Progress is invalid for current puzzle - clearing old progress`);
      // Clear the invalid progress
      localStorage.removeItem(storageKey);
      // Reset game state to fresh start
      gameState.guesses = [];
      gameState.isGameOver = false;
    }
  } else {
    logger.debug(`No saved progress found for today`);
  }
}

// Settings Management
export function saveSettings(settings: Settings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chrondle-settings', JSON.stringify(settings));
  }
}

export function loadSettings(): Settings | null {
  if (typeof window === 'undefined') return null;
  
  const settingsData = localStorage.getItem('chrondle-settings');
  if (settingsData) {
    return JSON.parse(settingsData) as Settings;
  }
  return null;
}

// Storage cleanup
export function cleanupOldStorage(): void {
  if (typeof window === 'undefined') return;

  const today = new Date().toISOString().slice(0, 10);
  const todayKey = `chrondle-progress-${today}`;
  
  logger.debug(`Cleaning up old localStorage entries, keeping: ${todayKey}`);
  
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chrondle-progress-') && key !== todayKey) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    logger.debug(`🗑️ Removed old storage entry: ${key}`);
  });
  
  if (keysToRemove.length > 0) {
    logger.debug(`Cleaned up ${keysToRemove.length} old entries`);
  }
}

// Debug utilities (for window.chrondle object)
export function createDebugUtilities(gameState: GameState) {
  return {
    reset: () => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    },
    state: () => logger.info('Game state:', gameState),
    clearStorage: () => {
      if (typeof window === 'undefined') return [];
      
      const keys = Object.keys(localStorage).filter(k => k.startsWith('chrondle-'));
      keys.forEach(k => localStorage.removeItem(k)); 
      logger.info(`🗑️ Cleared ${keys.length} chrondle storage entries:`, keys); 
      return keys;
    },
    setYear: (year: number) => { 
      if (gameState.puzzle) {
        gameState.puzzle.year = year; 
        logger.info(`Forced year to ${year}`); 
      }
    },
    testYear: (year: number) => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('debug', 'true');
        url.searchParams.set('year', year.toString());
        window.location.href = url.toString();
      }
    },
    debug: () => {
      logger.info('🔍 Current date:', new Date().toISOString());
      logger.info('🔍 Storage key:', getStorageKey());
      logger.info('🔍 Game state:', gameState);
      
      if (typeof window !== 'undefined') {
        const allChrondles: Array<{key: string, value: string | null}> = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('chrondle-')) {
            allChrondles.push({key, value: localStorage.getItem(key)});
          }
        }
        logger.info('🔍 All chrondle localStorage:', allChrondles);
      }
    }
  };
}

// Mark first time player
export function markFirstTimePlayer(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('chrondle-has-played', 'true');
  }
}

// Check if player has played before
export function hasPlayedBefore(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('chrondle-has-played') === 'true';
}
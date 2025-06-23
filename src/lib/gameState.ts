// Game State Management for Chrondle
// Static puzzle database with pre-curated historical events

import { getPuzzleForYear, SUPPORTED_YEARS } from './puzzleData';
import { CURATED_HISTORICAL_YEARS } from './curatedYears';

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
      // Check if debug year is in curated years list
      if (CURATED_HISTORICAL_YEARS.includes(parsedYear)) {
        console.log(`🔍 DEBUG: Forcing year to ${parsedYear}`);
        return parsedYear;
      } else {
        console.warn(`🔍 DEBUG: Debug year ${parsedYear} not in curated years, falling back to daily selection`);
      }
    } else {
      console.warn(`🔍 DEBUG: Invalid debug year parameter '${debugYear}', falling back to daily selection`);
    }
  }

  const today = new Date();
  
  // DEBUG: Log the raw date before modification
  console.log(`🔍 DEBUG: Raw today date: ${today.toISOString()}`);
  console.log(`🔍 DEBUG: Today's date string: ${today.toISOString().slice(0, 10)}`);
  
  // Reset time to midnight to ensure consistency across timezones
  today.setHours(0, 0, 0, 0);
  
  // Generate deterministic hash from date
  const dateHash = Math.abs([...today.toISOString().slice(0,10)].reduce((a,b)=>(a<<5)+a+b.charCodeAt(0),5381));
  
  // Select from years that have puzzles (20 years)
  const yearIndex = dateHash % SUPPORTED_YEARS.length;
  const selectedYear = SUPPORTED_YEARS[yearIndex];
  
  console.log(`🔍 DEBUG: Date: ${today.toISOString().slice(0,10)}, Hash: ${dateHash}, Index: ${yearIndex}/${SUPPORTED_YEARS.length}, Selected year: ${selectedYear}`);
  
  return selectedYear;
}

// Initialize daily puzzle from static database
export function initializePuzzle(
  sortEventsByRecognizability: (events: string[]) => string[],
  debugYear?: string,
  isDebugMode?: boolean
): Puzzle {
  console.log('🔍 DEBUG: Initializing daily puzzle from static database...');
  
  // Get the daily year (with debug support)
  const targetYear = getDailyYear(debugYear, isDebugMode);
  console.log(`🔍 DEBUG: Target year for today: ${targetYear}`);
  
  // Load events from static database
  const events = getPuzzleForYear(targetYear);
  
  if (events.length === 0) {
    // This should never happen with a properly curated database
    throw new Error(`No puzzle found for year ${targetYear}. This indicates a bug in the puzzle database or daily selection logic.`);
  }
  
  console.log(`🔍 DEBUG: Loaded ${events.length} events for year ${targetYear} from static database`);
  
  // Sort events by recognizability (most obscure first, easiest last)
  const sortedEvents = sortEventsByRecognizability(events);
  console.log(`🔍 DEBUG: Sorted ${sortedEvents.length} events by difficulty (obscure to obvious) for year ${targetYear}`);
  
  // Generate simple puzzle ID for today (just the date)
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
  
  // Create puzzle object
  const puzzle: Puzzle = {
    year: targetYear,
    events: sortedEvents, // Already exactly 6 events from database
    puzzleId: dateString
  };
  
  console.log(`🔍 DEBUG: Puzzle initialized successfully:`, puzzle);
  return puzzle;
}

// Local Storage Management
export function getStorageKey(): string {
  const today = new Date();
  const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const storageKey = `chrondle-progress-${dateString}`;
  console.log(`🔍 DEBUG: Storage key generated: ${storageKey}`);
  return storageKey;
}

export function saveProgress(gameState: GameState, isDebugMode?: boolean): void {
  if (isDebugMode) { 
    console.log('Debug mode: skipping localStorage save'); 
    return; 
  }

  const progress: Progress = {
    guesses: gameState.guesses,
    isGameOver: gameState.isGameOver,
    puzzleId: gameState.puzzle ? gameState.puzzle.puzzleId : null,
    puzzleYear: gameState.puzzle ? gameState.puzzle.year : null,
    timestamp: new Date().toISOString()
  };
  
  console.log(`🔍 DEBUG: Saving progress:`, progress);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(getStorageKey(), JSON.stringify(progress));
  }
}

export function loadProgress(gameState: GameState, isDebugMode?: boolean): void {
  if (isDebugMode) { 
    console.log('Debug mode: skipping localStorage load'); 
    return; 
  }

  if (typeof window === 'undefined') return;

  const storageKey = getStorageKey();
  const savedProgress = localStorage.getItem(storageKey);
  console.log(`🔍 DEBUG: Loading progress for key: ${storageKey}`);
  console.log(`🔍 DEBUG: Found saved progress:`, savedProgress);
  
  // DEBUG: Log all chrondle keys in localStorage
  const allChrondles: Array<{key: string, value: string | null}> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chrondle-')) {
      allChrondles.push({key, value: localStorage.getItem(key)});
    }
  }
  console.log(`🔍 DEBUG: All chrondle localStorage entries:`, allChrondles);
  
  if (savedProgress) {
    const progress: Progress = JSON.parse(savedProgress);
    console.log(`🔍 DEBUG: Parsed progress:`, progress);
    
    // Validate that the saved progress matches the current puzzle
    const currentPuzzleId = gameState.puzzle ? gameState.puzzle.puzzleId : null;
    const currentPuzzleYear = gameState.puzzle ? gameState.puzzle.year : null;
    
    console.log(`🔍 DEBUG: Current puzzle - ID: ${currentPuzzleId}, Year: ${currentPuzzleYear}`);
    console.log(`🔍 DEBUG: Saved puzzle - ID: ${progress.puzzleId}, Year: ${progress.puzzleYear}`);
    
    // Check if this progress belongs to the current puzzle
    const isValidProgress = progress.puzzleId === currentPuzzleId && 
                          progress.puzzleYear === currentPuzzleYear;
    
    if (isValidProgress) {
      console.log(`🔍 DEBUG: Progress is valid for current puzzle`);
      gameState.guesses = progress.guesses || [];
      gameState.isGameOver = progress.isGameOver || false;
      console.log(`🔍 DEBUG: Loaded ${gameState.guesses.length} guesses, game over: ${gameState.isGameOver}`);
    } else {
      console.log(`🔍 DEBUG: Progress is invalid for current puzzle - clearing old progress`);
      // Clear the invalid progress
      localStorage.removeItem(storageKey);
      // Reset game state to fresh start
      gameState.guesses = [];
      gameState.isGameOver = false;
    }
  } else {
    console.log(`🔍 DEBUG: No saved progress found for today`);
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
  
  console.log(`🔍 DEBUG: Cleaning up old localStorage entries, keeping: ${todayKey}`);
  
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('chrondle-progress-') && key !== todayKey) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed old storage entry: ${key}`);
  });
  
  if (keysToRemove.length > 0) {
    console.log(`🔍 DEBUG: Cleaned up ${keysToRemove.length} old entries`);
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
    state: () => console.log(gameState),
    clearStorage: () => {
      if (typeof window === 'undefined') return [];
      
      const keys = Object.keys(localStorage).filter(k => k.startsWith('chrondle-'));
      keys.forEach(k => localStorage.removeItem(k)); 
      console.log(`🗑️ Cleared ${keys.length} chrondle storage entries:`, keys); 
      return keys;
    },
    setYear: (year: number) => { 
      if (gameState.puzzle) {
        gameState.puzzle.year = year; 
        console.log(`Forced year to ${year}`); 
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
      console.log('🔍 Current date:', new Date().toISOString());
      console.log('🔍 Storage key:', getStorageKey());
      console.log('🔍 Game state:', gameState);
      
      if (typeof window !== 'undefined') {
        const allChrondles: Array<{key: string, value: string | null}> = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('chrondle-')) {
            allChrondles.push({key, value: localStorage.getItem(key)});
          }
        }
        console.log('🔍 All chrondle localStorage:', allChrondles);
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
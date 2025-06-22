// Game State Management for Chrondle
// Extracted from index.html lines ~150-250, 777-920, 1015-1480

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

// Curated years known to have significant historical events
// Selected for variety across eras and likelihood of having 6+ events from API
export const CURATED_YEARS = [
  // Ancient/Classical Era
  -776, -753, -221, -44,  // BC years (negative)
  
  // Medieval Era
  800, 1066, 1215, 1347, 1453,
  
  // Renaissance/Early Modern
  1492, 1517, 1588, 1607, 1620,
  
  // Enlightenment/Revolution Era
  1776, 1789, 1804, 1815, 1848,
  
  // Industrial Age
  1865, 1876, 1885, 1893, 1903,
  
  // Early 20th Century
  1914, 1917, 1918, 1929, 1936,
  
  // WWII Era
  1939, 1941, 1945, 1947, 1948,
  
  // Cold War Era
  1957, 1961, 1963, 1969, 1975,
  
  // Late 20th Century
  1989, 1991, 1994, 1997, 1999,
  
  // 21st Century
  2001, 2003, 2008, 2011, 2016, 2020
];

// Fallback year when API fails or returns insufficient events
// 1969 chosen for reliable event count: Moon landing, Woodstock, Vietnam War events
export const FALLBACK_YEAR = 1969;

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    puzzle: null,
    guesses: [],
    maxGuesses: 6,
    isGameOver: false,
  };
}

// Daily year generation logic
export function getDailyYear(debugYear?: string, isDebugMode?: boolean): number {
  // Handle debug mode forced year
  if (debugYear && isDebugMode) {
    const parsedYear = parseInt(debugYear, 10);
    if (!isNaN(parsedYear) && parsedYear >= -3000 && parsedYear <= new Date().getFullYear()) {
      console.log(`Debug: forcing year to ${parsedYear}`);
      return parsedYear;
    }
    console.warn(`Debug: Invalid year parameter '${debugYear}' ignored`);
  }

  const today = new Date();
  
  // DEBUG: Log the raw date before modification
  console.log(`🔍 DEBUG: Raw today date: ${today.toISOString()}`);
  console.log(`🔍 DEBUG: Today's date string: ${today.toISOString().slice(0, 10)}`);
  
  // Reset time to midnight to ensure consistency across timezones
  today.setHours(0, 0, 0, 0);
  
  // Use hash of date for unpredictable but deterministic selection
  const yearIndex = Math.abs([...today.toISOString().slice(0,10)].reduce((a,b)=>(a<<5)+a+b.charCodeAt(),5381)) % CURATED_YEARS.length;
  const selectedYear = CURATED_YEARS[yearIndex];
  
  console.log(`🔍 DEBUG: Date: ${today.toISOString().slice(0,10)}, Year index: ${yearIndex}, Selected year: ${selectedYear}`);
  
  return selectedYear;
}

// Initialize daily puzzle
export async function initializePuzzle(
  getHistoricalEvents: (year: number) => Promise<string[]>,
  sortEventsByRecognizability: (events: string[]) => string[]
): Promise<Puzzle> {
  console.log('🔍 DEBUG: Initializing daily puzzle...');
  
  try {
    // Get the daily year
    const targetYear = getDailyYear();
    console.log(`🔍 DEBUG: Target year for today: ${targetYear}`);
    
    // Fetch events for the target year
    let events = await getHistoricalEvents(targetYear);
    let usedYear = targetYear;
    
    console.log(`🔍 DEBUG: Fetched ${events ? events.length : 0} events for year ${targetYear}`);
    
    // Check if we have enough events (need 6 for the game)
    if (!events || events.length < 6) {
      console.warn(`🔍 DEBUG: Insufficient events for year ${targetYear} (${events ? events.length : 0} events), using fallback year ${FALLBACK_YEAR}`);
      
      // Try fallback year
      events = await getHistoricalEvents(FALLBACK_YEAR);
      usedYear = FALLBACK_YEAR;
      
      console.log(`🔍 DEBUG: Fallback year ${FALLBACK_YEAR} returned ${events ? events.length : 0} events`);
      
      // If fallback also fails, use hardcoded events
      if (!events || events.length < 6) {
        console.error('🔍 DEBUG: API completely failed, using hardcoded events');
        events = [
          'The Boeing 747 makes its first flight',
          'The Internet precursor ARPANET is created',
          'The Stonewall riots occur in New York',
          'Richard Nixon becomes President',
          'Woodstock music festival takes place',
          'Apollo 11 lands on the Moon'
        ];
        usedYear = FALLBACK_YEAR;
        console.log(`🔍 DEBUG: Using hardcoded events for year ${usedYear}`);
      }
    } else {
      console.log(`🔍 DEBUG: Successfully got ${events.length} events for year ${targetYear}`);
    }
    
    // Sort events by recognizability (most obscure first, easiest last)
    const sortedEvents = sortEventsByRecognizability(events);
    console.log(`Sorted ${sortedEvents.length} events by difficulty (obscure to obvious) for year ${usedYear}`);
    
    // Generate simple puzzle ID for today (just the date)
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Create puzzle object
    const puzzle: Puzzle = {
      year: usedYear,
      events: sortedEvents.slice(0, 6), // Use sorted events, ensure exactly 6
      puzzleId: dateString
    };
    
    console.log(`Puzzle initialized successfully:`, puzzle);
    return puzzle;
    
  } catch (error) {
    console.error('Failed to initialize puzzle:', error);
    
    // Last resort: return hardcoded puzzle
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10); // YYYY-MM-DD
    
    return {
      year: FALLBACK_YEAR,
      events: [
        'The Boeing 747 makes its first flight',
        'The Internet precursor ARPANET is created',
        'The Stonewall riots occur in New York',
        'Richard Nixon becomes President',
        'Woodstock music festival takes place',
        'Apollo 11 lands on the Moon'
      ],
      puzzleId: dateString
    };
  }
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
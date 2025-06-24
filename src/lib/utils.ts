// Utility Functions for Chrondle
// Extracted from index.html lines ~1244-1354 and other utility patterns

export interface ProximityFeedback {
  message: string;
  class: string;
}

export interface EnhancedFeedbackOptions {
  previousGuesses?: number[];
  includeHistoricalContext?: boolean;
}

export interface GuessDirectionInfo {
  direction: string;
  bgColor: string;
  textColor: string;
}

// --- DATE & TIME UTILITIES ---

export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  } else {
    return `${year} AD`;
  }
}

export function getNextMidnight(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
}

export function getTimeUntilMidnight(): number {
  const now = new Date();
  const midnight = getNextMidnight();
  return midnight.getTime() - now.getTime();
}

export function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) {
    return "00:00:00";
  }

  const hours = Math.floor(milliseconds / (1000 * 60 * 60)).toString().padStart(2, '0');
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000).toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

// --- GAME MECHANICS UTILITIES ---

export function getProximityFeedback(guess: number, target: number): ProximityFeedback {
  const difference = Math.abs(guess - target);
  
  if (difference === 0) {
    return { message: 'CORRECT!', class: 'text-green-600 dark:text-green-400' };
  } else if (difference <= 5) {
    return { message: 'Almost there – nice try!', class: 'text-green-500 dark:text-green-400' };
  } else if (difference <= 10) {
    return { message: 'So close – good guess!', class: 'text-lime-500 dark:text-lime-400' };
  } else if (difference <= 25) {
    return { message: 'Getting warm – keep going!', class: 'text-yellow-500 dark:text-yellow-400' };
  } else if (difference <= 50) {
    return { message: 'Half a century off – not bad!', class: 'text-orange-500 dark:text-orange-400' };
  } else if (difference <= 100) {
    return { message: 'One century off – nice try!', class: 'text-red-400 dark:text-red-400' };
  } else if (difference <= 250) {
    return { message: 'A few centuries off – getting there!', class: 'text-red-500 dark:text-red-500' };
  } else if (difference <= 500) {
    return { message: 'Half a millennium away – good effort!', class: 'text-red-600 dark:text-red-600' };
  } else if (difference <= 1000) {
    return { message: 'One millennium off – keep trying!', class: 'text-red-700 dark:text-red-700' };
  } else {
    return { message: `${Math.round(difference/1000)}+ millennia away – nice guess!`, class: 'text-gray-500 dark:text-gray-400' };
  }
}

export function getProgressiveFeedback(
  guess: number, 
  target: number, 
  previousGuesses: number[]
): ProximityFeedback {
  const currentDistance = Math.abs(guess - target);
  
  // If this is the first guess, use standard feedback
  if (previousGuesses.length === 0) {
    return getProximityFeedback(guess, target);
  }
  
  // Find the closest previous guess to compare improvement
  const previousDistance = Math.min(...previousGuesses.map(g => Math.abs(g - target)));
  const isImproving = currentDistance < previousDistance;
  const isGettingWorse = currentDistance > previousDistance;
  
  // Get base feedback
  const baseFeedback = getProximityFeedback(guess, target);
  
  // Modify message based on improvement
  if (guess === target) {
    return baseFeedback; // Keep CORRECT! unchanged
  } else if (isImproving) {
    return {
      ...baseFeedback,
      message: `Getting closer – ${baseFeedback.message.toLowerCase()}`
    };
  } else if (isGettingWorse) {
    return {
      ...baseFeedback,
      message: `Further away – ${baseFeedback.message.toLowerCase()}`
    };
  } else {
    // Same distance, just return base feedback
    return baseFeedback;
  }
}

// Helper function to determine historical era
function getHistoricalEra(year: number): string {
  if (year < 0) return 'ancient';
  if (year < 500) return 'classical';
  if (year < 1000) return 'medieval';
  if (year < 1500) return 'renaissance';
  if (year < 1800) return 'early modern';
  if (year < 1900) return '19th century';
  if (year < 1950) return 'early 20th century';
  if (year < 2000) return 'modern';
  return 'contemporary';
}

/**
 * Enhanced feedback system that provides encouraging, context-aware messages
 * for historical guessing game. Combines multiple feedback types:
 * 
 * 1. Encouraging language instead of generic "Within X years" messages
 * 2. Progressive improvement tracking based on previous guesses
 * 3. Historical era context for different time periods
 * 
 * @param guess The player's guess year
 * @param target The target year to guess
 * @param options Configuration for enhanced features
 * @returns ProximityFeedback with enhanced encouraging message
 * 
 * @example
 * // Basic encouraging feedback
 * getEnhancedProximityFeedback(1950, 1969)
 * // -> { message: "Getting warm – keep going!", class: "..." }
 * 
 * // With progressive improvement
 * getEnhancedProximityFeedback(1950, 1969, { previousGuesses: [1800] })
 * // -> { message: "Getting closer – getting warm – keep going!", class: "..." }
 * 
 * // With historical context
 * getEnhancedProximityFeedback(1200, 1969, { includeHistoricalContext: true })
 * // -> { message: "From medieval era to modern – one millennium off – keep trying!", class: "..." }
 */
export function getEnhancedProximityFeedback(
  guess: number, 
  target: number, 
  options: EnhancedFeedbackOptions = {}
): ProximityFeedback {
  const { previousGuesses = [], includeHistoricalContext = false } = options;
  const difference = Math.abs(guess - target);
  
  // Start with base encouraging feedback
  const baseFeedback = getProximityFeedback(guess, target);
  
  if (guess === target) {
    return baseFeedback; // Keep CORRECT! unchanged
  }
  
  let message = baseFeedback.message;
  
  // Add progressive improvement tracking
  if (previousGuesses.length > 0) {
    const previousDistance = Math.min(...previousGuesses.map(g => Math.abs(g - target)));
    const isImproving = difference < previousDistance;
    const isGettingWorse = difference > previousDistance;
    
    if (isImproving) {
      message = `Getting closer – ${message.toLowerCase()}`;
    } else if (isGettingWorse) {
      message = `Further away – ${message.toLowerCase()}`;
    }
  }
  
  // Add historical context if requested
  if (includeHistoricalContext) {
    const guessEra = getHistoricalEra(guess);
    const targetEra = getHistoricalEra(target);
    
    if (guessEra !== targetEra) {
      let eraHint = '';
      if (difference >= 1000) {
        if (guess < 0 && target > 0) {
          eraHint = 'Think BC to AD – crossing centuries! ';
        } else if (guessEra === 'classical' && targetEra === 'modern') {
          eraHint = 'From classical times to modern centuries – ';
        } else if (guessEra === 'medieval' && targetEra === 'modern') {
          eraHint = 'From medieval era to modern centuries – ';
        } else if (guessEra.includes('century') && targetEra === 'classical') {
          eraHint = 'From modern times back to ancient centuries – ';
        } else {
          eraHint = 'Crossing multiple centuries – ';
        }
      } else if (difference >= 500) {
        eraHint = `From ${guessEra} era to ${targetEra} – `;
      } else if (difference >= 100) {
        eraHint = 'Different centuries – ';
      }
      
      if (eraHint) {
        message = eraHint + message.toLowerCase();
      }
    } else if (difference >= 100) {
      // Same era but different centuries - add context
      message = `Different centuries – ${message.toLowerCase()}`;
    }
  }
  
  return {
    ...baseFeedback,
    message
  };
}

// Maintain backward compatibility
export function getHistoricalFeedback(guess: number, target: number): ProximityFeedback {
  return getEnhancedProximityFeedback(guess, target, { includeHistoricalContext: true });
}

export function getGuessDirectionInfo(guess: number, target: number): GuessDirectionInfo {
  const isEarlier = guess < target;
  const direction = isEarlier ? '▲ LATER' : '▼ EARLIER';
  
  return {
    direction: direction,
    bgColor: isEarlier ? 'bg-red-200 dark:bg-red-800' : 'bg-blue-200 dark:bg-blue-800',
    textColor: isEarlier ? 'text-red-800 dark:text-red-100' : 'text-blue-800 dark:text-blue-100'
  };
}

// --- SHARING UTILITIES ---

/**
 * Map temporal distance to color-coded emoji for visual feedback
 * Uses exponential distance buckets for intuitive progression
 */
export function getDistanceEmoji(yearsOff: number): string {
  // Exponentially growing buckets: each roughly 2x the previous
  // This creates a natural progression from "very close" to "very far"
  const buckets = [
    { threshold: 0, emoji: '🟩' },      // Correct
    { threshold: 5, emoji: '🟨' },      // Very close (yellow)
    { threshold: 10, emoji: '🟧' },     // Close (orange) 
    { threshold: 25, emoji: '🟥' },     // Getting warmer (red)
    { threshold: 50, emoji: '🟪' },     // Warm (purple)
    { threshold: 100, emoji: '🟦' },    // Cool (blue)
    { threshold: 250, emoji: '⬜' },    // Cold (white)
    { threshold: 500, emoji: '⬛' },    // Very cold (black)
    { threshold: 1000, emoji: '⚫' },   // Millennium off (black circle)
    { threshold: Infinity, emoji: '⚫' } // Ancient history
  ];
  
  // Binary search would be overkill for 9 elements
  // Simple linear scan is clearer and fast enough
  for (const bucket of buckets) {
    if (yearsOff <= bucket.threshold) {
      return bucket.emoji;
    }
  }
  
  return '⚫'; // Fallback (should never reach)
}

/**
 * Generate compact emoji timeline showing guess progression
 * Each emoji represents temporal distance from target
 */
export function generateEmojiTimeline(guesses: number[], targetYear: number): string {
  return guesses
    .map(guess => {
      const distance = Math.abs(guess - targetYear);
      return getDistanceEmoji(distance);
    })
    .join('');
}

/**
 * Generate emoji timeline with directional arrows
 * Combines distance colors with direction indicators
 */
export function generateDirectionalTimeline(guesses: number[], targetYear: number): string {
  return guesses
    .map(guess => {
      if (guess === targetYear) return '🟩';
      
      const distance = Math.abs(guess - targetYear);
      const emoji = getDistanceEmoji(distance);
      
      // For non-correct guesses, append a tiny directional hint
      // Using unicode combining characters for compactness
      if (guess < targetYear) {
        return emoji + '↗'; // Need to go later
      } else {
        return emoji + '↘'; // Need to go earlier
      }
    })
    .join(' '); // Space for readability with arrows
}

/**
 * Generate detailed share text with full guess information
 * Includes years, directions, and proximity feedback
 */
export function generateDetailedShareText(
  guesses: number[], 
  targetYear: number
): string {
  const isWin = guesses.includes(targetYear);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Create header with readable date and result
  const result = isWin ? `${guesses.length}/6 ⭐` : `X/6 💥`;
  let shareContent = `Chrondle - ${dateStr}\n`;
  shareContent += `Target: ${formatYear(targetYear)} - ${result}\n\n`;
  
  // Add detailed guess information
  shareContent += 'My guesses:\n';
  guesses.forEach((guess, index) => {
    const proximity = getProximityFeedback(guess, targetYear);
    let guessEmoji;
    
    if (guess === targetYear) {
      guessEmoji = '🟩'; // Correct
    } else if (guess < targetYear) {
      guessEmoji = '🔼'; // Too early, need later
    } else {
      guessEmoji = '🔽'; // Too late, need earlier
    }
    
    shareContent += `${index + 1}. ${formatYear(guess)} ${guessEmoji} ${proximity.message}\n`;
  });
  
  shareContent += '\n#Chrondle #HistoryGame';
  return shareContent;
}

export function generateShareText(
  guesses: number[], 
  targetYear: number,
  detailed: boolean = false
): string {
  if (detailed) {
    return generateDetailedShareText(guesses, targetYear);
  }
  
  const isWin = guesses.includes(targetYear);
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Generate compact emoji timeline
  const emojiTimeline = generateEmojiTimeline(guesses, targetYear);
  
  // Create header with result
  const result = isWin ? `${guesses.length}/6` : `X/6`;
  let shareContent = `Chrondle ${dateStr}\n`;
  shareContent += `${result} ${emojiTimeline}\n`;
  shareContent += `Target: ${formatYear(targetYear)}\n`;
  shareContent += '\n#Chrondle';
  
  return shareContent;
}

// --- DATE NAVIGATION UTILITIES ---

/**
 * Calculate the puzzle year for a specific date using the same logic as getDailyYear
 * This allows us to determine what year was available on previous days
 */
export function getYearForDate(date: Date, supportedYears: number[]): number {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  // Use the same deterministic hash logic as getDailyYear
  const dateString = targetDate.toISOString().slice(0, 10);
  const dateHash = Math.abs([...dateString].reduce((a,b)=>(a<<5)+a+b.charCodeAt(0),5381));
  
  // Select from supported years
  const yearIndex = dateHash % supportedYears.length;
  return supportedYears[yearIndex];
}

/**
 * Get yesterday's puzzle year
 */
export function getYesterdayYear(supportedYears: number[]): number {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getYearForDate(yesterday, supportedYears);
}

// --- UI UTILITIES ---

/**
 * Utility for conditionally combining CSS class names
 * Filters out falsy values and joins valid classes with spaces
 * Handles arrays of classes by flattening them
 */
export function cn(...classes: (string | string[] | undefined | null | false)[]): string {
  return classes
    .filter(Boolean)
    .flat()
    .join(' ');
}

export function showModal(modal: HTMLElement): void {
  if (!modal) return;
  
  modal.classList.remove('hidden');
  // Small delay to ensure transition works properly
  setTimeout(() => {
    const content = modal.firstElementChild as HTMLElement;
    if (content) {
      content.classList.add('show');
    }
  }, 10);
}

export function hideModal(modal: HTMLElement): void {
  if (!modal) return;
  
  const content = modal.firstElementChild as HTMLElement;
  if (content) {
    content.classList.remove('show');
  }
  // Wait for transition to complete before hiding
  setTimeout(() => modal.classList.add('hidden'), 300);
}

// --- VALIDATION UTILITIES ---

export function isValidYear(year: string | number): boolean {
  const parsed = typeof year === 'string' ? parseInt(year, 10) : year;
  return !isNaN(parsed) && parsed >= -3000 && parsed <= new Date().getFullYear();
}

export function parseYear(input: string): number | null {
  const parsed = parseInt(input, 10);
  return isValidYear(parsed) ? parsed : null;
}

// --- COUNTDOWN TIMER UTILITY ---

export function createCountdownTimer(
  callback: (timeString: string) => void,
  onComplete?: () => void
): () => void {
  const interval = setInterval(() => {
    const diff = getTimeUntilMidnight();

    if (diff <= 0) {
      callback("00:00:00");
      clearInterval(interval);
      if (onComplete) {
        onComplete();
      }
      return;
    }

    callback(formatCountdown(diff));
  }, 1000);

  // Return cleanup function
  return () => clearInterval(interval);
}

// --- ARRAY UTILITIES ---

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomElement<T>(array: T[]): T | null {
  return array.length > 0 ? array[Math.floor(Math.random() * array.length)] : null;
}

// --- DEBUG UTILITIES ---

export function formatDebugInfo(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return `[Error formatting debug info: ${error}]`;
  }
}

export function logWithTimestamp(message: string, ...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...args);
}

// --- TYPE GUARDS ---

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isValidArrayIndex(array: unknown[], index: number): boolean {
  return isNumber(index) && index >= 0 && index < array.length;
}

// --- BROWSER COMPATIBILITY UTILITIES ---

export function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function isLocalStorageAvailable(): boolean {
  if (!isClient()) return false;
  
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function safeLocalStorageGet(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageSet(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
// Utility Functions for Chrondle
// Extracted from index.html lines ~1244-1354 and other utility patterns

export interface ProximityFeedback {
  message: string;
  class: string;
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
    return { message: 'Within 5 years!', class: 'text-green-500 dark:text-green-400' };
  } else if (difference <= 10) {
    return { message: 'Within 10 years!', class: 'text-lime-500 dark:text-lime-400' };
  } else if (difference <= 25) {
    return { message: 'Within 25 years!', class: 'text-yellow-500 dark:text-yellow-400' };
  } else if (difference <= 50) {
    return { message: 'Within 50 years!', class: 'text-orange-500 dark:text-orange-400' };
  } else if (difference <= 100) {
    return { message: 'Within a century!', class: 'text-red-400 dark:text-red-400' };
  } else if (difference <= 250) {
    return { message: 'Within 250 years!', class: 'text-red-500 dark:text-red-500' };
  } else if (difference <= 500) {
    return { message: 'Within 500 years!', class: 'text-red-600 dark:text-red-600' };
  } else if (difference <= 1000) {
    return { message: 'Within a millennium!', class: 'text-red-700 dark:text-red-700' };
  } else {
    return { message: `${Math.round(difference/1000)}+ millennia off`, class: 'text-gray-500 dark:text-gray-400' };
  }
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

export function generateShareText(
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
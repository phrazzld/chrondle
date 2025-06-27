import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for the game
export function formatYear(year: number): string {
  if (year < 0) {
    return `${Math.abs(year)} BC`;
  }
  return `${year} AD`;
}

export function getGuessDirectionInfo(guess: number, target: number) {
  const difference = guess - target;
  if (difference === 0) {
    return { direction: 'correct', icon: '🎯', text: 'CORRECT!' };
  } else if (difference > 0) {
    return { direction: 'earlier', icon: '▼', text: 'EARLIER' };
  } else {
    return { direction: 'later', icon: '▲', text: 'LATER' };
  }
}

export function getTimeUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export function formatCountdown(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


export function generateShareText(guesses: number[], targetYear: number, hasWon: boolean): string {
  const date = new Date().toISOString().split('T')[0];
  const emojiTimeline = generateEmojiTimeline(guesses, targetYear);
  
  let result = `Chrondle ${date}\n`;
  result += hasWon ? `Solved in ${guesses.length}/6 🎯\n` : 'Not solved 😔\n';
  result += '\n';
  result += emojiTimeline;
  result += '\n\nChrondle.com';
  
  return result;
}

export function generateEmojiTimeline(guesses: number[], targetYear: number): string {
  return guesses.map(guess => {
    const distance = Math.abs(guess - targetYear);
    if (distance === 0) return '🎯'; // Perfect
    if (distance <= 10) return '🟢'; // Very close
    if (distance <= 25) return '🟡'; // Close
    if (distance <= 50) return '🟠'; // Near
    if (distance <= 100) return '🔴'; // Far
    return '⚫'; // Very far
  }).join('');
}

export interface StreakColorClasses {
  textColor: string;
  backgroundColor: string;
  milestone?: string;
}

export function getStreakColorClasses(streak: number): StreakColorClasses {
  if (streak <= 0) {
    return {
      textColor: 'text-muted-foreground',
      backgroundColor: 'bg-muted',
    };
  }
  
  if (streak <= 2) {
    return {
      textColor: 'text-slate-600',
      backgroundColor: 'bg-slate-100',
    };
  }
  
  if (streak <= 6) {
    return {
      textColor: 'text-blue-600',
      backgroundColor: 'bg-blue-100',
      milestone: streak === 3 ? 'Building habit!' : undefined,
    };
  }
  
  if (streak <= 13) {
    return {
      textColor: 'text-green-600',
      backgroundColor: 'bg-green-100',
      milestone: streak === 7 ? 'One week strong!' : undefined,
    };
  }
  
  if (streak <= 29) {
    return {
      textColor: 'text-orange-600',
      backgroundColor: 'bg-orange-100',
      milestone: streak === 14 ? 'Two weeks solid!' : undefined,
    };
  }
  
  // 30+ days
  return {
    textColor: 'text-red-600',
    backgroundColor: 'bg-red-100',
    milestone: streak === 30 ? 'One month champion!' : undefined,
  };
}

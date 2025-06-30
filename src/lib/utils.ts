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
    return { direction: 'correct', icon: '🎯', text: 'Perfect! You found it!' };
  } else if (difference > 0) {
    return { direction: 'earlier', icon: '▼', text: 'Too late - try an earlier year' };
  } else {
    return { direction: 'later', icon: '▲', text: 'Too early - try a later year' };
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
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const emojiTimeline = generateEmojiTimeline(guesses, targetYear);
  const score = hasWon ? `${guesses.length}/6` : 'X/6';
  
  let result = `Chrondle: ${dateString} - ${score}\n\n`;
  result += emojiTimeline;
  result += '\n\nhttps://www.chrondle.app';
  
  return result;
}

export function generateWordleBoxes(guess: number, targetYear: number): string {
  const distance = Math.abs(guess - targetYear);
  
  // Perfect match - all green
  if (distance === 0) {
    return '🟩🟩🟩🟩🟩';
  }
  
  // Very close (1-5 years) - 4 green, 1 yellow
  if (distance <= 5) {
    return '🟩🟩🟩🟩🟨';
  }
  
  // Close (6-25 years) - 3 green, 2 yellow
  if (distance <= 25) {
    return '🟩🟩🟩🟨🟨';
  }
  
  // Warm (26-100 years) - 1 green, 4 yellow
  if (distance <= 100) {
    return '🟩🟨🟨🟨🟨';
  }
  
  // Cold (100+ years) - all white
  return '⬜⬜⬜⬜⬜';
}

export function generateEmojiTimeline(guesses: number[], targetYear: number): string {
  return guesses.map(guess => generateWordleBoxes(guess, targetYear)).join('\n');
}

export interface StreakColorClasses {
  textColor: string;
  borderColor: string;
  milestone?: string;
}

export function getStreakColorClasses(streak: number): StreakColorClasses {
  if (streak <= 0) {
    return {
      textColor: 'text-muted-foreground',
      borderColor: 'border-muted-foreground/30',
    };
  }
  
  if (streak <= 2) {
    return {
      textColor: 'text-slate-600',
      borderColor: 'border-slate-300',
    };
  }
  
  if (streak <= 6) {
    return {
      textColor: 'text-blue-600',
      borderColor: 'border-blue-300',
      milestone: streak === 3 ? 'Building momentum!' : undefined,
    };
  }
  
  if (streak <= 13) {
    return {
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-300',
      milestone: streak === 7 ? 'One week streak! 🔥' : undefined,
    };
  }
  
  if (streak <= 29) {
    return {
      textColor: 'text-orange-600',
      borderColor: 'border-orange-300',
      milestone: streak === 14 ? 'Two weeks strong! ⚡' : undefined,
    };
  }
  
  if (streak <= 99) {
    return {
      textColor: 'text-red-600',
      borderColor: 'border-red-300',
      milestone: streak === 30 ? 'One month champion! 🏆' : streak === 50 ? 'Incredible dedication! 💎' : undefined,
    };
  }
  
  // 100+ days - Elite status
  return {
    textColor: 'text-purple-600',
    borderColor: 'border-purple-300',
    milestone: streak === 100 ? 'Century club! 👑' : undefined,
  };
}

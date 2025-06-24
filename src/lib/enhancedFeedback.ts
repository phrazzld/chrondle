// Enhanced Feedback System for Chrondle
// Provides encouraging, context-aware feedback with historical proximity hints

export interface EnhancedProximityFeedback {
  message: string;
  class: string; // For backwards compatibility
  className: string; // Modern CSS classes
  encouragement: string;
  historicalHint?: string;
  progressMessage?: string;
  severity: 'perfect' | 'excellent' | 'good' | 'okay' | 'cold' | 'frozen';
}

export interface ProgressiveFeedbackOptions {
  previousGuesses: number[];
  currentDistance: number;
  previousDistance: number | null;
}

export interface ProgressiveFeedback {
  improvement: 'better' | 'worse' | 'same' | 'neutral';
  improvementMessage?: string;
}

export interface HistoricalContextOptions {
  includeEraHints: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface HistoricalContextHint {
  hint: string | null;
  eraName?: string;
}

export interface EnhancedFeedbackOptions {
  previousGuesses?: number[];
  includeHistoricalContext?: boolean;
  includeProgressiveTracking?: boolean;
  difficulty?: 'easy' | 'normal' | 'hard';
}

/**
 * Get historical era name for a given year
 */
function getHistoricalEra(year: number): string {
  if (year < -1000) return 'Ancient World';
  if (year < 0) return 'Classical Antiquity';
  if (year < 500) return 'Late Antiquity';
  if (year < 1000) return 'Early Medieval';
  if (year < 1300) return 'High Medieval';
  if (year < 1500) return 'Late Medieval';
  if (year < 1800) return 'Early Modern';
  if (year < 1900) return 'Industrial Age';
  if (year < 1955) return 'Modern Era';
  if (year < 2000) return 'Late 20th Century';
  return 'Contemporary Era';
}

/**
 * Generate encouraging messages based on distance and context
 */
function generateEncouragingMessage(distance: number, severity: string, isImproving: boolean): string {
  const improvementBonus = isImproving ? ' – getting warmer!' : '';
  
  switch (severity) {
    case 'perfect':
      return 'Incredible historical knowledge!';
    case 'excellent':
      return distance <= 5 
        ? `Just ${distance} year${distance === 1 ? '' : 's'} off – outstanding!${improvementBonus}`
        : `Within a decade – impressive precision!${improvementBonus}`;
    case 'good':
      return distance <= 25 
        ? `Getting close – within a generation!${improvementBonus}`
        : `In the right ballpark – good instincts!${improvementBonus}`;
    case 'okay':
      return `Half a century off – not bad for such a vast timeline!${improvementBonus}`;
    case 'cold':
      return distance <= 100 
        ? `One century off – nice try!${improvementBonus}`
        : `A few centuries apart – good guess but different period!${improvementBonus}`;
    case 'frozen':
      return distance <= 1000 
        ? `Nearly a millennium off – major historical shift needed!${improvementBonus}`
        : `Ancient history vs modern times – big leap required!${improvementBonus}`;
    default:
      return `Keep exploring the vast timeline of history!${improvementBonus}`;
  }
}

/**
 * Generate contextual proximity message
 */
function generateProximityMessage(distance: number): { message: string; severity: string; className: string } {
  if (distance === 0) {
    return {
      message: 'Perfect!',
      severity: 'perfect',
      className: 'text-green-600 dark:text-green-400'
    };
  }

  const ranges = [
    { max: 2, message: 'Incredibly close', severity: 'excellent', className: 'text-green-500 dark:text-green-400' },
    { max: 5, message: 'Very close', severity: 'excellent', className: 'text-green-500 dark:text-green-400' },
    { max: 10, message: 'Close', severity: 'excellent', className: 'text-lime-500 dark:text-lime-400' },
    { max: 25, message: 'Getting warm', severity: 'good', className: 'text-yellow-500 dark:text-yellow-400' },
    { max: 50, message: 'In the ballpark', severity: 'okay', className: 'text-orange-500 dark:text-orange-400' },
    { max: 100, message: 'One century off', severity: 'cold', className: 'text-red-400 dark:text-red-400' },
    { max: 250, message: 'A few centuries off', severity: 'cold', className: 'text-red-500 dark:text-red-500' },
    { max: 500, message: 'Half a millennium off', severity: 'frozen', className: 'text-red-600 dark:text-red-600' },
    { max: 1000, message: 'Nearly a millennium off', severity: 'frozen', className: 'text-red-700 dark:text-red-700' },
  ];

  const range = ranges.find(r => distance <= r.max);
  return range || {
    message: `${Math.round(distance/1000)}+ millennia apart`,
    severity: 'frozen',
    className: 'text-gray-500 dark:text-gray-400'
  };
}

/**
 * Track progressive improvement in guesses
 */
export function getProgressiveFeedback(
  target: number,
  guess: number,
  options: ProgressiveFeedbackOptions
): ProgressiveFeedback {
  const { previousGuesses, currentDistance, previousDistance } = options;

  // First guess
  if (previousGuesses.length === 0 || previousDistance === null) {
    const messages = [
      'Good start!',
      'Solid attempt!',
      'Nice first guess!',
      'First guess - let\'s see how we do!'
    ];
    return {
      improvement: 'neutral',
      improvementMessage: messages[Math.floor(Math.random() * messages.length)]
    };
  }

  // Compare with previous attempt
  if (currentDistance < previousDistance) {
    const messages = [
      'Getting warmer!',
      'Much closer!',
      'Better direction!',
      'Improving nicely!',
      'Getting warmer – much closer!'
    ];
    return {
      improvement: 'better',
      improvementMessage: messages[Math.floor(Math.random() * messages.length)]
    };
  } else if (currentDistance > previousDistance) {
    const messages = [
      'Getting colder – try the other direction!',
      'Further away – back up a bit!',
      'Getting further – try other direction!',
      'Colder now – back up!'
    ];
    return {
      improvement: 'worse',
      improvementMessage: messages[Math.floor(Math.random() * messages.length)]
    };
  } else {
    const messages = [
      'Same distance – try different approach!',
      'No change – try different direction!',
      'Same distance – different strategy needed!'
    ];
    return {
      improvement: 'same',
      improvementMessage: messages[Math.floor(Math.random() * messages.length)]
    };
  }
}

/**
 * Generate historical context hints
 */
export function getHistoricalContextHint(
  target: number,
  guess: number,
  options: HistoricalContextOptions
): HistoricalContextHint {
  if (!options.includeEraHints) {
    return { hint: null };
  }

  const distance = Math.abs(guess - target);
  const targetEra = getHistoricalEra(target);
  const guessEra = getHistoricalEra(guess);

  // Close guesses don't need era hints
  if (distance <= 10) {
    return { hint: null };
  }
  
  // Skip hints only for very close guesses within same era
  if (distance <= 15 && targetEra === guessEra) {
    return { hint: null };
  }

  // BC/AD transition hints
  if ((guess < 0 && target > 0) || (guess > 0 && target < 0)) {
    return {
      hint: `Think ${target < 0 ? 'BC' : 'AD'} – crossing the ancient-modern divide!`,
      eraName: targetEra
    };
  }

  // Different eras
  if (targetEra !== guessEra) {
    const direction = guess < target ? 'later' : 'earlier';
    
    if (distance > 500) {
      return {
        hint: `Consider the ${targetEra} – think ${direction} in history!`,
        eraName: targetEra
      };
    } else if (distance > 100) {
      const centuries = Math.abs(Math.floor(target / 100) - Math.floor(guess / 100));
      return {
        hint: `About ${centuries} centur${centuries === 1 ? 'y' : 'ies'} ${direction} – different historical period!`,
        eraName: targetEra
      };
    } else {
      // For smaller distances between different eras
      const direction = guess < target ? 'later' : 'earlier';
      return {
        hint: `Think ${direction} in the ${targetEra}!`,
        eraName: targetEra
      };
    }
  }

  // Same era but significant distance - provide decade-based hints
  if (distance > 20) {
    const direction = guess < target ? 'later' : 'earlier';
    const decades = Math.floor(distance / 10);
    if (decades > 0) {
      return {
        hint: `About ${decades} decade${decades === 1 ? '' : 's'} ${direction} in the ${targetEra}!`,
        eraName: targetEra
      };
    }
  }

  return { hint: null, eraName: targetEra };
}

/**
 * Main enhanced proximity feedback function
 */
export function getEnhancedProximityFeedback(
  guess: number,
  target: number,
  options: EnhancedFeedbackOptions = {}
): EnhancedProximityFeedback {
  const {
    previousGuesses = [],
    includeHistoricalContext = false,
    includeProgressiveTracking = false,
    difficulty = 'normal'
  } = options;

  const distance = Math.abs(guess - target);
  const proximityData = generateProximityMessage(distance);

  // Progressive tracking
  let progressMessage: string | undefined;
  let isImproving = false;
  
  if (includeProgressiveTracking && previousGuesses.length > 0) {
    const previousDistance = Math.abs(previousGuesses[previousGuesses.length - 1] - target);
    const progressiveFeedback = getProgressiveFeedback(target, guess, {
      previousGuesses,
      currentDistance: distance,
      previousDistance
    });
    
    progressMessage = progressiveFeedback.improvementMessage;
    isImproving = progressiveFeedback.improvement === 'better';
  }

  // Historical context
  let historicalHint: string | undefined;
  if (includeHistoricalContext) {
    const contextHint = getHistoricalContextHint(target, guess, {
      includeEraHints: true,
      difficulty
    });
    historicalHint = contextHint.hint || undefined;
  }

  // Generate encouraging message
  const encouragement = generateEncouragingMessage(distance, proximityData.severity, isImproving);

  return {
    message: proximityData.message,
    class: proximityData.className, // Backwards compatibility
    className: proximityData.className,
    encouragement,
    historicalHint,
    progressMessage,
    severity: proximityData.severity as EnhancedProximityFeedback['severity']
  };
}
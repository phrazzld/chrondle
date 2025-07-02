'use client';

import React from 'react';
import { motion } from 'motion/react';
import { formatYear } from '@/lib/utils';
import type { ClosestGuessData } from '@/hooks/useGameState';

interface ProximityDisplayProps {
  currentGuess: number;
  currentDistance: number;
  closestGuess: ClosestGuessData | null;
  targetYear: number;
  hasWon: boolean;
  isCurrentGuessClosest: boolean;
  guessCount: number;
  className?: string;
}

export const ProximityDisplay: React.FC<ProximityDisplayProps> = ({
  currentGuess,
  currentDistance,
  closestGuess,
  targetYear,
  hasWon,
  isCurrentGuessClosest,
  guessCount,
  className = ''
}) => {
  // Don't show if no guesses or if game is won
  if (guessCount === 0 || hasWon) {
    return null;
  }

  // Format the distance message without revealing exact distance
  const getProximityMessage = (distance: number) => {
    if (distance === 0) {
      return 'Perfect!';
    } else if (distance <= 5) {
      return 'Extremely close';
    } else if (distance <= 15) {
      return 'Very close';
    } else if (distance <= 50) {
      return 'Getting warm';
    } else if (distance <= 100) {
      return 'Nearby';
    } else if (distance <= 500) {
      return 'Cold';
    } else {
      return 'Far off';
    }
  };

  // Get direction hint based on distance
  const getDirectionHint = (guess: number, targetYear: number, distance: number) => {
    const isLater = guess < targetYear;
    const arrow = isLater ? '→' : '←';
    const direction = isLater ? 'later' : 'earlier';
    
    if (distance <= 25) {
      return `${arrow} Slightly ${direction}`;
    } else if (distance <= 100) {
      return `${arrow} Go ${direction}`;
    } else {
      return `${arrow} Much ${direction}`;
    }
  };

  // Determine styling based on proximity
  const getProximityStyles = (distance: number) => {
    if (distance === 0) {
      return {
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-800 dark:text-green-200',
        borderColor: 'border-green-300 dark:border-green-700'
      };
    } else if (distance <= 5) {
      return {
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-700 dark:text-green-300',
        borderColor: 'border-green-200 dark:border-green-800'
      };
    } else if (distance <= 15) {
      return {
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        textColor: 'text-orange-700 dark:text-orange-300',
        borderColor: 'border-orange-200 dark:border-orange-800'
      };
    } else if (distance <= 50) {
      return {
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      };
    } else if (distance <= 100) {
      return {
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-700 dark:text-blue-300',
        borderColor: 'border-blue-200 dark:border-blue-800'
      };
    } else {
      return {
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        textColor: 'text-gray-700 dark:text-gray-300',
        borderColor: 'border-gray-200 dark:border-gray-800'
      };
    }
  };

  // Calculate values for current guess
  const currentStyles = getProximityStyles(currentDistance);
  const currentProximityMessage = getProximityMessage(currentDistance);
  const currentDirectionHint = getDirectionHint(currentGuess, targetYear, currentDistance);
  
  // Calculate values for best guess if it exists and is different from current
  const showBestGuess = closestGuess && guessCount > 1 && !isCurrentGuessClosest;
  const bestProximityMessage = showBestGuess ? getProximityMessage(closestGuess.distance) : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        scale: isCurrentGuessClosest ? [1, 1.02, 1] : 1
      }}
      transition={{ 
        duration: 0.3,
        scale: { duration: 0.4, ease: "easeOut" }
      }}
      className={`
        rounded-lg border-2 p-4 transition-all duration-200
        ${currentStyles.bgColor} ${currentStyles.textColor} ${currentStyles.borderColor}
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-label={`Your guess: ${formatYear(currentGuess)} - ${currentProximityMessage}. ${currentDirectionHint}`}
    >
      <div className="flex flex-col gap-3">
        {/* Current guess feedback */}
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Your guess: {formatYear(currentGuess)}
          </div>
          <div className="text-lg font-semibold">
            {currentProximityMessage}
          </div>
          <div className="text-base font-medium">
            {currentDirectionHint}
          </div>
        </div>
        
        {/* Divider and best guess (if applicable) */}
        {showBestGuess && closestGuess && (
          <>
            <div className="border-t border-current opacity-20" />
            <div className="text-xs opacity-70">
              Best so far: {formatYear(closestGuess.guess)} • {bestProximityMessage}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
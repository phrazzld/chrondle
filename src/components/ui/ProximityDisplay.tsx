'use client';

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { formatYear } from '@/lib/utils';

interface ProximityDisplayProps {
  currentGuess: number;
  currentDistance: number;
  targetYear: number;
  hasWon: boolean;
  guessCount: number;
  className?: string;
}

export const ProximityDisplay: React.FC<ProximityDisplayProps> = ({
  currentGuess,
  currentDistance,
  targetYear,
  hasWon,
  guessCount,
  className = ''
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Don't show if no guesses or if game is won
  if (guessCount === 0 || hasWon) {
    return null;
  }

  // Get temperature emoji that changes based on distance
  const getTemperatureEmoji = (distance: number): string => {
    if (distance === 0) return '🎯'; // Perfect
    if (distance <= 10) return '🔥'; // Very hot
    if (distance <= 50) return '♨️'; // Hot  
    if (distance <= 150) return '🌡️'; // Warm
    if (distance <= 500) return '❄️'; // Cold
    return '🧊'; // Very cold
  };

  // Get temperature text based on distance (no exact distances)
  const getTemperatureText = (distance: number): string => {
    if (distance === 0) return 'Perfect!';
    if (distance <= 10) return 'Very hot';
    if (distance <= 50) return 'Hot';  
    if (distance <= 150) return 'Warm';
    if (distance <= 500) return 'Cold';
    return 'Very cold';
  };

  // Get simple direction without arrow
  const getDirection = (guess: number, targetYear: number): string => {
    return guess < targetYear ? 'Try a later year' : 'Try an earlier year';
  };

  // Calculate display values
  const temperatureEmoji = getTemperatureEmoji(currentDistance);
  const temperatureText = getTemperatureText(currentDistance);
  const direction = getDirection(currentGuess, targetYear);

  // Simple accessibility description
  const accessibilityLabel = `Your guess ${formatYear(currentGuess)}, ${temperatureText.toLowerCase()}, ${direction.toLowerCase()}`;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
      transition={shouldReduceMotion ? {} : { duration: 0.2, ease: "easeOut" }}
      className={`
        flex sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-muted/30 border border-border/40 text-sm font-medium
        ${className}
      `}
      role="status"
      aria-live="polite"
      aria-label={accessibilityLabel}
    >
      <span className="text-lg" role="img" aria-label="temperature indicator">
        {temperatureEmoji}
      </span>
      <span className="text-foreground font-semibold">
        {formatYear(currentGuess)}
      </span>
      <span className="text-muted-foreground">
        {temperatureText} • {direction}
      </span>
    </motion.div>
  );
};
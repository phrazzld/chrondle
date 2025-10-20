"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatYear } from "@/lib/displayFormatting";
import { ANIMATION_DURATIONS, ANIMATION_SPRINGS } from "@/lib/animationConstants";

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
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Don't show if no guesses or if game is won
  if (guessCount === 0 || hasWon) {
    return null;
  }

  // Get temperature emoji that changes based on distance
  const getTemperatureEmoji = (distance: number): string => {
    if (distance === 0) return "🎯"; // Perfect
    if (distance <= 10) return "🔥"; // Very hot
    if (distance <= 50) return "♨️"; // Hot
    if (distance <= 150) return "🌡️"; // Warm
    if (distance <= 500) return "❄️"; // Cold
    return "🧊"; // Very cold
  };

  // Get temperature text based on distance (no exact distances)
  const getTemperatureText = (distance: number): string => {
    if (distance === 0) return "Perfect!";
    if (distance <= 10) return "Very hot";
    if (distance <= 50) return "Hot";
    if (distance <= 150) return "Warm";
    if (distance <= 500) return "Cold";
    return "Very cold";
  };

  // Get simple direction without arrow
  const getDirection = (guess: number, targetYear: number): string => {
    return guess < targetYear ? "Try a later year" : "Try an earlier year";
  };

  // Calculate display values
  const temperatureEmoji = getTemperatureEmoji(currentDistance);
  const temperatureText = getTemperatureText(currentDistance);
  const direction = getDirection(currentGuess, targetYear);

  // Simple accessibility description
  const accessibilityLabel = `Last guess: ${formatYear(currentGuess)}, ${temperatureText.toLowerCase()}, ${direction.toLowerCase()}`;

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? {}
          : {
              duration: 0.2,
              ease: "easeOut",
              delay: ANIMATION_DURATIONS.PROXIMITY_DELAY / 1000, // 300ms delay
            }
      }
      className={`bg-muted/30 border-border/40 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium sm:inline-flex ${className} `}
      role="status"
      aria-live="polite"
      aria-label={accessibilityLabel}
    >
      <motion.span
        initial={shouldReduceMotion ? {} : { scale: 0 }}
        animate={shouldReduceMotion ? {} : { scale: 1 }}
        transition={
          shouldReduceMotion
            ? {}
            : {
                type: "spring",
                ...ANIMATION_SPRINGS.BOUNCY,
                delay: 0.4, // 400ms delay (100ms after container)
              }
        }
        className="text-lg"
        role="img"
        aria-label="temperature indicator"
      >
        {temperatureEmoji}
      </motion.span>
      <span className="text-muted-foreground text-xs tracking-wide uppercase">Last guess:</span>
      <motion.span
        initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: 0.2,
                delay: 0.5, // 500ms delay (100ms after emoji)
              }
        }
        className="text-foreground font-semibold"
      >
        {formatYear(currentGuess)}
      </motion.span>
      <motion.span
        initial={shouldReduceMotion ? {} : { opacity: 0, x: -10 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: 0.2,
                delay: 0.5, // 500ms delay (same as guess year)
              }
        }
        className="text-muted-foreground"
      >
        {temperatureText} • {direction}
      </motion.span>
    </motion.div>
  );
};

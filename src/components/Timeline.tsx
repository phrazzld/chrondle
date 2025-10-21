"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { getGuessDirectionInfo } from "@/lib/game/proximity";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { ANIMATION_SPRINGS, useReducedMotion } from "@/lib/animationConstants";

interface TimelineProps {
  minYear: number;
  maxYear: number;
  guesses: number[];
  targetYear: number | null;
  isGameComplete: boolean;
  hasWon: boolean;
}

interface GuessWithFeedback {
  year: number;
  direction: "earlier" | "later" | "correct";
}

export const Timeline: React.FC<TimelineProps> = ({ minYear, maxYear, guesses, targetYear }) => {
  // Respect user's motion preferences
  const shouldReduceMotion = useReducedMotion();

  // Display range state with simple transitions
  const [currentDisplayRange, setCurrentDisplayRange] = useState<{
    min: number;
    max: number;
  }>({ min: minYear, max: maxYear });

  // Track previous values for smooth animations
  const prevMinRef = useRef<number>(minYear);
  const prevMaxRef = useRef<number>(maxYear);

  // Track previous guess count for scroll detection
  const prevGuessCountRef = useRef<number>(guesses.length);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  // Calculate valid range and valid guesses
  const { validMin, validMax, validGuesses } = useMemo(() => {
    let validRangeMin = minYear;
    let validRangeMax = maxYear;
    const feedbackList: GuessWithFeedback[] = [];

    if (targetYear !== null) {
      guesses.forEach((guess) => {
        const { direction } = getGuessDirectionInfo(guess, targetYear);
        feedbackList.push({
          year: guess,
          direction: direction as "earlier" | "later" | "correct",
        });

        if (direction === "earlier") {
          // Too late - eliminate everything after this guess
          validRangeMax = Math.min(validRangeMax, guess - 1);
        } else if (direction === "later") {
          // Too early - eliminate everything before this guess
          validRangeMin = Math.max(validRangeMin, guess + 1);
        }
      });
    }

    // Get valid guesses within current range
    const validGuessList = feedbackList.filter(
      (g) => g.year >= validRangeMin && g.year <= validRangeMax,
    );

    return {
      validMin: validRangeMin,
      validMax: validRangeMax,
      validGuesses: validGuessList,
    };
  }, [minYear, maxYear, guesses, targetYear]);

  // Helper function to convert year to position on timeline (using animated range)
  const getPositionX = (year: number): number => {
    const percentage =
      (year - currentDisplayRange.min) / (currentDisplayRange.max - currentDisplayRange.min);
    return 50 + percentage * 700; // 50 to 750 on the SVG viewBox for full timeline width
  };

  /**
   * Initialize display range on first render
   * -2500 represents 2500 BC, covering the full historical span of the game
   * This range encompasses all possible puzzle years while maintaining a
   * comprehensible scope for players (ancient history to present)
   */
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    // Show full historical range from 2500 BC to current year
    const initialRange = { min: -2500, max: currentYear };

    // Set initial previous values to avoid animation on first load
    prevMinRef.current = initialRange.min;
    prevMaxRef.current = initialRange.max;

    setCurrentDisplayRange(initialRange);
  }, []); // Only run once on mount

  // Simple range update with animation tracking
  useEffect(() => {
    const newRange = { min: validMin, max: validMax };

    // Only update if values actually changed
    if (newRange.min !== currentDisplayRange.min || newRange.max !== currentDisplayRange.max) {
      // Capture current values as previous BEFORE updating
      prevMinRef.current = currentDisplayRange.min;
      prevMaxRef.current = currentDisplayRange.max;

      setCurrentDisplayRange(newRange);
    }
  }, [validMin, validMax, currentDisplayRange.min, currentDisplayRange.max]);

  // Smooth scroll to new guess marker when added
  useEffect(() => {
    if (guesses.length > prevGuessCountRef.current && timelineContainerRef.current) {
      // New guess added - scroll into view
      timelineContainerRef.current.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    prevGuessCountRef.current = guesses.length;
  }, [guesses.length, shouldReduceMotion]);

  return (
    <div ref={timelineContainerRef} className="mb-0 w-full">
      <div className="flex items-center justify-between gap-1 px-1 sm:gap-2">
        {/* Left bookend label */}
        <div className="min-w-0 flex-shrink-0 text-left">
          <span className="inline-flex items-baseline">
            <NumberTicker
              key={`min-${currentDisplayRange.min}`}
              value={Math.abs(Math.round(currentDisplayRange.min))}
              startValue={Math.abs(Math.round(prevMinRef.current))}
              className="text-sm font-bold whitespace-nowrap text-blue-500/80 sm:text-sm dark:text-blue-400/80"
              duration={800}
            />
            <span className="ml-1 text-sm font-bold text-blue-500/80 sm:text-sm dark:text-blue-400/80">
              {currentDisplayRange.min < 0 ? "BC" : "AD"}
            </span>
          </span>
        </div>

        {/* Timeline SVG */}
        <svg
          viewBox="0 25 800 50"
          className="h-16 flex-1 sm:h-16"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "hidden" }}
        >
          {/* Simple tick marks: start and end only */}
          {(() => {
            const startX = 50;
            const endX = 750;

            return [
              // Start tick
              <g key="start-tick">
                <line
                  x1={startX}
                  y1="35"
                  x2={startX}
                  y2="65"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted-foreground/50 sm:stroke-2"
                />
              </g>,

              // End tick
              <g key="end-tick">
                <line
                  x1={endX}
                  y1="35"
                  x2={endX}
                  y2="65"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted-foreground/50 sm:stroke-2"
                />
              </g>,
            ];
          })()}

          {/* Main timeline line - full width */}
          <line
            x1="50"
            y1="50"
            x2="750"
            y2="50"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className="text-muted-foreground/50 sm:stroke-3"
          />

          {/* Valid guesses on timeline */}
          {validGuesses
            .filter(
              (guess) =>
                guess.year >= currentDisplayRange.min && guess.year <= currentDisplayRange.max,
            )
            .map((guess, index) => {
              const x = getPositionX(guess.year);
              const isCorrect = guess.direction === "correct";

              // Color based on direction
              let colorClass = "text-muted-foreground";
              if (isCorrect) {
                colorClass = "text-green-600 dark:text-green-400";
              } else if (guess.direction === "earlier") {
                colorClass = "text-red-600 dark:text-red-400";
              } else if (guess.direction === "later") {
                colorClass = "text-blue-600 dark:text-blue-400";
              }

              return (
                <motion.g
                  key={`valid-${index}-${guess.year}`}
                  initial={shouldReduceMotion ? undefined : { scale: 0, opacity: 0 }}
                  animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
                  transition={
                    shouldReduceMotion
                      ? undefined
                      : {
                          type: "spring",
                          ...ANIMATION_SPRINGS.SMOOTH,
                          delay: 0.1, // 100ms delay after button press
                        }
                  }
                >
                  {!isCorrect && (
                    <circle cx={x} cy="50" r="10" fill="currentColor" className={colorClass} />
                  )}
                </motion.g>
              );
            })}
        </svg>

        {/* Right bookend label */}
        <div className="min-w-0 flex-shrink-0 text-right">
          <span className="inline-flex items-baseline">
            <NumberTicker
              key={`max-${currentDisplayRange.max}`}
              value={Math.abs(Math.round(currentDisplayRange.max))}
              startValue={Math.abs(Math.round(prevMaxRef.current))}
              className="text-sm font-bold whitespace-nowrap text-red-500/80 sm:text-sm dark:text-red-400/80"
              duration={800}
            />
            <span className="ml-1 text-sm font-bold text-red-500/80 sm:text-sm dark:text-red-400/80">
              {currentDisplayRange.max < 0 ? "BC" : "AD"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

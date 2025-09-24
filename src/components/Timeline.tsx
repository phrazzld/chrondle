"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getGuessDirectionInfo } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/NumberTicker";

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
  const shouldReduceMotion = useReducedMotion();

  // Display range state with simple transitions
  const [currentDisplayRange, setCurrentDisplayRange] = useState<{
    min: number;
    max: number;
  }>({ min: minYear, max: maxYear });

  // Track previous values for smooth animations
  const prevMinRef = useRef<number>(minYear);
  const prevMaxRef = useRef<number>(maxYear);

  // Hover state for showing year
  const [hoverInfo, setHoverInfo] = useState<{ year: number; x: number; visible: boolean } | null>(
    null,
  );
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const svgRef = useRef<SVGSVGElement>(null);

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

  // Helper function to convert position to year
  const getYearFromPosition = (x: number): number => {
    const percentage = (x - 50) / 700;
    const year =
      currentDisplayRange.min + percentage * (currentDisplayRange.max - currentDisplayRange.min);
    return Math.round(year);
  };

  // Handle mouse move on timeline
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * 800; // Convert to SVG coordinate space

    // Constrain to timeline bounds (50 to 750 in SVG space)
    if (svgX >= 50 && svgX <= 750) {
      const year = getYearFromPosition(svgX);

      // Clear existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Set new timeout for 100ms delay
      hoverTimeoutRef.current = setTimeout(() => {
        setHoverInfo({ year, x: svgX, visible: true });
      }, 100);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoverInfo(null);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <div className="mb-0 w-full">
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
          ref={svgRef}
          viewBox="0 25 800 50"
          className="h-16 flex-1 cursor-crosshair sm:h-16"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "hidden" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
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

          {/* Eliminated ranges with smooth transitions */}
          {(() => {
            const rangeStart = getPositionX(currentDisplayRange.min);
            const rangeEnd = getPositionX(currentDisplayRange.max);

            return (
              <>
                {/* Eliminated left range */}
                {validMin > currentDisplayRange.min && (
                  <motion.rect
                    x={50}
                    y="45"
                    width={rangeStart - 50}
                    height="10"
                    fill="currentColor"
                    className="text-muted-foreground/20"
                    initial={false}
                    animate={{ width: rangeStart - 50 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 25,
                      duration: shouldReduceMotion ? 0 : 0.3,
                    }}
                  />
                )}

                {/* Eliminated right range */}
                {validMax < currentDisplayRange.max && (
                  <motion.rect
                    x={rangeEnd}
                    y="45"
                    width={750 - rangeEnd}
                    height="10"
                    fill="currentColor"
                    className="text-muted-foreground/20"
                    initial={false}
                    animate={{ x: rangeEnd, width: 750 - rangeEnd }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 25,
                      duration: shouldReduceMotion ? 0 : 0.3,
                    }}
                  />
                )}
              </>
            );
          })()}

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
                <g key={`valid-${index}-${guess.year}`}>
                  {!isCorrect && (
                    <motion.circle
                      cx={x}
                      cy="50"
                      r="10"
                      fill="currentColor"
                      className={colorClass}
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                      animate={{
                        cx: x,
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 25,
                        duration: shouldReduceMotion ? 0 : 0.3,
                        opacity: { duration: shouldReduceMotion ? 0 : 0.2 },
                        scale: { duration: shouldReduceMotion ? 0 : 0.2 },
                      }}
                    />
                  )}
                </g>
              );
            })}

          {/* Hover indicator */}
          {hoverInfo?.visible && (
            <g>
              {/* Vertical line at hover position */}
              <motion.line
                x1={hoverInfo.x}
                y1="40"
                x2={hoverInfo.x}
                y2="60"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="text-muted-foreground/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              />

              {/* Year label background */}
              <motion.rect
                x={Math.max(80, Math.min(hoverInfo.x - 30, 640))}
                y="20"
                width="60"
                height="22"
                rx="4"
                fill="currentColor"
                className="text-background"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 0.95, y: 20 }}
                transition={{ duration: 0.15 }}
              />

              {/* Year label text */}
              <motion.text
                x={Math.max(110, Math.min(hoverInfo.x, 670))}
                y="35"
                textAnchor="middle"
                className="text-foreground fill-current text-xs font-medium"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 35 }}
                transition={{ duration: 0.15 }}
              >
                {Math.abs(hoverInfo.year)} {hoverInfo.year < 0 ? "BC" : "AD"}
              </motion.text>
            </g>
          )}
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

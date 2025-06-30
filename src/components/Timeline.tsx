'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { getGuessDirectionInfo } from '@/lib/utils';
import { NumberTicker } from '@/components/ui/NumberTicker';

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
  direction: 'earlier' | 'later' | 'correct';
}

export const Timeline: React.FC<TimelineProps> = ({
  minYear,
  maxYear,
  guesses,
  targetYear,
}) => {
  // Display range state with simple transitions
  const [currentDisplayRange, setCurrentDisplayRange] = useState<{min: number, max: number}>({min: minYear, max: maxYear});
  
  // Track previous values for smooth animations
  const prevMinRef = useRef<number>(minYear);
  const prevMaxRef = useRef<number>(maxYear);

  // Calculate valid range and valid guesses
  const { validMin, validMax, validGuesses } = useMemo(() => {
    let validRangeMin = minYear;
    let validRangeMax = maxYear;
    const feedbackList: GuessWithFeedback[] = [];
    
    if (targetYear !== null) {
      guesses.forEach(guess => {
        const { direction } = getGuessDirectionInfo(guess, targetYear);
        feedbackList.push({ year: guess, direction: direction as 'earlier' | 'later' | 'correct' });
        
        if (direction === 'earlier') {
          // Too late - eliminate everything after this guess
          validRangeMax = Math.min(validRangeMax, guess - 1);
        } else if (direction === 'later') {
          // Too early - eliminate everything before this guess
          validRangeMin = Math.max(validRangeMin, guess + 1);
        }
      });
    }
    
    // Get valid guesses within current range
    const validGuessList = feedbackList.filter(g => g.year >= validRangeMin && g.year <= validRangeMax);
    
    return { 
      validMin: validRangeMin, 
      validMax: validRangeMax, 
      validGuesses: validGuessList
    };
  }, [minYear, maxYear, guesses, targetYear]);
  
  // Helper function to convert year to position on timeline (using animated range)
  const getPositionX = (year: number): number => {
    const percentage = (year - currentDisplayRange.min) / (currentDisplayRange.max - currentDisplayRange.min);
    return 50 + (percentage * 700); // 50 to 750 on the SVG viewBox for full timeline width
  };
  
  // Initialize display range on first render with broader, intuitive range
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const initialRange = { min: -2000, max: currentYear }; // 2000 BC to current year
    
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
    <div className="w-full mb-0">
      <div className="flex items-center justify-between gap-1 sm:gap-2 px-1">
        {/* Left bookend label */}
        <div className="min-w-0 flex-shrink-0 text-left">
          <NumberTicker 
            key={`min-${currentDisplayRange.min}`}
            value={Math.round(currentDisplayRange.min)}
            startValue={Math.round(prevMinRef.current)}
            className="text-sm sm:text-sm font-bold text-blue-500/80 dark:text-blue-400/80 whitespace-nowrap"
            duration={800}
          />
        </div>
        
        {/* Timeline SVG */}
        <svg 
          viewBox="0 25 800 50" 
          className="flex-1 h-16 sm:h-16"
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: 'hidden' }}
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
            </g>
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
          .filter(guess => guess.year >= currentDisplayRange.min && guess.year <= currentDisplayRange.max)
          .map((guess, index) => {
            const x = getPositionX(guess.year);
            const isCorrect = guess.direction === 'correct';
            
            // Color based on direction
            let colorClass = 'text-muted-foreground';
            if (isCorrect) {
              colorClass = 'text-green-600 dark:text-green-400';
            } else if (guess.direction === 'earlier') {
              colorClass = 'text-red-600 dark:text-red-400';
            } else if (guess.direction === 'later') {
              colorClass = 'text-blue-600 dark:text-blue-400';
            }
            
            return (
              <g key={`valid-${index}-${guess.year}`}>
                {!isCorrect && (
                  <circle 
                    cx={x} 
                    cy="50" 
                    r="10" 
                    fill="currentColor" 
                    className={colorClass}
                  />
                )}
              </g>
            );
          })}
        
        </svg>
        
        {/* Right bookend label */}
        <div className="min-w-0 flex-shrink-0 text-right">
          <NumberTicker 
            key={`max-${currentDisplayRange.max}`}
            value={Math.round(currentDisplayRange.max)}
            startValue={Math.round(prevMaxRef.current)}
            className="text-sm sm:text-sm font-bold text-red-500/80 dark:text-red-400/80 whitespace-nowrap"
            duration={800}
          />
        </div>
      </div>
      
    </div>
  );
};
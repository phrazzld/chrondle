'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { formatYear, getGuessDirectionInfo } from '@/lib/utils';
import { getEnhancedProximityFeedback } from '@/lib/enhancedFeedback';

interface GuessHistoryProps {
  guesses: number[];
  targetYear: number;
  events: string[];
  className?: string;
}

interface GuessRowProps {
  guess: number;
  targetYear: number;
  hint: string;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const GuessRow: React.FC<GuessRowProps> = React.memo(({ 
  guess, 
  targetYear, 
  hint, 
  index,
  isExpanded,
  onToggleExpand
}) => {
  const isCorrect = guess === targetYear;
  const directionInfo = getGuessDirectionInfo(guess, targetYear);

  if (isCorrect) {
    return (
      <div
        className="guess-row-compact guess-row-correct"
        style={{ animationDelay: `${index * 100}ms` }}
        role="listitem"
        aria-label={`Guess ${index + 1}: ${formatYear(guess)} - Correct answer!`}
      >
        <div className="guess-content-compact">
          <div className="guess-year-direction">
            <span className="correct-badge">✓</span>
            <span className="year-display-compact font-bold">{formatYear(guess)}</span>
          </div>
          <span className="correct-text">CORRECT!</span>
        </div>
      </div>
    );
  }

  const distance = Math.abs(guess - targetYear);
  const distanceText = distance === 1 ? '1 year' : `${distance} years`;
  const cleanDirection = directionInfo.direction.toLowerCase().replace('▲', '').replace('▼', '').trim();
  
  // Get enhanced feedback for this guess
  const enhancedFeedback = getEnhancedProximityFeedback(guess, targetYear, {
    includeHistoricalContext: true,
    includeProgressiveTracking: false // Individual rows don't need progressive tracking
  });
  
  // Truncate hint for collapsed state
  const maxHintLength = 60;
  const truncatedHint = hint && hint.length > maxHintLength 
    ? `${hint.slice(0, maxHintLength)}...` 
    : hint;
  const displayHint = isExpanded ? hint : truncatedHint;
  const hasLongHint = hint && hint.length > maxHintLength;
  
  return (
    <div
      className="guess-row-compact"
      style={{ animationDelay: `${index * 100}ms` }}
      role="listitem"
      aria-label={`Guess ${index + 1}: ${formatYear(guess)} is ${cleanDirection}, off by ${distanceText}. ${isExpanded ? 'Full hint:' : 'Hint preview:'} ${displayHint || 'No more hints available.'}`}
    >
      <div className="guess-content-compact">
        <div className="guess-year-direction">
          <span 
            className="direction-badge-compact"
            style={{
              background: directionInfo.direction.includes('EARLIER') ? 'var(--feedback-earlier)' : 'var(--feedback-later)',
              color: 'white'
            }}
            aria-hidden="true"
          >
            {directionInfo.direction.replace('▲', '').replace('▼', '').trim()}
          </span>
          <span className="year-display-compact">{formatYear(guess)}</span>
        </div>
        <div className="distance-display-compact">
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {enhancedFeedback.encouragement}
          </span>
          {enhancedFeedback.historicalHint && (
            <div className="text-xs mt-1" style={{ color: 'var(--primary)', opacity: 0.8 }}>
              {enhancedFeedback.historicalHint}
            </div>
          )}
        </div>
      </div>
      
      {hint && (
        <div 
          className={`hint-compact ${hasLongHint ? 'hint-expandable' : ''}`}
          onClick={hasLongHint ? onToggleExpand : undefined}
          role={hasLongHint ? 'button' : undefined}
          tabIndex={hasLongHint ? 0 : undefined}
          onKeyDown={hasLongHint ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleExpand();
            }
          } : undefined}
          aria-expanded={hasLongHint ? isExpanded : undefined}
          aria-label={hasLongHint ? `Hint text. ${isExpanded ? 'Click to collapse' : 'Click to expand full hint'}` : 'Hint text'}
        >
          <span style={{ color: 'var(--muted-foreground)' }}>
            {displayHint || 'No more hints available.'}
          </span>
          {hasLongHint && (
            <span 
              className="expand-indicator"
              style={{ color: 'var(--primary)' }}
              aria-hidden="true"
            >
              {isExpanded ? ' [collapse]' : ' [expand]'}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

GuessRow.displayName = 'GuessRow';

export const GuessHistory: React.FC<GuessHistoryProps> = ({
  guesses,
  targetYear,
  events,
  className = ''
}) => {
  // State management for collapsible hints
  const [expandedHints, setExpandedHints] = useState(new Set<number>());
  
  // Toggle hint expansion
  const toggleHint = useCallback((index: number) => {
    setExpandedHints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);
  
  // Memoize the guess rows to prevent unnecessary re-renders
  const guessRows = useMemo(() => {
    return guesses.map((guess, index) => {
      const hint = events[index + 1] || 'No more hints available.';
      
      return (
        <GuessRow
          key={`${guess}-${index}`}
          guess={guess}
          targetYear={targetYear}
          hint={hint}
          index={index}
          isExpanded={expandedHints.has(index)}
          onToggleExpand={() => toggleHint(index)}
        />
      );
    });
  }, [guesses, targetYear, events, expandedHints, toggleHint]);

  if (guesses.length === 0) {
    return null;
  }

  return (
    <div 
      className={className}
      role="region"
      aria-label={`Your ${guesses.length} previous guess${guesses.length === 1 ? '' : 'es'}`}
    >
      <div className="mb-6">
        <h3 
          className="text-xl font-bold mb-2" 
          style={{ color: 'var(--foreground)' }}
          id="guess-history-heading"
        >
          Your Guesses
        </h3>
        <div 
          className="h-px w-full mb-4"
          style={{ background: 'var(--border)' }}
        />
      </div>
      <div 
        className="guess-history-grid"
        role="list"
        aria-labelledby="guess-history-heading"
      >
        {guessRows}
      </div>
    </div>
  );
};
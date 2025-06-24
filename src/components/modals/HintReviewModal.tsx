'use client';

import React from 'react';
import { BaseModal } from './BaseModal';
import { formatYear } from '@/lib/utils';
import { getEnhancedProximityFeedback } from '@/lib/enhancedFeedback';

interface HintReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  guessNumber: number;
  guess: number;
  targetYear: number;
  hint: string;
  totalGuesses?: number;
  onNavigate?: (direction: 'prev' | 'next') => void;
  touchHandlers?: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

export const HintReviewModal: React.FC<HintReviewModalProps> = ({
  isOpen,
  onClose,
  guessNumber,
  guess,
  targetYear,
  hint,
  totalGuesses = 1,
  onNavigate,
  touchHandlers
}) => {
  const enhancedFeedback = getEnhancedProximityFeedback(guess, targetYear, {
    includeHistoricalContext: true,
    includeProgressiveTracking: false
  });
  const distance = Math.abs(guess - targetYear);
  const isCorrect = guess === targetYear;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="text-center" {...touchHandlers}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {totalGuesses > 1 && onNavigate && (
              <button
                onClick={() => onNavigate('prev')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Previous guess"
              >
                <span className="text-lg">←</span>
              </button>
            )}
            <h2 
              className="text-2xl font-bold font-[family-name:var(--font-playfair-display)]"
              style={{ color: 'var(--foreground)' }}
            >
              Guess #{guessNumber} Review
            </h2>
            {totalGuesses > 1 && onNavigate && (
              <button
                onClick={() => onNavigate('next')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Next guess"
              >
                <span className="text-lg">→</span>
              </button>
            )}
          </div>
          {totalGuesses > 1 && (
            <div className="text-xs text-center mb-3" style={{ color: 'var(--muted-foreground)' }}>
              {guessNumber} of {totalGuesses} • Swipe left/right to navigate
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-lg">
            <span 
              className="font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              You guessed: {formatYear(guess)}
            </span>
            {!isCorrect && (
              <span 
                className="text-sm px-2 py-1 rounded-lg"
                style={{ 
                  background: distance <= 25 ? 'var(--feedback-success)' : 'var(--status-error)',
                  color: 'white'
                }}
              >
                {distance === 1 ? '1 year off' : `${distance} years off`}
              </span>
            )}
          </div>
        </div>

        {/* Proximity Feedback */}
        <div className="mb-6">
          {isCorrect ? (
            <div 
              className="text-xl font-bold p-4 rounded-lg"
              style={{ 
                background: 'var(--feedback-correct)',
                color: 'white'
              }}
            >
              🎉 CORRECT! 🎉
            </div>
          ) : (
            <div 
              className="text-lg font-semibold p-3 rounded-lg"
              style={{ 
                background: 'var(--input)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)'
              }}
            >
              <div className="mb-2">{enhancedFeedback.encouragement}</div>
              {enhancedFeedback.historicalHint && (
                <div className="text-sm font-normal" style={{ color: 'var(--primary)', opacity: 0.9 }}>
                  {enhancedFeedback.historicalHint}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hint Display */}
        <div className="mb-6">
          <h3 
            className="text-lg font-semibold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Hint #{guessNumber}:
          </h3>
          <div 
            className="p-4 rounded-lg text-left border-l-4"
            style={{ 
              background: 'var(--input)',
              borderColor: 'var(--primary)',
              color: 'var(--foreground)'
            }}
          >
            <p className="text-base leading-relaxed">{hint}</p>
          </div>
        </div>

        {/* Target Year Revelation (only if correct) */}
        {isCorrect && (
          <div className="mb-6">
            <div 
              className="p-4 rounded-lg"
              style={{ 
                background: 'var(--surface)',
                border: '2px solid var(--feedback-correct)'
              }}
            >
              <p 
                className="text-lg font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Target Year: {formatYear(targetYear)}
              </p>
              <p 
                className="text-sm mt-1"
                style={{ color: 'var(--muted-foreground)' }}
              >
                All events in this puzzle happened in {formatYear(targetYear)}
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="w-full btn-primary py-3 px-6 text-lg font-semibold"
        >
          Continue Game
        </button>
      </div>
    </BaseModal>
  );
};
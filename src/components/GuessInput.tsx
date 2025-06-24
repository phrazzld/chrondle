'use client';

import React, { useState, useCallback, FormEvent, useRef, useEffect, KeyboardEvent } from 'react';
import { isValidYear, GAME_CONFIG } from '@/lib/constants';

interface GuessInputProps {
  onGuess: (guess: number) => void;
  disabled: boolean;
  remainingGuesses: number;
  maxGuesses: number;
  onValidationError?: (message: string) => void;
  className?: string;
}

export const GuessInput: React.FC<GuessInputProps> = ({
  onGuess,
  disabled,
  remainingGuesses,
  maxGuesses,
  onValidationError,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount and after submission
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]); // On mount and when disabled state changes

  // Auto-focus after successful submission (when inputValue resets to empty)
  useEffect(() => {
    if (inputValue === '' && !disabled && inputRef.current) {
      // Small delay to ensure DOM updates complete
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [inputValue, disabled]);

  // Keyboard navigation: Arrow keys for year increment/decrement
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    const currentValue = parseInt(inputValue, 10) || new Date().getFullYear();
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        const increment = e.shiftKey ? 10 : 1;
        const newUpValue = Math.min(currentValue + increment, GAME_CONFIG.MAX_YEAR);
        setInputValue(newUpValue.toString());
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        const decrement = e.shiftKey ? 10 : 1;
        const newDownValue = Math.max(currentValue - decrement, GAME_CONFIG.MIN_YEAR);
        setInputValue(newDownValue.toString());
        break;
    }
  }, [inputValue, disabled]);

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent double submission during animation
    if (isSubmitting) return;
    
    const guess = parseInt(inputValue, 10);
    
    // Validation
    if (isNaN(guess) || !isValidYear(guess)) {
      onValidationError?.('Please enter a valid year.');
      return;
    }

    // Trigger animation immediately for instant feedback
    setIsSubmitting(true);
    
    // Use requestAnimationFrame for optimal timing
    requestAnimationFrame(() => {
      // Make the guess
      onGuess(guess);
      setInputValue('');
      
      // Remove animation class after animation completes (150ms)
      setTimeout(() => {
        setIsSubmitting(false);
      }, 150);
    });
  }, [inputValue, onGuess, onValidationError, isSubmitting]);

  const buttonText = disabled ? 'Game Over' : 'Submit';
  const isSubmitDisabled = disabled || remainingGuesses <= 0;
  const currentGuess = maxGuesses - remainingGuesses + 1;

  return (
    <div className={className}>      
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter year (e.g., 1969)"
            className="w-full p-3 text-lg text-center rounded-lg border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white focus:bg-white border-border focus:border-primary focus:shadow-lg focus:shadow-primary/15"
            style={{
              color: 'var(--foreground)'
            }}
            title="Use ↑↓ arrow keys (±1 year) or Shift+↑↓ (±10 years)"
            required
            disabled={disabled}
            aria-label="Enter your year guess. Use arrow keys to increment or decrement."
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${
              isSubmitting ? 'submitting' : ''
            }`}
            style={{
              ...(isSubmitDisabled && {
                background: 'var(--muted-foreground)',
                color: 'white'
              })
            }}
          >
            {buttonText}
          </button>
          <span className="text-xs text-muted-foreground">
            {currentGuess}/{maxGuesses}
          </span>
        </div>
      </form>
    </div>
  );
};
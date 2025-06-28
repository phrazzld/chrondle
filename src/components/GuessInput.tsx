'use client';

import React, { useState, useCallback, FormEvent, useRef, useEffect, KeyboardEvent } from 'react';
import { isValidYear, GAME_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GuessInputProps {
  onGuess: (guess: number) => void;
  disabled: boolean;
  remainingGuesses: number;
  onValidationError?: (message: string) => void;
  className?: string;
}

export const GuessInput: React.FC<GuessInputProps> = ({
  onGuess,
  disabled,
  remainingGuesses,
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

  const buttonText = disabled ? 'Game Over' : 'Guess';
  const isSubmitDisabled = disabled || remainingGuesses <= 0;

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex gap-3">
        {/* Clean Input Field */}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter year (e.g. 1969 or -450 for BC)"
          className="text-2xl text-left font-accent font-bold h-12 bg-background border-2 border-input focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200 shadow-sm flex-1 tracking-wide"
          title="Use ↑↓ arrow keys (±1 year) or Shift+↑↓ (±10 years). Use negative numbers for BC years (e.g. -450 for 450 BC)"
          required
          disabled={disabled}
          aria-label="Enter your year guess. Use arrow keys to increment or decrement. Use negative numbers for BC years."
        />

        {/* Clean Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          size="lg"
          className={`h-12 px-8 text-lg font-accent font-semibold tracking-wide transition-all duration-200 ${isSubmitting
            ? 'scale-105 bg-primary/90 shadow-lg animate-pulse'
            : 'hover:bg-primary/90'
            }`}
        >
          {buttonText}
        </Button>
      </form>
    </div>
  );
};

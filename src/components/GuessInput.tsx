'use client';

import React, { useState, useCallback, FormEvent } from 'react';
import { isValidYear } from '@/lib/constants';

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

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const guess = parseInt(inputValue, 10);
    
    // Validation
    if (isNaN(guess) || !isValidYear(guess)) {
      onValidationError?.('Please enter a valid year.');
      return;
    }

    // Make the guess
    onGuess(guess);
    setInputValue('');
  }, [inputValue, onGuess, onValidationError]);

  const buttonText = disabled ? 'Game Over' : 'Submit';
  const isSubmitDisabled = disabled || remainingGuesses <= 0;
  const currentGuess = maxGuesses - remainingGuesses + 1;

  return (
    <div className={className}>      
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <div className="flex-1">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter year (e.g., 1969)"
            className="w-full p-3 text-lg text-center rounded-lg border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--input)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
            }}
            required
            disabled={disabled}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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
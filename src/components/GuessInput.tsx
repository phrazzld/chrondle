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

  const buttonText = `Guess (${remainingGuesses}/${maxGuesses})`;
  const isSubmitDisabled = disabled || remainingGuesses <= 0;

  return (
    <div className={className}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Make Your Guess
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Remaining guesses: <span className="font-medium">{remainingGuesses}/{maxGuesses}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a year (e.g. 1969 AD or -776 for 776 BC)..."
          className="w-full p-4 text-lg text-center rounded-lg border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="btn-primary sm:whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          style={{
            ...(isSubmitDisabled && {
              background: 'var(--muted-foreground)',
              color: 'white'
            })
          }}
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
};
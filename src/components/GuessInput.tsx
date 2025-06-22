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
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 mb-4 ${className}`}>
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter a year (e.g. 1969 AD or -776 for 776 BC)..."
        className={`
          w-full p-3 text-lg 
          bg-gray-200 dark:bg-gray-700 
          border-2 border-transparent 
          focus:border-indigo-500 focus:ring-0 
          rounded-lg text-center
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        required
        disabled={disabled}
      />
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className={`
          bg-indigo-600 hover:bg-indigo-700 
          text-white font-bold 
          py-3 px-6 rounded-lg 
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isSubmitDisabled ? 'bg-gray-400 hover:bg-gray-400' : ''}
        `}
      >
        {buttonText}
      </button>
    </form>
  );
};
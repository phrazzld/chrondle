'use client';

import React, { useState, useCallback, FormEvent, useRef } from 'react';
import { isValidYear } from '@/lib/constants';
import { TimelineSlider } from '@/components/ui/TimelineSlider';

interface EnhancedGuessInputProps {
  onGuess: (guess: number) => void;
  disabled: boolean;
  remainingGuesses: number;
  maxGuesses: number;
  onValidationError?: (message: string) => void;
  className?: string;
}

export const EnhancedGuessInput: React.FC<EnhancedGuessInputProps> = ({
  onGuess,
  disabled,
  remainingGuesses,
  maxGuesses,
  onValidationError,
  className = ''
}) => {
  const [yearValue, setYearValue] = useState(new Date().getFullYear());
  const [textInputValue, setTextInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Handle slider value change
  const handleSliderChange = useCallback((newYear: number) => {
    setYearValue(newYear);
    setTextInputValue(newYear.toString());
  }, []);

  // Handle text input change
  const handleTextInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTextInputValue(value);
    
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && isValidYear(parsed)) {
      setYearValue(parsed);
    }
  }, []);

  // Toggle between slider and text input
  const toggleInputMode = useCallback(() => {
    setShowTextInput(!showTextInput);
    if (!showTextInput) {
      setTextInputValue(yearValue.toString());
      // Focus text input when switching to it
      setTimeout(() => textInputRef.current?.focus(), 0);
    }
  }, [showTextInput, yearValue]);

  // Handle form submission
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const finalValue = showTextInput ? parseInt(textInputValue, 10) : yearValue;
    
    // Validation
    if (isNaN(finalValue) || !isValidYear(finalValue)) {
      onValidationError?.('Please enter a valid year.');
      return;
    }

    // Trigger animation
    setIsSubmitting(true);
    
    requestAnimationFrame(() => {
      onGuess(finalValue);
      
      // Reset to current year after submission
      const currentYear = new Date().getFullYear();
      setYearValue(currentYear);
      setTextInputValue('');
      setShowTextInput(false);
      
      setTimeout(() => {
        setIsSubmitting(false);
      }, 150);
    });
  }, [showTextInput, textInputValue, yearValue, onGuess, onValidationError, isSubmitting]);

  const buttonText = disabled ? 'Game Over' : 'Submit';
  const isSubmitDisabled = disabled || remainingGuesses <= 0;
  const currentGuess = maxGuesses - remainingGuesses + 1;

  return (
    <div className={className}>
      <form onSubmit={handleSubmit}>
        {/* Timeline Slider Mode */}
        {!showTextInput && (
          <div className="mb-4">
            <TimelineSlider
              value={yearValue}
              onChange={handleSliderChange}
              disabled={disabled}
              className="mb-3"
            />
          </div>
        )}

        {/* Text Input Mode */}
        {showTextInput && (
          <div className="mb-4">
            <input
              ref={textInputRef}
              type="number"
              value={textInputValue}
              onChange={handleTextInputChange}
              placeholder="Enter year (e.g., 1969)"
              className="w-full p-3 text-lg text-center rounded-lg border-2 font-medium transition-all duration-200 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed bg-white focus:bg-white border-border focus:border-primary focus:shadow-lg focus:shadow-primary/15"
              style={{
                color: 'var(--foreground)'
              }}
              required
              disabled={disabled}
              aria-label="Enter your year guess"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={toggleInputMode}
            className="btn-secondary px-4 py-2 text-sm"
            disabled={disabled}
            aria-label={showTextInput ? 'Switch to timeline slider' : 'Switch to text input'}
          >
            {showTextInput ? '📊 Timeline' : '⌨️ Type'}
          </button>
          
          <div className="flex-1" />
          
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
        </div>
      </form>
    </div>
  );
};
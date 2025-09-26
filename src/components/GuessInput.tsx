"use client";

import React, { useState, useCallback, FormEvent, useRef, useEffect, KeyboardEvent } from "react";
import { isValidYear } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { EraToggle } from "@/components/ui/EraToggle";
import { validateGuessInputProps } from "@/lib/propValidation";
import type { Era } from "@/lib/eraUtils";
import { convertToInternalYear, isValidEraYear } from "@/lib/eraUtils";
import { ANIMATION_DURATIONS } from "@/lib/animationConstants";

interface GuessInputProps {
  onGuess: (guess: number) => void;
  disabled: boolean;
  remainingGuesses: number;
  onValidationError?: (message: string) => void;
  className?: string;
  isLoading?: boolean;
}

/**
 * GuessInput component with BC/AD toggle for entering historical years
 */
export const GuessInput: React.FC<GuessInputProps> = (props) => {
  // Validate props in development
  validateGuessInputProps(props);

  const {
    onGuess,
    disabled,
    remainingGuesses,
    onValidationError,
    className = "",
    isLoading = false,
  } = props;

  // Separate year and era states
  const [year, setYear] = useState("");
  const [era, setEra] = useState<Era>("AD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Consolidated focus management
  useEffect(() => {
    // Focus on mount and keep focus unless game is over
    if (!disabled && inputRef.current) {
      // Use requestAnimationFrame for reliable focus after DOM updates
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [disabled, year]); // Re-focus when year changes (after submission) or disabled changes

  // Keyboard event handler - currently disabled to prevent game integrity issues
  // Arrow key navigation was removed as it could reveal puzzle information
  const handleKeyDown = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_e: KeyboardEvent<HTMLInputElement>) => {
      // Disabled to prevent game integrity violations
      // Per CLAUDE.md: UI should not react differently based on proximity to answer
      return;
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Prevent double submission during animation
      if (isSubmitting) return;

      const yearValue = parseInt(year, 10);

      // Validation - check if year is valid for the selected era
      if (isNaN(yearValue) || !isValidEraYear(yearValue, era)) {
        onValidationError?.("Please enter a valid year.");
        return;
      }

      // Convert UI representation (positive + era) to internal format (negative for BC)
      let internalYear: number;
      try {
        internalYear = convertToInternalYear(yearValue, era);
      } catch (error) {
        console.error("Failed to convert year:", error);
        onValidationError?.("Failed to process year. Please try again.");
        return;
      }

      // Double-check the internal year is valid
      if (!isValidYear(internalYear)) {
        onValidationError?.("Please enter a valid year.");
        return;
      }

      // Trigger animation immediately for instant feedback
      setIsSubmitting(true);

      // Make the guess with the internal year format
      onGuess(internalYear);
      setYear("");
      // Keep the era as-is for user convenience (don't reset to default)

      // Explicitly refocus the input to keep keyboard open on mobile
      inputRef.current?.focus();

      // Remove animation class after animation completes
      setTimeout(() => {
        setIsSubmitting(false);
      }, ANIMATION_DURATIONS.BUTTON_PRESS);
    },
    [year, era, onGuess, onValidationError, isSubmitting],
  );

  const getButtonText = (
    remainingGuesses: number,
    disabled: boolean,
    isLoading: boolean,
    isSubmitting: boolean,
  ): string => {
    // Show loading state first, before checking disabled
    if (isLoading) return "Loading game...";
    // Show submitting state during guess submission
    if (isSubmitting) return "Guessing...";
    // Only show "Game Over" if disabled and NOT loading
    if (disabled) return "Game Over";
    if (remainingGuesses === 0) return "No guesses remaining";
    return "Guess";
  };

  const buttonText = getButtonText(remainingGuesses, disabled, isLoading, isSubmitting);
  const isSubmitDisabled = disabled || remainingGuesses <= 0;

  return (
    <div className={`${className} mb-0`}>
      <form
        onSubmit={handleSubmit}
        className="mb-0 flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2"
      >
        {/* Combined Input and Era Toggle Container */}
        <div
          className={`bg-background border-input focus-within:border-primary focus-within:ring-primary/20 relative flex h-14 flex-1 items-center overflow-hidden rounded-md border-2 shadow-sm transition-all duration-200 focus-within:ring-2 sm:h-12 ${
            isSubmitting ? "animate-input-pulse" : ""
          }`}
        >
          {/* Year Input Field - No border, fills container */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="done"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter year"
            className="font-accent flex-1 border-0 bg-transparent px-3 py-3 text-left text-lg font-bold tracking-wide placeholder:text-sm placeholder:font-normal focus:outline-none sm:py-2 sm:text-2xl sm:placeholder:text-base"
            title="Use ↑↓ arrow keys (±1 year) or Shift+↑↓ (±10 years) to adjust the year"
            required
            disabled={disabled}
            aria-label={`Enter your year guess. Current era: ${era}. Use arrow keys to increment or decrement.`}
            aria-describedby={undefined}
          />

          {/* BC/AD Era Toggle - Embedded in container */}
          <div className="pr-2">
            <EraToggle
              value={era}
              onChange={setEra}
              disabled={disabled}
              size="default"
              className="bg-muted/50 border-0 shadow-none"
              aria-label="Select era: BC or AD"
            />
          </div>
        </div>

        {/* Submit Button - Responsive width and height */}
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          size="lg"
          aria-label={`Submit guess (${remainingGuesses} remaining)`}
          className={`font-accent h-14 w-full px-8 text-lg font-semibold tracking-wide transition-all duration-200 sm:h-12 sm:w-auto sm:min-w-[120px] ${
            isSubmitting ? "animate-button-press bg-primary/90 shadow-lg" : "hover:bg-primary/90"
          }`}
        >
          {buttonText}
        </Button>
      </form>
    </div>
  );
};

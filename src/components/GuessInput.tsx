"use client";

import React, {
  useState,
  useCallback,
  FormEvent,
  useRef,
  useEffect,
  KeyboardEvent,
} from "react";
import { isValidYear } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EraToggle } from "@/components/ui/EraToggle";
import { validateGuessInputProps } from "@/lib/propValidation";
import type { Era } from "@/lib/eraUtils";
import { convertToInternalYear, isValidEraYear } from "@/lib/eraUtils";

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

      // Use requestAnimationFrame for optimal timing
      requestAnimationFrame(() => {
        // Make the guess with the internal year format
        onGuess(internalYear);
        setYear("");
        // Keep the era as-is for user convenience (don't reset to default)

        // Explicitly refocus the input to keep keyboard open on mobile
        inputRef.current?.focus();

        // Remove animation class after animation completes (150ms)
        setTimeout(() => {
          setIsSubmitting(false);
        }, 150);
      });
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

  const buttonText = getButtonText(
    remainingGuesses,
    disabled,
    isLoading,
    isSubmitting,
  );
  const isSubmitDisabled = disabled || remainingGuesses <= 0;

  return (
    <div className={`${className} mb-0`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-0">
        {/* Input and Era Toggle Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Positive Year Input Field */}
          <div className="flex-1 w-full sm:w-auto">
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="done"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter year (e.g. 1969 or 776)"
              className="text-lg sm:text-2xl text-left font-accent font-bold h-12 bg-background border-2 border-input focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200 shadow-sm w-full tracking-wide"
              title="Use ↑↓ arrow keys (±1 year) or Shift+↑↓ (±10 years) to adjust the year"
              required
              disabled={disabled}
              aria-label={`Enter your year guess. Current era: ${era}. Use arrow keys to increment or decrement.`}
              aria-describedby={undefined}
            />
          </div>

          {/* BC/AD Era Toggle */}
          <EraToggle
            value={era}
            onChange={setEra}
            disabled={disabled}
            size="lg"
            width="full"
            className="h-12 sm:w-auto"
            aria-label="Select era: BC or AD"
          />
        </div>

        {/* Submit Button Row */}
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          size="lg"
          aria-label={`Submit guess (${remainingGuesses} remaining)`}
          className={`h-12 px-8 text-lg font-accent font-semibold tracking-wide transition-all duration-200 w-full ${
            isSubmitting
              ? "scale-105 bg-primary/90 shadow-lg animate-pulse"
              : "hover:bg-primary/90"
          }`}
        >
          {buttonText}
        </Button>
      </form>
    </div>
  );
};

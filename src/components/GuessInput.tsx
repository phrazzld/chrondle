"use client";

import React, {
  useState,
  useCallback,
  FormEvent,
  useRef,
  useEffect,
  KeyboardEvent,
  useMemo,
} from "react";
import { isValidYear } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EraToggle } from "@/components/ui/EraToggle";
import { validateGuessInputProps } from "@/lib/propValidation";
import type { Era } from "@/lib/eraUtils";
import {
  convertToInternalYear,
  isValidEraYear,
  getEraYearRange,
  adjustYearWithinEra,
  formatEraYear,
  suggestEra,
} from "@/lib/eraUtils";

interface GuessInputProps {
  onGuess: (guess: number) => void;
  disabled: boolean;
  remainingGuesses: number;
  onValidationError?: (message: string) => void;
  className?: string;
  isLoading?: boolean;
}

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

  // Real-time formatted display
  const formattedYear = useMemo(() => {
    const yearValue = parseInt(year, 10);
    if (isNaN(yearValue) || yearValue <= 0) return "";
    return formatEraYear(yearValue, era);
  }, [year, era]);

  // Auto-suggest era based on year value
  useEffect(() => {
    const yearValue = parseInt(year, 10);
    if (!isNaN(yearValue) && yearValue > 0) {
      const suggested = suggestEra(yearValue);
      // Only auto-suggest if user hasn't manually selected an era yet
      if (year.length <= 4 && suggested !== era) {
        // Optional: could add logic to only suggest on first input
        // For now, we'll let users control the era manually
      }
    }
  }, [year, era]);

  // Auto-focus on mount and after submission
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]); // On mount and when disabled state changes

  // Auto-focus after successful submission (when year resets to empty)
  useEffect(() => {
    if (year === "" && !disabled && inputRef.current) {
      // Small delay to ensure DOM updates complete
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [year, disabled]);

  // Keyboard navigation: Arrow keys for year increment/decrement within era bounds
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const currentYear = parseInt(year, 10) || 1;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          const increment = e.shiftKey ? 10 : 1;
          const newUpValue = adjustYearWithinEra(currentYear, era, increment);
          setYear(newUpValue.toString());
          break;

        case "ArrowDown":
          e.preventDefault();
          const decrement = e.shiftKey ? 10 : 1;
          const newDownValue = adjustYearWithinEra(
            currentYear,
            era,
            -decrement,
          );
          setYear(newDownValue.toString());
          break;
      }
    },
    [year, era, disabled],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Prevent double submission during animation
      if (isSubmitting) return;

      const yearValue = parseInt(year, 10);

      // Validation - check if year is valid for the selected era
      if (isNaN(yearValue) || !isValidEraYear(yearValue, era)) {
        onValidationError?.(
          `Please enter a valid ${era} year. Valid range: ${
            getEraYearRange(era).min
          } - ${getEraYearRange(era).max}`,
        );
        return;
      }

      // Convert UI representation (positive + era) to internal format (negative for BC)
      const internalYear = convertToInternalYear(yearValue, era);

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
              aria-describedby={formattedYear ? "formatted-year" : undefined}
            />
            {/* Real-time formatted display */}
            {formattedYear && (
              <div
                id="formatted-year"
                className="mt-1 text-sm text-muted-foreground font-medium"
                aria-live="polite"
              >
                {formattedYear}
              </div>
            )}
          </div>

          {/* BC/AD Era Toggle */}
          <EraToggle
            value={era}
            onChange={setEra}
            disabled={disabled}
            size="default"
            className="h-12"
            aria-label="Select era: BC or AD"
          />
        </div>

        {/* Submit Button Row */}
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          size="lg"
          aria-label={`Submit guess for ${formattedYear || "year"} (${remainingGuesses} remaining)`}
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

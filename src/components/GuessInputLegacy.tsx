"use client";

import React, {
  useState,
  useCallback,
  FormEvent,
  useRef,
  useEffect,
  KeyboardEvent,
} from "react";
import { isValidYear, GAME_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateGuessInputProps } from "@/lib/propValidation";

interface GuessInputProps {
  onGuess: (guess: number) => void;
  disabled: boolean;
  remainingGuesses: number;
  onValidationError?: (message: string) => void;
  className?: string;
  isLoading?: boolean;
}

/**
 * Legacy GuessInput component that uses negative numbers for BC years
 * This is the original implementation before BC/AD toggle was added
 */
export const GuessInputLegacy: React.FC<GuessInputProps> = (props) => {
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

  const [inputValue, setInputValue] = useState("");
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
    if (inputValue === "" && !disabled && inputRef.current) {
      // Small delay to ensure DOM updates complete
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [inputValue, disabled]);

  // Keyboard navigation: Arrow keys for year increment/decrement
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;

      const currentValue = parseInt(inputValue, 10) || new Date().getFullYear();

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          const increment = e.shiftKey ? 10 : 1;
          const newUpValue = Math.min(
            currentValue + increment,
            GAME_CONFIG.MAX_YEAR,
          );
          setInputValue(newUpValue.toString());
          break;

        case "ArrowDown":
          e.preventDefault();
          const decrement = e.shiftKey ? 10 : 1;
          const newDownValue = Math.max(
            currentValue - decrement,
            GAME_CONFIG.MIN_YEAR,
          );
          setInputValue(newDownValue.toString());
          break;
      }
    },
    [inputValue, disabled],
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Prevent double submission during animation
      if (isSubmitting) return;

      const guess = parseInt(inputValue, 10);

      // Validation
      if (isNaN(guess) || !isValidYear(guess)) {
        onValidationError?.("Please enter a valid year.");
        return;
      }

      // Trigger animation immediately for instant feedback
      setIsSubmitting(true);

      // Use requestAnimationFrame for optimal timing
      requestAnimationFrame(() => {
        // Make the guess
        onGuess(guess);
        setInputValue("");

        // Remove animation class after animation completes (150ms)
        setTimeout(() => {
          setIsSubmitting(false);
        }, 150);
      });
    },
    [inputValue, onGuess, onValidationError, isSubmitting],
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
        {/* Legacy Single Input Field (allows negative numbers for BC) */}
        <div className="flex-1 w-full">
          <Input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter year (e.g., 1969 or -776 for 776 BC)"
            className="text-lg sm:text-2xl text-left font-accent font-bold h-12 bg-background border-2 border-input focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200 shadow-sm w-full tracking-wide"
            title="Use ↑↓ arrow keys (±1 year) or Shift+↑↓ (±10 years) to adjust the year. Use negative numbers for BC years."
            required
            disabled={disabled}
            aria-label="Enter your year guess. Use negative numbers for BC years. Use arrow keys to increment or decrement."
            min={GAME_CONFIG.MIN_YEAR}
            max={GAME_CONFIG.MAX_YEAR}
          />
          {/* Helper text for BC years */}
          <div className="mt-1 text-sm text-muted-foreground font-medium">
            Use negative numbers for BC years (e.g., -776 for 776 BC)
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitDisabled}
          size="lg"
          aria-label={`Submit guess for year ${inputValue || "unspecified"} (${remainingGuesses} remaining)`}
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

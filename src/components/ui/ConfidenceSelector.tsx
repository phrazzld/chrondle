"use client";

import React from "react";
import type { ConfidenceLevel } from "@/types/confidence";
import { CONFIDENCE_CONFIGS } from "@/types/confidence";

interface ConfidenceSelectorProps {
  /** Currently selected confidence level */
  value: ConfidenceLevel;

  /** Callback when confidence changes */
  onChange: (value: ConfidenceLevel) => void;

  /** Whether buttons are disabled */
  disabled?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Confidence selector component
 *
 * Presents three simple buttons for players to express confidence level.
 * Replaces complex wager slider with intuitive emoji-based choice.
 *
 * @example
 * <ConfidenceSelector
 *   value="confident"
 *   onChange={(level) => setConfidence(level)}
 * />
 */
export const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const levels: ConfidenceLevel[] = ["cautious", "confident", "bold"];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <div className="text-center">
        <h3 className="text-foreground text-sm font-medium">Your Confidence:</h3>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {levels.map((level) => {
          const config = CONFIDENCE_CONFIGS[level];
          const isSelected = value === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              disabled={disabled}
              aria-label={`${config.label} - ${config.description}`}
              aria-pressed={isSelected}
              className={`focus-visible:ring-ring flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:p-4 ${
                isSelected
                  ? "border-primary bg-primary/10 ring-primary/20 shadow-md ring-2"
                  : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
              } `}
            >
              {/* Emoji */}
              <span className="mb-1 text-3xl sm:text-4xl" aria-hidden="true">
                {config.emoji}
              </span>

              {/* Label */}
              <span
                className={`mb-1 text-sm font-semibold sm:text-base ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                {config.label}
              </span>

              {/* Risk/Reward indicators */}
              <div className="flex flex-col items-center gap-0.5 text-xs">
                {config.bonus > 0 && (
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ✓ +{config.bonus} pts
                  </span>
                )}
                {config.bonus === 0 && (
                  <span className="text-muted-foreground font-medium">✓ +0 pts</span>
                )}
                <span className="font-medium text-red-600 dark:text-red-400">
                  ✗ -{config.penalty} pts
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Screen reader description */}
      <p className="sr-only">
        Select your confidence level. Higher confidence gives bonus points for correct guesses but
        larger penalties for wrong guesses. Cautious is safe with no bonus, Confident offers
        balanced risk and reward, Bold maximizes score when certain but risks large penalties.
      </p>
    </div>
  );
};

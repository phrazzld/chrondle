"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatYear } from "@/lib/displayFormatting";
import { getEnhancedProximityFeedback } from "@/lib/enhancedFeedback";

interface HintReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  guessNumber: number;
  guess: number;
  targetYear: number;
  hint: string;
  totalGuesses?: number;
  onNavigate?: (direction: "prev" | "next") => void;
  touchHandlers?: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

export const HintReviewModal: React.FC<HintReviewModalProps> = ({
  isOpen,
  onClose,
  guessNumber,
  guess,
  targetYear,
  hint,
  totalGuesses = 1,
  onNavigate,
  touchHandlers,
}) => {
  const enhancedFeedback = getEnhancedProximityFeedback(guess, targetYear, {
    includeHistoricalContext: true,
    includeProgressiveTracking: false,
  });
  const distance = Math.abs(guess - targetYear);
  const isCorrect = guess === targetYear;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-11/12 sm:max-w-md md:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            {totalGuesses > 1 && onNavigate && (
              <Button
                onClick={() => onNavigate("prev")}
                variant="ghost"
                size="sm"
                aria-label="Previous guess"
              >
                ←
              </Button>
            )}
            <DialogTitle className="text-2xl font-heading font-bold">
              Guess #{guessNumber} Review
            </DialogTitle>
            {totalGuesses > 1 && onNavigate && (
              <Button
                onClick={() => onNavigate("next")}
                variant="ghost"
                size="sm"
                aria-label="Next guess"
              >
                →
              </Button>
            )}
          </div>
          {totalGuesses > 1 && (
            <div className="text-xs text-center mb-3 text-muted-foreground">
              {guessNumber} of {totalGuesses} • Swipe left/right to navigate
            </div>
          )}
        </DialogHeader>

        <div className="text-center" {...touchHandlers}>
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 text-lg">
              <span className="font-accent font-bold text-foreground tracking-wide">
                You guessed: {formatYear(guess)}
              </span>
              {!isCorrect && (
                <span
                  className={`text-sm px-2 py-1 rounded-lg text-white ${
                    distance <= 25 ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {distance === 1 ? "1 year off" : `${distance} years off`}
                </span>
              )}
            </div>
          </div>

          {/* Proximity Feedback */}
          <div className="mb-6">
            {isCorrect ? (
              <div className="text-xl font-bold p-4 rounded-lg bg-green-600 text-white">
                CORRECT!
              </div>
            ) : (
              <div className="text-lg font-semibold p-3 rounded-lg bg-secondary border text-foreground">
                <div className="mb-2">{enhancedFeedback.encouragement}</div>
                {enhancedFeedback.historicalHint && (
                  <div className="text-sm font-normal text-primary opacity-90">
                    {enhancedFeedback.historicalHint}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hint Display */}
          <div className="mb-6">
            <h3 className="text-lg font-heading font-semibold mb-3 text-foreground">
              Hint #{guessNumber}:
            </h3>
            <div className="p-4 rounded-lg text-left border-l-4 border-primary bg-secondary text-foreground">
              <p className="text-base font-body leading-relaxed">{hint}</p>
            </div>
          </div>

          {/* Target Year Revelation (only if correct) */}
          {isCorrect && (
            <div className="mb-6">
              <div className="p-4 rounded-lg border-2 border-green-600 bg-muted">
                <p className="text-lg font-accent font-semibold text-foreground tracking-wide">
                  Target Year: {formatYear(targetYear)}
                </p>
                <p className="text-sm font-body mt-1 text-muted-foreground">
                  All events in this puzzle happened in{" "}
                  <span className="font-accent tracking-wide">
                    {formatYear(targetYear)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full py-3 px-6 text-lg font-accent font-semibold tracking-wide"
          >
            Continue Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

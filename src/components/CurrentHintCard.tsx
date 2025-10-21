"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { HintText } from "@/components/ui/HintText";
import { ANIMATION_DURATIONS, ANIMATION_EASINGS } from "@/lib/animationConstants";

interface CurrentHintCardProps {
  event: string | null;
  hintNumber: number;
  totalHints: number;
  isLoading: boolean;
  error: string | null;
}

export const CurrentHintCard: React.FC<CurrentHintCardProps> = React.memo(
  ({ event, hintNumber, totalHints, isLoading, error }) => {
    const shouldReduceMotion = useReducedMotion();

    // Don't render if we have an error
    if (error) {
      return null;
    }

    const hintText = event || "[DATA MISSING]";

    return (
      <motion.div
        key={hintNumber}
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: -20, scale: 0.95 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          duration: ANIMATION_DURATIONS.HINT_TRANSITION / 1000,
          ease: ANIMATION_EASINGS.ANTICIPATION,
          delay: ANIMATION_DURATIONS.HINT_DELAY / 1000,
        }}
        className="w-full"
      >
        <div className="border-border/70 bg-muted/30 shadow-primary/5 hover:shadow-primary/10 rounded-lg border px-4 py-3 shadow-md transition-shadow duration-200 hover:shadow-lg">
          <div className="mb-2">
            <span
              className="text-muted-foreground font-accent text-xs tracking-wide uppercase"
              aria-label={`Hint ${hintNumber} of ${totalHints}. ${totalHints - hintNumber + 1} guesses remaining`}
            >
              Hint {hintNumber} of {totalHints}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="font-body text-muted-foreground text-base">Loading hint...</span>
            </div>
          ) : (
            <div role="status" aria-live="polite" aria-atomic="true">
              <HintText className="font-body text-foreground text-left text-base leading-relaxed sm:text-lg">
                {hintText}
              </HintText>
            </div>
          )}
        </div>
      </motion.div>
    );
  },
);

CurrentHintCard.displayName = "CurrentHintCard";

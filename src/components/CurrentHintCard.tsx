"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { HintText } from "@/components/ui/HintText";

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
        layout={!shouldReduceMotion}
        layoutId={shouldReduceMotion ? undefined : "current-hint-card"}
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          opacity: { duration: 0.3 },
        }}
        className="w-full"
      >
        <div className="border-border/70 bg-muted/30 shadow-primary/5 hover:shadow-primary/10 rounded-lg border px-4 py-3 shadow-md transition-shadow duration-200 hover:shadow-lg">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-muted-foreground font-accent text-xs tracking-wide uppercase">
              Guesses remaining:
            </span>
            <div
              className="flex items-center gap-1.5"
              aria-label={`${totalHints - hintNumber + 1} guesses remaining`}
            >
              {/* Progress dots - inverted to show remaining */}
              {Array.from({ length: totalHints }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i >= hintNumber - 1
                      ? "bg-primary ring-primary/20 shadow-sm ring-1" // Filled blue for remaining attempts
                      : "border-primary/30 border bg-transparent" // Empty for used attempts
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
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

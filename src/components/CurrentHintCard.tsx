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
        <div className="py-3 px-4 rounded-lg border border-border/70 bg-muted/30 shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-shadow duration-200">
          <div className="mb-2">
            <h3 className="text-xs text-muted-foreground uppercase font-accent tracking-wide flex items-center gap-2">
              <span className="inline-flex w-5 h-5 rounded-full bg-primary/10 text-primary items-center justify-center text-[10px] font-bold">
                {hintNumber}
              </span>
              Hint {hintNumber} of {totalHints}
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-base font-body text-muted-foreground">
                Loading hint...
              </span>
            </div>
          ) : (
            <div role="status" aria-live="polite" aria-atomic="true">
              <HintText className="text-base sm:text-lg text-left font-body leading-relaxed text-foreground">
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

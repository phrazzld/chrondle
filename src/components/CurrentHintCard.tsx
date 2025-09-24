"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { HintText } from "@/components/ui/HintText";

interface CurrentHintCardProps {
  event: string | null;
  hintNumber: number;
  totalHints: number;
  guessCount: number;
  isLoading: boolean;
  error: string | null;
}

// Component for animated hint text with stagger effect
const AnimatedHintText: React.FC<{ text: string; shouldReduceMotion: boolean | null }> = ({
  text,
  shouldReduceMotion,
}) => {
  const words = useMemo(() => text.split(" "), [text]);

  if (shouldReduceMotion) {
    return (
      <HintText className="font-body text-foreground text-left text-base leading-relaxed sm:text-lg">
        {text}
      </HintText>
    );
  }

  return (
    <div className="font-body text-foreground text-left text-base leading-relaxed sm:text-lg">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.03, // 30ms delay per word
            ease: "easeOut",
          }}
          className="mr-1 inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export const CurrentHintCard: React.FC<CurrentHintCardProps> = React.memo(
  ({ event, hintNumber, totalHints, guessCount, isLoading, error }) => {
    const shouldReduceMotion = useReducedMotion();
    const prevGuessCountRef = useRef(guessCount);
    const justFilledIndices = useRef<Set<number>>(new Set());

    // Track which dots were just filled
    useEffect(() => {
      if (guessCount > prevGuessCountRef.current) {
        // New guess was made, mark the newly filled dots
        justFilledIndices.current = new Set();
        for (let i = prevGuessCountRef.current; i < guessCount; i++) {
          justFilledIndices.current.add(i);
        }
      }
      prevGuessCountRef.current = guessCount;
    }, [guessCount]);

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
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-muted-foreground font-accent text-xs tracking-wide uppercase">
              <span className="font-mono">
                HINT {hintNumber} OF {totalHints}
              </span>
            </h3>
            {/* Progress dots */}
            <div
              className="flex items-center gap-1"
              aria-label={`${totalHints - guessCount} guesses remaining`}
            >
              {Array.from({ length: totalHints }, (_, i) => {
                const isFilled = i < guessCount;
                const isJustFilled = justFilledIndices.current.has(i);

                return (
                  <motion.div
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${
                      isFilled
                        ? "bg-muted-foreground/50"
                        : "bg-primary ring-primary/20 shadow-sm ring-1"
                    }`}
                    initial={false}
                    animate={{
                      scale: isJustFilled && !shouldReduceMotion ? [0, 1.1, 1.0] : 1.0,
                    }}
                    transition={{
                      scale: {
                        duration: 0.3,
                        delay: isJustFilled ? 0.05 : 0,
                        ease: [0.175, 0.885, 0.32, 1.275], // Elastic easing for "pop" effect
                      },
                    }}
                    onAnimationComplete={() => {
                      // Clear the just-filled flag after animation
                      if (isJustFilled) {
                        justFilledIndices.current.delete(i);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="font-body text-muted-foreground text-base">Loading hint...</span>
            </div>
          ) : (
            <div role="status" aria-live="polite" aria-atomic="true">
              <AnimatedHintText text={hintText} shouldReduceMotion={shouldReduceMotion} />
            </div>
          )}
        </div>
      </motion.div>
    );
  },
);

CurrentHintCard.displayName = "CurrentHintCard";

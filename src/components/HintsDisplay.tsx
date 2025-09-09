"use client";

import React, { useEffect, useRef } from "react";
import { formatYear } from "@/lib/displayFormatting";
import { Separator } from "@/components/ui/Separator";
import { Check } from "lucide-react";
import { HintText } from "@/components/ui/HintText";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useReducedMotion,
} from "motion/react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { validateHintsDisplayProps } from "@/lib/propValidation";

interface HintsDisplayProps {
  events: string[];
  guesses: number[];
  targetYear: number;
  isGameComplete?: boolean;
  error: string | null;
  className?: string;
}

interface PastHintProps {
  hintNumber: number;
  hintText: string;
  guess: number;
  targetYear: number;
  shouldReduceMotion?: boolean;
}

interface FutureHintProps {
  hintNumber: number;
  hintText: string;
  shouldReduceMotion?: boolean;
}

const PastHint: React.FC<PastHintProps> = React.memo(
  ({ hintNumber, hintText, guess, targetYear, shouldReduceMotion = false }) => {
    if (
      !hintText ||
      guess === undefined ||
      typeof targetYear !== "number" ||
      !Number.isFinite(targetYear)
    ) {
      return (
        <div className="py-2 opacity-50">
          <p className="text-xs text-muted-foreground mb-1 text-left uppercase">
            Hint #{hintNumber}
          </p>
          <p className="text-sm text-destructive text-left">[DATA MISSING]</p>
        </div>
      );
    }

    // Calculate proximity for visual feedback
    const distance = Math.abs(guess - targetYear);
    const isCorrect = distance === 0;

    // Get proximity emoji (reusing logic from ProximityDisplay)
    const getProximityEmoji = (distance: number): string => {
      if (distance === 0) return "🎯"; // Perfect
      if (distance <= 10) return "🔥"; // Very hot
      if (distance <= 50) return "♨️"; // Hot
      if (distance <= 150) return "🌡️"; // Warm
      if (distance <= 500) return "❄️"; // Cold
      return "🧊"; // Very cold
    };

    // Get proximity text for accessibility
    const getProximityText = (distance: number): string => {
      if (distance === 0) return "Perfect";
      if (distance <= 10) return "Very close";
      if (distance <= 50) return "Close";
      if (distance <= 150) return "Warm";
      if (distance <= 500) return "Cold";
      return "Very cold";
    };

    const proximityEmoji = getProximityEmoji(distance);
    const proximityText = getProximityText(distance);

    // Enhanced background colors with subtle proximity hints
    const backgroundClass = isCorrect
      ? "bg-green-50 border-green-200/50 dark:bg-green-900/20 dark:border-green-800/50"
      : "bg-muted/10 border-muted/20";

    return (
      <motion.div
        layout={!shouldReduceMotion}
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: -20 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`py-3 px-4 rounded-lg border-2 ${backgroundClass} opacity-90 hover:opacity-100 transition-all duration-200 shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/10`}
      >
        {/* Enhanced header with proximity indicator */}
        <div className="flex items-center gap-3 mb-2">
          <p className="text-xs text-muted-foreground uppercase font-accent tracking-wide font-medium">
            Hint #{hintNumber}
          </p>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="font-accent font-semibold text-foreground text-xs">
              {formatYear(guess)}
            </span>
            {/* Proximity indicator */}
            <span
              className="text-sm"
              role="img"
              aria-label={proximityText}
              title={`${proximityText} (${distance} years off)`}
            >
              {proximityEmoji}
            </span>
            {isCorrect && (
              <div className="flex justify-center items-center text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Content section */}
        <div>
          <div className="text-sm text-left font-body leading-relaxed text-foreground">
            <HintText>{hintText}</HintText>
          </div>
        </div>
      </motion.div>
    );
  },
);

PastHint.displayName = "PastHint";

const FutureHint: React.FC<FutureHintProps> = React.memo(
  ({ hintNumber, hintText, shouldReduceMotion = false }) => {
    return (
      <motion.div
        layout={!shouldReduceMotion}
        initial={
          shouldReduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }
        }
        animate={
          shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
        }
        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.1,
        }}
        className="py-3 px-4 rounded-lg border border-dashed border-muted/50 bg-muted/10 opacity-75 hover:opacity-90 transition-all duration-200 shadow-sm shadow-muted/10 hover:shadow-md hover:shadow-muted/20"
      >
        {/* Enhanced header for unused hints */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label="unused hint">
              💡
            </span>
            <p className="text-xs text-muted-foreground uppercase font-accent tracking-wide font-medium">
              Hint #{hintNumber}
            </p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center">
            <span className="text-xs text-muted-foreground/70 uppercase tracking-wider font-medium">
              Unused
            </span>
          </div>
        </div>

        {/* Content section */}
        <div className="pl-2">
          <div className="text-sm text-muted-foreground text-left font-body leading-relaxed">
            <HintText>{hintText || "No hint available"}</HintText>
          </div>
        </div>
      </motion.div>
    );
  },
);

FutureHint.displayName = "FutureHint";

// Custom comparison function for HintsDisplay
const areHintsDisplayPropsEqual = (
  prevProps: HintsDisplayProps,
  nextProps: HintsDisplayProps,
): boolean => {
  // Check primitive props
  if (
    prevProps.targetYear !== nextProps.targetYear ||
    prevProps.isGameComplete !== nextProps.isGameComplete ||
    prevProps.error !== nextProps.error ||
    prevProps.className !== nextProps.className
  ) {
    return false;
  }

  // Check arrays - shallow comparison is sufficient since these are immutable
  if (prevProps.events.length !== nextProps.events.length) {
    return false;
  }

  if (prevProps.guesses.length !== nextProps.guesses.length) {
    return false;
  }

  // For events and guesses, we only need to check if they're the same reference
  // or have the same values at each index
  for (let i = 0; i < prevProps.events.length; i++) {
    if (prevProps.events[i] !== nextProps.events[i]) {
      return false;
    }
  }

  for (let i = 0; i < prevProps.guesses.length; i++) {
    if (prevProps.guesses[i] !== nextProps.guesses[i]) {
      return false;
    }
  }

  return true;
};

export const HintsDisplay: React.FC<HintsDisplayProps> = React.memo((props) => {
  // Validate props in development
  validateHintsDisplayProps(props);

  const {
    events,
    guesses,
    targetYear,
    isGameComplete = false,
    error,
    className = "",
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const prevGuessCount = useRef(guesses.length);
  const shouldReduceMotion = useReducedMotion();

  // Auto-scroll to keep current hint visible when new hint appears
  useEffect(() => {
    if (guesses.length > prevGuessCount.current && containerRef.current) {
      // Small delay to ensure animation has started
      setTimeout(() => {
        // Scroll to top to keep current hint visible
        containerRef.current?.scrollTo({
          top: 0,
          behavior: shouldReduceMotion ? "auto" : "smooth",
        });
      }, 100);
    }
    prevGuessCount.current = guesses.length;
  }, [guesses.length, shouldReduceMotion]);

  if (error) {
    return (
      <div
        className={`${className} p-6 text-center bg-destructive/5 border border-destructive/50 rounded-lg`}
      >
        <div className="mb-3">
          <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-destructive text-xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-destructive">
            Unable to Load Puzzle
          </h3>
          <p className="text-muted-foreground">
            Please refresh the page to try again.
          </p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className={`${className} p-6 text-center`}>
        <div className="flex items-center justify-center gap-3">
          <LoadingSpinner size="md" />
          <p className="text-muted-foreground">Loading puzzle events...</p>
        </div>
      </div>
    );
  }

  // Organize hints by type - past hints in reverse chronological order (newest first)
  const pastHints = guesses.map((guess, index) => {
    const reverseIndex = guesses.length - 1 - index;
    return {
      hintNumber: reverseIndex + 1,
      hintText: events[reverseIndex],
      guess: guesses[reverseIndex],
    };
  });

  const futureHints = isGameComplete
    ? events.slice(guesses.length).map((text, index) => ({
        hintNumber: guesses.length + index + 1,
        hintText: text,
      }))
    : [];

  return (
    <div ref={containerRef} className={`${className} space-y-3`}>
      {/* Container for past hints only */}
      <div className="flex flex-col gap-3">
        <LayoutGroup>
          {/* Past Hints - Stack downward in reverse chronological order */}
          <AnimatePresence>
            {pastHints.map((hint, index) => (
              <motion.div
                key={`past-hint-${hint.hintNumber}`}
                layout={!shouldReduceMotion}
              >
                <PastHint
                  hintNumber={hint.hintNumber}
                  hintText={hint.hintText}
                  guess={hint.guess}
                  targetYear={targetYear}
                  shouldReduceMotion={shouldReduceMotion ?? false}
                />
                {index < pastHints.length - 1 && <Separator className="mt-3" />}
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      </div>

      {/* Future Hints - Revealed on game completion */}
      {futureHints.length > 0 && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { delay: 0.5, duration: 0.4 }}
          className="mt-6 pt-4 border-t border-muted/40"
        >
          {/* Enhanced header for revealed hints */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl" role="img" aria-label="revealed hints">
              ✨
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                Unused Hints Revealed
              </p>
              <p className="text-xs text-muted-foreground">
                {futureHints.length} hint{futureHints.length === 1 ? "" : "s"}{" "}
                you didn&apos;t need
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {futureHints.map((hint, index) => (
                <motion.div
                  key={`future-hint-${hint.hintNumber}`}
                  initial={
                    shouldReduceMotion
                      ? undefined
                      : { opacity: 0, y: -10, scale: 0.98 }
                  }
                  animate={
                    shouldReduceMotion
                      ? undefined
                      : { opacity: 1, y: 0, scale: 1 }
                  }
                  transition={{
                    delay: 0.7 + index * 0.15, // Staggered reveal after header
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                >
                  <FutureHint
                    hintNumber={hint.hintNumber}
                    hintText={hint.hintText}
                    shouldReduceMotion={shouldReduceMotion ?? false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}, areHintsDisplayPropsEqual);

HintsDisplay.displayName = "HintsDisplay";

// why-did-you-render tracking
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HintsDisplay as any).whyDidYouRender = true;
}

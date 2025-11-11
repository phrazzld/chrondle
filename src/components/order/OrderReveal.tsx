"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { ANIMATION_DURATIONS, ANIMATION_SPRINGS, msToSeconds } from "@/lib/animationConstants";
import { PerformanceTier } from "./PerformanceTier";
import { ScoreTooltip } from "./ScoreTooltip";
import { ComparisonGrid } from "./ComparisonGrid";
import type { OrderEvent, OrderScore } from "../../types/orderGameState";

interface OrderRevealProps {
  events: OrderEvent[];
  finalOrder: string[];
  correctOrder: string[];
  score: OrderScore;
  puzzleNumber: number;
  onShare?: () => void;
}

export function OrderReveal({
  events,
  finalOrder,
  correctOrder,
  score,
  puzzleNumber,
  onShare,
}: OrderRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isShared, setIsShared] = useState(false);

  const accuracyPercent = useMemo(
    () => Math.round((score.correctPairs / score.totalPairs) * 100),
    [score.correctPairs, score.totalPairs],
  );

  const handleShareClick = async () => {
    if (isShared || !onShare) return;

    await onShare();
    setIsShared(true);

    // Reset after 2 seconds
    setTimeout(() => {
      setIsShared(false);
    }, 2000);
  };

  return (
    <motion.section
      className="border-border bg-card space-y-6 rounded-2xl border p-6 shadow-sm"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        duration: ANIMATION_DURATIONS.HINT_TRANSITION / 1000,
      }}
    >
      {/* Puzzle Number */}
      <motion.div
        className="text-center"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: msToSeconds(ANIMATION_DURATIONS.HINT_TRANSITION),
              }
        }
      >
        <p className="text-muted-foreground text-sm font-medium">Order #{puzzleNumber}</p>
      </motion.div>

      {/* Emotional Headline */}
      <PerformanceTier accuracyPercent={accuracyPercent} />

      {/* Score Breakdown */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                type: "spring",
                ...ANIMATION_SPRINGS.GENTLE,
                delay: msToSeconds(ANIMATION_DURATIONS.PROXIMITY_DELAY),
              }
        }
      >
        <ScoreTooltip score={score} />
      </motion.div>

      {/* Share Button */}
      {onShare && (
        <motion.div
          className="flex justify-center"
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  type: "spring",
                  ...ANIMATION_SPRINGS.SMOOTH,
                  delay: msToSeconds(ANIMATION_DURATIONS.PROXIMITY_DELAY) * 1.5,
                }
          }
        >
          <motion.button
            type="button"
            onClick={handleShareClick}
            disabled={isShared}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-md transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-80"
            whileTap={
              prefersReducedMotion || isShared
                ? undefined
                : {
                    scale: 0.95,
                  }
            }
            animate={
              prefersReducedMotion || !isShared
                ? undefined
                : {
                    scale: [1, 1.05, 1],
                  }
            }
            transition={
              prefersReducedMotion || !isShared
                ? undefined
                : {
                    duration: 0.3,
                    ease: "easeOut",
                  }
            }
          >
            {isShared && <Check className="h-4 w-4" />}
            {isShared ? "Copied!" : "Share Result"}
          </motion.button>
        </motion.div>
      )}

      {/* Comparison Grid */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: msToSeconds(ANIMATION_DURATIONS.HINT_TRANSITION),
                delay: msToSeconds(ANIMATION_DURATIONS.PROXIMITY_DELAY) * 2,
              }
        }
      >
        <ComparisonGrid events={events} finalOrder={finalOrder} correctOrder={correctOrder} />
      </motion.div>
    </motion.section>
  );
}

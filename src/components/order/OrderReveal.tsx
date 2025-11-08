"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ANIMATION_DURATIONS } from "@/lib/animationConstants";
import type { OrderEvent, OrderScore } from "../../types/orderGameState";

interface OrderRevealProps {
  events: OrderEvent[];
  finalOrder: string[];
  correctOrder: string[];
  score: OrderScore;
  onShare?: () => void;
}

export function OrderReveal({
  events,
  finalOrder,
  correctOrder,
  score,
  onShare,
}: OrderRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const eventMap = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);
  const correctIndex = useMemo(() => {
    const map = new Map<string, number>();
    correctOrder.forEach((id, idx) => map.set(id, idx));
    return map;
  }, [correctOrder]);

  return (
    <motion.section
      className="border-border bg-card space-y-6 rounded-2xl border p-6 shadow-sm"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        duration: ANIMATION_DURATIONS.HINT_TRANSITION / 1000,
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 text-left">
        <div>
          <p className="text-muted-foreground text-sm tracking-wide uppercase">Final Score</p>
          <p className="text-foreground text-3xl font-semibold">{score.totalScore}</p>
          <p className="text-muted-foreground text-sm">
            {score.correctPairs}/{score.totalPairs} pairs correct · Multiplier{" "}
            {score.hintMultiplier.toFixed(2)}×
          </p>
        </div>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="border-border text-foreground hover:bg-muted rounded-full border px-4 py-2 text-sm font-medium transition"
          >
            Share Result
          </button>
        )}
      </header>

      <p className="text-muted-foreground text-sm">
        Events below are sorted chronologically. Misordered entries from your submission are
        highlighted in red.
      </p>

      <motion.ol
        className="space-y-3"
        initial={false}
        animate={prefersReducedMotion ? "static" : "reveal"}
        variants={
          prefersReducedMotion
            ? undefined
            : {
                reveal: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: ANIMATION_DURATIONS.PROXIMITY_DELAY / 1000,
                  },
                },
              }
        }
      >
        {correctOrder.map((eventId, index) => {
          const event = eventMap.get(eventId);
          if (!event) return null;

          const finalIndex = finalOrder.indexOf(eventId);
          const wasCorrect = finalIndex === index;

          return (
            <motion.li
              key={eventId}
              layout
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 14 }}
              variants={
                prefersReducedMotion
                  ? undefined
                  : {
                      reveal: {
                        opacity: 1,
                        y: 0,
                        transition: {
                          type: "spring",
                          damping: 18,
                          stiffness: 220,
                        },
                      },
                    }
              }
              className={[
                "border-border rounded-2xl border px-4 py-3 text-left shadow-sm",
                wasCorrect ? "bg-background" : "bg-destructive/10 border-destructive",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs tracking-wide uppercase">
                    #{index + 1}
                  </p>
                  <p className="text-foreground text-base font-semibold">{event.text}</p>
                  <p className="text-muted-foreground text-sm">{event.year}</p>
                </div>
                {!wasCorrect && (
                  <span className="text-destructive text-sm font-semibold">Misordered</span>
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </motion.section>
  );
}

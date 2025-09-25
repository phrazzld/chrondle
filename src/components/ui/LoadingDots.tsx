"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  dotClassName?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className, dotClassName }) => {
  const shouldReduceMotion = useReducedMotion();

  const dotAnimationVariants = {
    initial: { opacity: shouldReduceMotion ? 0.7 : 0.3, scale: shouldReduceMotion ? 1 : 0.8 },
    animate: { opacity: 1, scale: 1 },
  };

  const dotTransition = {
    duration: shouldReduceMotion ? 0.3 : 0.6,
    ease: "easeInOut" as const,
    repeat: shouldReduceMotion ? 0 : Infinity,
    repeatType: "reverse" as const,
  };

  return (
    <div className={cn("flex items-center gap-1", className)} role="status" aria-label="Loading">
      <motion.span
        className={cn("bg-muted-foreground h-2 w-2 rounded-full", dotClassName)}
        variants={dotAnimationVariants}
        initial="initial"
        animate="animate"
        transition={{ ...dotTransition, delay: 0 }}
      />
      <motion.span
        className={cn("bg-muted-foreground h-2 w-2 rounded-full", dotClassName)}
        variants={dotAnimationVariants}
        initial="initial"
        animate="animate"
        transition={{ ...dotTransition, delay: 0.2 }}
      />
      <motion.span
        className={cn("bg-muted-foreground h-2 w-2 rounded-full", dotClassName)}
        variants={dotAnimationVariants}
        initial="initial"
        animate="animate"
        transition={{ ...dotTransition, delay: 0.4 }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

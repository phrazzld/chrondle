"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  dotClassName?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className, dotClassName }) => {
  const dotAnimationVariants = {
    initial: { opacity: 0.3, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  };

  const dotTransition = {
    duration: 0.6,
    ease: "easeInOut" as const,
    repeat: Infinity,
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

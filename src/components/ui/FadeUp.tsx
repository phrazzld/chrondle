"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "motion/react";
import { cn } from "@/lib/utils";

interface FadeUpProps {
  delay?: number;
  duration?: number;
  once?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface FadeUpStaggerProps {
  staggerDelay?: number;
  containerDelay?: number;
  once?: boolean;
  children: React.ReactNode;
  className?: string;
}

const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

/**
 * Fade-up animation for a single element
 */
export const FadeUp: React.FC<FadeUpProps> = ({
  delay = 0,
  duration = 0.5,
  once = true,
  children,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      viewport={{ once }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered fade-up animation for multiple children
 */
export const FadeUpStagger: React.FC<FadeUpStaggerProps> = ({
  staggerDelay = 0.05, // 50ms default
  containerDelay = 0,
  once = true,
  children,
  className,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: shouldReduceMotion ? 0 : containerDelay,
      },
    },
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      viewport={{ once }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={fadeUpVariants}
          transition={{
            duration: 0.4,
            ease: "easeOut",
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

/**
 * Hook for applying fade-up animation to existing components
 */
export const useFadeUpAnimation = (delay = 0, duration = 0.5, shouldAnimate = true) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !shouldAnimate) {
    return {
      initial: undefined,
      animate: undefined,
      transition: undefined,
    };
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration,
      delay,
      ease: "easeOut",
    },
  };
};

"use client";

import React, { useRef } from "react";
import { motion } from "motion/react";
import { Sparkles, CircleSlash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnimationSettings } from "@/contexts/AnimationSettingsContext";

interface AnimationToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Toggle button for enabling/disabling animations
 * Provides accessibility for users who prefer reduced motion
 */
export const AnimationToggle: React.FC<AnimationToggleProps> = ({
  className = "",
  size = "md",
}) => {
  const { animationsEnabled, toggleAnimations } = useAnimationSettings();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Icon size based on the size prop
  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  // Button size based on the size prop
  const buttonSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";

  // Generate tooltip based on current state
  const getTooltip = () => {
    return animationsEnabled
      ? "Animations: On (click to disable)"
      : "Animations: Off (click to enable)";
  };

  // Handle click: toggle animations and remove focus
  const handleClick = () => {
    toggleAnimations();
    buttonRef.current?.blur(); // Remove focus ring after click
  };

  return (
    <motion.button
      ref={buttonRef}
      whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
      onClick={handleClick}
      className={cn(
        // Base button styles - fully rounded ghost button
        buttonSize,
        "rounded-full",
        "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
        "transition-colors duration-200",
        "flex items-center justify-center",
        "group relative",
        className,
      )}
      aria-label={getTooltip()}
      title={getTooltip()}
      type="button"
    >
      <motion.div
        initial={false}
        animate={
          animationsEnabled
            ? {
                rotate: 0,
                scale: 1,
              }
            : {
                rotate: 0,
                scale: 0.9,
              }
        }
        transition={
          animationsEnabled
            ? {
                duration: 0.3,
                ease: "easeInOut",
                type: "spring",
                stiffness: 200,
                damping: 20,
              }
            : undefined
        }
        className="flex items-center justify-center"
      >
        {animationsEnabled ? (
          <Sparkles className={cn(iconSize, "text-foreground")} />
        ) : (
          <CircleSlash className={cn(iconSize, "text-muted-foreground")} />
        )}
      </motion.div>

      {/* Subtle hover effect overlay - perfect circle */}
      {animationsEnabled && (
        <motion.div
          className="bg-primary/10 absolute inset-0 rounded-full opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
};

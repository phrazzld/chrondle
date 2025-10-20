"use client";

import React from "react";
import { getMultiplierDescription } from "@/lib/wagerCalculations";

interface MultiplierBadgeProps {
  /** Current multiplier (1-6) */
  multiplier: number;

  /** Whether to show full description */
  showDescription?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * Badge component for displaying the current wager multiplier
 *
 * Shows the multiplier value with visual indication of risk level.
 * Higher multipliers (6x, 5x) are shown with more prominent styling.
 *
 * @example
 * <MultiplierBadge multiplier={6} showDescription />
 * // Renders: "6x - Maximum risk, maximum reward!"
 */
export const MultiplierBadge: React.FC<MultiplierBadgeProps> = ({
  multiplier,
  showDescription = false,
  className = "",
  size = "md",
}) => {
  // Color scheme based on multiplier value
  const getColors = () => {
    if (multiplier >= 5) {
      // High multiplier (5x-6x): Red/hot
      return {
        bg: "linear-gradient(135deg, rgb(220, 38, 38), rgb(239, 68, 68))",
        border: "rgb(220, 38, 38)",
        text: "white",
        glow: "0 0 20px rgba(220, 38, 38, 0.4)",
      };
    } else if (multiplier >= 3) {
      // Medium multiplier (3x-4x): Orange/warm
      return {
        bg: "linear-gradient(135deg, rgb(234, 88, 12), rgb(249, 115, 22))",
        border: "rgb(234, 88, 12)",
        text: "white",
        glow: "0 0 15px rgba(234, 88, 12, 0.3)",
      };
    } else {
      // Low multiplier (1x-2x): Blue/cool
      return {
        bg: "linear-gradient(135deg, rgb(37, 99, 235), rgb(59, 130, 246))",
        border: "rgb(37, 99, 235)",
        text: "white",
        glow: "0 0 10px rgba(37, 99, 235, 0.3)",
      };
    }
  };

  const colors = getColors();

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const description = getMultiplierDescription(multiplier);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-lg font-bold transition-all duration-300 ${sizeClasses[size]}`}
        style={{
          background: colors.bg,
          color: colors.text,
          border: `2px solid ${colors.border}`,
          boxShadow: colors.glow,
        }}
        title={description}
        aria-label={`${multiplier}x multiplier - ${description}`}
      >
        <span className="font-mono tracking-tight">{multiplier}×</span>
      </div>

      {showDescription && description && (
        <span className="text-muted-foreground max-w-[200px] text-xs italic">{description}</span>
      )}
    </div>
  );
};

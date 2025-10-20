"use client";

import React from "react";
import { formatPoints } from "@/lib/wagerCalculations";

interface BankDisplayProps {
  /** Current bank balance */
  bank: number;

  /** All-time high bank (optional) */
  allTimeHigh?: number;

  /** Whether to show all-time high */
  showAllTimeHigh?: boolean;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Display component for showing the player's current point bank
 *
 * Shows the current balance with a coin emoji, and optionally the
 * all-time high with a trophy emoji. Follows the styling of StreakIndicator.
 *
 * @example
 * <BankDisplay bank={1500} allTimeHigh={2000} showAllTimeHigh />
 */
export const BankDisplay: React.FC<BankDisplayProps> = ({
  bank,
  allTimeHigh,
  showAllTimeHigh = false,
  className = "",
}) => {
  // Don't show until player has started wagering
  if (bank === 1000 && !allTimeHigh) {
    return null;
  }

  const isAboveInitial = bank > 1000;
  const bankEmoji = bank >= 5000 ? "💎" : bank >= 2000 ? "💰" : "🪙";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current Bank */}
      <div
        className="touch-target-min flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200"
        style={{
          background: isAboveInitial ? "var(--primary)" : "var(--input)",
          color: isAboveInitial ? "white" : "var(--foreground)",
          border: isAboveInitial ? "none" : "1px solid var(--border)",
        }}
        title={`Current bank: ${formatPoints(bank)} points`}
        aria-label={`Current bank: ${formatPoints(bank)} points`}
      >
        <span className="text-base" aria-hidden="true">
          {bankEmoji}
        </span>
        <span className="font-bold">{formatPoints(bank)}</span>
      </div>

      {/* All-Time High (if different and exists) */}
      {showAllTimeHigh && allTimeHigh && allTimeHigh > bank && (
        <div
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium"
          style={{
            background: "var(--input)",
            color: "var(--muted-foreground)",
            border: "1px solid var(--border)",
          }}
          title={`All-time high: ${formatPoints(allTimeHigh)} points`}
          aria-label={`All-time high: ${formatPoints(allTimeHigh)} points`}
        >
          <span className="text-base" aria-hidden="true">
            👑
          </span>
          <span className="font-medium">{formatPoints(allTimeHigh)}</span>
        </div>
      )}
    </div>
  );
};

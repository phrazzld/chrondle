import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { SCORING_CONSTANTS } from "@/lib/scoring";

export interface ScoreDisplayProps {
  width: number;
  hintsUsed: number;
  variant?: "full" | "compact";
  className?: string;
}

export function ScoreDisplay({ width, hintsUsed, variant = "full", className }: ScoreDisplayProps) {
  // Calculate max possible score with flat deduction system
  const maxPossibleScore = useMemo(() => {
    const maxScoreForHints = SCORING_CONSTANTS.MAX_SCORES_BY_HINTS[hintsUsed];
    const widthFactor = (SCORING_CONSTANTS.W_MAX - width + 1) / SCORING_CONSTANTS.W_MAX;
    return Math.max(0, Math.floor(maxScoreForHints * widthFactor));
  }, [width, hintsUsed]);

  const isValid = width <= SCORING_CONSTANTS.W_MAX;

  // Format clues text: "No clues" / "1 clue" / "2 clues"
  const cluesText = useMemo(() => {
    if (hintsUsed === 0) return "No clues";
    if (hintsUsed === 1) return "1 clue";
    return `${hintsUsed} clues`;
  }, [hintsUsed]);

  // Compact variant: two-row vertical layout for header placement
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2 shadow-sm sm:px-4 sm:py-2.5",
          isValid ? "border-primary/40 bg-primary/10" : "border-muted bg-muted/30",
          className,
        )}
      >
        {/* Score - Large and prominent */}
        <div
          className={cn(
            "text-xl font-bold tabular-nums sm:text-2xl",
            isValid ? "text-primary" : "text-muted-foreground",
          )}
        >
          {maxPossibleScore} pts
        </div>

        {/* Context row - Small and muted */}
        <div className="text-muted-foreground text-[10px] sm:text-xs">
          {isValid ? (
            <>
              {width.toLocaleString()} yrs · {cluesText}
            </>
          ) : (
            <span className="text-destructive">Range too wide</span>
          )}
        </div>
      </div>
    );
  }

  // Full variant: original vertical card layout
  return (
    <div
      className={cn(
        "rounded-xl border-2 p-6 text-center shadow-sm",
        isValid
          ? "border-primary from-primary/10 to-primary/5 bg-gradient-to-br"
          : "border-muted bg-muted/30",
        className,
      )}
    >
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Your Score
      </div>
      <div
        className={cn(
          "mt-2 text-4xl font-bold tabular-nums",
          isValid ? "text-primary" : "text-muted-foreground",
        )}
      >
        {maxPossibleScore} pts
      </div>
      <div className="text-muted-foreground mt-3 text-xs">
        {isValid ? (
          <>
            Based on {width.toLocaleString()}-year range • {cluesText}
          </>
        ) : (
          <>Range too wide (max {SCORING_CONSTANTS.W_MAX} years)</>
        )}
      </div>
    </div>
  );
}

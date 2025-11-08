import React from "react";

import { Hint } from "@/types/range";
import { cn } from "@/lib/utils";

export interface HintLadderProps {
  hints: (Hint & { revealed: boolean })[];
  hintsUsed: 0 | 1 | 2 | 3;
  onHintTaken: (level: Hint["level"]) => void;
  currentMultiplier: number;
  className?: string;
}

export function HintLadder({
  hints,
  hintsUsed,
  onHintTaken,
  currentMultiplier,
  className,
}: HintLadderProps): JSX.Element {
  return (
    <div
      className={cn("border-border bg-card space-y-3 rounded-lg border p-4 shadow-sm", className)}
    >
      <div className="text-muted-foreground flex items-center justify-between text-sm">
        <span>Hints</span>
        <span>{Math.round(currentMultiplier * 100)}% score</span>
      </div>
      <div className="space-y-2">
        {hints.map((hint, index) => {
          const isUnlocked = index < hintsUsed;
          const isNext = index === hintsUsed;

          return (
            <button
              key={hint.level}
              type="button"
              disabled={!isNext}
              onClick={() => onHintTaken(hint.level)}
              className={cn(
                "w-full rounded-md border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed",
                isUnlocked && "border-primary bg-primary/10 text-primary",
                isNext && "border-primary text-primary border-dashed",
                !isUnlocked && !isNext && "border-border text-muted-foreground",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Hint {hint.level}</span>
                <span className="text-muted-foreground text-xs">
                  -{Math.round((1 - hint.multiplier) * 100)}%
                </span>
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                {hint.revealed ? hint.content : "Hidden until taken"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

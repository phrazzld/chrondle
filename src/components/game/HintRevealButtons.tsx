import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SCORING_CONSTANTS } from "@/lib/scoring";

interface HintRevealButtonsProps {
  events: string[];
  hintsRevealed: number; // 0-5 (0 = first event only, 5 = all 6 events revealed)
  onRevealHint: (hintIndex: number) => void;
  disabled?: boolean;
  className?: string;
}

function getPointLoss(hintsRevealed: number): number {
  // Calculate theoretical max score (width = 1, narrowest possible)
  const theoreticalMax = SCORING_CONSTANTS.S * Math.log2((SCORING_CONSTANTS.W_MAX + 1) / 2);

  const currentMultiplier = SCORING_CONSTANTS.HINT_MULTIPLIERS[hintsRevealed];
  const nextMultiplier = SCORING_CONSTANTS.HINT_MULTIPLIERS[hintsRevealed + 1];

  const currentMax = Math.floor(theoreticalMax * currentMultiplier);
  const nextMax = Math.floor(theoreticalMax * nextMultiplier);

  return currentMax - nextMax;
}

function ClueProgressDots({ total, revealed }: { total: number; revealed: number }) {
  return (
    <div className="flex items-center justify-start gap-1.5">
      <span className="text-muted-foreground text-xs font-medium">Clues:</span>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 w-2 rounded-full",
            index < revealed ? "bg-primary" : "bg-muted-foreground/30",
          )}
        />
      ))}
      <span className="text-muted-foreground text-xs font-medium">
        {revealed}/{total}
      </span>
    </div>
  );
}

export function HintRevealButtons({
  events,
  hintsRevealed,
  onRevealHint,
  disabled = false,
  className,
}: HintRevealButtonsProps) {
  const totalClues = events.length;
  const hasMoreClues = hintsRevealed < totalClues - 1;

  // First event is always shown (the puzzle itself)
  const firstEvent = events[0];

  // Additional revealed clues
  const revealedClues = events.slice(1, hintsRevealed + 1);

  return (
    <div className={cn("space-y-4", className)}>
      {/* The Puzzle Event - Hero Display */}
      <div className="border-primary bg-primary/10 rounded-xl border-2 p-5 shadow-sm">
        <div className="text-primary mb-2 text-xs font-semibold tracking-wide uppercase">
          The Event
        </div>
        <div className="text-foreground text-base leading-relaxed sm:text-lg">{firstEvent}</div>
      </div>

      {/* Additional Revealed Clues */}
      {revealedClues.length > 0 && (
        <div className="space-y-2">
          {revealedClues.map((clue, index) => (
            <div key={index} className="border-primary/40 bg-primary/5 rounded-lg border p-3">
              <div className="text-muted-foreground mb-1 text-xs font-medium uppercase">
                Clue {index + 2}
              </div>
              <div className="text-sm">{clue}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Dots */}
      <ClueProgressDots total={totalClues} revealed={hintsRevealed + 1} />

      {/* Show Next Clue Button - Only if more clues available */}
      {hasMoreClues && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRevealHint(hintsRevealed)}
          disabled={disabled}
          className="w-full justify-between"
        >
          <span>Show Next Clue</span>
          <span className="text-destructive text-xs font-medium">
            -{getPointLoss(hintsRevealed)}
          </span>
        </Button>
      )}
    </div>
  );
}

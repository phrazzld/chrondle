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

function getHintCost(hintsRevealed: number): number {
  // Return flat cost for the next hint (hintsRevealed is 0-5, cost is for next hint)
  if (hintsRevealed >= SCORING_CONSTANTS.HINT_COSTS.length) {
    return 0; // No more hints available
  }
  return SCORING_CONSTANTS.HINT_COSTS[hintsRevealed];
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

  // Get flat cost for next clue
  const hintCost = getHintCost(hintsRevealed);

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

      {/* Clue Reveal Section - Only if more clues available */}
      {hasMoreClues && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Want Another Clue?</span>
            <ClueProgressDots total={totalClues} revealed={hintsRevealed + 1} />
          </div>

          <p className="text-muted-foreground mb-3 text-xs">
            Revealing clue #{hintsRevealed + 2} costs{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-500">
              {hintCost} points
            </span>
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevealHint(hintsRevealed)}
            disabled={disabled}
            className="w-full border-amber-500/50 hover:bg-amber-500/10"
          >
            Reveal Clue
          </Button>
        </div>
      )}
    </div>
  );
}

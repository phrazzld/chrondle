import { useCallback, useMemo, useState } from "react";

import { generateHints } from "@/lib/hintGeneration";
import { logger } from "@/lib/logger";
import { SCORING_CONSTANTS } from "@/lib/scoring";
import { HintCount, RangeHint } from "@/types/range";

export type HintLevel = RangeHint["level"];

export type Hint = RangeHint & { revealed: boolean };

export interface UseHintsReturn {
  hints: Hint[];
  hintsUsed: HintCount;
  currentMultiplier: number;
  takeHint: (level: HintLevel) => void;
  resetHints: () => void;
}

const MAX_HINT_LEVEL: HintLevel = 3;

export function useHints(targetYear: number): UseHintsReturn {
  const [hintsUsed, setHintsUsed] = useState<HintCount>(0);

  const hints = useMemo(() => generateHints(targetYear), [targetYear]);

  const revealedHints = useMemo<Hint[]>(
    () => hints.map((hint, index) => ({ ...hint, revealed: index < hintsUsed })),
    [hints, hintsUsed],
  );

  const currentMultiplier = useMemo(
    () => SCORING_CONSTANTS.HINT_MULTIPLIERS[hintsUsed],
    [hintsUsed],
  );

  const takeHint = useCallback((level: HintLevel) => {
    setHintsUsed((current) => {
      if (level < 1 || level > MAX_HINT_LEVEL) {
        logger.warn(`[useHints] Invalid hint level requested: ${level}`);
        return current;
      }

      if (level <= current) {
        return current; // Already revealed or lower level
      }

      if (level !== current + 1) {
        logger.warn(
          `[useHints] Sequential violation: tried to take level ${level} after ${current}`,
        );
        return current;
      }

      return level as HintCount;
    });
  }, []);

  const resetHints = useCallback(() => setHintsUsed(0), []);

  return {
    hints: revealedHints,
    hintsUsed,
    currentMultiplier,
    takeHint,
    resetHints,
  };
}

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useHints } from "@/hooks/useHints";
import { RangeHint } from "@/types/range";
import { RangeSlider, RangeSliderValue } from "./RangeSlider";
import { RangePreview } from "./RangePreview";
import { HintLadder } from "./HintLadder";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { scoreRange, SCORING_CONSTANTS } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface RangeInputProps {
  targetYear: number;
  onCommit: (payload: { start: number; end: number; hintsUsed: RangeHint["level"] | 0 }) => void;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_RANGE_WIDTH = 50;
const DEBOUNCE_MS = 150;

function createDefaultRange(minYear: number, maxYear: number): RangeSliderValue {
  if (maxYear <= minYear) {
    return [minYear, minYear];
  }

  const span = Math.min(DEFAULT_RANGE_WIDTH, Math.max(1, maxYear - minYear));
  return [minYear, minYear + span];
}

export function RangeInput({
  targetYear,
  onCommit,
  minYear = -5000,
  maxYear = new Date().getFullYear(),
  disabled = false,
  className,
}: RangeInputProps) {
  const defaultRange = useMemo(() => createDefaultRange(minYear, maxYear), [minYear, maxYear]);

  const [range, setRange] = useState<RangeSliderValue>(defaultRange);
  const debouncedRange = useDebouncedValue(range, DEBOUNCE_MS);
  const [predictedScore, setPredictedScore] = useState(0);

  useEffect(() => {
    setRange(defaultRange);
  }, [defaultRange]);

  const { hints, hintsUsed, currentMultiplier, takeHint, resetHints } = useHints(targetYear);

  useEffect(() => {
    const debouncedWidth = debouncedRange[1] - debouncedRange[0] + 1;
    if (debouncedWidth > SCORING_CONSTANTS.W_MAX) {
      setPredictedScore(0);
      return;
    }

    const nextScore = scoreRange(
      debouncedRange[0],
      debouncedRange[1],
      targetYear,
      0,
      hintsUsed as 0 | 1 | 2 | 3,
    );
    setPredictedScore(nextScore);
  }, [debouncedRange, targetYear, hintsUsed]);

  const width = range[1] - range[0] + 1;
  const rangeTooWide = width > SCORING_CONSTANTS.W_MAX;
  const commitDisabled = disabled || rangeTooWide;

  const resetRange = useCallback(() => {
    setRange(createDefaultRange(minYear, maxYear));
  }, [minYear, maxYear]);

  const handleRangeCommit = () => {
    if (commitDisabled) return;
    onCommit({ start: range[0], end: range[1], hintsUsed });
    resetRange();
    resetHints();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <HintLadder
        hints={hints}
        hintsUsed={hintsUsed}
        currentMultiplier={currentMultiplier}
        onHintTaken={takeHint}
      />

      <div className="space-y-4">
        <RangeSlider
          min={minYear}
          max={maxYear}
          value={range}
          onChange={setRange}
          onCommit={setRange}
          disabled={disabled}
        />

        <RangePreview
          start={range[0]}
          end={range[1]}
          width={width}
          predictedScore={predictedScore}
          multiplier={currentMultiplier}
        />
      </div>

      {rangeTooWide && (
        <p className="text-destructive text-xs">
          Range must be {SCORING_CONSTANTS.W_MAX} years or narrower.
        </p>
      )}

      <Button onClick={handleRangeCommit} disabled={commitDisabled} className="w-full">
        Commit Range
      </Button>
    </div>
  );
}

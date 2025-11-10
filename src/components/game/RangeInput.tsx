"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EraToggle } from "@/components/ui/EraToggle";
import { RangePreview } from "./RangePreview";
import { SCORING_CONSTANTS } from "@/lib/scoring";
import { GAME_CONFIG } from "@/lib/constants";
import { convertToInternalYear, convertFromInternalYear, type Era } from "@/lib/eraUtils";
import { cn } from "@/lib/utils";

interface RangeInputProps {
  onCommit: (payload: { start: number; end: number; hintsUsed: number }) => void;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
  hintsUsed?: number; // Number of historical events revealed (0-6)
  currentMultiplier?: number; // Current score multiplier based on hints
  isOneGuessMode?: boolean; // Display "Submit Final Guess - ONE TRY" text
}

/**
 * Creates default range spanning the full timeline
 * This forces user to modify before submitting
 */
function createFullTimelineRange(minYear: number, maxYear: number): [number, number] {
  return [minYear, maxYear];
}

export function RangeInput({
  onCommit,
  minYear = GAME_CONFIG.MIN_YEAR,
  maxYear = GAME_CONFIG.MAX_YEAR,
  disabled = false,
  className,
  hintsUsed = 0,
  currentMultiplier = 1.0,
}: RangeInputProps) {
  const defaultRange = useMemo(() => createFullTimelineRange(minYear, maxYear), [minYear, maxYear]);

  // Internal year representation (negative = BC)
  const [range, setRange] = useState<[number, number]>(defaultRange);

  // Track if user has modified the range from default
  const [hasBeenModified, setHasBeenModified] = useState(false);

  // Convert internal years to UI representation
  const startEraYear = convertFromInternalYear(range[0]);
  const endEraYear = convertFromInternalYear(range[1]);

  // UI state for year inputs (positive numbers only)
  const [startInput, setStartInput] = useState(String(startEraYear.year));
  const [endInput, setEndInput] = useState(String(endEraYear.year));

  // UI state for era toggles
  const [startEra, setStartEra] = useState<Era>(startEraYear.era);
  const [endEra, setEndEra] = useState<Era>(endEraYear.era);

  // Sync UI state when internal range changes
  useEffect(() => {
    const start = convertFromInternalYear(range[0]);
    const end = convertFromInternalYear(range[1]);

    setStartInput(String(start.year));
    setEndInput(String(end.year));
    setStartEra(start.era);
    setEndEra(end.era);
  }, [range]);

  // Reset to default when bounds change
  useEffect(() => {
    setRange(defaultRange);
    setHasBeenModified(false);
  }, [defaultRange]);

  const width = range[1] - range[0] + 1;
  const rangeTooWide = width > SCORING_CONSTANTS.W_MAX;
  const commitDisabled = disabled || rangeTooWide || !hasBeenModified;

  const resetRange = useCallback(() => {
    setRange(createFullTimelineRange(minYear, maxYear));
    setHasBeenModified(false);
  }, [minYear, maxYear]);

  const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartInput(e.target.value);
  };

  const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndInput(e.target.value);
  };

  const handleStartEraChange = (era: Era) => {
    setStartEra(era);
    // Immediately apply era change if we have a valid year
    const parsed = parseInt(startInput, 10);
    if (!Number.isNaN(parsed)) {
      const internalYear = convertToInternalYear(parsed, era);
      if (internalYear >= minYear && internalYear <= maxYear) {
        setRange([internalYear, Math.max(internalYear, range[1])]);
        setHasBeenModified(true);
      }
    }
  };

  const handleEndEraChange = (era: Era) => {
    setEndEra(era);
    // Immediately apply era change if we have a valid year
    const parsed = parseInt(endInput, 10);
    if (!Number.isNaN(parsed)) {
      const internalYear = convertToInternalYear(parsed, era);
      if (internalYear >= minYear && internalYear <= maxYear) {
        setRange([Math.min(range[0], internalYear), internalYear]);
        setHasBeenModified(true);
      }
    }
  };

  const applyStartYear = () => {
    const parsed = parseInt(startInput, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const internalYear = convertToInternalYear(parsed, startEra);
      if (internalYear >= minYear && internalYear <= maxYear) {
        setRange([internalYear, Math.max(internalYear, range[1])]);
        setHasBeenModified(true);
      } else {
        // Reset to current valid value
        const current = convertFromInternalYear(range[0]);
        setStartInput(String(current.year));
        setStartEra(current.era);
      }
    } else {
      // Reset to current valid value
      const current = convertFromInternalYear(range[0]);
      setStartInput(String(current.year));
    }
  };

  const applyEndYear = () => {
    const parsed = parseInt(endInput, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const internalYear = convertToInternalYear(parsed, endEra);
      if (internalYear >= minYear && internalYear <= maxYear) {
        setRange([Math.min(range[0], internalYear), internalYear]);
        setHasBeenModified(true);
      } else {
        // Reset to current valid value
        const current = convertFromInternalYear(range[1]);
        setEndInput(String(current.year));
        setEndEra(current.era);
      }
    } else {
      // Reset to current valid value
      const current = convertFromInternalYear(range[1]);
      setEndInput(String(current.year));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, applyFn: () => void) => {
    if (e.key === "Enter") {
      applyFn();
    }
  };

  const handleRangeCommit = () => {
    if (commitDisabled) return;
    onCommit({ start: range[0], end: range[1], hintsUsed });
    resetRange();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="border-b pb-2">
        <h3 className="text-foreground text-sm font-semibold">Your Guess</h3>
      </div>

      {/* Range Inputs - Responsive: stacked on mobile, side-by-side on desktop */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
        {/* Start Year Input with Era Toggle */}
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <label
              htmlFor="start-year"
              className="text-muted-foreground mb-1 block text-xs font-medium"
            >
              From
            </label>
            <Input
              id="start-year"
              type="text"
              inputMode="numeric"
              value={startInput}
              onChange={handleStartInputChange}
              onBlur={applyStartYear}
              onKeyDown={(e) => handleInputKeyDown(e, applyStartYear)}
              disabled={disabled}
              className="text-center"
              aria-label="Start year"
            />
          </div>
          <div className="mt-5">
            <EraToggle
              value={startEra}
              onChange={handleStartEraChange}
              disabled={disabled}
              size="default"
            />
          </div>
        </div>

        {/* Separator - visible only on desktop */}
        <div className="text-muted-foreground hidden items-end pb-2 text-sm font-medium sm:flex">
          to
        </div>

        {/* End Year Input with Era Toggle */}
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <label
              htmlFor="end-year"
              className="text-muted-foreground mb-1 block text-xs font-medium"
            >
              To
            </label>
            <Input
              id="end-year"
              type="text"
              inputMode="numeric"
              value={endInput}
              onChange={handleEndInputChange}
              onBlur={applyEndYear}
              onKeyDown={(e) => handleInputKeyDown(e, applyEndYear)}
              disabled={disabled}
              className="text-center"
              aria-label="End year"
            />
          </div>
          <div className="mt-5">
            <EraToggle
              value={endEra}
              onChange={handleEndEraChange}
              disabled={disabled}
              size="default"
            />
          </div>
        </div>
      </div>

      {/* Range Preview - Subtle inline info */}
      <RangePreview start={range[0]} end={range[1]} width={width} multiplier={currentMultiplier} />

      {/* Validation Messages */}
      {rangeTooWide && (
        <p className="text-destructive text-xs">
          Range must be {SCORING_CONSTANTS.W_MAX} years or narrower.
        </p>
      )}

      {!hasBeenModified && !disabled && (
        <p className="text-muted-foreground text-xs">Adjust the range to enable submission</p>
      )}

      {/* Submit Button */}
      <Button onClick={handleRangeCommit} disabled={commitDisabled} className="w-full">
        Submit Range
      </Button>
    </div>
  );
}

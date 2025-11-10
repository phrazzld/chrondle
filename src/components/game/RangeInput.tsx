"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EraToggle } from "@/components/ui/EraToggle";
import { SCORING_CONSTANTS } from "@/lib/scoring";
import { GAME_CONFIG } from "@/lib/constants";
import { convertToInternalYear, convertFromInternalYear, type Era } from "@/lib/eraUtils";
import { formatYearWithOptions } from "@/lib/displayFormatting";
import { cn } from "@/lib/utils";

interface RangeInputProps {
  onCommit: (payload: { start: number; end: number; hintsUsed: number }) => void;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  className?: string;
  hintsUsed?: number; // Number of historical events revealed (0-6)
  isOneGuessMode?: boolean; // Display "Submit Final Guess - ONE TRY" text
  // Controlled component props
  value?: [number, number]; // External range state (controlled mode)
  onChange?: (range: [number, number]) => void; // Range change callback
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
  value,
  onChange,
}: RangeInputProps) {
  const defaultRange = useMemo(() => createFullTimelineRange(minYear, maxYear), [minYear, maxYear]);

  // Check if controlled
  const isControlled = value !== undefined && onChange !== undefined;

  // Internal year representation (negative = BC) - only used when uncontrolled
  const [internalRange, setInternalRange] = useState<[number, number]>(defaultRange);

  // Use external state if controlled, internal state if uncontrolled
  const range = isControlled ? value : internalRange;

  // Internal setter that respects controlled/uncontrolled mode
  const updateRange = useCallback(
    (newRange: [number, number]) => {
      if (isControlled) {
        onChange?.(newRange);
      } else {
        setInternalRange(newRange);
      }
    },
    [isControlled, onChange],
  );

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
    if (!isControlled) {
      setInternalRange(defaultRange);
    }
    setHasBeenModified(false);
  }, [defaultRange, isControlled]);

  const width = range[1] - range[0] + 1;
  const rangeTooWide = width > SCORING_CONSTANTS.W_MAX;
  const commitDisabled = disabled || rangeTooWide || !hasBeenModified;

  const resetRange = useCallback(() => {
    updateRange(createFullTimelineRange(minYear, maxYear));
    setHasBeenModified(false);
  }, [minYear, maxYear, updateRange]);

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
        updateRange([internalYear, Math.max(internalYear, range[1])]);
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
        updateRange([Math.min(range[0], internalYear), internalYear]);
        setHasBeenModified(true);
      }
    }
  };

  const applyStartYear = () => {
    const parsed = parseInt(startInput, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      const internalYear = convertToInternalYear(parsed, startEra);
      if (internalYear >= minYear && internalYear <= maxYear) {
        updateRange([internalYear, Math.max(internalYear, range[1])]);
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
        updateRange([Math.min(range[0], internalYear), internalYear]);
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
      {/* Section Header with Range Summary */}
      <div className="flex items-baseline justify-between border-b pb-1.5">
        <h3 className="text-foreground text-sm font-semibold">Your Guess</h3>
        <span className="text-muted-foreground text-xs">
          {formatYearWithOptions(range[0])} – {formatYearWithOptions(range[1])}
        </span>
      </div>

      {/* Range Inputs - Responsive: stacked on mobile, inline on desktop */}
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* "Between" label */}
          <span className="text-muted-foreground text-sm font-medium">Between</span>

          {/* Start Year Input with Era Toggle */}
          <div className="flex items-center gap-2">
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
            <EraToggle
              value={startEra}
              onChange={handleStartEraChange}
              disabled={disabled}
              size="default"
            />
          </div>

          {/* "and" separator */}
          <span className="text-muted-foreground text-sm font-medium">and</span>

          {/* End Year Input with Era Toggle */}
          <div className="flex items-center gap-2">
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
            <EraToggle
              value={endEra}
              onChange={handleEndEraChange}
              disabled={disabled}
              size="default"
            />
          </div>
        </div>
      </div>

      {/* Validation Messages */}
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

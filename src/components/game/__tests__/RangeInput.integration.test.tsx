import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { RangeInput } from "../RangeInput";
import type { RangeSliderProps } from "../RangeSlider";
import type { RangePreviewProps } from "../RangePreview";
import type { HintLadderProps } from "../HintLadder";

let latestRangeSliderProps: RangeSliderProps | null = null;
let latestRangePreviewProps: RangePreviewProps | null = null;
let latestHintLadderProps: HintLadderProps | null = null;

vi.mock("../RangeSlider", () => ({
  RangeSlider: (props: RangeSliderProps) => {
    latestRangeSliderProps = props;
    return <div data-testid="range-slider" />;
  },
}));

vi.mock("../RangePreview", () => ({
  RangePreview: (props: RangePreviewProps) => {
    latestRangePreviewProps = props;
    return <div data-testid="range-preview" />;
  },
}));

vi.mock("../HintLadder", () => ({
  HintLadder: (props: HintLadderProps) => {
    latestHintLadderProps = props;
    return <div data-testid="hint-ladder" />;
  },
}));

describe("RangeInput", () => {
  const renderRangeInput = (overrides: Partial<Parameters<typeof RangeInput>[0]> = {}) =>
    render(
      <RangeInput
        targetYear={1969}
        onCommit={vi.fn()}
        minYear={1800}
        maxYear={2000}
        {...overrides}
      />,
    );

  beforeEach(() => {
    latestRangeSliderProps = null;
    latestRangePreviewProps = null;
    latestHintLadderProps = null;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("updates preview data when the slider range changes", async () => {
    renderRangeInput();

    expect(latestRangeSliderProps).not.toBeNull();
    const initialScore = latestRangePreviewProps?.predictedScore ?? 0;
    act(() => {
      latestRangeSliderProps?.onChange([1965, 1970]);
    });

    expect(latestRangePreviewProps?.width).toBe(6);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(latestRangePreviewProps?.predictedScore ?? 0).toBeGreaterThan(initialScore);
  });

  it("prevents committing when the range exceeds the maximum width", () => {
    renderRangeInput();

    act(() => {
      latestRangeSliderProps?.onChange([1800, 2005]);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const commitButton = screen.getByRole("button", { name: /commit range/i });
    expect(commitButton).toBeDisabled();
  });

  it("commits the current range and resets state", async () => {
    const handleCommit = vi.fn();
    renderRangeInput({ onCommit: handleCommit });

    act(() => {
      latestRangeSliderProps?.onChange([1900, 1920]);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const commitButton = screen.getByRole("button", { name: /commit range/i });
    act(() => {
      fireEvent.click(commitButton);
    });

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(handleCommit).toHaveBeenCalledWith({ start: 1900, end: 1920, hintsUsed: 0 });
    expect(latestRangeSliderProps?.value).toEqual([1800, 1850]);
  });
});

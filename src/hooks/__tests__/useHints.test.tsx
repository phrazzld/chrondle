import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useHints } from "../useHints";

describe("useHints", () => {
  it("initializes with no hints revealed and multiplier 1.0", () => {
    const { result } = renderHook(() => useHints(1969));

    expect(result.current.hintsUsed).toBe(0);
    expect(result.current.currentMultiplier).toBe(1);
    expect(result.current.hints.every((hint) => hint.revealed === false)).toBe(true);
  });

  it("reveals hints sequentially when takeHint is called", () => {
    const { result } = renderHook(() => useHints(1969));

    act(() => {
      result.current.takeHint(1);
    });

    expect(result.current.hintsUsed).toBe(1);
    expect(result.current.currentMultiplier).toBeCloseTo(0.85);
    expect(result.current.hints[0].revealed).toBe(true);
  });

  it("prevents skipping hint levels", () => {
    const { result } = renderHook(() => useHints(1969));

    act(() => {
      result.current.takeHint(3);
    });

    expect(result.current.hintsUsed).toBe(0);
    expect(result.current.hints.every((hint) => hint.revealed === false)).toBe(true);
  });

  it("is idempotent when taking the same hint twice", () => {
    const { result } = renderHook(() => useHints(1969));

    act(() => {
      result.current.takeHint(1);
      result.current.takeHint(1);
    });

    expect(result.current.hintsUsed).toBe(1);
  });

  it("resets to the initial state", () => {
    const { result } = renderHook(() => useHints(1969));

    act(() => {
      result.current.takeHint(1);
      result.current.resetHints();
    });

    expect(result.current.hintsUsed).toBe(0);
    expect(result.current.hints.every((hint) => hint.revealed === false)).toBe(true);
    expect(result.current.currentMultiplier).toBe(1);
  });

  it("regenerates hints when the target year changes", () => {
    const { result, rerender } = renderHook(({ targetYear }) => useHints(targetYear), {
      initialProps: { targetYear: 1969 },
    });

    const firstContent = result.current.hints[1].content;

    rerender({ targetYear: 1800 });

    expect(result.current.hints[1].content).not.toBe(firstContent);
  });
});

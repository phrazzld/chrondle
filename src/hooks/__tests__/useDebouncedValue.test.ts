import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useDebouncedValue,
  useDebouncedValues,
  useDebouncedCallback,
} from "../useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("single value debouncing", () => {
    it("should return initial value immediately", () => {
      const { result } = renderHook(() => useDebouncedValue("initial", 100));
      expect(result.current).toBe("initial");
    });

    it("should debounce value changes", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: "initial" } },
      );

      expect(result.current).toBe("initial");

      // Change value
      rerender({ value: "updated" });

      // Value should not change immediately
      expect(result.current).toBe("initial");

      // Advance time by 50ms (less than delay)
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(result.current).toBe("initial");

      // Advance time by another 50ms (total 100ms)
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(result.current).toBe("updated");
    });

    it("should cancel previous timeout on rapid changes", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: "initial" } },
      );

      // Make rapid changes
      rerender({ value: "change1" });
      act(() => {
        vi.advanceTimersByTime(50);
      });

      rerender({ value: "change2" });
      act(() => {
        vi.advanceTimersByTime(50);
      });

      rerender({ value: "change3" });

      // Still should be initial
      expect(result.current).toBe("initial");

      // Advance time by 100ms from last change
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should only have the last value
      expect(result.current).toBe("change3");
    });

    it("should update immediately with 0 delay", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 0),
        { initialProps: { value: "initial" } },
      );

      expect(result.current).toBe("initial");

      rerender({ value: "updated" });
      expect(result.current).toBe("updated");
    });

    it("should handle null and undefined values", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: null as string | null | undefined } },
      );

      expect(result.current).toBe(null);

      rerender({ value: "value" });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe("value");

      rerender({ value: undefined as string | null | undefined });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe(undefined);
    });
  });

  describe("multiple values debouncing", () => {
    it("should debounce multiple values together", () => {
      const { result, rerender } = renderHook(
        ({ values }) => useDebouncedValues(values, 100),
        {
          initialProps: {
            values: { userId: "user1", puzzleId: "puzzle1" },
          },
        },
      );

      expect(result.current).toEqual({ userId: "user1", puzzleId: "puzzle1" });

      // Change both values
      rerender({
        values: { userId: "user2", puzzleId: "puzzle2" },
      });

      // Values should not change immediately
      expect(result.current).toEqual({ userId: "user1", puzzleId: "puzzle1" });

      // Advance time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Both values should update together
      expect(result.current).toEqual({ userId: "user2", puzzleId: "puzzle2" });
    });

    it("should handle partial value changes", () => {
      const { result, rerender } = renderHook(
        ({ values }) => useDebouncedValues(values, 100),
        {
          initialProps: {
            values: { userId: "user1", puzzleId: "puzzle1", other: "value1" },
          },
        },
      );

      // Change only one value
      rerender({
        values: { userId: "user2", puzzleId: "puzzle1", other: "value1" },
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toEqual({
        userId: "user2",
        puzzleId: "puzzle1",
        other: "value1",
      });
    });
  });

  describe("debounced callback", () => {
    it("should debounce function calls", () => {
      const mockFn = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(mockFn, 100));

      // Call multiple times
      act(() => {
        result.current("call1");
        result.current("call2");
        result.current("call3");
      });

      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Advance time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Function should be called once with last arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("call3");
    });

    it("should cancel on unmount", () => {
      const mockFn = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(mockFn, 100),
      );

      act(() => {
        result.current("test");
      });

      // Unmount before timeout
      unmount();

      // Advance time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Function should not be called
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("should clean up timeouts on unmount", () => {
      const { result, unmount, rerender } = renderHook(
        ({ value }) => useDebouncedValue(value, 100),
        { initialProps: { value: "initial" } },
      );

      // Change value
      rerender({ value: "updated" });

      // Unmount before timeout completes
      unmount();

      // Advance time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // No errors should occur
      expect(result.current).toBe("initial");
    });
  });
});

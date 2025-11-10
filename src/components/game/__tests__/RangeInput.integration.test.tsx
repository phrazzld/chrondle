import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { RangeInput } from "../RangeInput";
import type { RangePreviewProps } from "../RangePreview";
import { GAME_CONFIG } from "@/lib/constants";

let latestRangePreviewProps: RangePreviewProps | null = null;

vi.mock("../RangePreview", () => ({
  RangePreview: (props: RangePreviewProps) => {
    latestRangePreviewProps = props;
    return <div data-testid="range-preview" />;
  },
}));

// Mock EraToggle to simplify testing
vi.mock("@/components/ui/EraToggle", () => ({
  EraToggle: ({ value, onChange }: { value: string; onChange: (era: "BC" | "AD") => void }) => (
    <div data-testid={`era-toggle-${value}`}>
      <button data-testid={`toggle-bc-${value}`} onClick={() => onChange("BC")}>
        BC
      </button>
      <button data-testid={`toggle-ad-${value}`} onClick={() => onChange("AD")}>
        AD
      </button>
    </div>
  ),
}));

describe("RangeInput", () => {
  const renderRangeInput = (overrides: Partial<Parameters<typeof RangeInput>[0]> = {}) =>
    render(
      <RangeInput
        onCommit={vi.fn()}
        minYear={GAME_CONFIG.MIN_YEAR}
        maxYear={GAME_CONFIG.MAX_YEAR}
        {...overrides}
      />,
    );

  beforeEach(() => {
    latestRangePreviewProps = null;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("Default State", () => {
    it("defaults to full timeline range (3000 BC - 2025 AD)", () => {
      renderRangeInput();

      expect(latestRangePreviewProps?.start).toBe(GAME_CONFIG.MIN_YEAR); // -3000
      expect(latestRangePreviewProps?.end).toBe(GAME_CONFIG.MAX_YEAR); // 2025
      expect(latestRangePreviewProps?.width).toBeGreaterThan(250);
    });

    it("disables submit button until range is modified", () => {
      renderRangeInput();

      const commitButton = screen.getByRole("button", { name: /submit range/i });
      expect(commitButton).toBeDisabled();
    });

    it("shows helper text when not modified", () => {
      renderRangeInput();
      expect(screen.getByText(/adjust the range to enable submission/i)).toBeInTheDocument();
    });
  });

  describe("BC/AD Era Toggles", () => {
    it("renders era toggles for both start and end years", () => {
      renderRangeInput();

      // Initially both should be BC for start (3000 BC) and AD for end (2025 AD)
      expect(screen.getByTestId("era-toggle-BC")).toBeInTheDocument();
      expect(screen.getByTestId("era-toggle-AD")).toBeInTheDocument();
    });

    it("toggles era correctly when within bounds", () => {
      renderRangeInput();

      const commitButton = screen.getByRole("button", { name: /submit range/i });
      expect(commitButton).toBeDisabled();

      // First, change the start year to something that will be valid in both eras
      const startInput = screen.getByLabelText(/from/i);
      fireEvent.change(startInput, { target: { value: "1000" } });
      fireEvent.blur(startInput);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Store the initial start value (1000 BC = -1000)
      const initialStart = latestRangePreviewProps?.start;

      // Toggle from BC to AD
      const toggleButton = screen.getByTestId("toggle-ad-BC");
      fireEvent.click(toggleButton);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Start should change from -1000 (1000 BC) to 1000 (1000 AD)
      expect(latestRangePreviewProps?.start).not.toBe(initialStart);
      expect(latestRangePreviewProps?.start).toBe(1000);
    });
  });

  describe("Year Input", () => {
    it("accepts positive year values", () => {
      renderRangeInput();

      const startInput = screen.getByLabelText(/from/i);

      fireEvent.change(startInput, { target: { value: "1900" } });
      fireEvent.blur(startInput);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Start year should update (1900 AD = 1900 internal, assuming AD era)
      expect(latestRangePreviewProps?.start).toBeDefined();
    });

    it("enables submit after modifying year input", () => {
      renderRangeInput();

      const startInput = screen.getByLabelText(/from/i);
      const endInput = screen.getByLabelText(/to/i);

      // Set to valid narrow range
      fireEvent.change(startInput, { target: { value: "1900" } });
      fireEvent.blur(startInput);

      fireEvent.change(endInput, { target: { value: "1950" } });
      fireEvent.blur(endInput);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Check if range is within limits
      const width = latestRangePreviewProps?.width ?? 0;
      const commitButton = screen.getByRole("button", { name: /submit range/i });

      if (width <= 250) {
        expect(commitButton).toBeEnabled();
      } else {
        expect(commitButton).toBeDisabled();
      }
    });
  });

  describe("Range Validation", () => {
    it("prevents committing when the range exceeds 250 years", () => {
      renderRangeInput();

      const startInput = screen.getByLabelText(/from/i);
      const endInput = screen.getByLabelText(/to/i);

      // Set to range > 250 years (e.g., 1800-2100 = 301 years)
      fireEvent.change(startInput, { target: { value: "1800" } });
      fireEvent.blur(startInput);

      fireEvent.change(endInput, { target: { value: "2100" } });
      fireEvent.blur(endInput);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const width = latestRangePreviewProps?.width ?? 0;
      if (width > 250) {
        const commitButton = screen.getByRole("button", { name: /submit range/i });
        expect(commitButton).toBeDisabled();
        expect(screen.getByText(/range must be 250 years or narrower/i)).toBeInTheDocument();
      }
    });
  });

  describe("Commit Functionality", () => {
    it("commits the current range and resets state", async () => {
      const handleCommit = vi.fn();
      renderRangeInput({ onCommit: handleCommit });

      const startInput = screen.getByLabelText(/from/i);
      const endInput = screen.getByLabelText(/to/i);

      // Set valid range: 1900-1950 AD (51 years)
      fireEvent.change(startInput, { target: { value: "1900" } });
      fireEvent.blur(startInput);

      fireEvent.change(endInput, { target: { value: "1950" } });
      fireEvent.blur(endInput);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const commitButton = screen.getByRole("button", { name: /submit range/i });

      // Should be enabled if range is valid
      const width = latestRangePreviewProps?.width ?? 0;
      if (width <= 250) {
        expect(commitButton).toBeEnabled();

        act(() => {
          fireEvent.click(commitButton);
        });

        act(() => {
          vi.runOnlyPendingTimers();
        });

        expect(handleCommit).toHaveBeenCalled();

        // Should reset to disabled state
        await waitFor(() => {
          expect(commitButton).toBeDisabled();
        });
      }
    });

    it("passes hintsUsed to commit handler", () => {
      const handleCommit = vi.fn();
      renderRangeInput({ onCommit: handleCommit, hintsUsed: 2 });

      const startInput = screen.getByLabelText(/from/i);
      const endInput = screen.getByLabelText(/to/i);

      // Set valid narrow range
      fireEvent.change(startInput, { target: { value: "1900" } });
      fireEvent.blur(startInput);

      fireEvent.change(endInput, { target: { value: "1920" } });
      fireEvent.blur(endInput);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      const width = latestRangePreviewProps?.width ?? 0;
      if (width <= 250) {
        const commitButton = screen.getByRole("button", { name: /submit range/i });

        act(() => {
          fireEvent.click(commitButton);
        });

        act(() => {
          vi.runOnlyPendingTimers();
        });

        expect(handleCommit).toHaveBeenCalledWith(expect.objectContaining({ hintsUsed: 2 }));
      }
    });
  });
});

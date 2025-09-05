import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GuessInput } from "../GuessInput";
import {
  convertToInternalYear,
  convertFromInternalYear,
  isValidEraYear,
  adjustYearWithinEra,
  formatEraYear,
  parseEraYearString,
  getEraYearRange,
} from "@/lib/eraUtils";

// Mock motion/react to avoid animation overhead in performance tests
vi.mock("motion/react", () => ({
  motion: {
    button: ({
      children,
      type,
      ...props
    }: React.HTMLProps<HTMLButtonElement> & {
      type?: "button" | "submit" | "reset";
    }) => (
      <button type={type} {...props}>
        {children}
      </button>
    ),
  },
}));

describe("BC/AD Input Performance Benchmarks", () => {
  const mockOnGuess = vi.fn();
  const defaultProps = {
    onGuess: mockOnGuess,
    disabled: false,
    remainingGuesses: 6,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input Latency Performance", () => {
    it("should handle user input within 16ms frame budget (25ms CI threshold)", () => {
      render(<GuessInput {...defaultProps} />);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      // Warm up the component
      fireEvent.change(input, { target: { value: "100" } });

      // Measure input handling performance
      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const year = Math.floor(Math.random() * 2000) + 1;
        fireEvent.change(input, { target: { value: year.toString() } });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageLatency = duration / iterations;

      // Input handling should average well under 16ms per interaction
      // CI threshold: 25ms to account for environment variability
      // Local development target: 16ms (60fps frame budget)
      expect(averageLatency).toBeLessThan(25);

      // Additional check: total time for 100 inputs should be reasonable
      expect(duration).toBeLessThan(250); // 2.5ms average is excellent
    });

    it("should handle keyboard navigation efficiently", () => {
      render(<GuessInput {...defaultProps} />);
      const input = screen.getByRole("textbox") as HTMLInputElement;

      // Set initial value
      fireEvent.change(input, { target: { value: "500" } });

      const iterations = 100;
      const startTime = performance.now();

      // Simulate rapid arrow key navigation
      for (let i = 0; i < iterations; i++) {
        const key = i % 2 === 0 ? "ArrowUp" : "ArrowDown";
        const shiftKey = i % 4 < 2; // Alternate shift modifier
        fireEvent.keyDown(input, { key, shiftKey, preventDefault: () => {} });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Keyboard navigation should be snappy
      // 100 key events should complete quickly
      expect(duration).toBeLessThan(50); // Sub-millisecond per key event
    });

    it("should handle era toggle switching efficiently", () => {
      render(<GuessInput {...defaultProps} />);

      const bcButton = screen.getByRole("radio", { name: /BC/i });
      const adButton = screen.getByRole("radio", { name: /AD/i });

      const iterations = 100;
      const startTime = performance.now();

      // Rapidly toggle between BC and AD
      for (let i = 0; i < iterations; i++) {
        const button = i % 2 === 0 ? bcButton : adButton;
        fireEvent.click(button);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Era toggling should be instant
      expect(duration).toBeLessThan(100); // Under 1ms per toggle
    });

    it("should handle form submission efficiently", async () => {
      const { rerender } = render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const form = input.closest("form")!;

      // Warm up
      fireEvent.change(input, { target: { value: "1969" } });
      fireEvent.submit(form);
      mockOnGuess.mockClear();

      const iterations = 20; // Realistic number of rapid submissions
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        // Need to reset component between submissions to clear input
        mockOnGuess.mockClear();
        rerender(<GuessInput {...defaultProps} key={i} />);

        const year = 1000 + i;
        const currentInput = screen.getByRole("textbox") as HTMLInputElement;
        const currentForm = currentInput.closest("form")!;

        fireEvent.change(currentInput, { target: { value: year.toString() } });
        fireEvent.submit(currentForm);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Form submission should be fast even with validation
      expect(duration).toBeLessThan(300); // ~15ms per submission including re-render
    });
  });

  describe("Era Conversion Performance", () => {
    it("should convert years to internal format in under 1ms", () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const year = Math.floor(Math.random() * 3000) + 1;
        const era = i % 2 === 0 ? "BC" : "AD";
        const internal = convertToInternalYear(year, era);
        // Use result to prevent optimization
        expect(internal).toBeDefined();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageTime = duration / iterations;

      // Each conversion should take well under 1ms
      // 10000 conversions should complete very quickly
      expect(duration).toBeLessThan(100); // 10 microseconds per conversion is still excellent
      expect(averageTime).toBeLessThan(0.01); // Well under 1ms target
    });

    it("should convert from internal format efficiently", () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const internal = Math.floor(Math.random() * 6000) - 3000;
        const { year, era } = convertFromInternalYear(internal);
        // Use results to prevent optimization
        expect(year).toBeGreaterThanOrEqual(0); // Year 0 is valid for AD
        expect(era).toBeDefined();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Reverse conversion should also be fast
      // With 10000 assertions, allow slightly more time
      expect(duration).toBeLessThan(75);
    });

    it("should validate era years efficiently", () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const year = Math.floor(Math.random() * 4000);
        const era = i % 2 === 0 ? "BC" : "AD";
        const valid = isValidEraYear(year, era);
        // Use result to prevent optimization
        expect(typeof valid).toBe("boolean");
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Validation should be instant
      expect(duration).toBeLessThan(30);
    });

    it("should adjust years within era bounds efficiently", () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const year = Math.floor(Math.random() * 1000) + 1;
        const era = i % 2 === 0 ? "BC" : "AD";
        const delta = Math.random() * 20 - 10; // -10 to +10
        const adjusted = adjustYearWithinEra(year, era, delta);
        // Use result
        expect(adjusted).toBeGreaterThanOrEqual(0);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Year adjustment with bounds checking should be fast
      expect(duration).toBeLessThan(40);
    });

    it("should format era years for display efficiently", () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const year = Math.floor(Math.random() * 2000) + 1;
        const era = i % 2 === 0 ? "BC" : "AD";
        const formatted = formatEraYear(year, era);
        // Use result
        expect(formatted).toContain(era);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // String formatting should be efficient
      expect(duration).toBeLessThan(60);
    });

    it("should parse era year strings efficiently", () => {
      const testStrings = [
        "776 BC",
        "1969 AD",
        "100 BCE",
        "2024 CE",
        "1 BC",
        "2000 AD",
        "500 BC",
        "1500 AD",
      ];

      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const str = testStrings[i % testStrings.length];
        const parsed = parseEraYearString(str);
        // Use result
        expect(parsed).toBeDefined();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Regex parsing should still be reasonably fast
      expect(duration).toBeLessThan(100);
    });

    it("should get era year ranges efficiently", () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const era = i % 2 === 0 ? "BC" : "AD";
        const range = getEraYearRange(era);
        // Use result to prevent optimization
        if (range.min === undefined || range.max === undefined) {
          throw new Error("Invalid range");
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Simple object creation should be very fast
      // But with 10000 iterations including expect() calls, allow more time
      expect(duration).toBeLessThan(100); // Still under 0.01ms per call
    });
  });

  describe("Combined Operations Performance", () => {
    it("should handle complete input flow within frame budget", () => {
      render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const bcButton = screen.getByRole("radio", { name: /BC/i });
      const form = input.closest("form")!;

      const iterations = 20; // Complete flows
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        // Complete user interaction flow
        const year = Math.floor(Math.random() * 1000) + 1;

        // 1. Toggle era if needed
        if (i % 2 === 0) {
          fireEvent.click(bcButton);
        }

        // 2. Type year
        fireEvent.change(input, { target: { value: year.toString() } });

        // 3. Navigate with arrows
        fireEvent.keyDown(input, { key: "ArrowUp", preventDefault: () => {} });
        fireEvent.keyDown(input, {
          key: "ArrowDown",
          preventDefault: () => {},
        });

        // 4. Submit
        fireEvent.submit(form);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const averageFlowTime = duration / iterations;

      // Complete interaction flow should feel instant
      expect(averageFlowTime).toBeLessThan(25); // Well within frame budget
      expect(duration).toBeLessThan(500); // All flows in half a second
    });
  });
});

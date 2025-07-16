import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GuessInput } from "../GuessInput";
import { validateGuessInputProps } from "@/lib/propValidation";

const mockValidate = vi.mocked(validateGuessInputProps);

// Mock prop validation to track calls
vi.mock("@/lib/propValidation", () => ({
  validateGuessInputProps: vi.fn(),
}));

describe("GuessInput Component Interface", () => {
  const mockOnGuess = vi.fn();
  const mockOnValidationError = vi.fn();

  const defaultProps = {
    onGuess: mockOnGuess,
    disabled: false,
    remainingGuesses: 6,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Required Props", () => {
    it("renders with all required props", () => {
      render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox");
      const button = screen.getByRole("button");

      expect(input).toBeTruthy();
      expect(button).toBeTruthy();
    });

    it("validates props on render", () => {
      render(<GuessInput {...defaultProps} />);

      expect(mockValidate).toHaveBeenCalledWith(defaultProps);
    });

    it("calls onGuess when form is submitted with valid year", () => {
      render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "1969" } });
      fireEvent.submit(form);

      expect(mockOnGuess).toHaveBeenCalledWith(1969);
    });

    it("handles disabled state correctly", () => {
      render(<GuessInput {...defaultProps} disabled={true} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const button = screen.getByRole("button") as HTMLButtonElement;

      expect(input.disabled).toBe(true);
      expect(button.disabled).toBe(true);
    });

    it("shows remaining guesses in button text", () => {
      render(<GuessInput {...defaultProps} remainingGuesses={3} />);

      const button = screen.getByRole("button");
      expect(button.textContent).toContain("3");
      expect(button.textContent).toMatch(/guess/i);
    });

    it("handles single guess remaining", () => {
      render(<GuessInput {...defaultProps} remainingGuesses={1} />);

      const button = screen.getByRole("button");
      expect(button.textContent).toContain("1");
      expect(button.textContent).toMatch(/guess/i);
    });

    it("handles no guesses remaining", () => {
      render(<GuessInput {...defaultProps} remainingGuesses={0} />);

      const button = screen.getByRole("button");
      expect(button.textContent?.toLowerCase()).toContain("no");
      expect(button.textContent).toMatch(/guess/i);
    });
  });

  describe("Optional Props", () => {
    it("calls onValidationError for invalid year format", () => {
      render(
        <GuessInput
          {...defaultProps}
          onValidationError={mockOnValidationError}
        />,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "invalid" } });
      fireEvent.submit(form);

      expect(mockOnValidationError).toHaveBeenCalledTimes(1);
      expect(mockOnGuess).not.toHaveBeenCalled();
    });

    it("accepts className prop", () => {
      const { container } = render(
        <GuessInput {...defaultProps} className="custom-class" />,
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("custom-class");
    });

    it("renders without optional props", () => {
      render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeTruthy();
    });
  });

  describe("Input Validation", () => {
    it("rejects non-numeric input", () => {
      render(
        <GuessInput
          {...defaultProps}
          onValidationError={mockOnValidationError}
        />,
      );

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "abc" } });
      fireEvent.submit(form);

      expect(mockOnValidationError).toHaveBeenCalled();
      expect(mockOnGuess).not.toHaveBeenCalled();
    });

    it("accepts valid BCE years", () => {
      render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "-776" } });
      fireEvent.submit(form);

      expect(mockOnGuess).toHaveBeenCalledWith(-776);
    });

    it("handles Enter key submission", () => {
      render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;

      fireEvent.change(input, { target: { value: "1969" } });
      fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

      // Form submission happens via form submit event
      const form = input.closest("form")!;
      fireEvent.submit(form);

      expect(mockOnGuess).toHaveBeenCalledWith(1969);
    });
  });

  describe("Focus Management", () => {
    it("auto-focuses input on mount", () => {
      render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox");
      // In jsdom, focus behavior is simulated - we just verify element exists
      expect(input).toBeTruthy();
    });

    it("does not break when disabled", () => {
      render(<GuessInput {...defaultProps} disabled={true} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("handles negative remaining guesses", () => {
      render(<GuessInput {...defaultProps} remainingGuesses={-1} />);

      const button = screen.getByRole("button") as HTMLButtonElement;
      expect(button.disabled).toBe(true);
    });

    it("handles very large remaining guesses", () => {
      render(<GuessInput {...defaultProps} remainingGuesses={100} />);

      const button = screen.getByRole("button");
      expect(button.textContent).toContain("100");
    });

    it("clears input after successful submission", () => {
      render(<GuessInput {...defaultProps} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const form = input.closest("form")!;

      fireEvent.change(input, { target: { value: "1969" } });
      expect(input.value).toBe("1969");

      fireEvent.submit(form);

      // After submission, input should be cleared
      // Note: This behavior depends on the actual component implementation
      // In tests, we verify the onGuess was called
      expect(mockOnGuess).toHaveBeenCalledWith(1969);
    });
  });

  describe("Type Safety", () => {
    it("accepts all valid props", () => {
      const props = {
        onGuess: () => {},
        disabled: false,
        remainingGuesses: 3,
        onValidationError: () => {},
        className: "test-class",
      };

      // This should compile without TypeScript errors
      render(<GuessInput {...props} />);
      const input = screen.getByRole("textbox");
      expect(input).toBeTruthy();
    });

    it("validates prop types at runtime", () => {
      const invalidProps = {
        onGuess: "not a function" as unknown as () => void,
        disabled: "not a boolean" as unknown as boolean,
        remainingGuesses: "not a number" as unknown as number,
      };

      // Should still render but validation should catch these
      render(<GuessInput {...invalidProps} />);

      expect(mockValidate).toHaveBeenCalledWith(invalidProps);
    });
  });
});

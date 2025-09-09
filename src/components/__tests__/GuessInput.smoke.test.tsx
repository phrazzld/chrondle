import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GuessInput } from "../GuessInput";

// Mock motion/react to avoid animation issues
vi.mock("motion/react", () => ({
  motion: {
    button: ({
      children,
      type,
      ...props
    }: React.HTMLProps<HTMLButtonElement> & {
      whileTap?: unknown;
      animate?: unknown;
      transition?: unknown;
      type?: "button" | "submit" | "reset";
    }) => (
      <button type={type} {...props}>
        {children}
      </button>
    ),
  },
}));

describe("GuessInput Smoke Tests", () => {
  it("accepts year input and era selection", async () => {
    const mockOnGuess = vi.fn();
    const user = userEvent.setup();

    render(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={6}
      />,
    );

    // Verify input field exists and is accessible
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).toBeTruthy();

    // Type a year into the input
    await user.type(input, "1969");
    expect(input.value).toBe("1969");

    // Verify era toggle exists and AD is selected by default
    const adRadio = screen.getByRole("radio", {
      name: /AD/i,
    }) as HTMLButtonElement;
    const bcRadio = screen.getByRole("radio", {
      name: /BC/i,
    }) as HTMLButtonElement;
    expect(adRadio).toBeTruthy();
    expect(bcRadio).toBeTruthy();
    expect(adRadio.getAttribute("aria-checked")).toBe("true");
    expect(bcRadio.getAttribute("aria-checked")).toBe("false");
  });

  it("handles form submission with year and era", async () => {
    const mockOnGuess = vi.fn();
    const user = userEvent.setup();

    render(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={6}
      />,
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const submitButton = screen.getByRole("button", {
      name: /Submit guess/i,
    }) as HTMLButtonElement;

    // Enter a year and submit
    await user.type(input, "776");

    // Switch to BC
    const bcRadio = screen.getByRole("radio", { name: /BC/i });
    await user.click(bcRadio);

    // Submit the form
    await user.click(submitButton);

    // Verify the callback was called with the correct value (negative for BC)
    await waitFor(() => {
      expect(mockOnGuess).toHaveBeenCalledWith(-776);
    });
  });

  it("disables input and buttons when disabled prop is true", () => {
    const mockOnGuess = vi.fn();

    render(
      <GuessInput onGuess={mockOnGuess} disabled={true} remainingGuesses={6} />,
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const submitButton = screen.getByRole("button", {
      name: /Submit guess/i,
    }) as HTMLButtonElement;
    const adRadio = screen.getByRole("radio", {
      name: /AD/i,
    }) as HTMLButtonElement;
    const bcRadio = screen.getByRole("radio", {
      name: /BC/i,
    }) as HTMLButtonElement;

    // Verify all interactive elements are disabled
    expect(input.disabled).toBe(true);
    expect(submitButton.disabled).toBe(true);
    expect(adRadio.disabled).toBe(true);
    expect(bcRadio.disabled).toBe(true);
  });

  it("shows remaining guesses indicator", () => {
    const mockOnGuess = vi.fn();

    render(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={3}
      />,
    );

    // Verify remaining guesses is displayed (check aria-label instead)
    const submitBtn = screen.getByRole("button", { name: /Submit guess/i });
    expect(submitBtn.getAttribute("aria-label")).toContain("3 remaining");
  });

  // Arrow key navigation test removed - feature disabled for game integrity
  // Per CLAUDE.md: UI should not react differently based on proximity to answer

  it("clears input after successful submission", async () => {
    const mockOnGuess = vi.fn();
    const user = userEvent.setup();

    render(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={6}
      />,
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    const submitButton = screen.getByRole("button", {
      name: /Submit guess/i,
    }) as HTMLButtonElement;

    // Enter a year and submit
    await user.type(input, "1969");
    await user.click(submitButton);

    // Verify input is cleared after submission
    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });
});

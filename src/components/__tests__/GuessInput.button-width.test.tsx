import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GuessInput } from "../GuessInput";

describe("GuessInput Button Width Consistency", () => {
  const mockOnGuess = vi.fn();

  it("maintains consistent button width and shows animation during submission", async () => {
    render(<GuessInput onGuess={mockOnGuess} disabled={false} remainingGuesses={6} />);

    const button = screen.getByRole("button");
    const input = screen.getByRole("textbox");

    // Initial state - button should show "Guess"
    expect(button.textContent).toBe("Guess");

    // Button should have full width class
    expect(button.className).toContain("w-full");

    // Type a valid year
    fireEvent.change(input, { target: { value: "1969" } });

    // Submit the form
    fireEvent.submit(input.closest("form")!);

    // Button text should stay as "Guess" (no intermediate state anymore)
    expect(button.textContent).toBe("Guess");

    // Button should have the animation classes during submission
    expect(button.className).toContain("animate-button-press");

    // After submission animation completes (300ms), animation class should be removed
    await waitFor(
      () => {
        expect(button.className).not.toContain("animate-button-press");
      },
      { timeout: 500 }, // Increased from 300ms to 500ms to account for 300ms animation duration
    );

    // Verify onGuess was called with correct value
    expect(mockOnGuess).toHaveBeenCalledWith(1969);
  });

  it("button text changes correctly for different states", () => {
    const { rerender } = render(
      <GuessInput onGuess={mockOnGuess} disabled={false} remainingGuesses={6} />,
    );

    let button = screen.getByRole("button");
    expect(button.textContent).toBe("Guess");

    // Test loading state
    rerender(
      <GuessInput onGuess={mockOnGuess} disabled={false} remainingGuesses={6} isLoading={true} />,
    );
    button = screen.getByRole("button");
    expect(button.textContent).toBe("Loading game...");

    // Test disabled state (game over)
    rerender(
      <GuessInput onGuess={mockOnGuess} disabled={true} remainingGuesses={0} isLoading={false} />,
    );
    button = screen.getByRole("button");
    expect(button.textContent).toBe("Game Over");

    // Test no guesses remaining
    rerender(
      <GuessInput onGuess={mockOnGuess} disabled={false} remainingGuesses={0} isLoading={false} />,
    );
    button = screen.getByRole("button");
    expect(button.textContent).toBe("No guesses remaining");
  });

  it("button maintains full width", () => {
    render(<GuessInput onGuess={mockOnGuess} disabled={false} remainingGuesses={6} />);

    const button = screen.getByRole("button");

    // Check that button has full width class
    expect(button.className).toContain("w-full");
  });
});

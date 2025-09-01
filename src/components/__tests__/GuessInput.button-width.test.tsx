import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GuessInput } from "../GuessInput";

describe("GuessInput Button Width Consistency", () => {
  const mockOnGuess = vi.fn();

  it("maintains consistent button width when text changes from 'Guess' to 'Guessing...'", async () => {
    render(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={6}
      />,
    );

    const button = screen.getByRole("button");
    const input = screen.getByRole("textbox");

    // Initial state - button should show "Guess"
    expect(button.textContent).toBe("Guess");

    // Check that button has minimum width class on desktop
    expect(button.className).toContain("sm:min-w-[140px]");

    // Type a valid year
    fireEvent.change(input, { target: { value: "1969" } });

    // Submit the form
    fireEvent.submit(input.closest("form")!);

    // During submission, button should show "Guessing..."
    await waitFor(() => {
      expect(button.textContent).toBe("Guessing...");
    });

    // Button should have the animation classes during submission
    expect(button.className).toContain("scale-105");
    expect(button.className).toContain("animate-pulse");

    // After submission completes (150ms), button should return to "Guess"
    await waitFor(
      () => {
        expect(button.textContent).toBe("Guess");
      },
      { timeout: 300 },
    );

    // Verify onGuess was called with correct value
    expect(mockOnGuess).toHaveBeenCalledWith(1969);
  });

  it("button text changes correctly for different states", () => {
    const { rerender } = render(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={6}
      />,
    );

    let button = screen.getByRole("button");
    expect(button.textContent).toBe("Guess");

    // Test loading state
    rerender(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={6}
        isLoading={true}
      />,
    );
    button = screen.getByRole("button");
    expect(button.textContent).toBe("Loading game...");

    // Test disabled state (game over)
    rerender(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={true}
        remainingGuesses={0}
        isLoading={false}
      />,
    );
    button = screen.getByRole("button");
    expect(button.textContent).toBe("Game Over");

    // Test no guesses remaining
    rerender(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={0}
        isLoading={false}
      />,
    );
    button = screen.getByRole("button");
    expect(button.textContent).toBe("No guesses remaining");
  });

  it("button maintains full width on mobile and auto width with min-width on desktop", () => {
    render(
      <GuessInput
        onGuess={mockOnGuess}
        disabled={false}
        remainingGuesses={6}
      />,
    );

    const button = screen.getByRole("button");

    // Check responsive width classes
    expect(button.className).toContain("w-full"); // Full width on mobile
    expect(button.className).toContain("sm:w-auto"); // Auto width on desktop
    expect(button.className).toContain("sm:min-w-[140px]"); // Min width on desktop
  });
});

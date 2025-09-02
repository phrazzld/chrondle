import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentHintCard } from "../CurrentHintCard";

// Mocks
vi.mock("@/components/magicui/text-animate", () => ({
  TextAnimate: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="text-animate">{children}</div>
  ),
}));

vi.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  useReducedMotion: () => false,
}));

describe("CurrentHintCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseProps = {
    event: "Sample current hint",
    hintNumber: 1,
    totalHints: 6,
    remainingGuesses: 6,
    isLoading: false,
    error: null as string | null,
  };

  it("renders heading with hint count", () => {
    render(<CurrentHintCard {...baseProps} />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.textContent).toMatch(/Hint 1 of 6/i);
  });

  it("announces hint text in a polite live region", () => {
    render(<CurrentHintCard {...baseProps} />);

    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(screen.getByText("Sample current hint")).toBeTruthy();
  });

  it("shows loading state when isLoading is true", () => {
    render(<CurrentHintCard {...baseProps} isLoading={true} />);

    expect(screen.getByTestId("loading-spinner")).toBeTruthy();
    expect(screen.getByText(/Loading hint/i)).toBeTruthy();
  });

  it("renders remaining guesses with correct pluralization", () => {
    const { rerender } = render(
      <CurrentHintCard {...baseProps} remainingGuesses={2} />,
    );
    expect(screen.getByText(/2 guesses left/)).toBeTruthy();

    rerender(<CurrentHintCard {...baseProps} remainingGuesses={1} />);
    expect(screen.getByText(/1 guess left/)).toBeTruthy();
  });

  it("does not render when error is present", () => {
    render(<CurrentHintCard {...baseProps} error="boom" />);

    expect(screen.queryByRole("heading", { level: 3 })).toBe(null);
  });
});

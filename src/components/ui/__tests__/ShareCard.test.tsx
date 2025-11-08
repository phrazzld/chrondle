import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShareCard } from "../ShareCard";
import type { RangeGuess } from "@/types/range";

vi.mock("@/components/magicui/ripple-button", () => ({
  RippleButton: ({
    children,
    rippleColor: _rippleColor,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { rippleColor?: string }) => (
    <button {...props}>{children}</button>
  ),
}));

const sampleRanges: RangeGuess[] = [
  { start: 1900, end: 1950, hintsUsed: 0, score: 120, timestamp: 1 },
  { start: 1800, end: 1825, hintsUsed: 2, score: 80, timestamp: 2 },
  { start: 1500, end: 1700, hintsUsed: 3, score: 0, timestamp: 3 },
];

describe("ShareCard", () => {
  it("renders summary and range list", () => {
    render(
      <ShareCard
        ranges={sampleRanges}
        totalScore={200}
        shareStatus="idle"
        onShare={() => {}}
        hasWon={false}
        containedCount={2}
      />,
    );

    expect(screen.getByText(/2\/6 ranges contained/i)).toBeTruthy();
    expect(screen.getByText(/200 pts/)).toBeTruthy();
    expect(screen.getAllByText(/Attempt/)).toHaveLength(sampleRanges.length);
  });

  it("renders success state label", () => {
    render(
      <ShareCard
        ranges={sampleRanges}
        totalScore={300}
        shareStatus="success"
        onShare={() => {}}
        hasWon={true}
      />,
    );

    expect(screen.getByText(/Copied!/i)).toBeTruthy();
  });
});

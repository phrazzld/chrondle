import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HintLadder } from "../HintLadder";
import type { RangeHint } from "@/types/range";

const baseHints: (RangeHint & { revealed: boolean })[] = [
  { level: 1, content: "After 1900", multiplier: 0.85, revealed: true },
  { level: 2, content: "Between 1940-1990", multiplier: 0.7, revealed: false },
  { level: 3, content: "Between 1958-1980", multiplier: 0.5, revealed: false },
];

describe("HintLadder", () => {
  it("renders all hints with status", () => {
    render(
      <HintLadder
        hints={baseHints}
        hintsUsed={1}
        currentMultiplier={0.85}
        onHintTaken={() => {}}
      />,
    );

    expect(screen.getByText("Hint 1")).toBeInTheDocument();
    expect(screen.getByText("Hint 2")).toBeInTheDocument();
    expect(screen.getByText("Hint 3")).toBeInTheDocument();
    expect(screen.getByText("85% score")).toBeInTheDocument();
  });

  it("only enables the next hint button", () => {
    render(
      <HintLadder
        hints={baseHints}
        hintsUsed={1}
        currentMultiplier={0.85}
        onHintTaken={() => {}}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
    expect(buttons[2]).toBeDisabled();
  });

  it("invokes callback when the next hint is taken", () => {
    const handleHint = vi.fn();
    render(
      <HintLadder
        hints={baseHints}
        hintsUsed={1}
        currentMultiplier={0.85}
        onHintTaken={handleHint}
      />,
    );

    fireEvent.click(screen.getByText("Hint 2"));
    expect(handleHint).toHaveBeenCalledWith(2);
  });
});

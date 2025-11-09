import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { HintDisplay } from "@/components/order/HintDisplay";
import type { OrderEvent, OrderHint } from "@/types/orderGameState";

vi.stubGlobal("React", React);

vi.mock("motion/react", () => ({
  motion: {
    li: ({
      children,
      layout: _layout,
      ...props
    }: React.HTMLAttributes<HTMLLIElement> & { layout?: boolean }) => (
      <li {...props}>{children}</li>
    ),
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  LayoutGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => false,
}));

vi.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <span data-testid="spinner" />,
}));

const events: OrderEvent[] = [
  { id: "a", text: "Event A", year: 1200 },
  { id: "b", text: "Event B", year: 1500 },
  { id: "c", text: "Event C", year: 1800 },
];

const defaultProps = {
  events,
  hints: [] as OrderHint[],
  multiplier: 1,
  onRequestHint: vi.fn(),
};

describe("Order HintDisplay", () => {
  it("renders multiplier summary", () => {
    render(<HintDisplay {...defaultProps} multiplier={0.85} />);

    expect(screen.getAllByText("0.85×")[0]).toBeInTheDocument();
  });

  it("invokes callback when selecting a hint", () => {
    const onRequestHint = vi.fn();
    render(<HintDisplay {...defaultProps} onRequestHint={onRequestHint} />);

    const button = screen.getByRole("button", { name: /anchor hint/i });
    fireEvent.click(button);

    expect(onRequestHint).toHaveBeenCalledWith("anchor");
  });

  it("disables hint option when marked", () => {
    render(<HintDisplay {...defaultProps} disabledTypes={{ anchor: true }} />);

    const button = screen.getByRole("button", { name: /anchor hint/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("shows hint history entries when hints exist", () => {
    const hints: OrderHint[] = [{ type: "anchor", eventId: "b", position: 2 }];

    render(<HintDisplay {...defaultProps} hints={hints} />);

    expect(screen.getByText("Event B")).toBeInTheDocument();
    expect(screen.getByText(/position 3/i)).toBeInTheDocument();
  });

  it("shows error message when provided", () => {
    render(<HintDisplay {...defaultProps} error="Unable to generate hint" />);

    expect(screen.getByText("Unable to generate hint")).toBeInTheDocument();
  });
});

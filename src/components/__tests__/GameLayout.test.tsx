import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameLayout, type GameLayoutProps } from "../GameLayout";
import { validateGameLayoutProps } from "@/lib/propValidation";

const mockValidate = vi.mocked(validateGameLayoutProps);

vi.mock("@/components/GameInstructions", () => ({
  GameInstructions: () => <div data-testid="game-instructions">Game Instructions</div>,
}));

vi.mock("@/components/game/RangeInput", () => ({
  RangeInput: ({
    disabled,
    onCommit,
  }: {
    disabled: boolean;
    onCommit: (payload: { start: number; end: number; hintsUsed: number }) => void;
  }) => (
    <button
      data-testid="range-input"
      data-disabled={String(disabled)}
      onClick={() => onCommit({ start: 1900, end: 1950, hintsUsed: 0 })}
    >
      Range Input
    </button>
  ),
}));

vi.mock("@/components/game/RangeTimeline", () => ({
  RangeTimeline: ({ ranges }: { ranges: unknown[] }) => (
    <div data-testid="timeline" data-range-count={ranges.length}>
      Timeline
    </div>
  ),
}));

vi.mock("@/components/HintsDisplay", () => ({
  HintsDisplay: () => <div data-testid="hints-display">Hints Display</div>,
}));

vi.mock("@/components/CurrentHintCard", () => ({
  CurrentHintCard: () => <div data-testid="current-hint">Current Hint</div>,
}));

vi.mock("@/components/modals/GameComplete", () => ({
  GameComplete: () => <div data-testid="game-complete">Game Complete</div>,
}));

vi.mock("@/components/magicui/confetti", () => ({
  Confetti: () => <div data-testid="confetti">Confetti</div>,
  ConfettiRef: {},
}));

vi.mock("@/lib/propValidation", () => ({
  validateGameLayoutProps: vi.fn(),
}));

describe("GameLayout", () => {
  const mockOnRangeCommit = vi.fn();

  const createDefaultProps = (): GameLayoutProps => ({
    gameState: {
      puzzle: {
        year: 1969,
        events: ["Event 1", "Event 2", "Event 3", "Event 4", "Event 5", "Event 6"],
      },
      guesses: [],
      ranges: [],
      isGameOver: false,
      totalScore: 0,
    },
    isGameComplete: false,
    hasWon: false,
    isLoading: false,
    error: null,
    onRangeCommit: mockOnRangeCommit,
    remainingAttempts: 6,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("required props", () => {
    it("renders primary sections", () => {
      const props = createDefaultProps();
      render(<GameLayout {...props} />);

      expect(screen.getByTestId("game-instructions")).toBeTruthy();
      expect(screen.getByTestId("range-input")).toBeTruthy();
      expect(screen.getByTestId("timeline")).toBeTruthy();
      expect(screen.getByTestId("hints-display")).toBeTruthy();
    });

    it("validates props", () => {
      const props = createDefaultProps();
      render(<GameLayout {...props} />);

      expect(mockValidate).toHaveBeenCalledWith(props);
    });

    it("renders when puzzle missing", () => {
      const props = createDefaultProps();
      props.gameState.puzzle = null;

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("range-input")).toBeTruthy();
    });
  });

  describe("range input behavior", () => {
    it("disables input when game complete", () => {
      const props = createDefaultProps();
      props.isGameComplete = true;

      render(<GameLayout {...props} />);

      expect(screen.getByTestId("range-input").getAttribute("data-disabled")).toBe("true");
    });

    it("disables input while loading", () => {
      const props = createDefaultProps();
      props.isLoading = true;

      render(<GameLayout {...props} />);

      expect(screen.getByTestId("range-input").getAttribute("data-disabled")).toBe("true");
    });

    it("passes ranges to timeline", () => {
      const props = createDefaultProps();
      props.gameState.ranges = [
        { start: 1900, end: 1950, hintsUsed: 0, score: 25, timestamp: 1 },
        { start: 1800, end: 1850, hintsUsed: 1, score: 15, timestamp: 2 },
      ];

      render(<GameLayout {...props} />);

      expect(screen.getByTestId("timeline").getAttribute("data-range-count")).toBe("2");
    });

    it("shows remaining attempts", () => {
      const props = createDefaultProps();
      props.remainingAttempts = 1;

      render(<GameLayout {...props} />);

      expect(screen.getByText("1 attempt remaining")).toBeTruthy();
    });

    it("invokes commit callback", () => {
      const props = createDefaultProps();
      render(<GameLayout {...props} />);

      fireEvent.click(screen.getByTestId("range-input"));
      expect(mockOnRangeCommit).toHaveBeenCalledWith({ start: 1900, end: 1950, hintsUsed: 0 });
    });
  });

  describe("optional props", () => {
    it("renders header/footer", () => {
      const props = createDefaultProps();
      props.headerContent = <div data-testid="header">Header</div>;
      props.footerContent = <div data-testid="footer">Footer</div>;

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("header")).toBeTruthy();
      expect(screen.getByTestId("footer")).toBeTruthy();
    });

    it("renders confetti when ref provided", () => {
      const props = createDefaultProps();
      props.confettiRef = { current: null };

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("confetti")).toBeTruthy();
    });
  });

  describe("game complete state", () => {
    it("renders summary panel and hides current hint", () => {
      const props = createDefaultProps();
      props.isGameComplete = true;

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("game-complete")).toBeTruthy();
      expect(screen.queryByTestId("current-hint")).toBeNull();
    });
  });

  describe("type safety", () => {
    it("accepts full props object", () => {
      const props: GameLayoutProps = {
        gameState: {
          puzzle: { year: 1969, events: ["E1", "E2", "E3", "E4", "E5", "E6"] },
          guesses: [1970, 1968],
          ranges: [
            { start: 1960, end: 1970, hintsUsed: 0, score: 30, timestamp: 1 },
            { start: 1940, end: 1950, hintsUsed: 1, score: 15, timestamp: 2 },
          ],
          isGameOver: false,
          totalScore: 45,
        },
        isGameComplete: false,
        hasWon: false,
        isLoading: false,
        error: null,
        onRangeCommit: () => {},
        remainingAttempts: 4,
        headerContent: <div>Header</div>,
        footerContent: <div>Footer</div>,
        confettiRef: { current: null },
      };

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("game-instructions")).toBeTruthy();
    });
  });
});

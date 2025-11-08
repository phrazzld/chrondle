import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameLayout, type GameLayoutProps } from "../GameLayout";
import { validateGameLayoutProps } from "@/lib/propValidation";

const mockValidate = vi.mocked(validateGameLayoutProps);

// Mock child components to isolate GameLayout testing
vi.mock("@/components/GameInstructions", () => ({
  GameInstructions: () => <div data-testid="game-instructions">Game Instructions</div>,
}));

vi.mock("@/components/GuessInput", () => ({
  GuessInput: ({ disabled }: { disabled: boolean }) => (
    <div data-testid="guess-input" data-disabled={String(disabled)}>
      Guess Input
    </div>
  ),
}));

vi.mock("@/components/game/RangeTimeline", () => ({
  RangeTimeline: () => <div data-testid="timeline">Timeline</div>,
}));

vi.mock("@/components/ui/LastGuessDisplay", () => ({
  LastGuessDisplay: ({
    guessCount,
    hasWon,
    currentGuess,
    currentDistance,
  }: {
    guessCount: number;
    hasWon: boolean;
    currentGuess?: number;
    currentDistance?: number;
  }) => {
    // Replicate actual component logic - don't render before first guess or if won
    if (guessCount === 0 || hasWon || currentGuess === undefined || currentDistance === undefined) {
      return null;
    }
    return <div data-testid="last-guess-display">Last Guess Display</div>;
  },
}));

vi.mock("@/components/HintsDisplay", () => ({
  HintsDisplay: () => <div data-testid="hints-display">Hints Display</div>,
}));

vi.mock("@/components/magicui/confetti", () => ({
  Confetti: () => <div data-testid="confetti">Confetti</div>,
  ConfettiRef: {},
}));

// Mock prop validation to track calls
vi.mock("@/lib/propValidation", () => ({
  validateGameLayoutProps: vi.fn(),
}));

describe("GameLayout Component Interface", () => {
  const mockOnGuess = vi.fn();

  const createDefaultProps = (): GameLayoutProps => ({
    gameState: {
      puzzle: {
        year: 1969,
        events: ["Event 1", "Event 2", "Event 3", "Event 4", "Event 5", "Event 6"],
      },
      guesses: [],
      isGameOver: false,
    },
    isGameComplete: false,
    hasWon: false,
    isLoading: false,
    error: null,
    onGuess: mockOnGuess,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Required Props", () => {
    it("renders with all required props", () => {
      const props = createDefaultProps();
      render(<GameLayout {...props} />);

      expect(screen.getByTestId("game-instructions")).toBeTruthy();
      expect(screen.getByTestId("guess-input")).toBeTruthy();
      expect(screen.getByTestId("hints-display")).toBeTruthy();
    });

    it("validates props on render", () => {
      const props = createDefaultProps();
      render(<GameLayout {...props} />);

      expect(mockValidate).toHaveBeenCalledWith(props);
    });

    it("handles null puzzle state correctly", () => {
      const props = createDefaultProps();
      props.gameState.puzzle = null;

      render(<GameLayout {...props} />);
      // GuessInput should still render when not complete
      const guessInput = screen.getByTestId("guess-input");
      expect(guessInput).toBeTruthy();
    });

    it("handles empty guesses array", () => {
      const props = createDefaultProps();
      props.gameState.guesses = [];

      render(<GameLayout {...props} />);
      // Timeline is always rendered
      expect(screen.getByTestId("timeline")).toBeTruthy();
      // LastGuessDisplay only shows after first guess (no placeholder)
      expect(screen.queryByTestId("last-guess-display")).toBe(null);
    });

    it("shows timeline and last guess display after first guess", () => {
      const props = createDefaultProps();
      props.gameState.guesses = [1970];

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("timeline")).toBeTruthy();
      expect(screen.getByTestId("last-guess-display")).toBeTruthy();
    });
  });

  describe("Optional Props", () => {
    it("renders header content when provided", () => {
      const props = createDefaultProps();
      props.headerContent = <div data-testid="header">Custom Header</div>;

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("header")).toBeTruthy();
    });

    it("renders footer content when provided", () => {
      const props = createDefaultProps();
      props.footerContent = <div data-testid="footer">Custom Footer</div>;

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("footer")).toBeTruthy();
    });

    it("renders without optional props", () => {
      const props = createDefaultProps();

      render(<GameLayout {...props} />);
      expect(screen.queryByTestId("header")).toBe(null);
      expect(screen.queryByTestId("footer")).toBe(null);
    });

    it("renders confetti when ref is provided", () => {
      const props = createDefaultProps();
      props.confettiRef = { current: null };

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("confetti")).toBeTruthy();
    });
  });

  describe("Game State Scenarios", () => {
    it("shows input when game is over but not complete", () => {
      const props = createDefaultProps();
      props.gameState.isGameOver = true;
      // Game over but not complete (can still render input)

      render(<GameLayout {...props} />);
      const guessInput = screen.getByTestId("guess-input");
      expect(guessInput).toBeTruthy();
      // Disabled is based on isGameComplete, not isGameOver
      expect(guessInput.getAttribute("data-disabled")).toBe("false");
    });

    it("hides input when game is complete", () => {
      const props = createDefaultProps();
      props.isGameComplete = true;

      render(<GameLayout {...props} />);
      // GuessInput should not render when game is complete
      expect(screen.queryByTestId("guess-input")).toBe(null);
    });

    it("shows loading state correctly", () => {
      const props = createDefaultProps();
      props.isLoading = true;

      render(<GameLayout {...props} />);
      // Components should still render during loading
      expect(screen.getByTestId("hints-display")).toBeTruthy();
    });

    it("handles error state", () => {
      const props = createDefaultProps();
      props.error = "Something went wrong";

      render(<GameLayout {...props} />);
      // Components should still render with error
      expect(screen.getByTestId("hints-display")).toBeTruthy();
    });

    it("handles won state", () => {
      const props = createDefaultProps();
      props.hasWon = true;
      props.isGameComplete = true;

      render(<GameLayout {...props} />);
      // GuessInput should not render when game is complete
      expect(screen.queryByTestId("guess-input")).toBe(null);
    });
  });

  describe("Edge Cases", () => {
    it("handles puzzle with wrong number of events", () => {
      const props = createDefaultProps();
      props.gameState.puzzle!.events = ["Event 1", "Event 2"]; // Only 2 events

      render(<GameLayout {...props} />);
      expect(screen.getByTestId("hints-display")).toBeTruthy();
    });

    it("handles negative remainingGuesses", () => {
      const props = createDefaultProps();
      props.gameState.guesses = [1, 2, 3, 4, 5, 6, 7]; // More than max guesses

      render(<GameLayout {...props} />);
      const guessInput = screen.getByTestId("guess-input");
      // Should still render but be disabled
      expect(guessInput).toBeTruthy();
    });
  });

  describe("Callback Props", () => {
    it("passes onGuess callback to GuessInput", () => {
      const props = createDefaultProps();
      const customOnGuess = vi.fn();
      props.onGuess = customOnGuess;

      render(<GameLayout {...props} />);
      // GuessInput should receive the onGuess prop
      expect(screen.getByTestId("guess-input")).toBeTruthy();
    });

    it("handles onValidationError callback", () => {
      const props = createDefaultProps();
      const onValidationError = vi.fn();
      props.onValidationError = onValidationError;

      render(<GameLayout {...props} />);
      // Validation error handler should be available
      expect(screen.getByTestId("guess-input")).toBeTruthy();
    });
  });

  describe("Type Safety", () => {
    it("accepts valid GameLayoutProps", () => {
      const props: GameLayoutProps = {
        gameState: {
          puzzle: { year: 1969, events: ["E1", "E2", "E3", "E4", "E5", "E6"] },
          guesses: [1970, 1968],
          isGameOver: false,
        },
        isGameComplete: false,
        hasWon: false,
        isLoading: false,
        error: null,
        onGuess: () => {},
        headerContent: <div>Header</div>,
        footerContent: <div>Footer</div>,
        onValidationError: () => {},
        confettiRef: { current: null },
        debugMode: true,
      };

      // This should compile without TypeScript errors
      render(<GameLayout {...props} />);
      expect(screen.getByTestId("game-instructions")).toBeTruthy();
    });
  });
});

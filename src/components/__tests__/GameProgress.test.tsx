import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GameProgress } from "../GameProgress";

describe("GameProgress Component", () => {
  describe("Guesses Remaining Label", () => {
    it("renders the 'Guesses Remaining:' label text", () => {
      render(<GameProgress currentHintIndex={0} guessCount={0} />);

      expect(screen.getByText("Guesses Remaining:")).toBeTruthy();
    });

    it("has correct styling on the label", () => {
      render(<GameProgress currentHintIndex={0} guessCount={0} />);

      const label = screen.getByText("Guesses Remaining:");
      expect(label.className).toContain("text-sm");
      expect(label.className).toContain("font-medium");
      expect(label.className).toContain("text-muted-foreground");
      expect(label.className).toContain("mr-2");
    });

    it("renders correct aria-label with remaining count", () => {
      render(
        <GameProgress currentHintIndex={2} guessCount={2} totalHints={6} />,
      );

      const progressContainer = screen.getByLabelText("Guesses remaining: 4");
      expect(progressContainer).toBeTruthy();
    });

    it("updates aria-label when guesses change", () => {
      const { rerender } = render(
        <GameProgress currentHintIndex={0} guessCount={1} totalHints={6} />,
      );

      expect(screen.getByLabelText("Guesses remaining: 5")).toBeTruthy();

      rerender(
        <GameProgress currentHintIndex={2} guessCount={3} totalHints={6} />,
      );

      expect(screen.getByLabelText("Guesses remaining: 3")).toBeTruthy();
    });

    it("shows correct remaining count when all guesses used", () => {
      render(
        <GameProgress
          currentHintIndex={5}
          guessCount={6}
          totalHints={6}
          isGameComplete={true}
        />,
      );

      expect(screen.getByLabelText("Guesses remaining: 0")).toBeTruthy();
    });
  });

  describe("Progress Bubbles", () => {
    it("renders correct number of bubbles based on totalHints", () => {
      render(
        <GameProgress currentHintIndex={0} guessCount={0} totalHints={6} />,
      );

      const bubbles = screen
        .getAllByRole("generic")
        .filter((el) => el.className.includes("rounded-full"));
      expect(bubbles).toHaveLength(6);
    });

    it("fills correct number of bubbles based on current progress", () => {
      render(<GameProgress currentHintIndex={2} guessCount={2} />);

      const filledBubbles = screen
        .getAllByRole("generic")
        .filter(
          (el) =>
            el.className.includes("rounded-full") &&
            el.className.includes("bg-primary"),
        );
      expect(filledBubbles).toHaveLength(3); // currentHintIndex + 1
    });

    it("shows all bubbles as filled when game is complete and won", () => {
      render(
        <GameProgress
          currentHintIndex={3}
          guessCount={4}
          isGameComplete={true}
        />,
      );

      const filledBubbles = screen
        .getAllByRole("generic")
        .filter(
          (el) =>
            el.className.includes("rounded-full") &&
            el.className.includes("bg-primary"),
        );
      expect(filledBubbles).toHaveLength(4); // Shows guessCount when complete
    });

    it("renders empty bubbles for remaining guesses", () => {
      render(<GameProgress currentHintIndex={1} guessCount={2} />);

      const emptyBubbles = screen
        .getAllByRole("generic")
        .filter(
          (el) =>
            el.className.includes("rounded-full") &&
            el.className.includes("bg-muted-foreground/30"),
        );
      expect(emptyBubbles).toHaveLength(4); // 6 total - 2 filled
    });
  });

  describe("Container Styling", () => {
    it("applies custom className when provided", () => {
      render(
        <GameProgress
          currentHintIndex={0}
          guessCount={0}
          className="custom-class"
        />,
      );

      const container = screen.getByText("Guesses Remaining:").parentElement;
      expect(container?.className).toContain("custom-class");
    });

    it("has correct flex layout classes", () => {
      render(<GameProgress currentHintIndex={0} guessCount={0} />);

      const container = screen.getByText("Guesses Remaining:").parentElement;
      expect(container?.className).toContain("flex");
      expect(container?.className).toContain("justify-start");
      expect(container?.className).toContain("items-center");
    });
  });
});

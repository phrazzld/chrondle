import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HintsDisplay } from "../HintsDisplay";
import { validateHintsDisplayProps } from "@/lib/propValidation";

const mockValidate = vi.mocked(validateHintsDisplayProps);

// Mock child components to isolate HintsDisplay testing
vi.mock("@/components/ui/Separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

vi.mock("@/components/magicui/text-animate", () => ({
  TextAnimate: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="text-animate">{children}</div>
  ),
}));

vi.mock("@/components/ui/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon">✓</span>,
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    p: ({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) => (
      <p {...props}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  LayoutGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock prop validation to track calls
vi.mock("@/lib/propValidation", () => ({
  validateHintsDisplayProps: vi.fn(),
}));

describe("HintsDisplay Component Interface", () => {
  const createDefaultProps = () => ({
    events: [
      "First lunar landing by Apollo 11",
      "Vietnam War escalation continues",
      "Woodstock music festival occurs",
      "ARPANET first connection established",
      "Nixon becomes president",
      "Beatles release Abbey Road album",
    ],
    guesses: [] as number[],
    targetYear: 1969,
    currentHintIndex: 0,
    isGameComplete: false,
    isLoading: false,
    error: null as string | null,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Required Props", () => {
    it("renders with all required props", () => {
      const props = createDefaultProps();
      render(<HintsDisplay {...props} />);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 1 of 6/i);
      expect(screen.getByText(props.events[0])).toBeTruthy();
    });

    it("validates props on render", () => {
      const props = createDefaultProps();
      render(<HintsDisplay {...props} />);

      expect(mockValidate).toHaveBeenCalledWith(props);
    });

    it("shows correct hint based on currentHintIndex", () => {
      const props = createDefaultProps();
      props.currentHintIndex = 2;

      render(<HintsDisplay {...props} />);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 3 of 6/i);
      expect(screen.getByText(props.events[2])).toBeTruthy();
    });

    it("shows all hints when game is complete", () => {
      const props = createDefaultProps();
      props.isGameComplete = true;
      props.guesses = [1970, 1968, 1969]; // Won on third guess

      render(<HintsDisplay {...props} />);

      // Should show all events
      props.events.forEach((event) => {
        expect(screen.getByText(event)).toBeTruthy();
      });
    });

    it("handles empty guesses array", () => {
      const props = createDefaultProps();
      props.guesses = [];

      render(<HintsDisplay {...props} />);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 1 of 6/i);
      const checkIcons = screen.queryAllByTestId("check-icon");
      expect(checkIcons.length).toBe(0);
    });
  });

  describe("Optional Props", () => {
    it("accepts className prop", () => {
      const props = createDefaultProps();
      const { container } = render(
        <HintsDisplay {...props} className="custom-class" />,
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("custom-class");
    });

    it("renders without isGameComplete prop", () => {
      const props = createDefaultProps();
      // Don't set isGameComplete

      render(<HintsDisplay {...props} />);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 1 of 6/i);
    });
  });

  describe("Loading and Error States", () => {
    it("shows loading spinner when isLoading is true", () => {
      const props = createDefaultProps();
      props.isLoading = true;

      render(<HintsDisplay {...props} />);

      expect(screen.getByTestId("loading-spinner")).toBeTruthy();
    });

    it("shows error message when error is present", () => {
      const props = { ...createDefaultProps(), error: "Failed to load hints" };

      render(<HintsDisplay {...props} />);

      expect(screen.getByText(/failed to load hints/i)).toBeTruthy();
    });

    it("prioritizes error over loading state", () => {
      const props = {
        ...createDefaultProps(),
        isLoading: true,
        error: "Error occurred",
      };

      render(<HintsDisplay {...props} />);

      expect(screen.getByText(/error occurred/i)).toBeTruthy();
      expect(screen.queryByTestId("loading-spinner")).toBe(null);
    });
  });

  describe("Hint Progression", () => {
    it("shows hints up to current index", () => {
      const props = createDefaultProps();
      props.currentHintIndex = 2;
      props.guesses = [1970, 1968];

      render(<HintsDisplay {...props} />);

      // Should show hints 0, 1, and 2
      expect(screen.getByText(props.events[0])).toBeTruthy();
      expect(screen.getByText(props.events[1])).toBeTruthy();
      expect(screen.getByText(props.events[2])).toBeTruthy();

      // Should not show later hints
      expect(screen.queryByText(props.events[3])).toBe(null);
    });

    it("shows check marks for revealed hints", () => {
      const props = createDefaultProps();
      props.currentHintIndex = 3;
      props.guesses = [1970, 1968, 1971];

      render(<HintsDisplay {...props} />);

      // Should have check marks for hints 0, 1, 2 (not current hint)
      const checkIcons = screen.getAllByTestId("check-icon");
      expect(checkIcons.length).toBe(3);
    });

    it("formats target year correctly", () => {
      const props = createDefaultProps();
      props.targetYear = -776;
      props.isGameComplete = true;

      render(<HintsDisplay {...props} />);

      // formatYear should convert -776 to "776 BCE"
      const yearText = screen.getByText(/776/);
      expect(yearText.textContent).toMatch(/BCE/);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty events array", () => {
      const props = createDefaultProps();
      props.events = [];

      render(<HintsDisplay {...props} />);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 1 of 0/i);
    });

    it("handles wrong number of events", () => {
      const props = createDefaultProps();
      props.events = ["Event 1", "Event 2"]; // Only 2 events

      render(<HintsDisplay {...props} />);

      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 1 of 2/i);
    });

    it("handles currentHintIndex out of bounds", () => {
      const props = createDefaultProps();
      props.currentHintIndex = 10; // Out of bounds

      render(<HintsDisplay {...props} />);

      // Should handle gracefully
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 11 of 6/i);
    });

    it("handles negative currentHintIndex", () => {
      const props = createDefaultProps();
      props.currentHintIndex = -1;

      render(<HintsDisplay {...props} />);

      // Should handle gracefully
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 0 of 6/i);
    });

    it("handles more guesses than events", () => {
      const props = createDefaultProps();
      props.guesses = [1970, 1968, 1971, 1967, 1966, 1965, 1964];
      props.currentHintIndex = 5;

      render(<HintsDisplay {...props} />);

      // Should show all 6 events
      const checkIcons = screen.getAllByTestId("check-icon");
      expect(checkIcons.length).toBe(5); // All except current
    });
  });

  describe("Type Safety", () => {
    it("accepts all valid props", () => {
      const props = {
        events: ["E1", "E2", "E3", "E4", "E5", "E6"],
        guesses: [1970, 1969],
        targetYear: 1969,
        currentHintIndex: 2,
        isGameComplete: true,
        isLoading: false,
        error: null,
        className: "test-class",
      };

      // This should compile without TypeScript errors
      render(<HintsDisplay {...props} />);
      expect(screen.getByText("E3")).toBeTruthy();
    });

    it("validates prop types at runtime", () => {
      const invalidProps = {
        events: "not an array" as unknown as string[],
        guesses: "not an array" as unknown as number[],
        targetYear: "not a number" as unknown as number,
        currentHintIndex: "not a number" as unknown as number,
        isLoading: "not a boolean" as unknown as boolean,
        error: 123 as unknown as string | null,
      };

      // Should still render but validation should catch these
      render(<HintsDisplay {...invalidProps} />);

      expect(mockValidate).toHaveBeenCalledWith(invalidProps);
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML structure", () => {
      const props = createDefaultProps();
      render(<HintsDisplay {...props} />);

      // Should have proper heading hierarchy
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading.textContent).toMatch(/hint 1 of 6/i);
    });

    it("announces hint progression to screen readers", () => {
      const props = createDefaultProps();
      props.currentHintIndex = 2;

      render(<HintsDisplay {...props} />);

      // Current hint should be announced
      expect(screen.getByText(props.events[2])).toBeTruthy();
    });
  });
});

import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RangePreview } from "../RangePreview";

describe("RangePreview", () => {
  const props = {
    start: 1900,
    end: 1950,
    width: 51,
    predictedScore: 420,
    multiplier: 0.7,
  };

  it("shows range boundaries", () => {
    render(<RangePreview {...props} />);
    expect(screen.getByText("1900 – 1950")).toBeInTheDocument();
  });

  it("displays width, score, and multiplier", () => {
    render(<RangePreview {...props} />);
    expect(screen.getByText("51")).toBeInTheDocument();
    expect(screen.getByText("420")).toBeInTheDocument();
    expect(screen.getByText("70%"));
  });
});

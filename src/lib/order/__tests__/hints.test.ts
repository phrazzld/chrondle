import { describe, expect, it } from "vitest";
import { generateAnchorHint, generateBracketHint, generateRelativeHint } from "@/lib/order/hints";
import type { OrderEvent } from "@/types/orderGameState";

const events: OrderEvent[] = [
  { id: "a", year: 1200, text: "Event A" },
  { id: "b", year: 1500, text: "Event B" },
  { id: "c", year: 1800, text: "Event C" },
];

describe("Order hint generation", () => {
  it("generates an anchor hint for first incorrect position", () => {
    const hint = generateAnchorHint(["b", "a", "c"], ["a", "b", "c"]);
    expect(hint).toEqual({ type: "anchor", eventId: "a", position: 0 });
  });

  it("falls back to first slot when order already matches", () => {
    const hint = generateAnchorHint(["a", "b", "c"], ["a", "b", "c"]);
    expect(hint).toEqual({ type: "anchor", eventId: "a", position: 0 });
  });

  it("returns a relative hint for misordered pair", () => {
    const hint = generateRelativeHint(["c", "a", "b"], events);
    expect(hint).toEqual({ type: "relative", earlierEventId: "a", laterEventId: "c" });
  });

  it("falls back to earliest chronological pair when already correct", () => {
    const hint = generateRelativeHint(["a", "b", "c"], events);
    expect(hint).toEqual({ type: "relative", earlierEventId: "a", laterEventId: "b" });
  });

  it("produces bracket hints around the event year", () => {
    const hint = generateBracketHint(events[1], 50);
    expect(hint).toEqual({ type: "bracket", eventId: "b", yearRange: [1450, 1550] });
  });
});

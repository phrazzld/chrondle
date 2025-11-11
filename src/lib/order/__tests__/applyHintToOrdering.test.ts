import { describe, expect, it } from "vitest";
import { applyHintToOrdering } from "@/lib/order/applyHintToOrdering";
import type { OrderHint } from "@/types/orderGameState";

describe("applyHintToOrdering", () => {
  const ordering = ["a", "b", "c", "d", "e", "f"];
  const correctOrder = ["a", "b", "c", "d", "e", "f"];

  describe("anchor hints", () => {
    it("moves event to locked position from earlier position", () => {
      const hint: OrderHint = { type: "anchor", eventId: "b", position: 4 };
      const result = applyHintToOrdering(ordering, hint, correctOrder);
      expect(result).toEqual(["a", "c", "d", "e", "b", "f"]);
    });

    it("moves event to locked position from later position", () => {
      const hint: OrderHint = { type: "anchor", eventId: "e", position: 1 };
      const result = applyHintToOrdering(ordering, hint, correctOrder);
      expect(result).toEqual(["a", "e", "b", "c", "d", "f"]);
    });

    it("handles event already at correct position", () => {
      const hint: OrderHint = { type: "anchor", eventId: "c", position: 2 };
      const result = applyHintToOrdering(ordering, hint, correctOrder);
      expect(result).toEqual(ordering);
    });

    it("handles locking first event", () => {
      const scrambled = ["b", "a", "c", "d", "e", "f"];
      const hint: OrderHint = { type: "anchor", eventId: "a", position: 0 };
      const result = applyHintToOrdering(scrambled, hint, correctOrder);
      expect(result).toEqual(["a", "b", "c", "d", "e", "f"]);
    });

    it("handles locking last event", () => {
      const scrambled = ["a", "b", "c", "d", "f", "e"];
      const hint: OrderHint = { type: "anchor", eventId: "f", position: 5 };
      const result = applyHintToOrdering(scrambled, hint, correctOrder);
      expect(result).toEqual(["a", "b", "c", "d", "e", "f"]);
    });

    it("handles invalid position gracefully (negative)", () => {
      const hint: OrderHint = { type: "anchor", eventId: "b", position: -1 };
      const result = applyHintToOrdering(ordering, hint, correctOrder);
      expect(result).toEqual(ordering);
    });

    it("handles invalid position gracefully (out of bounds)", () => {
      const hint: OrderHint = { type: "anchor", eventId: "b", position: 10 };
      const result = applyHintToOrdering(ordering, hint, correctOrder);
      expect(result).toEqual(ordering);
    });

    it("handles missing event ID gracefully", () => {
      const hint: OrderHint = { type: "anchor", eventId: "z", position: 2 };
      const result = applyHintToOrdering(ordering, hint, correctOrder);
      expect(result).toEqual(ordering);
    });

    it("is pure - does not mutate input ordering", () => {
      const originalOrdering = ["a", "b", "c", "d", "e", "f"];
      const hint: OrderHint = { type: "anchor", eventId: "e", position: 0 };
      applyHintToOrdering(originalOrdering, hint, correctOrder);
      expect(originalOrdering).toEqual(["a", "b", "c", "d", "e", "f"]);
    });
  });

  describe("relative hints", () => {
    it("does not affect ordering", () => {
      const hint: OrderHint = {
        type: "relative",
        earlierEventId: "b",
        laterEventId: "d",
      };
      const result = applyHintToOrdering(ordering, hint, correctOrder);
      expect(result).toEqual(ordering);
    });
  });

  describe("bracket hints", () => {
    it("does not affect ordering", () => {
      const hint: OrderHint = {
        type: "bracket",
        eventId: "c",
        yearRange: [1500, 1600],
      };
      const result = applyHintToOrdering(ordering, hint, correctOrder);
      expect(result).toEqual(ordering);
    });
  });

  describe("real-world scenario", () => {
    it("correctly locks Hypatia at position 4", () => {
      // Scenario from screenshot: Hypatia should be at position 4 (index 3)
      const scrambled = [
        "hypatia", // Currently at position 1 (index 0) - WRONG
        "philip",
        "battle",
        "stonehenge",
        "cleopatra",
        "ramesses",
      ];
      const hint: OrderHint = { type: "anchor", eventId: "hypatia", position: 3 };
      const result = applyHintToOrdering(scrambled, hint, correctOrder);

      // Hypatia should now be at position 4 (index 3)
      expect(result[3]).toBe("hypatia");

      // Verify complete ordering
      expect(result).toEqual([
        "philip",
        "battle",
        "stonehenge",
        "hypatia", // Now at position 4
        "cleopatra",
        "ramesses",
      ]);
    });
  });
});

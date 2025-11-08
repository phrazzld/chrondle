import type { OrderEvent, OrderHint } from "@/types/orderGameState";

/**
 * Reveals the correct event for a specific position.
 * If the player already has the correct event in that slot, the hint confirms it.
 */
export function generateAnchorHint(currentOrder: string[], correctOrder: string[]): OrderHint {
  const index = currentOrder.findIndex((eventId, idx) => eventId !== correctOrder[idx]);
  const position = index === -1 ? 0 : index;

  return {
    type: "anchor",
    eventId: correctOrder[position],
    position,
  };
}

/**
 * Provides a relative ordering hint (event A occurs before event B).
 */
export function generateRelativeHint(currentOrder: string[], events: OrderEvent[]): OrderHint {
  const chronological = [...events].sort((a, b) => a.year - b.year);
  const indexById = new Map(chronological.map((event, idx) => [event.id, idx]));

  for (let i = 0; i < currentOrder.length; i++) {
    for (let j = i + 1; j < currentOrder.length; j++) {
      const first = currentOrder[i];
      const second = currentOrder[j];
      const firstIndex = indexById.get(first);
      const secondIndex = indexById.get(second);

      if (firstIndex === undefined || secondIndex === undefined) {
        continue;
      }

      if (firstIndex > secondIndex) {
        return {
          type: "relative",
          earlierEventId: chronological[Math.min(firstIndex, secondIndex)].id,
          laterEventId: chronological[Math.max(firstIndex, secondIndex)].id,
        };
      }
    }
  }

  // If everything is already correct, reinforce the earliest pair.
  return {
    type: "relative",
    earlierEventId: chronological[0]?.id ?? "",
    laterEventId: chronological[1]?.id ?? "",
  };
}

/**
 * Returns a bracket hint describing the event's year range.
 */
export function generateBracketHint(event: OrderEvent, span: number = 25): OrderHint {
  const lower = event.year - span;
  const upper = event.year + span;

  return {
    type: "bracket",
    eventId: event.id,
    yearRange: [lower, upper],
  };
}

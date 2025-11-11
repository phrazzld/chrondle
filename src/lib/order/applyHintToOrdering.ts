import type { OrderHint } from "@/types/orderGameState";

/**
 * Pure function that applies a hint's effect to the current event ordering.
 *
 * Following Ousterhout's deep module principle: simple interface that hides
 * the complexity of how different hint types affect ordering.
 *
 * @param ordering - Current event ordering (array of event IDs)
 * @param hint - The hint being applied
 * @param correctOrder - The correct chronological ordering (for anchor hints)
 * @returns New ordering with hint effect applied
 */
export function applyHintToOrdering(
  ordering: string[],
  hint: OrderHint,
  correctOrder: string[],
): string[] {
  // Only anchor hints affect ordering - they lock an event at the correct position
  if (hint.type === "anchor") {
    return applyAnchorHint(ordering, hint.eventId, hint.position, correctOrder);
  }

  // Relative and bracket hints only provide information - they don't affect ordering
  return ordering;
}

/**
 * Applies an anchor hint by moving the locked event to its correct position.
 *
 * Algorithm:
 * 1. Find current position of locked event
 * 2. Remove it from current position
 * 3. Insert it at the locked position
 *
 * This ensures the event appears at the exact position specified by the hint.
 */
function applyAnchorHint(
  ordering: string[],
  eventId: string,
  lockedPosition: number,
  _correctOrder: string[],
): string[] {
  // Validate inputs
  if (lockedPosition < 0 || lockedPosition >= ordering.length) {
    return ordering;
  }

  const currentIndex = ordering.indexOf(eventId);
  if (currentIndex === -1) {
    return ordering;
  }

  // If already at correct position, no change needed
  if (currentIndex === lockedPosition) {
    return ordering;
  }

  // Create new ordering with event moved to locked position
  const newOrdering = [...ordering];
  const [movedEvent] = newOrdering.splice(currentIndex, 1);
  newOrdering.splice(lockedPosition, 0, movedEvent);

  return newOrdering;
}

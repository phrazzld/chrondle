import type { OrderEvent, OrderScore } from "../../types/orderGameState";

const HINT_MULTIPLIERS = [1, 0.85, 0.7, 0.5];

export function scoreOrderSubmission(
  playerOrdering: string[],
  events: OrderEvent[],
  hintsUsed: number,
): OrderScore {
  const chronological = [...events].sort((a, b) => a.year - b.year).map((event) => event.id);
  const totalPairs = (playerOrdering.length * (playerOrdering.length - 1)) / 2;
  let correctPairs = 0;

  for (let i = 0; i < playerOrdering.length; i++) {
    for (let j = i + 1; j < playerOrdering.length; j++) {
      const first = playerOrdering[i];
      const second = playerOrdering[j];
      if (chronological.indexOf(first) < chronological.indexOf(second)) {
        correctPairs += 1;
      }
    }
  }

  const multiplier = HINT_MULTIPLIERS[Math.min(hintsUsed, HINT_MULTIPLIERS.length - 1)];
  const totalScore = Math.round(correctPairs * 2 * multiplier);

  return {
    totalScore,
    correctPairs,
    totalPairs,
    hintMultiplier: multiplier,
  };
}

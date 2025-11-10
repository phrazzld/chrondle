import { HintCount, ScoreResult } from "../types/range";

export const SCORING_CONSTANTS = {
  S: 100,
  W_MAX: 250,
  // Extended multipliers for 6 historical events (0-6 hints revealed)
  // 0 hints = 100%, 1 = 85%, 2 = 70%, 3 = 50%, 4 = 40%, 5 = 30%, 6 = 20%
  HINT_MULTIPLIERS: [1.0, 0.85, 0.7, 0.5, 0.4, 0.3, 0.2] as const,
} as const;

const { HINT_MULTIPLIERS } = SCORING_CONSTANTS;

const HINT_LEVELS = new Set<HintCount>([0, 1, 2, 3, 4, 5, 6]);

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
}

function validateInputs(
  start: number,
  end: number,
  answer: number,
  tolerance: number,
  hintsUsed: HintCount,
): void {
  const numericArgs: Array<[number, string]> = [
    [start, "start"],
    [end, "end"],
    [answer, "answer"],
    [tolerance, "tolerance"],
  ];

  numericArgs.forEach(([value, label]) => {
    assertFinite(value, label);
  });

  if (tolerance < 0) {
    throw new Error("tolerance cannot be negative");
  }

  if (!HINT_LEVELS.has(hintsUsed)) {
    throw new Error("hintsUsed must be between 0 and 3 inclusive");
  }
}

function calculateWidth(start: number, end: number): number {
  const width = end - start + 1;

  if (width <= 0) {
    throw new Error("start year must be less than or equal to end year");
  }

  if (width > SCORING_CONSTANTS.W_MAX) {
    throw new Error(`range width cannot exceed ${SCORING_CONSTANTS.W_MAX} years`);
  }

  return width;
}

/**
 * Detailed score calculation with containment metadata.
 */
export function scoreRangeDetailed(
  start: number,
  end: number,
  answer: number,
  tolerance: number = 0,
  hintsUsed: HintCount = 0,
): ScoreResult {
  validateInputs(start, end, answer, tolerance, hintsUsed);
  const width = calculateWidth(start, end);

  const lowerBound = start - tolerance;
  const upperBound = end + tolerance;
  const contains = answer >= lowerBound && answer <= upperBound;

  if (!contains) {
    return {
      score: 0,
      contained: false,
      baseScore: 0,
      width,
    };
  }

  const baseScore = SCORING_CONSTANTS.S * Math.log2((SCORING_CONSTANTS.W_MAX + 1) / (width + 1));

  const multiplier = HINT_MULTIPLIERS[hintsUsed];
  const score = Math.floor(baseScore * multiplier);

  return {
    score,
    contained: true,
    baseScore,
    width,
  };
}

/**
 * Public scoring helper that returns just the final integer score.
 */
export function scoreRange(
  start: number,
  end: number,
  answer: number,
  tolerance: number = 0,
  hintsUsed: HintCount = 0,
): number {
  return scoreRangeDetailed(start, end, answer, tolerance, hintsUsed).score;
}

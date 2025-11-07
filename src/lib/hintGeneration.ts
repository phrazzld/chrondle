import { formatYear } from "@/lib/displayFormatting";
import { RangeHint } from "@/types/range";

import { SCORING_CONSTANTS } from "./scoring";

const COARSE_OFFSET_YEARS = 25;
const FINE_OFFSET_YEARS = 10;

const ERA_BUCKETS: Array<{ minYear: number; label: string }> = [
  { minYear: 1900, label: "20th century or later" },
  { minYear: 1700, label: "Modern era (1700-1900)" },
  { minYear: 1400, label: "Early Modern era (1400-1700)" },
  { minYear: 500, label: "Medieval period (500-1400)" },
  { minYear: 0, label: "Classical antiquity (0-500)" },
];

const FALLBACK_ERA_LABEL = "Ancient history (before 0 AD)";

const HINT_MULTIPLIERS_BY_LEVEL: Record<RangeHint["level"], number> = {
  1: SCORING_CONSTANTS.HINT_MULTIPLIERS[1],
  2: SCORING_CONSTANTS.HINT_MULTIPLIERS[2],
  3: SCORING_CONSTANTS.HINT_MULTIPLIERS[3],
};

function assertFiniteYear(year: number): void {
  if (!Number.isFinite(year)) {
    throw new Error("answerYear must be a finite number");
  }
}

function describeEra(year: number): string {
  for (const bucket of ERA_BUCKETS) {
    if (year >= bucket.minYear) {
      return bucket.label;
    }
  }

  return FALLBACK_ERA_LABEL;
}

function buildBracketHint(year: number, offset: number): string {
  const start = Math.min(year - offset, year + offset);
  const end = Math.max(year - offset, year + offset);

  return `Between ${formatYear(start)} and ${formatYear(end)}`;
}

export function generateHints(answerYear: number): RangeHint[] {
  assertFiniteYear(answerYear);

  return [
    {
      level: 1,
      content: describeEra(answerYear),
      multiplier: HINT_MULTIPLIERS_BY_LEVEL[1],
    },
    {
      level: 2,
      content: buildBracketHint(answerYear, COARSE_OFFSET_YEARS),
      multiplier: HINT_MULTIPLIERS_BY_LEVEL[2],
    },
    {
      level: 3,
      content: buildBracketHint(answerYear, FINE_OFFSET_YEARS),
      multiplier: HINT_MULTIPLIERS_BY_LEVEL[3],
    },
  ];
}

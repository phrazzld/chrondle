/**
 * Social Sharing Content Generator
 * Generates formatted text for sharing game results on social media
 */

import type { RangeGuess } from "@/types/range";
import { pluralize } from "@/lib/displayFormatting";
import { logger } from "@/lib/logger";

interface ShareTextOptions {
  targetYear?: number;
}

function getPrimaryRange(ranges: RangeGuess[]): RangeGuess | undefined {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return undefined;
  }
  return ranges[ranges.length - 1];
}

function getMissDistance(range: RangeGuess, targetYear: number): number {
  if (targetYear < range.start) {
    return range.start - targetYear;
  }
  if (targetYear > range.end) {
    return targetYear - range.end;
  }
  return 0;
}

export function generateShareText(
  ranges: RangeGuess[],
  totalScore: number,
  hasWon: boolean,
  puzzleNumber?: number,
  options: ShareTextOptions = {},
): string {
  try {
    if (!Array.isArray(ranges) || ranges.some((range) => typeof range.start !== "number")) {
      logger.error("Invalid ranges passed to generateShareText");
      return "Chrondle share text generation failed";
    }

    const primaryRange = getPrimaryRange(ranges);
    const hintsUsed = primaryRange?.hintsUsed ?? 0;
    const widthYears = primaryRange ? primaryRange.end - primaryRange.start + 1 : null;
    const hintPhrase =
      hintsUsed === 0 ? "with no extra hints" : `after ${pluralize(hintsUsed, "hint")}`;
    const windowPhrase = widthYears ? `${widthYears}-year window` : "single range";
    const missDistance =
      !hasWon && primaryRange && typeof options.targetYear === "number"
        ? getMissDistance(primaryRange, options.targetYear)
        : null;

    const today = new Date();
    const dateString = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const header = `Chrondle${puzzleNumber ? ` #${puzzleNumber}` : ""} • ${dateString}`;
    const performanceLine = primaryRange
      ? `I scored ${totalScore.toLocaleString()} pts with a ${windowPhrase} ${hintPhrase}.`
      : `I scored ${totalScore.toLocaleString()} pts.`;

    const detailLine = hasWon
      ? "Contained today's year. Think you can match it?"
      : missDistance !== null && missDistance > 0
        ? `Missed by ${pluralize(missDistance, "year")}. Can you contain it?`
        : "Today's year escaped me. Can you contain it?";

    return `${header}\n${performanceLine}\n${detailLine}\nhttps://www.chrondle.app`;
  } catch (error) {
    logger.error("Failed to generate share text:", error);
    return `Chrondle: ${hasWon ? "Victory" : "Learned something new"}\nhttps://www.chrondle.app`;
  }
}

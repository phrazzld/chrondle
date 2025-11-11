/**
 * Social Sharing Content Generator
 * Generates formatted text for sharing game results on social media
 */

import type { RangeGuess } from "@/types/range";
import { formatYear } from "@/lib/displayFormatting";
import { logger } from "@/lib/logger";

function formatRangeLine(range: RangeGuess, index: number): string {
  const width = range.end - range.start + 1;
  const status = range.score > 0 ? "✅" : "◻️";
  return `${status} #${index + 1}: ${formatYear(range.start)}–${formatYear(range.end)} • ${width} yr${width === 1 ? "" : "s"} • ${range.score} pts • H${range.hintsUsed}`;
}

export function generateShareText(
  ranges: RangeGuess[],
  totalScore: number,
  hasWon: boolean,
  puzzleNumber?: number,
): string {
  try {
    if (!Array.isArray(ranges) || ranges.some((range) => typeof range.start !== "number")) {
      logger.error("Invalid ranges passed to generateShareText");
      return "Chrondle share text generation failed";
    }

    const today = new Date();
    const dateString = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const containedCount = ranges.filter((range) => range.score > 0).length;
    const attemptSummary =
      ranges.length > 0
        ? `${containedCount}/${ranges.length} ranges contained`
        : "No ranges submitted";

    const header = `Chrondle${puzzleNumber ? ` #${puzzleNumber}` : ""} • ${dateString}`;
    const scoreLine = `Score: ${totalScore.toLocaleString()} pts`;
    const resultLine = hasWon ? `Victory! ${attemptSummary}` : `Keep practicing! ${attemptSummary}`;

    const rangeLines = ranges.length > 0 ? ranges.map(formatRangeLine).join("\n") : "—";

    return `${header}\n${scoreLine}\n${resultLine}\n\n${rangeLines}\n\nhttps://www.chrondle.app`;
  } catch (error) {
    logger.error("Failed to generate share text:", error);
    return `Chrondle: ${hasWon ? "Victory" : "Learned something new"}\nhttps://www.chrondle.app`;
  }
}

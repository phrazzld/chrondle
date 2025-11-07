"use node";

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { createLLMClient, type LLMClient, type TokenUsage } from "../../lib/llmClient";
import type { CandidateEvent } from "./schemas";
import { GeneratorOutputSchema, parseEra, type Era } from "./schemas";

const GENERATOR_SYSTEM_PROMPT = `You are ChronBot Generator, a historian-puzzlemaker creating historical event clues for a guessing game.

CRITICAL RULES:
1. All events MUST be from the EXACT target year provided
2. NO numerals ≥10 (write "twelve" not "12", "thousand" not "1000")
3. NO century/decade/millennium terms ("19th century" forbidden)
4. NO BCE/CE/AD/BC terminology
5. Present tense, ≤20 words per event
6. Include proper nouns (people, places, institutions)
7. Vary domains: politics, science, culture, tech, sports, economy, war, religion
8. Vary geography: multiple regions/countries

OUTPUT: Valid JSON matching the schema. 12-18 candidates.

SPECIAL HANDLING FOR ANCIENT YEARS (1-3 digits):
- Prefer figure-centric clues: "Caesar falls at Theatre of Pompey"
- Avoid era terms: "late Republic" acceptable, "1st century BCE" forbidden
- Use dynasties, rulers, cultural movements without date indicators`;

let cachedGeneratorClient: LLMClient | null = null;

function getGeneratorClient(): LLMClient {
  if (!cachedGeneratorClient) {
    cachedGeneratorClient = createLLMClient({
      temperature: 0.8,
      maxOutputTokens: 1800,
    });
  }
  return cachedGeneratorClient;
}

export interface GeneratorYearSummary {
  value: number;
  era: Era;
  digits: number;
}

export interface GeneratorActionResult {
  year: GeneratorYearSummary;
  candidates: CandidateEvent[];
  llm: {
    requestId: string;
    model: string;
    usage: TokenUsage;
  };
}

interface GenerateCandidatesParams {
  year: number;
  era: Era;
  llmClient?: LLMClient;
}

export const generateCandidates = internalAction({
  args: {
    year: v.number(),
    era: v.string(),
  },
  handler: async (_ctx, args): Promise<GeneratorActionResult> => {
    const era = parseEra(args.era);
    return generateCandidatesForYear({ year: args.year, era });
  },
});

export async function generateCandidatesForYear(
  params: GenerateCandidatesParams,
): Promise<GeneratorActionResult> {
  const { year, era } = params;
  const client = params.llmClient ?? getGeneratorClient();
  const yearSummary: GeneratorYearSummary = {
    value: year,
    era,
    digits: Math.min(4, Math.max(1, getDigitCount(year))),
  };

  const response = await client.generate({
    prompt: {
      system: GENERATOR_SYSTEM_PROMPT,
      user: buildGeneratorUserPrompt(year, era),
    },
    schema: GeneratorOutputSchema,
    metadata: {
      stage: "generator",
      year,
      era,
    },
  });

  warnIfYearMismatch(
    response.data.year.value,
    year,
    response.data.year.era,
    era,
    response.requestId,
  );

  const candidates = response.data.candidates.map(sanitizeCandidateEvent);

  return {
    year: yearSummary,
    candidates,
    llm: {
      requestId: response.requestId,
      model: response.model,
      usage: response.usage,
    },
  };
}

function buildGeneratorUserPrompt(year: number, era: Era): string {
  const absoluteYear = Math.abs(year);
  const yearLabel = era === "BCE" ? absoluteYear : year;
  return `Target year: ${yearLabel} (${era})

Generate 12-18 historical events that occurred in ${yearLabel} ${era}.

Requirements:
- All events from ${yearLabel} exactly
- Present tense, ≤20 words
- No year leakage (no numbers ≥10, no century terms)
- Domain diversity (politics, science, culture, sports, etc.)
- Geographic diversity (multiple regions)
- Difficulty range: mix of obscure (1-2) and recognizable (4-5)

Return JSON matching CandidateEventSchema.`;
}

function sanitizeCandidateEvent(candidate: CandidateEvent): CandidateEvent {
  return {
    ...candidate,
    canonical_title: candidate.canonical_title.trim(),
    event_text: normalizeWhitespace(candidate.event_text),
    geo: candidate.geo.trim(),
  };
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function getDigitCount(year: number): number {
  const absolute = Math.abs(Math.trunc(year)) || 0;
  return String(absolute === 0 ? 0 : absolute).length;
}

function warnIfYearMismatch(
  llmYear: number,
  requestedYear: number,
  llmEra: Era,
  requestedEra: Era,
  requestId: string,
): void {
  if (llmYear === requestedYear && llmEra === requestedEra) {
    return;
  }

  console.warn(
    `[Generator] LLM year mismatch for ${requestId}: expected ${requestedYear} ${requestedEra}, got ${llmYear} ${llmEra}`,
  );
}

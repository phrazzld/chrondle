"use node";

import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { createLLMClient, type LLMClient, type TokenUsage } from "../../lib/llmClient";
import type { CandidateEvent, CritiqueResult } from "./schemas";
import { CandidateEventSchema, parseEra, type Era } from "./schemas";
import { CandidateEventValue } from "./values";

const REVISER_SYSTEM_PROMPT = `You are ChronBot Reviser. Rewrite ONLY failing events using critic feedback.

MAINTAIN ALL CONSTRAINTS:
- Present tense, ≤20 words
- No numerals ≥10, no century/decade/BCE/CE terms
- Include proper nouns
- Target year: {{year}} ({{era}})

REWRITING STRATEGIES:
- Remove specific dates/numbers: "Napoleon crowned" not "Napoleon crowned in 1804"
- Add proper nouns: "Paris" not "the capital"
- Vary phrasing: Use different verbs, frame differently
- Preserve core event: Keep the historical fact, change the clue wording

OUTPUT: Valid JSON with rewritten events.`;

let cachedReviserClient: LLMClient | null = null;

function getReviserClient(): LLMClient {
  if (!cachedReviserClient) {
    cachedReviserClient = createLLMClient({
      temperature: 0.6,
      maxOutputTokens: 1500,
    });
  }
  return cachedReviserClient;
}

export interface ReviserActionResult {
  rewrites: CandidateEvent[];
  llm: {
    requestId: string;
    model: string;
    usage: TokenUsage;
  };
}

interface ReviserParams {
  failing: CritiqueResult[];
  year: number;
  era: Era;
  llmClient?: LLMClient;
}

export const reviseCandidates = internalAction({
  args: {
    failing: v.array(
      v.object({
        event: CandidateEventValue,
        issues: v.array(v.string()),
        rewrite_hints: v.array(v.string()),
      }),
    ),
    year: v.number(),
    era: v.string(),
  },
  handler: async (_ctx, args): Promise<ReviserActionResult> => {
    const era = parseEra(args.era);
    return reviseCandidatesForYear({
      failing: args.failing as CritiqueResult[],
      year: args.year,
      era,
    });
  },
});

export async function reviseCandidatesForYear(params: ReviserParams): Promise<ReviserActionResult> {
  const { failing, year, era } = params;
  if (!failing.length) {
    return {
      rewrites: [],
      llm: { requestId: "", model: "", usage: emptyUsage() },
    };
  }

  const client = params.llmClient ?? getReviserClient();
  const response = await client.generate({
    prompt: {
      system: REVISER_SYSTEM_PROMPT,
      user: buildReviserUserPrompt(year, era, failing),
    },
    schema: CandidateEventSchema.array().length(failing.length),
    metadata: {
      stage: "reviser",
      year,
      era,
      failingCount: failing.length,
    },
  });

  const rewrites = response.data.map(sanitizeEventRewrite);
  return {
    rewrites,
    llm: {
      requestId: response.requestId,
      model: response.model,
      usage: response.usage,
    },
  };
}

function buildReviserUserPrompt(
  year: number,
  era: Era,
  failing: Pick<CritiqueResult, "event" | "rewrite_hints">[],
): string {
  const payload = JSON.stringify(
    failing.map((failure) => ({
      event: failure.event,
      hints: failure.rewrite_hints,
    })),
    null,
    2,
  );

  return `Target year: ${Math.abs(year)} (${era})

Rewrite these failing events using the critic's hints.

Failing events:
${payload}

Return JSON array with improved event_text for each.`;
}

function sanitizeEventRewrite(event: CandidateEvent): CandidateEvent {
  return {
    ...event,
    canonical_title: event.canonical_title.trim(),
    event_text: event.event_text.replace(/\s+/g, " ").trim(),
    geo: event.geo.trim(),
  };
}

function emptyUsage(): TokenUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    reasoningTokens: 0,
    totalTokens: 0,
  };
}

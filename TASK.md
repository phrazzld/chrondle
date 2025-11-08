# PRD: Autonomous Event Pool Replenishment System

**Status:** Implementation Ready
**Version:** 2.0
**Last Updated:** 2025-11-07

---

## Executive Summary

Build an autonomous event generation pipeline that maintains a healthy buffer of high-quality historical events for puzzle generation. The system generates 12-18 events/day (2-3 years), filling gaps and improving existing low-quality events. Uses a simple Generate → Critique → Revise pattern with strict leakage prevention and quality guardrails. Estimated cost: ~$5-10/month.

**User Value:** Ensures puzzle generation never fails due to empty event pool. Continuously improves event quality over time.

**Success Criteria:**

- Generate ≥12 events/day (minimum 6)
- Validation pass rate ≥90%
- Year leakage rate ≤1%
- Zero pipeline crashes (graceful degradation)

---

## Problem Statement

**Current State:** Event pool managed manually via CLI. Database has 87 puzzles worth of events (~522 events across ~87 years). Daily puzzle generation consumes 6 events/day.

**Problems:**

1. Manual event creation is slow and doesn't scale
2. Event pool could be exhausted in ~87 days without replenishment
3. No systematic quality improvement of existing events
4. Historical gaps remain unfilled (target: -776 to 2008 = ~2,784 years)

**User Impact:** If event pool depletes, puzzle generation fails → no daily puzzle → user churn.

---

## User Context

**Primary Users:** Daily puzzle players expecting consistent, high-quality puzzles every day

**Secondary Users:** Content curators (you) monitoring event quality and coverage

**Requirements:**

- Fully autonomous operation (no human review required)
- High-quality events (proper nouns, present tense, no year leakage)
- Continuous improvement (replace low-quality events over time)
- Reliable execution (graceful failure handling)

---

## System Architecture

### Overview

```
┌─────────────────────────────────────────────────────────┐
│  Event Generation Cron (02:00 UTC daily)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1. Work Selection (2-3 years/day)                │  │
│  │     - Missing years first                         │  │
│  │     - Low-quality existing events second          │  │
│  └──────────────────────────────────────────────────┘  │
│                       ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  2. Per-Year Pipeline (Generator → Critic → Rev)  │  │
│  │     - Generate 12-18 candidates                   │  │
│  │     - Critique with rules + LLM                   │  │
│  │     - Revise failing events (max 2 cycles)        │  │
│  │     - Select best 6-10 events                     │  │
│  └──────────────────────────────────────────────────┘  │
│                       ↓                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  3. Persist to Event Pool                         │  │
│  │     - Call events.importYearEvents()              │  │
│  │     - Log generation metadata                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Event Pool (Convex events table)                       │
│  Growing buffer: 12-18 events added daily                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Daily Puzzle Generation (00:00 UTC)                     │
│  Consumes 6 events/day from pool                         │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Event Pool as Buffer:** Generate faster than consumption (12-18/day vs 6/day consumed)
2. **Quality Over Speed:** Skip years that can't reach quality bar, don't compromise
3. **Continuous Improvement:** Regenerate low-quality events over time
4. **Fail-Safe Design:** Pipeline failures don't block puzzle generation

---

## Requirements

### Functional Requirements

**FR1: Daily Event Generation**

- Generate 2-3 years worth of events per day (12-18 events minimum, 18-30 ideal)
- Run independently of puzzle generation schedule (02:00 UTC recommended)
- Complete within 5-10 minutes wall-clock time

**FR2: Work Selection Strategy**

1. **Priority 1:** Fill missing years (gaps in -776 to 2008 range)
2. **Priority 2:** Regenerate low-quality existing events (identified by audit)
3. **Balance:** Mix of ancient, medieval, modern eras

**FR3: Event Quality Standards**

- Present tense, ≤20 words
- At least one proper noun after first word
- No year leakage (no numerals ≥10, no century/decade/BCE/CE terms)
- Domain diversity: No more than 3 events from same domain per year
- Geographic diversity: Multiple regions per year when feasible

**FR4: Three-Stage Pipeline**

**Stage 1: Generator**

- Input: Target year (integer), era (BCE/CE)
- Output: 12-18 candidate events (structured JSON)
- Per event: event_text, canonical_title, domain, geo, difficulty_guess (1-5), confidence (0-1), leak_flags
- LLM instructions: "No numerals ≥10, no century/decade/BCE/CE, present tense, proper nouns, ≤20 words"

**Stage 2: Critic**

- Deterministic rules first (regex leakage detection, word count, proper noun check)
- LLM scoring second (factual plausibility, leak risk, ambiguity, guessability, diversity)
- Per event: pass/fail + issues[] + rewrite_hints[]
- Thresholds: factual ≥0.75, leak_risk ≤0.15, ambiguity ≤0.25, guessability ≥0.4

**Stage 3: Revise**

- Only rewrite failing events
- Use critic's rewrite_hints
- Maintain same constraints as Generator
- Loop guard: MAX_CRITIC_CYCLES = 2

**FR5: Failure Handling**

- MAX_TOTAL_ATTEMPTS = 4 per year
- If <6 valid events after 4 attempts: Skip year, log failure, move to next
- Log all skipped years to `generation_logs` table for manual review

**FR6: Data Persistence**

- Use existing `events.importYearEvents(year, events[])` mutation
- Duplicate prevention handled by mutation
- Store generation metadata in new `generation_logs` table

### Non-Functional Requirements

**NFR1: Performance**

- Pipeline execution: <10 minutes for 2-3 years
- Per-year generation: <3 minutes average
- LLM latency: p95 <30 seconds per call

**NFR2: Cost**

- Target: <$10/month for LLM API calls
- Monitor token usage per year/per day
- Use cost-efficient models (GPT-4o-mini tier acceptable for Generator/Critic)

**NFR3: Reliability**

- Zero-downtime: Pipeline failures don't affect puzzle generation
- Graceful degradation: Skip problematic years, don't crash
- Retry logic: Exponential backoff for API failures
- Circuit breaker: Stop after 5 consecutive API failures

**NFR4: Observability**

- Log every generation attempt (success/failure, token usage, cost)
- Track metrics: events generated/day, validation pass rate, leakage rate, cost/event
- Alert on: Zero events generated, cost spike >2x average, validation pass rate <80%

**NFR5: Maintainability**

- Provider-agnostic LLM client (easy to swap OpenRouter/OpenAI/Anthropic)
- Structured logging with request IDs
- Testable components (Generator, Critic, Revise as separate functions)

---

## Architecture Decision

### Selected Approach: Three-Stage Pipeline (Simplified)

**Rationale:**

- **Simplicity:** Generate → Critique → Revise is minimal viable pattern for quality
- **User Value:** Autonomous quality control without web verification complexity
- **Explicitness:** Clear stage boundaries with structured contracts
- **Proven:** Industry-standard pattern (reflection agent) with loop guards

**Components:**

1. **LLM Client (Provider-Agnostic)**

```typescript
interface LLMClient {
  generate(prompt: SystemUserPrompt, schema: ZodSchema): Promise<T>;
  // Handles: JSON mode, retries, fallbacks, token tracking
}
```

2. **Generator Agent**

```typescript
async function generateCandidates(year: number, era: "BCE" | "CE"): Promise<Candidate[]> {
  // Returns 12-18 candidates with metadata
}
```

3. **Critic Agent**

```typescript
async function critiqueCandidates(
  candidates: Candidate[],
  year: number,
): Promise<CritiqueResult[]> {
  // Phase 1: Deterministic rules (regex, word count, proper nouns)
  // Phase 2: LLM scoring (factual, leak risk, ambiguity, etc.)
  // Returns: pass/fail + issues + rewrite hints
}
```

4. **Reviser Agent**

```typescript
async function reviseCandidates(failing: CritiqueResult[], year: number): Promise<Candidate[]> {
  // Rewrites only failing events using hints
  // Maintains all constraints
}
```

5. **Orchestrator**

```typescript
async function generateYearEvents(year: number): Promise<Event[] | null> {
  let candidates = await generateCandidates(year);
  let attempt = 1;

  while (attempt <= MAX_TOTAL_ATTEMPTS) {
    const rulesResult = applyDeterministicRules(candidates);
    const critique = await critiqueCandidates(rulesResult);

    const passing = critique.filter((c) => c.passed);
    if (passing.length >= 6) {
      return selectBest(passing, 6 - 10);
    }

    const failing = critique.filter((c) => !c.passed);
    candidates = await reviseCandidates(failing, year);
    attempt++;
  }

  return null; // Failed to generate 6 valid events
}
```

### Alternatives Considered

| Approach                                     | Simplicity | Quality    | Cost | Why Not Chosen                                     |
| -------------------------------------------- | ---------- | ---------- | ---- | -------------------------------------------------- |
| **Single-shot** (Generate only, no critique) | ⭐⭐⭐⭐⭐ | ⭐⭐       | $    | Too many leakage failures, manual cleanup required |
| **Two-stage** (Generate + Validate only)     | ⭐⭐⭐⭐   | ⭐⭐⭐     | $$   | Can't improve failing events, wastes LLM calls     |
| **Three-stage** (Gen + Crit + Rev)           | ⭐⭐⭐     | ⭐⭐⭐⭐   | $$$  | **SELECTED** - Best quality/simplicity balance     |
| **Multi-LLM consensus** (3+ models vote)     | ⭐⭐       | ⭐⭐⭐⭐⭐ | $$$$ | 3x cost, overkill for event generation             |
| **Web verification** (TASK.md spec)          | ⭐         | ⭐⭐⭐⭐⭐ | $$$$ | Too complex for v1, adds latency/failure points    |

### Module Boundaries

**LLMClient Module**

- Interface: `generate(prompt, schema) → T`
- Responsibility: Abstract LLM provider, handle retries, track tokens
- Hides: API details, retry logic, error handling

**Generator Module**

- Interface: `generateCandidates(year, era) → Candidate[]`
- Responsibility: Propose 12-18 historical events for year
- Hides: Prompt engineering, JSON schema validation

**Critic Module**

- Interface: `critiqueCandidates(candidates, year) → CritiqueResult[]`
- Responsibility: Score events, identify issues, suggest improvements
- Hides: Regex patterns, scoring algorithms, threshold tuning

**Reviser Module**

- Interface: `reviseCandidates(failing, year) → Candidate[]`
- Responsibility: Rewrite failing events using hints
- Hides: Rewriting strategies, prompt engineering

**Orchestrator Module**

- Interface: `generateYearEvents(year) → Event[] | null`
- Responsibility: Coordinate pipeline, enforce loop guards, select best events
- Hides: Retry logic, attempt tracking, event selection

**WorkSelector Module**

- Interface: `selectWorkYears(count) → number[]`
- Responsibility: Choose 2-3 years to generate based on priorities
- Hides: Priority algorithm, database queries, balancing logic

### Abstraction Layers

**Layer 1: LLM Provider (Infrastructure)**

- Vocabulary: API keys, tokens, rate limits, HTTP
- Abstraction: Raw API calls

**Layer 2: LLM Client (Platform)**

- Vocabulary: Prompts, schemas, retries, costs
- Abstraction: Structured LLM interactions

**Layer 3: Agents (Domain)**

- Vocabulary: Events, years, quality scores, issues
- Abstraction: Historical event generation

**Layer 4: Orchestrator (Application)**

- Vocabulary: Work selection, pipeline execution, success/failure
- Abstraction: Autonomous event pool management

---

## Dependencies & Assumptions

### Dependencies

**External Services:**

- OpenRouter API (already integrated, API key in .env.local)
- Convex database (already configured, prod deployment)

**Internal Services:**

- `convex/events.ts::importYearEvents` mutation (exists)
- `scripts/manage-events.ts` CLI tools (exists)
- `scripts/audit-events.ts` quality analysis (exists)

**Libraries:**

- `zod` for schema validation (already in package.json)
- `openrouter` client (already integrated in historicalContext.ts)

### Assumptions

**Scale Expectations:**

- 2-3 years/day generation target
- ~2,784 years total coverage goal
- ~1,000 days to complete full historical coverage (acceptable)

**Team Constraints:**

- Solo developer (you)
- Minimal ongoing maintenance required
- Self-healing system (logs failures, doesn't crash)

**Environment:**

- Convex prod deployment has sufficient capacity
- OpenRouter API has stable uptime (>99%)
- No rate limit issues at 2-3 years/day volume

**Event Quality:**

- LLM confidence scores correlate with factual accuracy (no web verification)
- Deterministic regex rules catch 95%+ of leakage cases
- Post-hoc manual spot-checking acceptable for edge cases

**Cost Model:**

- ~$0.02-0.05 per year generated (including retries)
- ~$1.50-3.00/month at 2-3 years/day
- Budget headroom for spikes/experiments

---

## Implementation Phases

### Phase 1: Core Pipeline (MVP) - 3 days

**Goal:** Generate events for a single year end-to-end

**Deliverables:**

1. **LLM Client Module** (4 hours)

   - Provider-agnostic wrapper around OpenRouter
   - JSON mode with Zod validation
   - Retry logic with exponential backoff
   - Token usage tracking

2. **Generator Agent** (6 hours)

   - System + user prompt templates
   - JSON schema for candidate events
   - Leakage prevention instructions
   - Test with 3 sample years (ancient, medieval, modern)

3. **Critic Agent** (8 hours)

   - Deterministic rules engine (regex, word count, proper nouns)
   - LLM scoring prompt
   - Threshold-based pass/fail
   - Test with known good/bad events

4. **Reviser Agent** (4 hours)

   - Rewriting prompt with hints
   - Maintains all constraints
   - Test with critique failures

5. **Orchestrator** (6 hours)
   - Loop logic with MAX_ATTEMPTS guards
   - Event selection (best 6-10 from passing)
   - Basic logging
   - Test full pipeline for 1 year

**Success Criteria:**

- Generate 6 valid events for test year (e.g., 1969) with <4 attempts
- Zero leakage in final events
- Execution time <3 minutes

### Phase 2: Convex Integration - 1 day

**Deliverables:**

1. **Convex Action** (3 hours)

   - `convex/actions/generateEvents.ts`
   - Calls orchestrator for single year
   - Returns events + metadata

2. **Convex Mutation** (2 hours)

   - `convex/events.ts::persistGeneratedEvents`
   - Calls existing `importYearEvents`
   - Updates `generation_logs` table

3. **Schema Updates** (1 hour)

   - Add `generation_logs` table (year, timestamp, status, attempt_count, events_generated, token_usage, cost, error_message)
   - Add indexes for monitoring queries

4. **Testing** (2 hours)
   - Test end-to-end: Convex action → persist → verify in database
   - Test duplicate prevention
   - Test error handling

**Success Criteria:**

- Generate and persist events for 3 test years
- Events appear in Convex dashboard
- Logs captured correctly

### Phase 3: Work Selection & Scheduling - 1 day

**Deliverables:**

1. **Work Selection Module** (4 hours)

   - Query missing years from database
   - Integrate with `scripts/audit-events.ts` for low-quality detection
   - Priority algorithm (missing first, low-quality second, era balance)
   - Select 2-3 years per run

2. **Scheduled Cron Job** (2 hours)

   - `convex/crons.ts`: Add daily event generation (02:00 UTC)
   - Calls work selector → orchestrator for each year
   - Parallel execution for 2-3 years (careful with rate limits)

3. **Monitoring Queries** (2 hours)
   - `getGenerationStats`: Daily events, success rate, cost
   - `getFailedYears`: Years that need manual review
   - `getPoolHealth`: Current buffer size, estimated days until depletion

**Success Criteria:**

- Cron runs successfully for 3 consecutive days
- Generates 12-18 events/day minimum
- Work selection avoids duplicates

### Phase 4: Hardening & Monitoring - 2 days

**Deliverables:**

1. **Error Handling** (4 hours)

   - Circuit breaker for API failures
   - Graceful degradation (skip year, don't crash)
   - Alert on zero events generated
   - Cost spike detection

2. **Observability** (4 hours)

   - Structured logging with request IDs
   - Metrics dashboard (events/day, pass rate, cost, latency)
   - Alert configuration (Discord webhook or email)

3. **Testing & Validation** (6 hours)

   - Golden file tests (10 sample years with expected pass/fail)
   - Leakage detection tests (regex patterns)
   - Load testing (10 years in single run)
   - Cost validation (track actual vs. estimated)

4. **Documentation** (2 hours)
   - Pipeline architecture diagram
   - Prompt templates reference
   - Troubleshooting guide
   - Cost optimization tips

**Success Criteria:**

- Pipeline runs for 7 consecutive days with zero crashes
- Validation pass rate ≥90%
- Cost within $10/month budget
- Alerts working correctly

### Phase 5: Quality Improvements (Future)

**Optional Enhancements:**

1. **Adaptive Quality Thresholds** (2 days)

   - Learn from manual rejections
   - Adjust critic thresholds per era (ancient vs. modern)
   - Track quality drift over time

2. **Web Verification** (3 days)

   - Add selective web search for low-confidence events
   - Integration with trusted sources (Nobel, Olympics, etc.)
   - Keep it fast (<5 seconds per verification)

3. **Multi-Model Consensus** (2 days)

   - Use 2-3 LLMs for critic stage
   - Require agreement for high-confidence scores
   - Fallback chain for reliability

4. **Advanced Work Selection** (1 day)
   - Strategic prioritization (popular decades, curriculum alignment)
   - Player feedback integration (skip unpopular years)
   - Coverage balance (equal distribution across eras)

---

## Risks & Mitigation

| Risk                                               | Likelihood | Impact | Mitigation                                                                       |
| -------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------- |
| **LLM hallucinations** (factually wrong events)    | Medium     | High   | - Confidence thresholds<br>- Post-hoc spot-checking<br>- Player feedback loop    |
| **Year leakage** (events reveal year in clues)     | Medium     | High   | - Strict regex rules<br>- Critic LLM checks<br>- Manual audit samples            |
| **API rate limits** (OpenRouter throttling)        | Low        | Medium | - Exponential backoff<br>- Circuit breaker<br>- Fallback to slower schedule      |
| **Cost overrun** (unexpected token usage)          | Low        | Medium | - Token usage tracking<br>- Cost alerts at $15/month<br>- Model downgrade option |
| **Pipeline failures** (crashes prevent generation) | Low        | High   | - Graceful error handling<br>- Skip problematic years<br>- Alert on zero events  |
| **Quality drift** (standards degrade over time)    | Medium     | Medium | - Continuous monitoring<br>- Random sampling validation<br>- Quarterly reviews   |
| **Convex capacity** (database overload)            | Low        | Low    | - Batch writes<br>- Rate limiting<br>- Monitor query performance                 |

---

## Key Decisions

### Decision 1: Skip Web Verification for v1

**What:** Don't implement web search corroboration for low-confidence events in initial version.

**Alternatives:**

- Include web verification as TASK.md spec'd
- Implement web verification only for ancient years (<1000 CE)

**Rationale:**

- **Simplicity:** Reduces complexity by 30-40% (no web scraping, no source ranking, no corroboration logic)
- **User Value:** LLM confidence + post-hoc spot-checking adequate for initial quality bar
- **Explicitness:** Can add web verification in Phase 5 if quality issues emerge

**Tradeoffs:** Accept slightly higher hallucination risk for simpler, more reliable pipeline. Mitigate with confidence thresholds and manual sampling.

---

### Decision 2: Generate 12-18 Events/Day (2-3 Years)

**What:** Target 2-3 years per day, producing 12-18 events minimum.

**Alternatives:**

- Conservative: 6 events/day (1 year) - matches consumption
- Aggressive: 30-60 events/day (5-10 years) - faster pool fill

**Rationale:**

- **User Value:** Builds safety buffer faster than consumption (2-3x rate)
- **Simplicity:** Manageable cost (~$2-5/month) and execution time (<10 min)
- **Explicitness:** Clear headroom for pipeline failures (some days may produce 0 due to quality issues)

**Tradeoffs:** Slower than aggressive approach but more reliable and budget-friendly.

---

### Decision 3: Regenerate Low-Quality Events

**What:** After filling missing years, automatically improve existing low-quality events.

**Alternatives:**

- Fill missing years only (simpler, faster to completion)
- Manual curation of low-quality events (higher quality bar)

**Rationale:**

- **User Value:** Continuous quality improvement, not just coverage expansion
- **Simplicity:** Reuses same pipeline, just different work selection
- **Explicitness:** Uses existing `audit-events.ts` quality scoring

**Tradeoffs:** Slower to complete historical coverage, but higher steady-state quality.

---

### Decision 4: Provider-Agnostic LLM Client

**What:** Abstract LLM provider behind interface, support OpenRouter/OpenAI/Anthropic.

**Alternatives:**

- Hard-code OpenRouter (simpler, fewer abstractions)
- Use LangChain/LiteLLM library (more features, more dependencies)

**Rationale:**

- **Simplicity:** Thin wrapper, minimal abstraction (single interface)
- **User Value:** Easy to experiment with models/providers for cost optimization
- **Explicitness:** Clear contract between pipeline and LLM layer

**Tradeoffs:** Slight upfront complexity for long-term flexibility.

---

### Decision 5: Loop Guards Over Unbounded Retries

**What:** Hard caps on retries (MAX_CRITIC_CYCLES=2, MAX_TOTAL_ATTEMPTS=4 per year).

**Alternatives:**

- Unbounded retries until success (higher success rate, potential infinite loops)
- Single-shot generation (simplest, lower success rate)

**Rationale:**

- **Simplicity:** Predictable cost and latency
- **User Value:** Skip impossible years instead of wasting API calls
- **Explicitness:** Clear failure mode (log and move on)

**Tradeoffs:** Accept some years will fail (logged for manual review).

---

## JSON Schemas

### Generator Output Schema

```typescript
const CandidateEventSchema = z.object({
  canonical_title: z.string().describe("Full event name for verification"),
  event_text: z.string().max(100).describe("Present tense clue, ≤20 words, no year leakage"),
  domain: z.enum([
    "politics",
    "science",
    "culture",
    "tech",
    "sports",
    "economy",
    "war",
    "religion",
  ]),
  geo: z.string().describe("Region or country"),
  difficulty_guess: z.number().min(1).max(5).describe("1=hardest, 5=easiest"),
  confidence: z.number().min(0).max(1).describe("LLM confidence in accuracy"),
  leak_flags: z.object({
    has_digits: z.boolean(),
    has_century_terms: z.boolean(),
    has_spelled_year: z.boolean(),
  }),
});

const GeneratorOutputSchema = z.object({
  year: z.object({
    value: z.number(),
    era: z.enum(["BCE", "CE"]),
    digits: z.number().min(1).max(4),
  }),
  candidates: z.array(CandidateEventSchema).min(12).max(18),
});
```

### Critic Output Schema

```typescript
const CritiqueResultSchema = z.object({
  event: CandidateEventSchema,
  passed: z.boolean(),
  scores: z.object({
    factual: z.number().min(0).max(1),
    leak_risk: z.number().min(0).max(1),
    ambiguity: z.number().min(0).max(1),
    guessability: z.number().min(0).max(1),
    diversity: z.number().min(0).max(1),
  }),
  issues: z.array(z.string()).describe("List of problems found"),
  rewrite_hints: z.array(z.string()).describe("Specific improvement suggestions"),
});
```

### Generation Log Schema

```typescript
// Convex schema addition
generation_logs: defineTable({
  year: v.number(),
  era: v.string(), // 'BCE' | 'CE'
  status: v.string(), // 'success' | 'failed' | 'skipped'
  attempt_count: v.number(),
  events_generated: v.number(),
  token_usage: v.object({
    input: v.number(),
    output: v.number(),
    total: v.number(),
  }),
  cost_usd: v.number(),
  error_message: v.optional(v.string()),
  timestamp: v.number(),
})
  .index("by_timestamp", ["timestamp"])
  .index("by_status", ["status", "timestamp"])
  .index("by_year", ["year"]);
```

---

## Prompt Templates

### Generator System Prompt

```
You are ChronBot Generator, a historian-puzzlemaker creating historical event clues for a guessing game.

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
- Use dynasties, rulers, cultural movements without date indicators
```

### Generator User Prompt

```
Target year: {{year}} ({{era}})

Generate 12-18 historical events that occurred in {{year}} {{era}}.

Requirements:
- All events from {{year}} exactly
- Present tense, ≤20 words
- No year leakage (no numbers ≥10, no century terms)
- Domain diversity (politics, science, culture, sports, etc.)
- Geographic diversity (multiple regions)
- Difficulty range: mix of obscure (1-2) and recognizable (4-5)

Return JSON matching CandidateEventSchema.
```

### Critic System Prompt

```
You are ChronBot Critic, a precision editor scoring historical event clues.

SCORING CRITERIA (0-1 scale):
- factual: Is this event real and accurately dated?
- leak_risk: Could this clue reveal the year? (0=no risk, 1=obvious giveaway)
- ambiguity: Could this event be confused with adjacent years?
- guessability: Does this help players infer the year? (0=useless, 1=perfect hint)
- diversity: Does this add domain/geo variety to the set?

PASS THRESHOLDS:
- factual ≥0.75
- leak_risk ≤0.15
- ambiguity ≤0.25
- guessability ≥0.4

For failing events, provide:
- issues: List of specific problems
- rewrite_hints: Concrete improvement suggestions

OUTPUT: Valid JSON with scores, pass/fail, issues, and hints.
```

### Critic User Prompt

```
Target year: {{year}} ({{era}})

Evaluate these candidate events for quality and year-leakage.

Candidates:
{{candidatesJSON}}

Return JSON array with critique for each event.
```

### Reviser System Prompt

```
You are ChronBot Reviser. Rewrite ONLY failing events using critic feedback.

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

OUTPUT: Valid JSON with rewritten events.
```

### Reviser User Prompt

```
Target year: {{year}} ({{era}})

Rewrite these failing events using the critic's hints.

Failing events:
{{failingEventsJSON}}

Return JSON array with improved event_text for each.
```

---

## Success Metrics

### Primary Metrics

| Metric                   | Target          | Measurement                                                               |
| ------------------------ | --------------- | ------------------------------------------------------------------------- |
| **Events Generated/Day** | ≥12 (minimum 6) | Count from `generation_logs` where status='success'                       |
| **Validation Pass Rate** | ≥90%            | (passed events / total candidates) from critic stage                      |
| **Year Leakage Rate**    | ≤1%             | Manual sampling: 10 random events/week checked for numerals/century terms |
| **Pipeline Uptime**      | ≥98%            | Successful cron runs / total scheduled runs                               |

### Secondary Metrics

| Metric                  | Target             | Measurement                                    |
| ----------------------- | ------------------ | ---------------------------------------------- |
| **Cost/Event**          | ≤$0.05             | Total monthly cost / events generated          |
| **Cost/Month**          | ≤$10               | Sum of cost_usd from `generation_logs`         |
| **Latency/Year**        | <3 min p95         | Timestamp delta in orchestrator logs           |
| **Event Pool Buffer**   | ≥100 unused events | Query events table where puzzleId is null      |
| **Quality Improvement** | TBD                | Track quality scores before/after regeneration |

### Alerts

| Alert              | Condition                                 | Action                        |
| ------------------ | ----------------------------------------- | ----------------------------- |
| **Zero Events**    | 0 events generated for 2 consecutive days | Discord webhook + email       |
| **Cost Spike**     | Daily cost >$2 (>2x average)              | Email notification            |
| **Low Pass Rate**  | Validation pass rate <80% for 3 days      | Review prompt templates       |
| **High Leakage**   | >5% leakage in manual sampling            | Audit regex patterns          |
| **Pool Depletion** | <30 unused events remaining               | Increase generation frequency |

---

## Cost Model

### Token Usage Estimates

**Per Year Generation:**

- Generator: ~1,200 tokens (800 input + 400 output)
- Critic: ~1,500 tokens (1,000 input + 500 output)
- Reviser: ~1,000 tokens (600 input + 400 output)
- **Total per year:** ~3,700 tokens (with 1 revision cycle)

**Daily Usage (2-3 years):**

- 2.5 years/day × 3,700 tokens = ~9,250 tokens/day
- ~277,500 tokens/month

### Cost Projections

| Model             | Cost/1M Tokens             | Monthly Cost (277K tokens) |
| ----------------- | -------------------------- | -------------------------- |
| GPT-4o            | $2.50 input + $10 output   | ~$2.50                     |
| GPT-4o-mini       | $0.15 input + $0.60 output | ~$0.15                     |
| Claude 3.5 Sonnet | $3 input + $15 output      | ~$3.00                     |
| Claude 3 Haiku    | $0.25 input + $1.25 output | ~$0.25                     |

**Recommendation:** Start with GPT-4o-mini (~$0.15/month) for Generator/Critic, upgrade to GPT-4o if quality insufficient.

**Budget Headroom:** $10/month target allows 40x current usage for experiments/spikes.

---

## Testing Strategy

### Unit Tests

```typescript
// Deterministic rule tests
describe("Leakage Detection", () => {
  it("should block numerals ≥10", () => {
    expect(hasLeakage("Event in 1969")).toBe(true);
    expect(hasLeakage("Event with 12 participants")).toBe(true);
    expect(hasLeakage("Nine players compete")).toBe(false);
  });

  it("should block century terms", () => {
    expect(hasLeakage("In the 19th century")).toBe(true);
    expect(hasLeakage("In the nineteenth century")).toBe(true);
    expect(hasLeakage("During the Renaissance")).toBe(false);
  });

  it("should block BCE/CE/AD/BC", () => {
    expect(hasLeakage("44 BCE")).toBe(true);
    expect(hasLeakage("410 CE")).toBe(true);
    expect(hasLeakage("In ancient Rome")).toBe(false);
  });
});

// Word count validation
describe("Event Validation", () => {
  it("should enforce ≤20 words", () => {
    const event = "Caesar falls at the Theatre of Pompey".split(" ");
    expect(event.length).toBeLessThanOrEqual(20);
  });

  it("should require proper noun", () => {
    expect(hasProperNoun("Battle of Hastings begins")).toBe(true);
    expect(hasProperNoun("A war starts in europe")).toBe(false);
  });
});
```

### Integration Tests

```typescript
// End-to-end pipeline test
describe("Event Generation Pipeline", () => {
  it("should generate 6+ valid events for 1969", async () => {
    const events = await generateYearEvents(1969);

    expect(events).not.toBeNull();
    expect(events.length).toBeGreaterThanOrEqual(6);

    events.forEach((event) => {
      expect(event.event_text.split(" ").length).toBeLessThanOrEqual(20);
      expect(hasLeakage(event.event_text)).toBe(false);
      expect(hasProperNoun(event.event_text)).toBe(true);
    });
  });

  it("should skip year after MAX_ATTEMPTS failures", async () => {
    // Mock LLM to always return invalid events
    const events = await generateYearEvents(9999); // Nonexistent year

    expect(events).toBeNull();
    // Check generation_logs table for skip entry
  });
});
```

### Golden File Tests

```typescript
// Known good/bad events for regression testing
const goldenEvents = {
  "1969": {
    good: [
      "Apollo 11 lands on Moon with Armstrong and Aldrin",
      "Woodstock Music Festival draws hundreds of thousands",
      "Concorde makes maiden flight over France",
    ],
    bad: [
      "Moon landing in 1969", // Has year
      "Event in the 1960s", // Has decade term
      "Something happens", // No proper noun
    ],
  },
  "-44": {
    // 44 BCE
    good: [
      "Caesar falls at Theatre of Pompey amid senatorial conspiracy",
      "Brutus and Cassius lead plot against Roman dictator",
    ],
    bad: [
      "Julius Caesar assassinated in 44 BCE", // Has year + BCE
      "Ides of March in first century BC", // Has century term
    ],
  },
};

describe("Golden File Validation", () => {
  Object.entries(goldenEvents).forEach(([year, events]) => {
    it(`should pass all good events for ${year}`, () => {
      events.good.forEach((event) => {
        expect(hasLeakage(event)).toBe(false);
        expect(hasProperNoun(event)).toBe(true);
      });
    });

    it(`should fail all bad events for ${year}`, () => {
      events.bad.forEach((event) => {
        const valid = !hasLeakage(event) && hasProperNoun(event);
        expect(valid).toBe(false);
      });
    });
  });
});
```

### Manual Validation

**Weekly Sampling Protocol:**

1. Query 10 random events generated in past week
2. Check each for: year leakage, factual accuracy, proper nouns
3. Record results in validation log spreadsheet
4. If >10% failures, adjust critic thresholds or prompts

---

## Monitoring Dashboard

### Key Queries

```typescript
// Daily generation summary
async function getDailyGenerationStats(date: string) {
  return ctx.db
    .query("generation_logs")
    .withIndex("by_timestamp", (q) =>
      q.gte("timestamp", startOfDay(date)).lt("timestamp", endOfDay(date)),
    )
    .collect()
    .then((logs) => ({
      totalYears: logs.length,
      successfulYears: logs.filter((l) => l.status === "success").length,
      failedYears: logs.filter((l) => l.status === "failed").length,
      eventsGenerated: logs.reduce((sum, l) => sum + l.events_generated, 0),
      totalCost: logs.reduce((sum, l) => sum + l.cost_usd, 0),
      avgTokensPerYear: logs.reduce((sum, l) => sum + l.token_usage.total, 0) / logs.length,
    }));
}

// Event pool health
async function getEventPoolHealth() {
  const allEvents = await ctx.db.query("events").collect();
  const unusedEvents = allEvents.filter((e) => !e.puzzleId);

  return {
    totalEvents: allEvents.length,
    unusedEvents: unusedEvents.length,
    usedEvents: allEvents.length - unusedEvents.length,
    daysUntilDepletion: Math.floor(unusedEvents.length / 6),
    coverageByEra: {
      ancient: unusedEvents.filter((e) => e.year < 500).length,
      medieval: unusedEvents.filter((e) => e.year >= 500 && e.year < 1500).length,
      modern: unusedEvents.filter((e) => e.year >= 1500).length,
    },
  };
}

// Failed years requiring manual review
async function getFailedYears(limit: number = 20) {
  return ctx.db
    .query("generation_logs")
    .withIndex("by_status", (q) => q.eq("status", "failed"))
    .order("desc")
    .take(limit);
}
```

### Alert Configuration

```typescript
// Cost spike detection
async function checkCostAlert() {
  const last7Days = await getLast7DaysCosts();
  const avgDailyCost = last7Days.reduce((sum, c) => sum + c, 0) / 7;
  const todayCost = last7Days[6];

  if (todayCost > avgDailyCost * 2) {
    await sendAlert({
      severity: "warning",
      title: "LLM Cost Spike Detected",
      message: `Today's cost ($${todayCost.toFixed(2)}) is 2x average ($${avgDailyCost.toFixed(2)})`,
      details: last7Days,
    });
  }
}

// Zero events alert
async function checkZeroEventsAlert() {
  const last2Days = await getLast2DaysGenerationStats();

  if (last2Days.every((day) => day.eventsGenerated === 0)) {
    await sendAlert({
      severity: "critical",
      title: "Event Generation Failure",
      message: "Zero events generated for 2 consecutive days",
      action: "Check Convex logs and LLM API status",
    });
  }
}
```

---

## Next Steps

After PRD approval, run `/plan` to break this into implementation tasks.

**Estimated Timeline:** 7 days (3 days core pipeline + 1 day integration + 1 day scheduling + 2 days hardening)

**First Milestone:** Generate events for 1 test year end-to-end, validate in Convex dashboard.

---

## Appendix: Deterministic Rules (Reference)

### Leakage Detection Regex

```typescript
const LEAKAGE_PATTERNS = {
  // Numerals ≥10
  digits: /\b([1-9]\d+)\b/,

  // Century/decade terms (case-insensitive)
  centuryTerms: /\b(century|centuries|decade|decades|millennium|millennia|BCE|CE|BC|AD)\b/i,

  // Spelled-out years
  spelledYears:
    /(nineteen|eighteen|seventeen|sixteen|fifteen|fourteen|thirteen|twelve|eleven|twenty)\s+(hundred|ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)/i,

  // Hyphenated compound years
  compoundYears:
    /\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)-(one|two|three|four|five|six|seven|eight|nine)\b/i,
};

function hasLeakage(text: string): boolean {
  return Object.values(LEAKAGE_PATTERNS).some((pattern) => pattern.test(text));
}
```

### Proper Noun Detection

```typescript
function hasProperNoun(text: string): boolean {
  // After first word, look for capitalized words (excluding sentence start)
  const words = text.split(" ");
  return words.slice(1).some((word) => /^[A-Z]/.test(word));
}
```

### Domain Diversity Check

```typescript
function checkDomainDiversity(events: Event[]): boolean {
  const domainCounts = events.reduce(
    (counts, e) => {
      counts[e.domain] = (counts[e.domain] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );

  // No more than 3 events from same domain (50% of 6)
  return Object.values(domainCounts).every((count) => count <= 3);
}
```

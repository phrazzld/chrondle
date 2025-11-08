# TODO: Autonomous Event Pool Replenishment System

## Context

**Architecture:** Three-stage pipeline (Generate → Critique → Revise) from TASK.md
**Key Pattern:** Follow `convex/actions/historicalContext.ts` for LLM API integration
**Schema:** Add `generation_logs` table for observability
**Integration:** Reuses `convex/events.ts::importYearEvents` mutation
**Testing:** Follow `convex/__tests__/*.test.ts` and `convex/lib/__tests__/*.test.ts` patterns

## Module Structure

```
convex/
├── actions/
│   └── eventGeneration/          [NEW - LLM pipeline]
│       ├── generator.ts          # Generator agent
│       ├── critic.ts             # Critic agent
│       ├── reviser.ts            # Reviser agent
│       └── orchestrator.ts       # Pipeline coordinator
├── lib/
│   ├── llmClient.ts              [NEW - Provider abstraction]
│   ├── eventValidation.ts        [NEW - Deterministic rules]
│   └── workSelector.ts           [NEW - Year selection logic]
├── generationLogs.ts             [NEW - Mutations/queries for logs]
└── schema.ts                     [MODIFY - Add generation_logs table]

scripts/
└── test-event-generation.ts     [NEW - Manual testing script]
```

---

## Phase 1: Core Pipeline (3 days)

### 1.1 Schema & Infrastructure

- [x] **Add generation_logs table to schema**

  ```
  Files: convex/schema.ts
  Lines: Add after puzzles table definition
  Pattern: Follow existing table definitions with indexes
  Schema: See TASK.md "Generation Log Schema" (lines 656-673)
  Success: Schema compiles, `npx convex dev` runs without errors
  Test: Deploy schema, verify table appears in Convex dashboard
  Dependencies: None
  Time: 30min
  ```

- [x] **Implement deterministic validation rules**
  ```
  Files: convex/lib/eventValidation.ts [NEW]
  Pattern: Pure functions, export const patterns and validators
  Functions:
    - hasLeakage(text: string): boolean
    - hasProperNoun(text: string): boolean
    - checkDomainDiversity(events): boolean
    - LEAKAGE_PATTERNS constant (see TASK.md lines 1083-1095)
  Success: All regex patterns match TASK.md spec, exports testable functions
  Test: Unit tests for each pattern (good/bad examples from TASK.md lines 860-893)
  Dependencies: None
  Time: 1hr
  ```

### 1.2 LLM Client (Provider-Agnostic)

- [x] **Implement provider-agnostic LLM client**
  ```
  Files: convex/lib/llmClient.ts [NEW]
  Pattern: Follow historicalContext.ts OpenRouter integration (lines 1-50)
  Interface:
    interface LLMClient {
      generate<T>(prompt: { system: string, user: string }, schema: z.ZodSchema<T>): Promise<T>
    }
  Features:
    - Exponential backoff retry (match historicalContext.ts pattern lines 215-265)
    - API key sanitization (reuse sanitizeErrorForLogging pattern)
    - Token usage tracking
    - JSON mode with Zod validation
  Success: Can call OpenRouter API, parse JSON, handle retries
  Test: Mock API responses, test retry logic, test Zod validation failures
  Dependencies: zod (already in package.json)
  Time: 2hrs
  ```

### 1.3 Generator Agent

- [x] **Implement Generator agent with LLM**
  ```
  Files: convex/actions/eventGeneration/generator.ts [NEW]
  Pattern: internalAction with API calls (like historicalContext.ts lines 90-150)
  Zod Schema: CandidateEventSchema from TASK.md (lines 611-623)
  Prompt: System + user templates from TASK.md (lines 682-719)
  Function signature:
    export const generateCandidates = internalAction({
      args: { year: v.number(), era: v.string() },
      handler: async (ctx, args) => {
        // Call llmClient.generate() with prompts
        // Return 12-18 candidates with metadata
      }
    })
  Success: Returns 12-18 valid JSON candidates matching schema
  Test: Mock LLM responses, verify schema compliance, test BCE/CE handling
  Dependencies: llmClient.ts, zod schemas
  Time: 3hrs
  ```

### 1.4 Critic Agent

- [x] **Implement Critic agent (rules + LLM)**
  ```
  Files: convex/actions/eventGeneration/critic.ts [NEW]
  Pattern: internalAction + deterministic rules from eventValidation.ts
  Zod Schema: CritiqueResultSchema from TASK.md (lines 638-650)
  Prompt: System + user templates from TASK.md (lines 722-757)
  Logic:
    1. Apply deterministic rules first (eventValidation.ts)
    2. LLM scoring second (call llmClient)
    3. Combine results with pass/fail + issues + hints
  Thresholds: factual ≥0.75, leak_risk ≤0.15, ambiguity ≤0.25, guessability ≥0.4
  Success: Returns critique for each candidate with scores and feedback
  Test: Golden file tests (TASK.md lines 927-970), mock LLM scoring
  Dependencies: generator.ts, eventValidation.ts, llmClient.ts
  Time: 4hrs
  ```

### 1.5 Reviser Agent

- [x] **Implement Reviser agent**
  ```
  Files: convex/actions/eventGeneration/reviser.ts [NEW]
  Pattern: internalAction calling llmClient
  Prompt: System + user templates from TASK.md (lines 761-790)
  Function signature:
    export const reviseCandidates = internalAction({
      args: {
        failing: v.array(v.any()), // CritiqueResult[]
        year: v.number(),
        era: v.string()
      },
      handler: async (ctx, args) => {
        // Rewrite only failing events using hints
        // Return improved candidates
      }
    })
  Success: Returns rewritten candidates maintaining all constraints
  Test: Mock failing events with hints, verify rewrites pass critic
  Dependencies: critic.ts, llmClient.ts
  Time: 2hrs
  ```

### 1.6 Orchestrator

- [x] **Implement pipeline orchestrator with loop guards**
  ```
  Files: convex/actions/eventGeneration/orchestrator.ts [NEW]
  Pattern: internalAction coordinating other actions
  Pseudocode: See TASK.md lines 226-246
  Constants:
    - MAX_TOTAL_ATTEMPTS = 4
    - MAX_CRITIC_CYCLES = 2
  Function signature:
    export const generateYearEvents = internalAction({
      args: { year: v.number() },
      handler: async (ctx, args) => {
        // Loop: Generate → Critique → Revise
        // Return 6-10 best events or null if failed
      }
    })
  Success: Generates 6 valid events within MAX_ATTEMPTS or returns null
  Test: Integration test with full pipeline, mock LLM calls, verify loop guards
  Dependencies: generator.ts, critic.ts, reviser.ts
  Time: 3hrs
  ```

---

## Phase 2: Convex Integration (1 day)

### 2.1 Generation Logs Infrastructure

- [x] **Implement generation logs mutations and queries**
  ```
  Files: convex/generationLogs.ts [NEW]
  Pattern: Follow existing mutation/query patterns (events.ts, puzzles/queries.ts)
  Mutations:
    - logGenerationAttempt(year, status, attempt_count, events_generated, token_usage, cost, error_message)
  Queries:
    - getDailyGenerationStats(date: string)
    - getFailedYears(limit: number)
    - getEventPoolHealth()
  Implementations: See TASK.md lines 987-1030 for query logic
  Success: Can write logs and query stats from Convex dashboard
  Test: Insert test logs, verify queries return correct aggregations
  Dependencies: schema.ts with generation_logs table
  Time: 2hrs
  ```

### 2.2 Event Persistence Action

- [x] **Implement action to persist generated events**
  ```
  Files: convex/actions/eventGeneration/orchestrator.ts [MODIFY]
  Pattern: Call internal mutation from action (historicalContext.ts lines 430-445)
  Logic:
    1. After orchestrator succeeds, call internal.events.importYearEvents
    2. Log success/failure to generation_logs
    3. Track token usage and estimated cost
  Success: Events appear in Convex events table, logs recorded
  Test: End-to-end test from orchestrator → persist → verify in DB
  Dependencies: orchestrator.ts, generationLogs.ts, events.ts::importYearEvents
  Time: 2hrs
  ```

### 2.3 Integration Testing

- [x] **Create end-to-end integration test**
  ```
  Files: convex/__tests__/eventGeneration.test.ts [NEW]
  Pattern: Follow existing Convex test structure (archivePuzzleStreak.test.ts)
  Tests:
    - Generate valid events for test year (1969)
    - Verify leakage detection works
    - Verify loop guards prevent infinite loops
    - Verify graceful failure logging
  Success: All tests pass, can generate events end-to-end
  Test: Run `pnpm test` with new test file
  Dependencies: All Phase 1 & 2.1-2.2 modules
  Time: 2hrs
  ```

---

## Phase 3: Work Selection & Scheduling (1 day)

### 3.1 Work Selector

- [x] **Implement year selection logic**
  ```
  Files: convex/lib/workSelector.ts [NEW]
  Pattern: Pure functions or internalAction if needs DB queries
  Logic:
    1. Query missing years (gaps in -776 to 2008)
    2. Query low-quality years (integrate with audit-events.ts patterns)
    3. Priority: missing first, low-quality second, era balance third
    4. Select 2-3 years per run
  Function signature:
    export const selectWorkYears = internalAction({
      args: { count: v.number() },
      handler: async (ctx, args) => {
        // Query events table for gaps and quality
        // Return array of 2-3 years to generate
      }
    })
  Success: Returns 2-3 years avoiding duplicates, prioritizes missing years
  Test: Mock database state, verify priority algorithm, check era balance
  Dependencies: events table queries
  Time: 3hrs
  ```

### 3.2 Scheduled Cron Job

- [x] **Add daily event generation cron**
  ```
  Files: convex/crons.ts [MODIFY]
  Lines: Add after existing puzzle generation cron
  Pattern: Follow existing cron structure (lines 8-13)
  Schedule: 02:00 UTC daily (separate from puzzle generation at 00:00 UTC)
  Code:
    crons.daily(
      "generate events for pool replenishment",
      { hourUTC: 2, minuteUTC: 0 },
      internal.actions.eventGeneration.orchestrator.generateDailyBatch,
      { targetCount: 3 } // 2-3 years
    );
  Success: Cron appears in Convex dashboard, runs at scheduled time
  Test: Trigger manually via Convex dashboard, verify execution
  Dependencies: orchestrator.ts, workSelector.ts
  Time: 1hr
  ```

### 3.3 Batch Orchestrator

- [x] **Implement daily batch generation coordinator**
  ```
  Files: convex/actions/eventGeneration/orchestrator.ts [MODIFY - add new export]
  Function:
    export const generateDailyBatch = internalAction({
      args: { targetCount: v.number() },
      handler: async (ctx, args) => {
        // 1. Call workSelector to get 2-3 years
        // 2. For each year: call generateYearEvents
        // 3. Log aggregate stats
        // 4. Handle partial failures gracefully
      }
    })
  Success: Generates 12-18 events/day across 2-3 years
  Test: Mock year selection, verify parallel execution, test error handling
  Dependencies: workSelector.ts, generateYearEvents
  Time: 2hrs
  ```

---

## Phase 4: Hardening & Monitoring (2 days)

### 4.1 Error Handling & Circuit Breaker

- [x] **Implement circuit breaker for API failures**

  ```
  Files: convex/lib/llmClient.ts [MODIFY]
  Pattern: Simple state machine tracking consecutive failures
  Logic:
    - Track consecutive API failures
    - Open circuit after 5 failures
    - Half-open after 5 minute timeout
    - Close on success
  Success: API failures don't crash pipeline, graceful degradation
  Test: Mock consecutive API failures, verify circuit opens/closes
  Dependencies: llmClient.ts
  Time: 2hrs
  ```

- [x] **Add comprehensive error logging**
  ```
  Files: All action files [MODIFY]
  Pattern: Follow historicalContext.ts sanitization (lines 24-63)
  Changes:
    - Wrap all LLM calls in try-catch
    - Sanitize errors before logging
    - Log to generation_logs on failure
    - Include context: year, attempt number, stage
  Success: All errors logged, no API key leakage, pipeline continues
  Test: Force errors at each stage, verify logging and continuation
  Dependencies: sanitizeErrorForLogging helper
  Time: 2hrs
  ```

### 4.2 Monitoring & Alerts

- [x] **Implement alert system**

  ```
  Files: convex/lib/alerts.ts [NEW]
  Pattern: Simple webhook or console.error for v1
  Functions:
    - checkZeroEventsAlert(): Alert if 0 events for 2 days
    - checkCostAlert(): Alert if daily cost >2x average
    - checkPassRateAlert(): Alert if validation <80% for 3 days
  Integration: Call from generateDailyBatch at end
  Success: Alerts trigger on threshold violations
  Test: Mock threshold conditions, verify alert messages
  Dependencies: generationLogs queries
  Time: 2hrs
  ```

- [x] **Create monitoring queries for dashboard**
  ```
  Files: convex/generationLogs.ts [MODIFY - add queries]
  Queries: See TASK.md lines 987-1064
    - getDailyGenerationStats(date)
    - getEventPoolHealth()
    - getFailedYears(limit)
    - getLast7DaysCosts()
  Success: Queries return accurate aggregations
  Test: Insert test data, verify query results
  Dependencies: generation_logs table
  Time: 2hrs
  ```

### 4.3 Testing & Validation

- [x] **Implement golden file tests**

  ```
  Files: convex/lib/__tests__/eventValidation.unit.test.ts [NEW]
  Pattern: Follow existing unit test structure (eraUtils.test.ts)
  Golden data: See TASK.md lines 927-970
  Tests:
    - Leakage detection (numerals, century terms, BCE/CE)
    - Word count validation (≤20 words)
    - Proper noun detection
    - Domain diversity checks
  Success: All deterministic rules pass/fail correctly
  Test: Run `pnpm test`, all pass
  Dependencies: eventValidation.ts
  Time: 2hrs
  ```

- [~] **Create manual testing script**
  ```
  Files: scripts/test-event-generation.ts [NEW]
  Pattern: Follow test-responses-api.ts structure
  Features:
    - Test single year generation (specify year via CLI)
    - Dry-run mode (don't persist to DB)
    - Verbose output (show all candidates, critiques, revisions)
    - Cost estimation
  Usage: pnpm tsx scripts/test-event-generation.ts --year 1969 --dry-run
  Success: Can manually test pipeline for any year
  Test: Run for 3 test years (ancient, medieval, modern)
  Dependencies: orchestrator.ts
  Time: 2hrs
  ```

### 4.4 Documentation

- [ ] **Write pipeline architecture doc**
  ```
  Files: docs/EVENT_GENERATION_PIPELINE.md [NEW]
  Content:
    - Architecture diagram (ASCII art from TASK.md)
    - Module responsibilities and interfaces
    - Prompt templates reference
    - Troubleshooting guide
    - Cost optimization tips
    - Manual intervention procedures
  Success: Engineer can understand and maintain pipeline
  Test: Review with fresh eyes
  Dependencies: None
  Time: 2hrs
  ```

---

## Design Iteration Checkpoints

### After Phase 1 (Core Pipeline):

- Review module boundaries: Is Generator/Critic/Reviser separation clean?
- Extract emerging patterns: Any reusable prompt engineering patterns?
- Performance check: Is latency <3min per year?

### After Phase 2 (Integration):

- Review interfaces: Is orchestrator → persistence contract clear?
- Identify coupling: Are modules independently testable?
- Data model check: Is generation_logs schema sufficient?

### After Phase 3 (Scheduling):

- Production readiness: Can cron run unsupervised?
- Failure modes: Have we tested all error paths?
- Cost validation: Is usage tracking accurate?

---

## Automation Opportunities

- [ ] **Script: Bulk test multiple years**

  ```
  Create script to test pipeline on 10 years in parallel
  Verify consistency and catch edge cases
  ```

- [ ] **Script: Cost analysis**

  ```
  Analyze generation_logs to project monthly costs
  Identify expensive years (high retry counts)
  ```

- [ ] **Script: Quality audit sampler**
  ```
  Random sample 10 events/week for manual review
  Check: leakage, factual accuracy, proper nouns
  Log results for threshold tuning
  ```

---

## Success Criteria

**Phase 1 Complete:**

- [ ] Can generate 6+ events for test year (1969) with <4 attempts
- [ ] Zero leakage in final events
- [ ] Execution time <3 minutes
- [ ] All unit tests pass

**Phase 2 Complete:**

- [ ] Events persist to Convex database
- [ ] Generation logs captured correctly
- [ ] Integration tests pass

**Phase 3 Complete:**

- [ ] Cron runs successfully for 3 consecutive days
- [ ] Generates 12-18 events/day minimum
- [ ] Work selection avoids duplicates

**Phase 4 Complete:**

- [ ] Pipeline runs 7 consecutive days with zero crashes
- [ ] Validation pass rate ≥90%
- [ ] Cost within $10/month budget
- [ ] Alerts working correctly

---

## Notes

**Module Value Formula**: Module Value = Functionality - Interface Complexity

- **LLMClient**: High value (hides retry/sanitization/JSON parsing complexity)
- **EventValidation**: High value (encapsulates all regex patterns)
- **Orchestrator**: High value (hides loop/retry/selection complexity)
- **WorkSelector**: Medium value (could be simpler if just query missing years)

**Testing Strategy**:

- Unit tests: eventValidation.ts (pure functions, easy to test)
- Integration tests: Full pipeline with mocked LLM responses
- Manual tests: Real LLM calls for specific years (scripts/test-event-generation.ts)
- Golden files: Known good/bad events for regression testing

**Parallelization**:

- Phase 1 tasks are module-independent (can work in parallel)
- Phase 2 requires Phase 1 complete
- Phase 3 requires Phase 2 complete
- Phase 4 can partially overlap with Phase 3

**Time Estimate**: 7 days (56 hours) based on task-level estimates

# TODO: Server-Side Historical Context Generation Refactor

## Problem Statement

Client-side context generation causes rate limiting (5 req/hour), duplicate API calls ($$$), and poor UX with loading states. Solution: Generate once server-side during puzzle creation, store in Convex.

## Phase 1: Database Schema Evolution

- [x] Add `historicalContext: v.optional(v.string())` field to puzzles table in `/convex/schema.ts` - stores the AI-generated narrative text (3000-4000 chars expected)
- [x] Add `historicalContextGeneratedAt: v.optional(v.number())` field to puzzles table - Unix timestamp for tracking generation time and potential regeneration logic
- [x] Deploy schema changes to development environment using `npx convex dev` and verify migration succeeds without data loss

## Phase 2: Convex Action for OpenRouter Integration

- [x] Create `/convex/actions/historicalContext.ts` file with proper TypeScript module structure and Convex action imports
- [x] Implement `generateHistoricalContext` action with args: `{puzzleId: v.id("puzzles"), year: v.number(), events: v.array(v.string())}`
- [x] Add OpenRouter API key to Convex environment variables via `npx convex env set OPENROUTER_API_KEY` (get from .env.local)
- [ ] Implement fetch call to OpenRouter API endpoint `https://openrouter.ai/api/v1/chat/completions` with proper headers including `HTTP-Referer` and `X-Title`
- [ ] Use model `google/gemini-2.0-flash-exp:free` with existing prompt templates from `/src/lib/constants.ts` lines 233-254
- [ ] Add exponential backoff retry logic (max 3 attempts) with base delay 1000ms for transient failures
- [ ] Parse OpenRouter response and extract content from `choices[0].message.content` with proper error handling for malformed responses
- [ ] Call internal mutation `updateHistoricalContext` to persist generated context to database
- [ ] Add comprehensive error logging with context including puzzleId, year, attempt number, and error details

## Phase 3: Internal Mutation for Context Storage

- [ ] Add `updateHistoricalContext` internal mutation to `/convex/puzzles.ts` accepting `{puzzleId: v.id("puzzles"), context: v.string()}`
- [ ] Implement patch operation to update puzzle document with `historicalContext` and `historicalContextGeneratedAt` fields
- [ ] Add validation to ensure context is non-empty string (min 100 chars) before storing
- [ ] Add error handling for invalid puzzleId references with proper error messages

## Phase 4: Cron Job Integration

- [ ] Modify `generateDailyPuzzle` function in `/convex/puzzles.ts` at line ~95 after puzzle creation
- [ ] Add `ctx.scheduler.runAfter(0, internal.actions.historicalContext.generateHistoricalContext, {...})` with puzzleId, year, and events
- [ ] Ensure scheduler call happens AFTER events are patched with puzzleId (line ~93) to maintain data consistency
- [ ] Add fallback mechanism: if context generation fails, log error but don't fail puzzle creation

## Phase 5: Query Updates for Historical Context

- [ ] Update `getDailyPuzzle` query in `/convex/puzzles.ts` to include `historicalContext` field in return value
- [ ] Update `getPuzzleById` query to include `historicalContext` field
- [ ] Update `getPuzzleByNumber` query to include `historicalContext` field
- [ ] Update `getArchivePuzzles` query to include `historicalContext` field in paginated results

## Phase 6: Client Data Hook Updates

- [ ] Update `ConvexPuzzle` interface in `/src/hooks/data/usePuzzleData.ts` line ~10 to include `historicalContext?: string`
- [ ] Update `PuzzleData` interface at line ~21 to include `historicalContext?: string`
- [ ] Update normalization logic at lines ~106 and ~144 to map `historicalContext` from Convex to normalized data structure

## Phase 7: Component Simplification

- [ ] Create new simplified `HistoricalContextCard` component that accepts `context?: string` prop directly
- [ ] Remove all loading state logic from HistoricalContextCard (lines 165-167, 236-244)
- [ ] Remove all error state logic from HistoricalContextCard (lines 167-188, 247-274)
- [ ] Remove manual generation trigger logic (handleToggle function lines 90-148)
- [ ] Update expand/collapse to only toggle visibility of pre-fetched content
- [ ] Update GameInstructions.tsx to pass `puzzle.historicalContext` directly to HistoricalContextCard
- [ ] Remove `useHistoricalContext` hook import and usage from HistoricalContextCard

## Phase 8: Dead Code Removal

- [ ] Delete `/src/hooks/useHistoricalContext.ts` (234 lines) - completely replaced by server-side generation
- [ ] Delete `/src/lib/openrouter.ts` (318 lines) - moved to Convex action
- [ ] Delete `/src/app/api/historical-context/route.ts` (180 lines) - no longer needed
- [ ] Remove `HISTORICAL_CONTEXT_RATE_LIMIT` constant from `/src/lib/rate-limiter.ts` line 145
- [ ] Remove historical context rate limiting logic from `/src/lib/rate-limiter.ts`
- [ ] Remove OpenRouter-related types from `/src/lib/types/aiContext.ts` if no longer referenced
- [ ] Remove AI_CONFIG constants that are only used by deleted code from `/src/lib/constants.ts`

## Phase 9: Migration Script for Existing Puzzles

- [ ] Create `/convex/migrations/generateMissingContext.ts` internal mutation
- [ ] Query all puzzles where `historicalContext === undefined` ordered by puzzleNumber ascending
- [ ] Batch process in groups of 5 to avoid overwhelming OpenRouter API
- [ ] Schedule context generation action for each puzzle with 2-second delays between batches
- [ ] Add progress logging showing X/Y puzzles processed
- [ ] Add dry-run mode that counts puzzles needing migration without executing
- [ ] Test on single puzzle first before running full migration

## Phase 10: Testing & Verification

- [ ] Test action with mock year 1969 and Apollo 11 events to verify prompt formatting
- [ ] Verify context persists to database and is retrievable via queries
- [ ] Test error handling by temporarily using invalid API key
- [ ] Verify retry logic by simulating network timeouts
- [ ] Load test with 10 rapid puzzle generations to ensure no rate limiting
- [ ] Verify client instantly displays context with no loading spinners
- [ ] Test expand/collapse functionality still works correctly
- [ ] Measure API cost reduction: log before (client requests) vs after (server requests) metrics

## Phase 11: Production Deployment

- [ ] Deploy schema changes to production via `npx convex deploy`
- [ ] Set OPENROUTER_API_KEY in production environment
- [ ] Deploy actions and mutations
- [ ] Run migration script to backfill existing puzzles
- [ ] Deploy client code changes
- [ ] Monitor error logs for failed context generations
- [ ] Verify cron job successfully generates context for new daily puzzles
- [ ] Remove feature flag or gradual rollout after 24 hours of stability

## Success Metrics

- API calls reduced from ~1000/day to ~1/day (1000x reduction)
- Zero loading states for historical context
- Zero 429 rate limit errors
- Context available for 100% of puzzles
- Page load time improved by removing client-side API call

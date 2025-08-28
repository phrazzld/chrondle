# TODO: Server-Side Historical Context Generation Refactor

## URGENT: CI Pipeline Fix Required [CI FIX]

**Issue**: CI failures blocking PR #13 due to missing Convex generated TypeScript files
**Classification**: CI Infrastructure Issue (NOT a code issue)
**Impact**: All CI runs failing, PR cannot be merged

### CI Resolution Tasks

- [x] **[CI FIX]** Add Convex code generation step to `.github/workflows/ci.yml` before type checking
  - Add after line 42 (Install dependencies): `- name: Generate Convex files`
  - Command: `npx convex codegen --no-push`
  - Environment: `CONVEX_DEPLOYMENT: fleet-goldfish-183`
- [x] **[CI FIX]** Verify Convex files are generated correctly in CI
  - Add verification step: `ls -la convex/_generated/` to confirm files exist
  - Should see: `api.d.ts`, `server.d.ts`, `dataModel.d.ts`
- [x] **[CI FIX]** Update build job to also generate Convex files
  - Add same Convex codegen step after line 105 in build job
  - Ensures build has necessary TypeScript definitions
- [x] **[CI FIX]** Test fix by pushing to current PR branch
  - Commit workflow changes with message: "fix(ci): add Convex codegen step to CI pipeline"
  - Monitor CI run to verify all checks pass
- [x] **[CI FIX]** Add CI setup documentation to README or CONTRIBUTING.md
  - Document that Convex files must be generated before type checking
  - Explain why these files are gitignored
  - Note the production deployment ID for CI usage
- [ ] **[CI FIX]** Consider caching generated Convex files to speed up CI
  - Cache path: `convex/_generated`
  - Cache key: Based on `convex/schema.ts` hash
  - Restore on subsequent runs to avoid regeneration
- [ ] **[CI FIX]** Update Vercel build command if needed
  - Check if Vercel needs explicit Convex codegen in build settings
  - May need to prepend: `npx convex codegen --no-push && ` to build command

### Verification Checklist

- [x] TypeScript compilation passes in CI
- [x] All test suites run successfully
- [x] Build job completes without errors
- [ ] Vercel deployment succeeds (separate issue - needs investigation)
- [ ] PR checks all show green status (Vercel still failing)

---

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
- [x] Implement fetch call to OpenRouter API endpoint `https://openrouter.ai/api/v1/chat/completions` with proper headers including `HTTP-Referer` and `X-Title`
- [x] Use model `google/gemini-2.5-flash` with existing prompt templates from `/src/lib/constants.ts` lines 233-254
- [x] Add exponential backoff retry logic (max 3 attempts) with base delay 1000ms for transient failures
- [x] Parse OpenRouter response and extract content from `choices[0].message.content` with proper error handling for malformed responses
- [x] Call internal mutation `updateHistoricalContext` to persist generated context to database
- [x] Add comprehensive error logging with context including puzzleId, year, attempt number, and error details

## Phase 3: Internal Mutation for Context Storage

- [x] Add `updateHistoricalContext` internal mutation to `/convex/puzzles.ts` accepting `{puzzleId: v.id("puzzles"), context: v.string()}`
- [x] Implement patch operation to update puzzle document with `historicalContext` and `historicalContextGeneratedAt` fields
- [x] Add validation to ensure context is non-empty string (min 100 chars) before storing
- [x] Add error handling for invalid puzzleId references with proper error messages

## Phase 4: Cron Job Integration

- [x] Modify `generateDailyPuzzle` function in `/convex/puzzles.ts` at line ~95 after puzzle creation
- [x] Add `ctx.scheduler.runAfter(0, internal.actions.historicalContext.generateHistoricalContext, {...})` with puzzleId, year, and events
- [x] Ensure scheduler call happens AFTER events are patched with puzzleId (line ~93) to maintain data consistency
- [x] Add fallback mechanism: if context generation fails, log error but don't fail puzzle creation

## Phase 5: Query Updates for Historical Context

- [x] Update `getDailyPuzzle` query in `/convex/puzzles.ts` to include `historicalContext` field in return value
- [x] Update `getPuzzleById` query to include `historicalContext` field
- [x] Update `getPuzzleByNumber` query to include `historicalContext` field
- [x] Update `getArchivePuzzles` query to include `historicalContext` field in paginated results

## Phase 6: Client Data Hook Updates

- [x] Update `ConvexPuzzle` interface in `/src/hooks/data/usePuzzleData.ts` line ~10 to include `historicalContext?: string`
- [x] Update `PuzzleData` interface at line ~21 to include `historicalContext?: string`
- [x] Update normalization logic at lines ~106 and ~144 to map `historicalContext` from Convex to normalized data structure

## Phase 7: Component Simplification

- [x] Create new simplified `HistoricalContextCard` component that accepts `context?: string` prop directly
- [x] Remove all loading state logic from HistoricalContextCard (lines 165-167, 236-244)
- [x] Remove all error state logic from HistoricalContextCard (lines 167-188, 247-274)
- [x] Remove manual generation trigger logic (handleToggle function lines 90-148)
- [x] Update expand/collapse to only toggle visibility of pre-fetched content
- [x] Update GameInstructions.tsx to pass `puzzle.historicalContext` directly to HistoricalContextCard
- [x] Remove `useHistoricalContext` hook import and usage from HistoricalContextCard

## Phase 8: Dead Code Removal

- [x] Delete `/src/hooks/useHistoricalContext.ts` (234 lines) - completely replaced by server-side generation
- [x] Delete `/src/lib/openrouter.ts` (318 lines) - moved to Convex action
- [x] Delete `/src/app/api/historical-context/route.ts` (180 lines) - no longer needed
- [x] Remove `HISTORICAL_CONTEXT_RATE_LIMIT` constant from `/src/lib/rate-limiter.ts` line 145
- [x] Remove historical context rate limiting logic from `/src/lib/rate-limiter.ts`
- [x] Remove OpenRouter-related types from `/src/lib/types/aiContext.ts` if no longer referenced
- [x] Remove AI_CONFIG constants that are only used by deleted code from `/src/lib/constants.ts`

## Phase 9: Migration Script for Existing Puzzles

- [x] Create `/convex/migrations/generateMissingContext.ts` internal mutation
- [x] Query all puzzles where `historicalContext === undefined` ordered by puzzleNumber ascending
- [x] Batch process in groups of 5 to avoid overwhelming OpenRouter API
- [x] Schedule context generation action for each puzzle with 2-second delays between batches
- [x] Add progress logging showing X/Y puzzles processed
- [x] Add dry-run mode that counts puzzles needing migration without executing
- [x] Test on single puzzle first before running full migration

## Phase 10: Testing & Verification

- [x] Test action with mock year 1969 and Apollo 11 events to verify prompt formatting
- [x] Verify context persists to database and is retrievable via queries
- [ ] Test error handling by temporarily using invalid API key
- [ ] Verify retry logic by simulating network timeouts
- [ ] Load test with 10 rapid puzzle generations to ensure no rate limiting
- [x] Verify client instantly displays context with no loading spinners
- [x] Test expand/collapse functionality still works correctly
- [x] Measure API cost reduction: log before (client requests) vs after (server requests) metrics

## Phase 11: Production Deployment

- [ ] Deploy schema changes to production via `npx convex deploy`
- [ ] Set OPENROUTER_API_KEY in production environment
- [ ] Deploy actions and mutations
- [ ] Run migration script to backfill existing puzzles
- [ ] Deploy client code changes
- [ ] Monitor error logs for failed context generations
- [ ] Verify cron job successfully generates context for new daily puzzles
- [ ] Remove feature flag or gradual rollout after 24 hours of stability

## Miscellaneous

- [x] Show Chrondle puzzle number in share text

## Success Metrics

- API calls reduced from ~1000/day to ~1/day (1000x reduction)
- Zero loading states for historical context
- Zero 429 rate limit errors
- Context available for 100% of puzzles
- Page load time improved by removing client-side API call

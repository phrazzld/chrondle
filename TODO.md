# TODO: Convex Backend Architectural Refactoring

## Context

- **Current State**: 1,422 lines of god objects across puzzles.ts (690L) and users.ts (732L)
- **Problem**: 7 distinct responsibilities in puzzles.ts, 5 in users.ts, 80 lines of duplicated code
- **Approach**: Extract focused modules with clear boundaries, eliminate duplication
- **Key Pattern**: Each module owns ONE responsibility, hides implementation complexity
- **Validation**: `pnpm type-check`, all imports auto-update via Convex codegen

## Phase 1: Extract Puzzle Generation Module (Eliminate Duplication)

**Goal**: DRY violation elimination first - extract shared generation logic

- [x] **Create `convex/puzzles/generation.ts` with shared helper**

  ```
  Files: convex/puzzles/generation.ts (NEW), convex/puzzles.ts:40-80, 178-212
  Approach: Extract `selectYearForPuzzle(ctx)` helper from duplicated code
  Module: Single responsibility - puzzle year selection algorithm
  Interface: async function selectYearForPuzzle(ctx: QueryCtx): Promise<{ year, events }>
  Success: Both generateDailyPuzzle and ensureTodaysPuzzle call helper, duplicate code removed
  Test: Existing puzzles.ts tests still pass, generation logic unchanged
  Time: 45min
  ```

  **Implementation Details**:

  - Extract lines 40-80 from puzzles.ts (unused event query + year selection)
  - Helper function returns `{ year: number, events: Event[], availableEvents: number }`
  - Import helper in puzzles.ts and replace both duplicated blocks
  - Preserve all logic: yearCounts Map, filtering 6+ events, random selection
  - NO behavior changes - pure refactor

- [x] **Update `generateDailyPuzzle` to use helper**

  ```
  Files: convex/puzzles.ts:15-140
  Approach: Replace lines 40-80 with call to selectYearForPuzzle()
  Success: Function compiles, generates puzzles correctly
  Test: Run generation manually with `convex run puzzles:generateDailyPuzzle`
  Time: 15min
  ```

- [x] **Update `ensureTodaysPuzzle` to use helper**
  ```
  Files: convex/puzzles.ts:155-239
  Approach: Replace lines 178-212 with call to selectYearForPuzzle()
  Success: Function compiles, ensures puzzle correctly
  Test: Frontend puzzle loading still works
  Time: 15min
  ```

## Phase 2: Split puzzles.ts God Object (7 → 7 Focused Modules)

**Goal**: Clear module boundaries, each ~100 lines with single responsibility

- [x] **Create `convex/puzzles/queries.ts` - Puzzle retrieval**

  ```
  Files: convex/puzzles/queries.ts (NEW)
  Extract: getDailyPuzzle, getPuzzleById, getPuzzleByNumber, getArchivePuzzles, getTotalPuzzles, getPuzzleYears
  Module: Single responsibility - read-only puzzle access
  Interface: 6 query functions, all return Puzzle or Puzzle[]
  Success: All queries compile, frontend imports auto-update
  Test: Archive page loads, daily puzzle loads, puzzle by ID works
  Time: 1h
  ```

  **Implementation Notes**:

  - Created 129-line focused module for puzzle retrieval
  - Added re-exports in puzzles.ts for backward compatibility
  - Reduced puzzles.ts from ~690L to 539L (-151 lines)
  - Type checking passes, no breaking changes

  **Module Design**:

  - Lines: ~150 (6 queries × 25 lines avg)
  - Dependencies: schema.ts only
  - Exports: query functions only
  - No side effects, pure data retrieval

- [ ] **Create `convex/puzzles/mutations.ts` - Game actions**

  ```
  Files: convex/puzzles/mutations.ts (NEW)
  Extract: submitGuess
  Module: Single responsibility - game state mutations
  Interface: 1 mutation function
  Success: Guess submission works, frontend imports update
  Test: Make guess in game, verify mutation succeeds
  Time: 30min
  ```

- [ ] **Move generation to `convex/puzzles/generation.ts`**

  ```
  Files: convex/puzzles/generation.ts (already exists), move generateDailyPuzzle, ensureTodaysPuzzle
  Extract: generateDailyPuzzle, ensureTodaysPuzzle, manualGeneratePuzzle
  Module: Single responsibility - puzzle creation
  Interface: 2 internal mutations + 1 public mutation
  Success: Cron job creates puzzles, manual generation works
  Test: Check cron execution, verify puzzle creation
  Time: 45min
  ```

- [ ] **Create `convex/plays/queries.ts` - User progress tracking**

  ```
  Files: convex/plays/queries.ts (NEW)
  Extract: getUserPlay, getUserCompletedPuzzles
  Module: Single responsibility - read user play data
  Interface: 2 query functions
  Success: Frontend progress loads, archive shows completed
  Test: Check game progress, verify archive filtering
  Time: 30min
  ```

- [ ] **Create `convex/plays/statistics.ts` - Puzzle stats**

  ```
  Files: convex/plays/statistics.ts (NEW)
  Extract: updatePuzzleStats (from puzzles.ts:428-500)
  Module: Single responsibility - aggregate puzzle statistics
  Interface: Internal function updatePuzzleStats(ctx, puzzleId)
  Success: Stats update after game completion
  Test: Complete puzzle, verify playCount and avgGuesses update
  Time: 45min
  ```

  **Note**: updatePuzzleStats currently in puzzles.ts, moves to plays domain

- [ ] **Create `convex/streaks/mutations.ts` - Streak management**

  ```
  Files: convex/streaks/mutations.ts (NEW)
  Extract: updateUserStreak (from puzzles.ts:428-450)
  Module: Single responsibility - user streak updates
  Interface: Internal function updateUserStreak(ctx, userId, hasWon, puzzleDate)
  Success: Streaks update correctly, archive puzzles don't affect streaks
  Test: Complete daily puzzle → streak updates, complete archive → no streak change
  Time: 45min
  ```

  **Critical Business Rule**: Archive puzzles (puzzleDate !== today) do NOT update streaks

  - Enforce with PuzzleType union: `{ type: 'daily' | 'archive'; date: string }`
  - Type-level guarantee this rule isn't violated

- [ ] **Create `convex/system/scheduling.ts` - Cron utilities**

  ```
  Files: convex/system/scheduling.ts (NEW)
  Extract: getCronSchedule
  Module: Single responsibility - system scheduling info
  Interface: 1 query function
  Success: Countdown timer shows correct schedule
  Test: Check homepage countdown display
  Time: 15min
  ```

- [ ] **Create `convex/actions/context.ts` - Historical context**

  ```
  Files: convex/actions/context.ts (NEW)
  Extract: updateHistoricalContext (from puzzles.ts)
  Module: Single responsibility - AI context generation
  Interface: 1 internal mutation
  Success: Context generates after puzzle creation
  Test: Verify new puzzles have historicalContext field populated
  Time: 30min
  ```

- [ ] **Delete `convex/puzzles.ts` after migration verification**
  ```
  Files: convex/puzzles.ts (DELETE)
  Success: All imports resolved, no references to old file
  Test: `pnpm type-check` passes, all pages load correctly
  Time: 15min
  ```

## Phase 3: Split users.ts God Object (1 → 5 Focused Modules)

**Goal**: Separate user CRUD, auth, migration, validation, statistics

- [ ] **Create `convex/users/queries.ts` - User retrieval**

  ```
  Files: convex/users/queries.ts (NEW)
  Extract: getCurrentUser, getUserByClerkId, userExists, getUserStats
  Module: Single responsibility - read-only user access
  Interface: 4 query functions
  Success: User data loads correctly, stats display
  Test: Sign in, verify user data, check stats page
  Time: 45min
  ```

- [ ] **Create `convex/users/mutations.ts` - User management**

  ```
  Files: convex/users/mutations.ts (NEW)
  Extract: createUser, createUserFromWebhook, getOrCreateCurrentUser, updateUsername
  Module: Single responsibility - user CRUD operations
  Interface: 2 internal mutations + 2 public mutations
  Success: Webhook creates users, username updates work
  Test: Trigger webhook, update username, verify changes
  Time: 1h
  ```

- [ ] **Create `convex/users/statistics.ts` - User stats aggregation**

  ```
  Files: convex/users/statistics.ts (NEW)
  Extract: updateUserStats
  Module: Single responsibility - calculate user metrics
  Interface: Internal function updateUserStats(ctx, userId)
  Success: Stats update after game completion
  Test: Complete game, verify totalPlays and perfectGames increment
  Time: 30min
  ```

- [ ] **Create `convex/migration/anonymous.ts` - Anonymous data merge**

  ```
  Files: convex/migration/anonymous.ts (NEW)
  Extract: mergeAnonymousState, mergeAnonymousStreak
  Module: Single responsibility - anonymous → authenticated migration
  Interface: 2 mutation functions
  Success: Anonymous data merges on sign-in
  Test: Play anonymously, sign in, verify streak preserved
  Time: 1.5h
  ```

  **Security Enhancement**: Add idempotency + rate limiting as per BACKLOG security findings

  - Add `sessionId` parameter
  - Track `mergedSessions` array in user record
  - Implement rate limit: 2 merges/minute max

- [ ] **Create `convex/migration/validation.ts` - Streak validation**

  ```
  Files: convex/migration/validation.ts (NEW)
  Extract: validateAnonymousStreak (87 lines from users.ts:443-529)
  Module: Single responsibility - anonymous streak security checks
  Interface: Pure function validateAnonymousStreak(streak, date): { isValid, reason }
  Success: Invalid streaks rejected, valid ones accepted
  Test: Existing validation tests pass (convex/lib/__tests__/anonymousStreakValidation.test.ts)
  Time: 45min
  ```

- [ ] **Delete `convex/users.ts` after migration verification**
  ```
  Files: convex/users.ts (DELETE)
  Success: All imports resolved, webhook still creates users
  Test: Full auth flow works, `pnpm type-check` passes
  Time: 15min
  ```

## Phase 4: Update Frontend Imports

**Goal**: All frontend code uses new module paths

- [ ] **Update all `api.puzzles.*` imports**

  ```
  Files: All files in src/ using api.puzzles (15 files found)
  Approach: Convex auto-generates new api paths after module split
  New paths: api.puzzles.queries.*, api.puzzles.mutations.*, api.plays.queries.*, etc.
  Success: `pnpm type-check` passes, no import errors
  Test: All pages load, game functions work
  Time: 1h
  ```

  **Convex Auto-Generation**: After moving mutations/queries, `api` object auto-updates

  - `api.puzzles.getDailyPuzzle` → `api.puzzles.queries.getDailyPuzzle`
  - `api.puzzles.submitGuess` → `api.puzzles.mutations.submitGuess`
  - TypeScript will catch ALL import errors at compile time

- [ ] **Update all `api.users.*` imports**
  ```
  Files: All files in src/ using api.users
  Approach: Follow same pattern as puzzles imports
  Success: Auth flows work, user data loads
  Test: Sign in/out, profile updates, streak displays
  Time: 45min
  ```

## Phase 5: Test Coverage & Validation

**Goal**: Verify no regressions, all functionality preserved

- [ ] **Run full test suite**

  ```
  Command: pnpm test
  Success: All existing tests pass
  Coverage: No decrease in test coverage
  Time: 10min
  ```

- [ ] **Run type checking**

  ```
  Command: pnpm type-check
  Success: Zero TypeScript errors
  Time: 5min
  ```

- [ ] **Manual smoke tests**
  ```
  Tests:
  - [ ] Daily puzzle loads and is playable
  - [ ] Archive page displays completed puzzles
  - [ ] Guess submission works and updates stats
  - [ ] Streaks update correctly for daily puzzles
  - [ ] Anonymous play works
  - [ ] Sign-in merges anonymous data
  - [ ] Webhook creates users
  - [ ] Historical context generates for new puzzles
  Success: All manual tests pass
  Time: 30min
  ```

## Design Iteration Checkpoints

**After Phase 2 (puzzles.ts split)**:

- Review: Are module boundaries clear? Any coupling detected?
- Measure: Lines per module (target ~100-150), function count (target 3-6 per module)
- Consider: Any shared patterns that should be extracted to lib/?

**After Phase 3 (users.ts split)**:

- Review: Is migration logic properly isolated? Security concerns addressed?
- Measure: Test coverage for new modules
- Consider: Documentation needs for complex migration flows?

**After Phase 5 (completion)**:

- Document: New module structure in convex/README.md
- Metrics: Total lines reduced? God objects eliminated? Duplication removed?
- Next: Address other BACKLOG items (security fixes, UX improvements)

## Automation Opportunities

**Identified Patterns**:

- Extract mutation/query → Create new file → Update imports (repeatable)
- Could create script: `scripts/split-convex-module.ts <source> <target> <functions...>`
- Would automate: File creation, export extraction, import updates

**Not Implementing Now**: Focus on manual refactor first, automate if pattern repeats

## Success Criteria

- [ ] Zero TypeScript errors (`pnpm type-check`)
- [ ] All tests pass (`pnpm test`)
- [ ] No functional regressions (manual smoke tests pass)
- [ ] 1,422 lines → ~1,200 lines (eliminating duplication + overhead)
- [ ] puzzles.ts (690L) → 7 modules (~100L each)
- [ ] users.ts (732L) → 5 modules (~100-150L each)
- [ ] Zero code duplication (80 duplicate lines eliminated)
- [ ] Clear module boundaries (each module has single responsibility)
- [ ] Convex API auto-generates correct paths

## Estimated Total Time

- Phase 1 (Duplication): 1h 15min
- Phase 2 (puzzles.ts split): 5h 15min
- Phase 3 (users.ts split): 5h
- Phase 4 (Frontend imports): 1h 45min
- Phase 5 (Testing): 45min
- **Total: ~14 hours** (vs. original estimate 12h, more accurate with detailed breakdown)

## Notes

- **Convex Auto-Generation**: API paths auto-update, TypeScript catches all import errors
- **No Breaking Changes**: All functions preserve exact same behavior
- **Test Safety Net**: Existing tests validate no regressions
- **Incremental Migration**: Can merge after each phase if needed
- **Module Value**: Each new module has Value = Functionality - Interface Complexity > 0
  - Example: `generation.ts` hides 80 lines of complex logic behind simple `selectYearForPuzzle()` interface

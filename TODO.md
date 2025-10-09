# TODO: Fix Streak Persistence System - PR Review Fixes

## 🚨 CRITICAL: PR Review Blockers (MUST FIX BEFORE MERGE)

**Status**: In Progress
**Priority**: P1 - Merge Blocking
**Source**: Codex automated PR review (PR #34)
**ETA**: 1.5-2 hours

### Task 1: Fix Authenticated Player Loss Streak Reset ⏳

**File**: `convex/puzzles.ts:346-370`
**Issue**: Streaks not reset when authenticated users exhaust all 6 guesses
**Impact**: Critical - Data integrity bug causing inflated streak counts
**Estimate**: 45 minutes

**Problem**:

- `updateUserStreak()` only called when `isCorrect === true` (lines 348, 369)
- When users lose (6 wrong guesses), streak remains at previous win value
- Next successful puzzle incorrectly continues old streak instead of resetting
- Violates core streak rules in `streakCalculation.ts:100-104`

**Implementation Steps**:

- [ ] Define `MAX_GUESSES = 6` constant at top of file
- [ ] Update existing play path (lines 346-349):
  ```typescript
  if (isCorrect) {
    await updatePuzzleStats(ctx, args.puzzleId);
    await updateUserStreak(ctx, args.userId, true);
  } else if (updatedGuesses.length >= MAX_GUESSES) {
    await updateUserStreak(ctx, args.userId, false);
  }
  ```
- [ ] Apply same logic to new play path (lines 367-370)
- [ ] Add backend integration test: authenticated user loses → streak resets to 0
- [ ] Verify `lastCompletedDate` updated even on loss
- [ ] Run: `pnpm test:unit && pnpm test:integration`
- [ ] Manual test in Convex dashboard

**Test Scenarios**:

1. Authenticated user makes 6 wrong guesses → streak = 0
2. Next day, user wins → streak = 1 (not continuing old streak)
3. `lastCompletedDate` reflects loss date

---

### Task 2: Fix Streak Merge Date Preservation ⏳

**File**: `convex/users.ts:454-473`
**Issue**: Always uses anonymous date regardless of which streak wins
**Impact**: Critical - Invalid state allowing incorrect streak continuation
**Estimate**: 30 minutes

**Problem**:

- Line 471: `lastCompletedDate: args.anonymousLastCompletedDate || user.lastCompletedDate`
- When server streak > anonymous streak, uses server count but anonymous date
- Creates mismatch: streak value doesn't match date that generated it
- Future plays may incorrectly continue despite gap

**Example Bug**:

```
Server: streak=10, date="2025-10-05"
Anonymous: streak=3, date="2025-10-08"
Current Result: streak=10, date="2025-10-08" ❌ WRONG
Expected: streak=10, date="2025-10-05" ✅ CORRECT
```

**Implementation Steps**:

- [ ] Add `mergedDate` variable alongside `mergedStreak` (line 454)
- [ ] Update conditional logic:
  - Combined: `mergedDate = args.anonymousLastCompletedDate` (most recent)
  - Anonymous wins: `mergedDate = args.anonymousLastCompletedDate`
  - Server wins: `mergedDate = user.lastCompletedDate || args.anonymousLastCompletedDate`
- [ ] Replace line 471 with: `lastCompletedDate: mergedDate`
- [ ] Update test in `useStreak.test.tsx` (lines ~400-420)
- [ ] Add test: server streak > anonymous → verify server date used
- [ ] Add test: anonymous streak > server → verify anonymous date used
- [ ] Run: `pnpm test:unit && pnpm test:integration`
- [ ] Manual test: sign in with anonymous streak, check Convex dashboard

**Test Scenarios**:

1. Anonymous=5 (Oct 8) + Server=10 (Oct 5) → streak=10, date=Oct 5
2. Anonymous=10 (Oct 8) + Server=5 (Oct 5) → streak=10, date=Oct 8
3. Consecutive (combined) → use most recent date

---

### Task 3: Integration Testing & Verification ⏳

**Estimate**: 30 minutes

**Manual Test Scenarios**:

- [ ] Anonymous user: complete → lose → verify streak = 0
- [ ] Authenticated user: complete → lose → verify streak = 0
- [ ] Anonymous=5 (Oct 8) + Server=10 (Oct 5) → verify streak=10, date=Oct 5
- [ ] Anonymous=10 (Oct 8) + Server=5 (Oct 5) → verify streak=10, date=Oct 8
- [ ] Page refresh after each scenario → verify persistence
- [ ] Re-run Codex review: `@codex review`

**Acceptance Criteria**:

- [ ] All 122+ tests passing (unit + integration + new tests)
- [ ] TypeScript compilation clean
- [ ] ESLint passing with only known a11y warnings
- [ ] Manual testing scenarios complete
- [ ] Codex review passes
- [ ] Ready for merge

---

## ✅ Implementation Status (Previous Work)

**Branch**: `fix/streak-persistence`

**Completed Phases**:

- ✅ Phase 1: Backend Foundation (5/5 tasks)
- ✅ Phase 2: Frontend Refactor (4/4 tasks)
- 🚨 Phase 2.5: PR Review Fixes (0/3 tasks) **← CURRENT FOCUS**
- ⏸️ Phase 3: Historical Migration (deferred)

**Total Commits**: 9

- Backend: 5 commits (calculation utility, tests, schema, mutations)
- Frontend: 4 commits (storage schema, hook refactor, tests, verification)

**Test Results** (Pre-Fix):

- ✅ All 122 tests passing (102 unit + 20 integration)
- ✅ TypeScript compilation clean
- ✅ ESLint passing (minor a11y warnings only)
- ⚠️ 2 critical bugs found by Codex review

---

## 🔄 Post-Merge Follow-up (Move to BACKLOG.md After Fixes)

### Enhancement A: Add Rate Limiting to Migration

**File**: `convex/users.ts:417`
**Priority**: Medium | **Impact**: 6/10 | **Effort**: 30 min
**Rationale**: Prevent migration spam from auth state flapping

### Enhancement B: Optimistic Updates for Auth Users

**File**: `src/hooks/useStreak.ts:99-110`
**Priority**: Medium | **Impact**: 4/10 | **Effort**: 1 hour
**Rationale**: Improve UX for authenticated streak updates

### Testing Enhancements

**Priority**: Medium | **Impact**: 7/10 | **Effort**: 2 hours

- E2E integration tests (anonymous → authenticated flow)
- localStorage corruption recovery tests
- Performance tests for large streak values

### Documentation Improvements

**Priority**: Low | **Impact**: 3/10 | **Effort**: 30 min

- Add JSDoc to `mergeAnonymousStreak`
- Enhance error messages with format examples
- Create troubleshooting guide

---

## Timeline

**Immediate Work** (PR Blockers): 1.5-2 hours

- Task 1: 45 minutes
- Task 2: 30 minutes
- Task 3: 30 minutes

**Follow-up Work** (Post-Merge): 4-5 hours

- Rate limiting: 30 minutes
- Optimistic updates: 1 hour
- Testing enhancements: 2 hours
- Documentation: 30 minutes
- Historical migration: 2-3 hours (optional)

---

**Current Focus**: Fix P1-A (loss streak reset) and P1-B (merge date logic)
**Next Command**: Implement fixes in `convex/puzzles.ts` and `convex/users.ts`

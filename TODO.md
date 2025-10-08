# TODO: Fix Streak Persistence System

## ✅ Implementation Status

**Branch**: `fix/streak-persistence`

**Completed Phases**:

- ✅ Phase 1: Backend Foundation (5/5 tasks)
- ✅ Phase 2: Frontend Refactor (4/4 tasks)
- ⏳ Phase 3: Historical Migration (0/2 tasks - PENDING)

**Total Commits**: 9

- Backend: 5 commits (calculation utility, tests, schema, mutations)
- Frontend: 4 commits (storage schema, hook refactor, tests, verification)

**Files Created**: 4

- `convex/lib/streakCalculation.ts` (193 lines)
- `convex/lib/__tests__/streakCalculation.unit.test.ts` (329 lines, 45 tests)
- `src/hooks/__tests__/useStreak.test.tsx` (471 lines, 15 tests)

**Files Modified**: 5

- `convex/schema.ts` (added lastCompletedDate field)
- `convex/puzzles.ts` (added streak update logic)
- `convex/users.ts` (added mergeAnonymousStreak mutation)
- `src/lib/secureStorage.ts` (added anonymousStreakStorage)
- `src/hooks/useStreak.ts` (complete rewrite for dual-mode)
- `src/components/GameIsland.tsx` (documentation only)

**Test Results**:

- ✅ All 60 tests passing (45 backend + 15 frontend)
- ✅ TypeScript compilation clean
- ✅ ESLint passing
- ✅ Integration verified

**Next Step**: Phase 3 - Historical Migration (optional, can be deferred)

---

## Context

**Approach**: Hybrid streak system with Convex as authoritative source for authenticated users and localStorage fallback for anonymous users. Implements optimistic updates for instant UI feedback.

**Key Files**:

- `convex/schema.ts`: Add `lastCompletedDate` field to users table
- `convex/lib/streakCalculation.ts`: NEW - Pure streak calculation logic (shared)
- `convex/puzzles.ts`: Update `submitGuess` mutation to calculate streaks
- `convex/users.ts`: Add `mergeAnonymousStreak` mutation
- `src/hooks/useStreak.ts`: Complete refactor for dual-mode operation
- `src/lib/secureStorage.ts`: Add streak storage schema
- `src/components/GameIsland.tsx`: Verify streak update flow

**Patterns to Follow**:

- Testing: Follow `src/lib/__tests__/validation.unit.test.ts` for pure function tests
- Hooks: Follow `src/hooks/data/useLocalSession.test.tsx` for hook testing with mocks
- Storage: Use `secureStorage.ts` pattern with Zod schemas (see lines 368-373)
- Mutations: Follow existing pattern in `convex/puzzles.ts` submitGuess (lines 320-380)

**Build/Validation Commands**:

```bash
pnpm type-check          # TypeScript compilation
pnpm lint                # ESLint
pnpm test:unit           # Unit tests
pnpm test:integration    # Integration tests
npx convex dev           # Start Convex in dev mode
```

---

## Phase 1: Backend Foundation ✅ COMPLETED

### Core Streak Calculation Module

- [x] **Create shared streak calculation utility** ✅

  ```
  Files: convex/lib/streakCalculation.ts (CREATED - 193 lines)
  Commit: feat(backend): add pure streak calculation utility
  Approach: Pure function with zero dependencies, similar to validation utilities
  Module Interface:
    - calculateStreak(lastCompletedDate: string | null, todayDate: string, hasWon: boolean): { currentStreak: number, lastCompletedDate: string }
    - isConsecutiveDay(lastDate: string, currentDate: string): boolean
    - getUTCDateString(date?: Date): string
  Module Responsibility: All streak calculation logic - the "what" not the "how to persist"
  Hidden Complexity: UTC timezone handling, edge cases (null, same-day, gaps)
  Success:
    - Function correctly handles first play (null → 1)
    - Same-day play returns unchanged streak
    - Yesterday → streak + 1
    - Gap (>1 day) → reset to 1
    - Losing resets to 0
    - All dates in UTC format
  Test: Unit tests with 15+ edge cases (see test strategy below)
  Time: 1.5 hours
  ```

- [x] **Write comprehensive unit tests for streak calculation** ✅
  ```
  Files: convex/lib/__tests__/streakCalculation.unit.test.ts (CREATED - 329 lines, 45 tests)
  Commit: test(backend): add comprehensive tests for streak calculation
  Approach: Follow pattern in src/lib/__tests__/validation.unit.test.ts
  Test Cases (minimum):
    1. First play (null lastCompletedDate, won) → streak = 1
    2. First play lost → streak = 0
    3. Same day completion (already played today) → no change
    4. Consecutive day (yesterday) won → streak + 1
    5. Consecutive day lost → streak = 0
    6. Gap of 2 days won → reset to 1
    7. Gap of 7 days won → reset to 1
    8. Timezone edge case (23:59 UTC yesterday, 00:01 UTC today) → consecutive
    9. Invalid date strings → throw error
    10. Empty string → throw error
    11. Streak continuation across month boundary → works
    12. Streak continuation across year boundary → works
    13. Leap year handling (Feb 28/29) → works
    14. Multiple consecutive wins → streak increments correctly
    15. Win after loss → streak = 1
  Success: All tests pass, 100% code coverage for calculation module
  Time: 1 hour
  ```

### Backend Schema & Mutations

- [x] **Update Convex schema to add lastCompletedDate field** ✅

  ```
  Files: convex/schema.ts:50 (MODIFIED)
  Commit: feat(backend): add lastCompletedDate field to users schema
  Approach: Add field to users table, make it optional for backwards compatibility
  Changes:
    Line 48 (after longestStreak): Add `lastCompletedDate: v.optional(v.string()),`
  Success:
    - Schema update accepted by Convex
    - `npx convex dev` runs without errors
    - Existing user records unaffected (field is optional)
    - Type generation includes new field
  Test: Manual verification in Convex dashboard, no data loss
  Time: 15 minutes
  ```

- [x] **Update submitGuess mutation to calculate and persist streaks** ✅

  ````
  Files: convex/puzzles.ts:359,380,422-453 (MODIFIED - added updateUserStreak helper)
  Commit: feat(backend): add streak updates to submitGuess mutation
  Approach: Add streak logic after successful guess, before returning
  Module Responsibility: Persist streak updates when puzzle completed correctly
  Changes:
    1. Import calculateStreak from convex/lib/streakCalculation
    2. After setting completedAt (line ~357), add streak logic:
       - Fetch user: `const user = await ctx.db.get(args.userId)`
       - Get today's date: `const today = getUTCDateString()`
       - Calculate new streak: `const { currentStreak, lastCompletedDate } = calculateStreak(user.lastCompletedDate, today, isCorrect)`
       - Update user record:
         ```typescript
         await ctx.db.patch(args.userId, {
           currentStreak,
           lastCompletedDate,
           longestStreak: Math.max(currentStreak, user.longestStreak),
           updatedAt: Date.now(),
         });
         ```
    3. Only update streaks when isCorrect === true (winning updates streak)
  Success:
    - Mutation compiles without errors
    - Winning a puzzle updates currentStreak, lastCompletedDate, longestStreak
    - Losing a puzzle resets currentStreak to 0
    - Consecutive day wins increment streak
    - Same-day completion doesn't change streak
    - Manual test in Convex dashboard shows correct values
  Test: Integration test with test data (see test strategy)
  Time: 1.5 hours
  ````

- [x] **Add mergeAnonymousStreak mutation to users.ts** ✅

  ````
  Files: convex/users.ts:417-498 (CREATED new mutation)
  Commit: feat(backend): add mergeAnonymousStreak mutation
  Approach: Follow pattern of existing mutations (getOrCreateCurrentUser, mergeAnonymousState)
  Module Interface:
    - Input: { anonymousStreak: number, anonymousLastCompletedDate: string }
    - Output: { mergedStreak: number, source: 'anonymous' | 'server' | 'combined' }
  Module Responsibility: Merge anonymous and server streaks with "best of both" logic
  Hidden Complexity: Date comparison to determine if streaks can be combined
  Merge Logic:
    1. If anonymous lastCompletedDate continues server streak → add them
    2. Else → take max(anonymous streak, server streak)
    3. Update lastCompletedDate to most recent of the two
  Code Structure:
    ```typescript
    export const mergeAnonymousStreak = mutation({
      args: {
        anonymousStreak: v.number(),
        anonymousLastCompletedDate: v.string(),
      },
      handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await getOrCreateUser(ctx, identity);

        // Import and use isConsecutiveDay from streakCalculation
        const canCombine = args.anonymousLastCompletedDate && user.lastCompletedDate
          && isConsecutiveDay(user.lastCompletedDate, args.anonymousLastCompletedDate);

        let mergedStreak: number;
        let source: string;

        if (canCombine) {
          mergedStreak = user.currentStreak + args.anonymousStreak;
          source = 'combined';
        } else {
          mergedStreak = Math.max(user.currentStreak, args.anonymousStreak);
          source = mergedStreak === args.anonymousStreak ? 'anonymous' : 'server';
        }

        await ctx.db.patch(user._id, {
          currentStreak: mergedStreak,
          longestStreak: Math.max(mergedStreak, user.longestStreak),
          lastCompletedDate: args.anonymousLastCompletedDate || user.lastCompletedDate,
          updatedAt: Date.now(),
        });

        return { mergedStreak, source };
      },
    });
  ````

  Success:

  - Mutation compiles and type-checks
  - Correctly combines consecutive streaks
  - Takes max for non-consecutive streaks
  - Updates longestStreak if new merged value exceeds it
  - Returns merge result for client logging
    Test: Unit test with mock data (anonymous=5 + server=3 consecutive → 8)
    Time: 1 hour

  ```

  ```

---

## Phase 2: Frontend Refactor ✅ COMPLETED

### Storage Infrastructure

- [x] **Add anonymous streak storage schema to secureStorage.ts** ✅

  ````
  Files: src/lib/secureStorage.ts:353-368 (MODIFIED - added schema and export)
  Commit: feat(frontend): add anonymous streak storage schema
  Approach: Follow pattern for gameStateStorage and themeStorage
  Schema Definition:
    ```typescript
    const anonymousStreakSchema = z.object({
      currentStreak: z.number().int().min(0).max(10000),
      lastCompletedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date format
    });

    export const anonymousStreakStorage = createSecureStorage(
      "chrondle-anonymous-streak",
      anonymousStreakSchema,
      { currentStreak: 0, lastCompletedDate: "" }
    );
  ````

  Success:

  - Storage compiles with correct types
  - get() returns typed streak data
  - set() validates before writing
  - Invalid data throws validation error
    Test: Unit test for storage validation (invalid date format rejected)
    Time: 30 minutes

  ```

  ```

### Core Hook Refactor

- [x] **Refactor useStreak hook for dual-mode operation** ✅

  ````
  Files: src/hooks/useStreak.ts (REWRITTEN - 209 lines)
  Commit: refactor(frontend): complete useStreak dual-mode implementation
  Approach: Fork logic based on auth state, leverage existing patterns
  Module Interface (unchanged):
    - useStreak(): { streakData: StreakData, updateStreak: (hasWon: boolean) => void, ... }
  Module Responsibility: Provide streak data and update mechanism for both auth states
  Hidden Complexity:
    - Convex query subscription management
    - localStorage sync with React state
    - Optimistic updates with rollback
    - Anonymous-to-auth migration trigger

  New Implementation Structure:
    ```typescript
    export function useStreak(): UseStreakReturn {
      const { userId } = useAuth(); // Clerk auth hook
      const user = useQuery(api.users.getCurrentUser); // Convex query
      const mergeStreakMutation = useMutation(api.users.mergeAnonymousStreak);

      // Track if we've already migrated this session
      const [hasMigrated, setHasMigrated] = useState(false);

      // Anonymous mode: localStorage
      const [anonymousStreak, setAnonymousStreak] = useState(() => {
        if (typeof window === 'undefined') return { currentStreak: 0, lastCompletedDate: '' };
        return anonymousStreakStorage.get();
      });

      // Authenticated mode: Convex user record
      const streakData = useMemo(() => {
        if (userId && user) {
          return {
            currentStreak: user.currentStreak,
            longestStreak: user.longestStreak,
            lastCompletedDate: user.lastCompletedDate || '',
            // ... other fields
          };
        }
        return {
          currentStreak: anonymousStreak.currentStreak,
          longestStreak: anonymousStreak.currentStreak, // No history for anon
          lastCompletedDate: anonymousStreak.lastCompletedDate,
          // ... other fields
        };
      }, [userId, user, anonymousStreak]);

      // Update function routes to correct persistence
      const updateStreak = useCallback((hasWon: boolean) => {
        if (userId && user) {
          // Authenticated: streak is updated by submitGuess mutation
          // This is a no-op - the mutation already handled it
          // Just optimistically update local state
          // (Real implementation will be more sophisticated)
        } else {
          // Anonymous: calculate and save to localStorage
          const today = getUTCDateString();
          const result = calculateStreak(anonymousStreak.lastCompletedDate, today, hasWon);
          setAnonymousStreak(result);
          anonymousStreakStorage.set(result);
        }
      }, [userId, user, anonymousStreak]);

      // Trigger migration on auth state change
      useEffect(() => {
        if (userId && !hasMigrated && anonymousStreak.currentStreak > 0) {
          mergeStreakMutation({
            anonymousStreak: anonymousStreak.currentStreak,
            anonymousLastCompletedDate: anonymousStreak.lastCompletedDate,
          }).then(() => {
            anonymousStreakStorage.clear();
            setHasMigrated(true);
          });
        }
      }, [userId, hasMigrated, anonymousStreak, mergeStreakMutation]);

      return { streakData, updateStreak, ... };
    }
  ````

  Success:

  - Hook compiles with correct types
  - Authenticated users see streak from Convex
  - Anonymous users see streak from localStorage
  - Page refresh preserves streaks for both modes
  - Sign-in triggers migration automatically
    Test: Unit tests with mocked auth states (see test strategy)
    Time: 2.5 hours

  ```

  ```

- [x] **Write comprehensive tests for refactored useStreak** ✅
  ```
  Files: src/hooks/__tests__/useStreak.test.tsx (CREATED - 471 lines, 15 tests)
  Commit: test(frontend): add comprehensive tests for refactored useStreak hook
  Approach: Follow pattern in src/hooks/data/__tests__/useLocalSession.test.tsx
  Test Cases:
    1. Anonymous user - returns localStorage streak
    2. Anonymous user - updateStreak persists to localStorage
    3. Anonymous user - page refresh preserves streak
    4. Authenticated user - returns Convex streak
    5. Authenticated user - updateStreak is no-op (mutation handles it)
    6. Auth transition - triggers mergeStreakMutation
    7. Auth transition - clears localStorage after merge
    8. Auth transition - doesn't migrate if anonymous streak is 0
    9. Auth transition - doesn't migrate twice
    10. Merge consecutive streaks (anon yesterday, server day before)
    11. Merge non-consecutive streaks (take max)
  Success: All tests pass, 90%+ coverage
  Time: 1.5 hours
  ```

### Integration Points

- [x] **Verify GameIsland streak update flow** ✅
  ```
  Files: src/components/GameIsland.tsx:148-151 (VERIFIED - added documentation)
  Commit: docs(frontend): document GameIsland streak update flow
  Approach: Minimal changes - verify handleGameOver calls updateStreak correctly
  Verification:
    - Line 147: updateStreak(won) is called after game completion
    - Authenticated users: streak updated by submitGuess mutation (backend)
    - Anonymous users: streak updated by useStreak hook (localStorage)
    - No duplicate streak updates
  Changes Needed: None expected, but add logging for debugging
  Success:
    - Completing puzzle updates streak (verify in UI)
    - Refreshing page shows correct streak
    - Sign-in preserves/merges streak correctly
  Test: Manual E2E testing in dev environment
  Time: 30 minutes
  ```

---

## Phase 3: Historical Migration

### Streak Restoration

- [ ] **Create streak restoration migration script**

  ````
  Files: convex/migrations/restoreStreaks.ts (NEW)
  Approach: Follow pattern in convex/migrations/generateMissingContext.ts
  Module Responsibility: One-time migration to restore streaks from play history
  Hidden Complexity: Calculating consecutive days from arbitrary play dates

  Algorithm:
    1. Query all users where currentStreak === 0
    2. For each user:
       - Query plays table by userId, ordered by completedAt DESC
       - Filter to only completed plays (completedAt !== null)
       - Convert completedAt timestamps to UTC date strings
       - Walk backwards from most recent, counting consecutive days
       - Stop when gap > 1 day found
       - Update user record with calculated streak and lastCompletedDate
    3. Log results: { totalUsers, restored, unchanged, errors }

  Code Structure:
    ```typescript
    export const restoreUserStreaks = internalMutation({
      handler: async (ctx) => {
        const users = await ctx.db.query("users")
          .filter(q => q.eq(q.field("currentStreak"), 0))
          .collect();

        let restored = 0;
        let errors = 0;

        for (const user of users) {
          try {
            const plays = await ctx.db.query("plays")
              .withIndex("by_user", q => q.eq("userId", user._id))
              .filter(q => q.neq(q.field("completedAt"), null))
              .order("desc")
              .collect();

            if (plays.length === 0) continue;

            // Calculate streak from play history
            const { streak, lastDate } = calculateStreakFromPlays(plays);

            if (streak > 0) {
              await ctx.db.patch(user._id, {
                currentStreak: streak,
                lastCompletedDate: lastDate,
                longestStreak: Math.max(streak, user.longestStreak),
                updatedAt: Date.now(),
              });
              restored++;
            }
          } catch (error) {
            console.error(`Failed to restore streak for user ${user._id}:`, error);
            errors++;
          }
        }

        return { totalUsers: users.length, restored, unchanged: users.length - restored - errors, errors };
      },
    });

    function calculateStreakFromPlays(plays: Play[]): { streak: number, lastDate: string } {
      // Convert timestamps to dates, find consecutive sequence
      // Return longest current streak (must include most recent play)
    }
  ````

  Success:

  - Migration compiles and runs without errors
  - Dry run in dev shows expected restoration counts
  - Restored streaks match manual calculation for sample users
  - No users have streaks > their total completed plays
    Test: Dry run + manual verification of 10+ sample users
    Time: 2 hours

  ```

  ```

- [ ] **Execute and validate migration**
  ```
  Files: convex/migrations/restoreStreaks.ts
  Approach: Run in dev first, then production during low-traffic window
  Execution Steps:
    1. Dev run: `npx convex run migrations:restoreStreaks --dev`
    2. Verify results in dev Convex dashboard
    3. Spot-check 20 random users manually
    4. Production run: `npx convex run migrations:restoreStreaks --prod`
    5. Monitor logs for errors
    6. Verify production dashboard
  Success:
    - >95% of users with play history have non-zero streaks
    - No data corruption (no negative streaks, no streaks > total plays)
    - Longest streaks make sense (no impossible values like 1000 days)
  Time: 1 hour
  ```

---

## Test Strategy

### Unit Tests (Pure Functions)

**Pattern**: `src/lib/__tests__/validation.unit.test.ts`

- `convex/lib/streakCalculation.ts`: 15+ test cases covering all edge cases
- `src/lib/secureStorage.ts`: Storage schema validation tests
- No mocks needed (pure functions with zero dependencies)

### Integration Tests (Hooks + Storage)

**Pattern**: `src/hooks/data/__tests__/useLocalSession.test.tsx`

- `src/hooks/useStreak.ts`: 10+ test cases with mocked auth and Convex
- Mock `useAuth()` to simulate authenticated/anonymous states
- Mock `useQuery(api.users.getCurrentUser)` for Convex data
- Mock `useMutation(api.users.mergeAnonymousStreak)` for migration
- Mock localStorage with `vi.spyOn(Storage.prototype, 'getItem')`

### Backend Tests (Mutations)

**Pattern**: Convex testing best practices

- Test `submitGuess` with test user and puzzle data
- Verify streak calculations by inspecting user record
- Test `mergeAnonymousStreak` with mock anonymous data
- Use Convex test environment (not production data)

### Manual E2E Testing

**Critical User Flows**:

1. Anonymous play → complete puzzle → refresh → streak persists
2. Anonymous play → sign in → streak migrated
3. Authenticated play → complete puzzle → refresh → streak persists
4. Authenticated play → switch devices → streak syncs
5. Lose puzzle → streak resets to 0
6. Win puzzle daily for 3 days → streak = 3

---

## Design Iteration Checkpoints

**After Phase 1**:

- Review streak calculation module boundaries
- Verify backend mutations have clear, single responsibilities
- Check for coupling between submitGuess and streak logic
- Consider extracting user record updates to separate function if complex

**After Phase 2**:

- Review useStreak interface - is it too complex?
- Check if auth state branching creates shallow wrapper pattern
- Verify localStorage storage schema is sufficient
- Consider refactoring if migration logic becomes unwieldy

**After Phase 3**:

- Review migration script complexity
- Document any edge cases discovered during restoration
- Plan for future: should we keep restoration script or delete it?

---

## Module Boundaries Summary

**convex/lib/streakCalculation.ts** (Pure Logic)

- Interface: Date comparison and calculation functions
- Value: Hides UTC complexity, edge cases, date math
- No dependencies, 100% testable in isolation

**convex/puzzles.ts** (Persistence Layer)

- Interface: submitGuess mutation
- Value: Hides database update complexity
- Uses streak calculation module, owns user record updates

**src/hooks/useStreak.ts** (State Management)

- Interface: React hook returning streak data and update function
- Value: Hides auth state branching, migration, storage complexity
- Coordinates between Convex, localStorage, auth state

**src/lib/secureStorage.ts** (Storage Abstraction)

- Interface: Type-safe localStorage wrapper
- Value: Hides validation, security checks, error handling
- Reusable across all localStorage needs

---

## Acceptance Criteria

**Must Pass Before Merging**:

- [ ] All unit tests pass (`pnpm test:unit`)
- [ ] All integration tests pass (`pnpm test:integration`)
- [ ] TypeScript compiles with no errors (`pnpm type-check`)
- [ ] Linter passes with no errors (`pnpm lint`)
- [ ] Manual testing confirms all user flows work
- [ ] Convex schema update deployed successfully
- [ ] Migration script executed and validated

**User Acceptance**:

- [ ] Complete puzzle → streak increments
- [ ] Refresh page → streak persists
- [ ] Sign in → anonymous streak migrated
- [ ] Play on multiple devices → streak syncs
- [ ] Lose puzzle → streak resets to 0

---

**Estimated Total Time**: 12-14 hours across 2-3 days
**Critical Path**: Phase 1 → Phase 2 → Phase 3 (linear dependencies)
**Parallel Opportunities**: Write tests while implementing (TDD style)

**Next Steps**: Start with Phase 1, Task 1 (streak calculation utility)

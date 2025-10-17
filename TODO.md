# TODO: Technical Debt Remediation

## Context

Source: TASK.md analysis across 8 technical debt items
Approach: Module-first decomposition prioritizing high-impact fixes
Testing Pattern: Follow existing test conventions in `src/lib/__tests__/`

## Phase 1: Critical Maintainability [High Impact, Medium Effort]

### 1.1 Create Tests for enhancedFeedback.ts (314 lines, 0 tests)

**Impact**: 10/10 - Enables safe refactoring of complex conditional logic
**Effort**: 3h

- [x] Create test suite for proximity severity classification

  ```
  Files: NEW src/lib/__tests__/enhancedFeedback.test.ts
  Approach: Follow displayFormatting.test.ts pattern (describe/it structure)
  Test Coverage: Distance thresholds (0, 5, 10, 25, 50, 100, 500, 1000+)
  Success: All severity branches covered (perfect/excellent/good/okay/cold/frozen)
  Time: 45min
  Work Log:
  - Created comprehensive test suite with 53 tests covering all functionality
  - Tests verify proximity severity classification (perfect → frozen)
  - Tests verify BC/AD era transitions and boundary cases
  - Tests verify progressive improvement tracking (better/worse/same/neutral)
  - Tests verify encouragement message generation
  - Tests verify historical context hints
  - Tests verify message consistency and completeness
  - All 53 tests passing
  ```

- [x] Add tests for BC/AD era transitions and boundaries

  ```
  Files: src/lib/__tests__/enhancedFeedback.test.ts
  Test Coverage: BC→AD transitions, era boundary edge cases (year 0, -1, 1)
  Success: Era hint logic verified, no off-by-one errors
  Time: 30min
  ```

- [x] Test random message selection and consistency

  ```
  Files: src/lib/__tests__/enhancedFeedback.test.ts
  Test Coverage: Message randomization, encouragement text variations
  Success: All message paths exercised, no undefined returns
  Time: 30min
  ```

- [x] Test progressive improvement tracking logic

  ```
  Files: src/lib/__tests__/enhancedFeedback.test.ts
  Test Coverage: Better/worse/same/neutral detection, distance comparison
  Success: Improvement detection accurate across all scenarios
  Time: 45min
  ```

- [x] Test overlapping threshold edge cases
  ```
  Files: src/lib/__tests__/enhancedFeedback.test.ts
  Test Coverage: Boundary values (exactly 5, 10, 25, 50, 100, 500, 1000)
  Success: No ambiguous classifications, clear threshold behavior
  Time: 30min
  ```

### 1.2 Type-Enforce PuzzleType Business Rule

**Impact**: 10/10 - Prevents silent bugs from comment removal
**Effort**: 2h

- [ ] Create PuzzleType discriminated union in types

  ```
  Files: NEW src/types/puzzleType.ts
  Approach: Discriminated union { type: 'daily' | 'archive'; date: string }
  Success: Type compiles, clear distinction enforced at compile time
  Module: Self-documenting business rule through types
  Time: 30min
  ```

- [ ] Update Convex schema with puzzleType field

  ```
  Files: convex/schema.ts, convex/puzzles.ts
  Approach: Add puzzleType: v.union(v.literal("daily"), v.literal("archive"))
  Success: Schema compiles, migration path documented
  Time: 45min
  ```

- [ ] Refactor streak update logic to use type discrimination
  ```
  Files: convex/puzzles.ts:428-450
  Approach: Replace comment with type guard if (puzzle.type === 'daily')
  Success: Early return logic preserved, type-safe, self-documenting
  Time: 45min
  ```

### 1.3 Standardize Puzzle Terminology

**Impact**: 9/10 - Eliminates category of type confusion bugs
**Effort**: 3h

- [ ] Define canonical Puzzle interface with consistent naming

  ```
  Files: src/types/puzzle.ts
  Approach: Single source of truth - id: Id<"puzzles">, puzzleNumber: number, targetYear: number
  Success: Interface compiles, removes string|Id union confusion
  Module: Clear, non-overlapping field names
  Time: 30min
  ```

- [ ] Update all Puzzle references to use canonical interface

  ```
  Files: All files using Puzzle type (search: "interface Puzzle|type Puzzle")
  Approach: Replace puzzleId with id, year with targetYear
  Success: Type-check passes, no union confusion
  Time: 90min
  ```

- [ ] Remove legacy string union types
  ```
  Files: Search for "puzzleId.*string.*Id" patterns
  Approach: Delete deprecated types, update references
  Success: No legacy types remain, all usages migrated
  Time: 60min
  ```

## Phase 2: Code Quality & Organization [High Impact, Low-Medium Effort]

### 2.1 Split utils.ts Dumping Ground

**Impact**: 9/10 - Eliminates primary anti-pattern
**Effort**: 3h

- [ ] Create `src/lib/display/formatting.ts` module

  ```
  Files: NEW src/lib/display/formatting.ts, MOVE formatYear, formatCountdown
  Approach: Extract display formatting functions
  Success: Functions moved, imports updated, tests pass
  Module: Single responsibility (display formatting)
  Dependencies: None (pure functions)
  Time: 45min
  ```

- [ ] Create `src/lib/game/proximity.ts` module

  ```
  Files: NEW src/lib/game/proximity.ts, MOVE getGuessDirectionInfo, generateWordleBoxes
  Approach: Extract guess feedback logic
  Success: Functions moved, game logic centralized
  Module: Single responsibility (proximity feedback)
  Time: 45min
  ```

- [ ] Create `src/lib/sharing/generator.ts` module

  ```
  Files: NEW src/lib/sharing/generator.ts, MOVE generateShareText, generateEmojiTimeline
  Approach: Extract social sharing generation
  Success: Sharing logic isolated, clean imports
  Module: Single responsibility (share content)
  Dependencies: Import from game/proximity.ts
  Time: 45min
  ```

- [ ] Create `src/lib/game/statistics.ts` module

  ```
  Files: NEW src/lib/game/statistics.ts, MOVE calculateClosestGuess
  Approach: Extract stats calculation
  Success: Stats logic centralized
  Module: Single responsibility (game statistics)
  Time: 30min
  ```

- [ ] Create `src/lib/ui/streak-styling.ts` module
  ```
  Files: NEW src/lib/ui/streak-styling.ts, MOVE getStreakColorClasses
  Approach: Extract UI styling helpers
  Success: UI styling isolated from business logic
  Module: Single responsibility (UI styling)
  Time: 15min
  ```

### 2.2 Improve Function Naming & Documentation

**Impact**: 8/10 - Reduces developer confusion
**Effort**: 30min

- [ ] Rename mergeGuesses to reconcileGuessesWithPriority
  ```
  Files: src/lib/deriveGameState.ts:42-63
  Approach: Rename + add comprehensive JSDoc with examples
  Success: Name reflects actual behavior (dedup + priority + cap)
  Documentation: Note O(n²) complexity, explain server-first priority
  Time: 30min
  ```

### 2.3 Migrate console.log to Structured Logger

**Impact**: 8/10 - Clean console, structured logs
**Effort**: 3h

- [ ] Configure ESLint no-console rule with logger exceptions

  ```
  Files: eslint.config.mjs
  Approach: Enable no-console, allow logger.* methods
  Success: Lint fails on console.* usage
  Time: 15min
  ```

- [ ] Migrate 145 console.\* calls to logger usage

  ```
  Files: 40 files across src/ (see grep results)
  Approach: Replace console.log → logger.debug, console.error → logger.error
  Success: All console.* calls migrated, lint passes
  Pattern: console.log → logger.debug (development only)
          console.error → logger.error (always logged)
          console.warn → logger.warn
  Time: 2h 30min
  ```

- [ ] Verify no secrets in logger output
  ```
  Files: All migrated logger calls
  Approach: Audit logger.* calls for API keys, tokens
  Success: No sensitive data logged
  Time: 15min
  ```

## Phase 3: Performance & Future-Proofing [Medium Impact, Low Effort]

### 3.1 Optimize mergeGuesses from O(n²) to O(n)

**Impact**: 6/10 - Future-proofs for archive mode
**Effort**: 15min

- [x] Replace .includes() with Set for O(1) lookups
  ```
  Files: src/lib/deriveGameState.ts:42-63
  Approach: const serverSet = new Set(serverGuesses); if (!serverSet.has(guess))
  Success: O(n+m) linear complexity, tests pass unchanged
  Performance: 0.5ms → 0.05ms (~10x faster), scales to 100+ guesses
  Time: 15min
  Work Log:
  - Replaced .includes() with Set.has() for O(1) lookups
  - Added serverSet.add() to track session guesses and avoid duplicates
  - Updated JSDoc to document O(n+m) complexity
  - All 22 deriveGameState tests pass
  - Type-check passes
  ```

### 3.2 Remove Deprecated Functions

**Impact**: 6/10 - Reduces confusion, cleaner codebase
**Effort**: 1h

- [ ] Delete getDailyYear() placeholder function

  ```
  Files: src/lib/gameState.ts:51-65
  Approach: Remove function entirely, verify no references
  Success: Function deleted, no broken imports
  Time: 20min
  ```

- [ ] Delete initializePuzzle() deprecated logic

  ```
  Files: src/lib/gameState.ts:68-105
  Approach: Remove 30+ lines of dead code
  Success: Dead code removed, no production impact
  Time: 20min
  ```

- [ ] Add deprecation notes to CHANGELOG.md
  ```
  Files: CHANGELOG.md
  Approach: Document removed functions, migration path (use Convex)
  Success: Clear migration guide for any external consumers
  Time: 20min
  ```

## Quality Gates

**After each module/phase:**

- [ ] `pnpm type-check` passes - no type errors
- [ ] `pnpm lint` passes - no new warnings
- [ ] `pnpm test` passes - all tests green
- [ ] Module has single, clear responsibility

**Before marking complete:**

- [ ] All 8 TASK.md items addressed
- [ ] All tests green with improved coverage
- [ ] Build succeeds: `pnpm build`
- [ ] No deprecated code in production bundle
- [ ] Module boundaries clear and documented

## Success Criteria

- **Test Coverage**: enhancedFeedback.ts has 100% path coverage
- **Type Safety**: PuzzleType enforced at compile time, no runtime checks
- **Module Value**: Each new module has Functionality > Interface Complexity
- **Performance**: mergeGuesses O(n) linear, scales to 100+ guesses
- **Code Quality**: Zero console.\* calls, structured logging only
- **Maintainability**: Clear naming, documented business rules
- **Zero Regression**: All existing functionality preserved

## Time Estimate

**Total**: ~16h

**Phase 1** (Critical): ~8h

- enhancedFeedback tests: 3h
- PuzzleType enforcement: 2h
- Terminology standardization: 3h

**Phase 2** (Organization): ~7h

- utils.ts split: 3h
- Function naming: 30min
- Logger migration: 3h 30min

**Phase 3** (Performance): ~1h 15min

- mergeGuesses optimization: 15min
- Deprecated function removal: 1h

## Execution Strategy

**Recommended Order**:

1. Phase 1.1 (tests) - Enables safe refactoring
2. Phase 1.2 (PuzzleType) - Prevents bugs
3. Phase 3.1 (O(n) optimization) - Quick win
4. Phase 2.1 (utils.ts split) - Major cleanup
5. Phase 2.2 (naming) - Small polish
6. Phase 1.3 (terminology) - Large refactor
7. Phase 2.3 (logger migration) - Tedious but valuable
8. Phase 3.2 (deprecated removal) - Final cleanup

**Parallel Opportunities**:

- Phase 1.1 and Phase 3.1 can run in parallel (different files)
- Phase 2.1 modules can be created independently

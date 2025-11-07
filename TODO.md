# TODO: Chrondle Range Implementation

## Context

- **Architecture:** Modular Range-Based Game (DESIGN.md)
- **Key Pattern:** Pure functional state derivation (existing `useChrondle` → `useRangeGame`)
- **Core Principle:** Range IS Chrondle (not a mode toggle)
- **Migration Strategy:** Soft schema evolution (`guesses[]` + `ranges[]` coexist)

**Existing Patterns to Follow:**

- Test structure: `src/lib/__tests__/*.test.ts` pattern (vitest + @testing-library/react)
- Mutation structure: `convex/puzzles/mutations.ts` pattern (validation → update → stats)
- Hook composition: `src/hooks/useChrondle.ts` pattern (compose data sources → derive state)
- Component structure: `src/components/GuessInput.tsx` pattern (controlled component + validation)

**Key Files:**

- Architecture: `DESIGN.md`
- Schema: `convex/schema.ts`
- State derivation: `src/lib/deriveGameState.ts`
- Main hook: `src/hooks/useChrondle.ts`
- Mutations: `convex/puzzles/mutations.ts`

---

## Phase 1: Core Scoring & Hint Infrastructure (Parallel-Ready)

These tasks are independent and can be implemented concurrently.

- [x] **Task 1.1: Implement Scoring Module**

```
Files:
  - src/lib/scoring.ts (NEW)
  - src/lib/__tests__/scoring.test.ts (NEW)
  - src/types/range.ts (NEW - type definitions)

Architecture:
  Pure function module (DESIGN.md "Module: Scoring")
  Hides logarithmic complexity behind simple scoreRange() interface

Pseudocode: DESIGN.md section "Algorithm: Logarithmic Scoring"

Implementation:
  1. Create scoring.ts with SCORING_CONSTANTS and scoreRange()
     - Export constants: S=100, W_MAX=200, HINT_MULTIPLIERS=[1.0, 0.85, 0.7, 0.5]
     - Implement: width calc → validation → containment → log2 → multiply → floor
  2. Create range.ts types:
     - RangeGuess: { start, end, hintsUsed, score, timestamp }
     - RangeValue: [startYear, endYear]
     - ScoreResult: { score, contained, baseScore, width }
  3. Handle edge cases:
     - W <= 0: throw error
     - W > W_MAX: throw error
     - !contains: return 0
     - BC years: negative integers work naturally

Success Criteria:
  ✓ scoreRange(1969, 1969, 1969, 0, 0) === 766
  ✓ scoreRange(1967, 1971, 1969, 0, 0) === 533
  ✓ scoreRange(1969, 1969, 1969, 0, 2) === 536 (H2 multiplier)
  ✓ scoreRange(1900, 1950, 1969, 0, 0) === 0 (missed)
  ✓ Width > 200 throws error
  ✓ BC years work: scoreRange(-100, -50, -75, 0, 0) > 0

Test Strategy:
  - Unit tests (15 cases covering all branches)
  - Property tests (width ↓ = score ↑)
  - Edge cases (BC years, boundaries, tolerance)
  - Follow pattern: src/lib/__tests__/eraUtils.test.ts

Dependencies: None (pure function)
Time: 45min
```

```
Work Log:
- Implemented `scoreRange`/`scoreRangeDetailed` exactly as outlined in DESIGN; noted sample numbers in TODO/DESIGN assumed `log2(201/2) ≈ 7.66`, so tests assert the correct computed values (665/465/etc.).
- Added `range.ts` shared types plus comprehensive Vitest coverage (range validation, BC years, tolerance, monotonicity, metadata).
- Vitest currently fails to start because the sandbox lacks the optional `@rollup/rollup-darwin-x64` binary bundled with Rollup 4; documented the blocker in the summary.
```

---

- [ ] **Task 1.2: Implement Hint Generation Module**

```
Files:
  - src/lib/hintGeneration.ts (NEW)
  - src/lib/__tests__/hintGeneration.test.ts (NEW)

Architecture:
  Algorithmic hint generation (DESIGN.md "Module: Hints")
  No storage - derive from answer_year dynamically

Pseudocode: DESIGN.md section "Algorithm: Hint Generation"

Implementation:
  1. Create generateHints(answerYear: number) -> Hint[]
     - H1: Era bucket (if >= 1900 → "20th century", else branches)
     - H2: Coarse bracket (answerYear ± 25)
     - H3: Fine bracket (answerYear ± 10)
  2. BC year formatting:
     - Use existing formatYear() from src/lib/eraUtils.ts
     - Negative years → "X BC", positive → "X AD"
  3. Return array of 3 hints with level, content, multiplier

Success Criteria:
  ✓ generateHints(1969)[0].content === "20th century or later"
  ✓ H2 bracket is ±25 years (1944-1994)
  ✓ H3 bracket is ±10 years (1959-1979)
  ✓ Multipliers are [0.85, 0.70, 0.50]
  ✓ BC years formatted correctly: generateHints(-100)[1].content.includes("BC")
  ✓ Era buckets cover all ranges (Ancient → Contemporary)

Test Strategy:
  - 12 test cases (one per era bucket, bracket edge cases)
  - BC year formatting integration test
  - Follow pattern: src/lib/__tests__/formatYear.test.ts

Dependencies:
  - src/lib/eraUtils.ts (formatYear function)
Time: 30min
```

---

- [ ] **Task 1.3: Implement useHints Hook**

```
Files:
  - src/hooks/useHints.ts (NEW)
  - src/hooks/__tests__/useHints.test.ts (NEW)

Architecture:
  State management hook (DESIGN.md "Module: Hints")
  Encapsulates hint state + generation logic

Implementation:
  1. State management:
     - useState for hintsUsed (0-3)
     - useMemo for hints array (from generateHints)
     - useMemo for currentMultiplier (from HINT_MULTIPLIERS[hintsUsed])
  2. Actions:
     - takeHint(level): Validate sequential (can't take H3 before H2), update state
     - resetHints(): Set hintsUsed back to 0
  3. Derived state:
     - hints[i].revealed = (i < hintsUsed)

Success Criteria:
  ✓ Initial state: hintsUsed=0, currentMultiplier=1.0, all hints unrevealed
  ✓ takeHint(1) updates: hintsUsed=1, multiplier=0.85, hints[0].revealed=true
  ✓ Can't skip hints (takeHint(3) when hintsUsed=0 is no-op)
  ✓ resetHints() returns to initial state
  ✓ Hints regenerate when targetYear changes

Test Strategy:
  - renderHook from @testing-library/react
  - Test state transitions, idempotency, sequential enforcement
  - Follow pattern: src/hooks/__tests__/useStreak.test.tsx

Dependencies:
  - src/lib/hintGeneration.ts (generateHints)
  - src/lib/scoring.ts (HINT_MULTIPLIERS)
Time: 40min
```

---

## Phase 2: Convex Schema & Mutations (Backend)

These tasks modify the database layer and must be done sequentially.

- [ ] **Task 2.1: Extend Convex Schema for Ranges**

```
Files:
  - convex/schema.ts (MODIFY)

Architecture:
  Soft migration (DESIGN.md "Module: Migration")
  Add optional ranges[] field, keep guesses[] for backward compat

Implementation:
  1. Update plays table definition:
     - Add: ranges: v.optional(v.array(v.object({ ... })))
       - Fields: start, end, hintsUsed, score, timestamp (all v.number())
     - Keep: guesses: v.optional(v.array(v.number()))
     - Add: totalScore: v.optional(v.number())
  2. Schema changes are additive only (no deletions)
  3. Both fields optional to allow gradual migration

Success Criteria:
  ✓ Schema compiles: npx convex dev --once
  ✓ Existing queries still work (guesses field accessible)
  ✓ New queries can access ranges field
  ✓ TypeScript types regenerated in convex/_generated/

Test Strategy:
  - Deploy to dev environment
  - Verify existing plays table records unaffected
  - Insert test record with ranges field

Dependencies: None (additive schema change)
Time: 15min
```

---

- [ ] **Task 2.2: Implement submitRange Mutation**

```
Files:
  - convex/puzzles/mutations.ts (MODIFY)
  - convex/lib/migrationHelpers.ts (NEW)

Architecture:
  Server-side authoritative scoring (DESIGN.md "Core Algorithm: Range Submission")
  Follows existing submitGuess pattern

Pseudocode: DESIGN.md section "Core Algorithm: Range Submission Flow"

Implementation:
  1. Add submitRange mutation (similar to submitGuess):
     - Args: puzzleId, start, end, hintsUsed
     - Load puzzle to get targetYear
     - Call scoreRange() on server (import from shared scoring.ts)
     - Find/create play record (same pattern as submitGuess)
     - Append to ranges[] array
     - Update totalScore
  2. Create migrationHelpers.ts:
     - legacyGuessesToRanges(guesses: number[]): Range[]
       - Convert to degenerate ranges (start=end, hintsUsed=0, score=0)
     - normalizePlayData(play): NormalizedPlay
       - Handle both ranges and guesses formats
  3. Update existing queries (plays/queries.ts):
     - Modify getPlay to use normalizePlayData()
     - Support both data formats during transition

Success Criteria:
  ✓ submitRange mutation works: submit test range, verify DB update
  ✓ Score matches scoreRange() calculation
  ✓ totalScore accumulates correctly across multiple ranges
  ✓ Legacy guesses data still readable (normalizePlayData works)
  ✓ Can't submit after 6 attempts
  ✓ Puzzle stats update on win (first contained range)

Test Strategy:
  - Integration test in Convex test framework
  - Test legacy data conversion (create old-format play, read with new query)
  - Test score authority (client can't fake scores)

Dependencies:
  - Task 1.1 (scoring.ts must exist for import)
  - Task 2.1 (schema must have ranges field)
Time: 60min
```

---

## Phase 3: UI Components (Parallel after Phase 2)

These tasks build the frontend components and can be parallelized.

- [ ] **Task 3.1: Install Radix Slider Dependency**

```
Files:
  - package.json (MODIFY)

Implementation:
  1. Add Radix Slider package:
     pnpm add @radix-ui/react-slider
  2. Verify installation:
     grep "@radix-ui/react-slider" package.json

Success Criteria:
  ✓ Package in dependencies
  ✓ pnpm install succeeds
  ✓ Types available (@radix-ui/react-slider/dist/index.d.ts)

Dependencies: None
Time: 5min
```

---

- [ ] **Task 3.2: Implement RangeSlider Component**

```
Files:
  - src/components/game/RangeSlider.tsx (NEW)
  - src/components/game/__tests__/RangeSlider.test.tsx (NEW)

Architecture:
  Radix UI wrapper (DESIGN.md "Module: RangeInput")
  Hides Radix complexity, provides Chrondle-specific interface

Implementation:
  1. Wrap Radix Slider primitive:
     - Two thumbs (minStepsBetweenThumbs={1})
     - Props: min, max, value: [number, number], onChange, onCommit
     - Accessibility: aria-label on each thumb
  2. Styling:
     - Track: bg-muted, 2px height
     - Range: bg-primary
     - Thumbs: 24px circle, shadow-lg, focus ring
  3. Keyboard support (Radix provides):
     - Arrow keys: move handle
     - Page Up/Down: jump 10 years
     - Home/End: min/max bounds

Success Criteria:
  ✓ Renders two draggable thumbs
  ✓ onChange fires with [start, end] on drag
  ✓ onCommit fires on release
  ✓ Thumbs can't overlap (minStepsBetweenThumbs enforced)
  ✓ Keyboard navigation works
  ✓ Accessibility: screen reader announces "Start year" / "End year"

Test Strategy:
  - Render test (two thumbs visible)
  - Interaction test (fireEvent drag, check onChange called)
  - Keyboard test (fireEvent.keyDown arrow keys)
  - Follow pattern: src/components/__tests__/GuessInput.test.tsx

Dependencies:
  - Task 3.1 (Radix Slider package)
Time: 45min
```

---

- [ ] **Task 3.3: Implement RangePreview Component**

```
Files:
  - src/components/game/RangePreview.tsx (NEW)
  - src/components/game/__tests__/RangePreview.test.tsx (NEW)

Architecture:
  Display component (DESIGN.md "Module: RangeInput")
  Shows width, predicted score, current multiplier

Implementation:
  1. Props: start, end, width, predictedScore, multiplier
  2. Layout:
     - Year display: "1965 AD - 1975 AD" (use formatYear from eraUtils)
     - Width badge: "11 years"
     - Score preview: "~430 points" (with multiplier shown)
     - Multiplier indicator: "0.85×" (color-coded)
  3. Styling:
     - Use Card component (src/components/ui/Card.tsx pattern)
     - Badge component for width
     - Color-coded multiplier (green=1.0, yellow=0.85, orange=0.70, red=0.50)

Success Criteria:
  ✓ Displays BC/AD years correctly
  ✓ Width calculation matches (end - start + 1)
  ✓ Score updates when predictedScore prop changes
  ✓ Multiplier color matches hint level
  ✓ Accessible: ARIA labels for score/multiplier

Test Strategy:
  - Snapshot test for layout
  - BC year formatting test
  - Follow pattern: src/components/__tests__/CurrentHintCard.test.tsx

Dependencies:
  - src/lib/eraUtils.ts (formatYear)
Time: 30min
```

---

- [ ] **Task 3.4: Implement HintLadder Component**

```
Files:
  - src/components/game/HintLadder.tsx (NEW)
  - src/components/game/__tests__/HintLadder.test.tsx (NEW)

Architecture:
  Interactive hint UI (DESIGN.md "Module: Hints")
  Shows 3-tier ladder with progressive reveal

Implementation:
  1. Props: hints, hintsUsed, onHintTaken, currentMultiplier
  2. Render 3 buttons (one per hint level):
     - Level 1-3 labels with multiplier (e.g., "Hint 1 (0.85×)")
     - Show content if revealed (hints[i].revealed)
     - "Take hint to reveal" placeholder if not revealed
     - Disabled states:
       - isUsed: already taken (grayed out, show content)
       - isNext: can be taken (highlighted, clickable)
       - isFuture: can't skip (disabled, dimmed)
  3. Styling:
     - Use Button component (src/components/ui/button.tsx)
     - Stack vertically with gap
     - Visual hierarchy (H1→H2→H3 with increasing emphasis)

Success Criteria:
  ✓ Shows 3 hint buttons
  ✓ Can only take hints sequentially (H1 → H2 → H3)
  ✓ Taken hints show content, future hints show placeholder
  ✓ onClick fires onHintTaken(level)
  ✓ Current multiplier displayed prominently

Test Strategy:
  - Render test (3 buttons)
  - Click test (sequential enforcement)
  - Disabled state test (can't skip)
  - Follow pattern: src/components/__tests__/HintsDisplay.test.tsx

Dependencies:
  - src/lib/hintGeneration.ts (Hint type)
Time: 40min
```

---

- [ ] **Task 3.5: Implement RangeInput Composite Component**

```
Files:
  - src/components/game/RangeInput.tsx (NEW)
  - src/components/game/__tests__/RangeInput.integration.test.tsx (NEW)

Architecture:
  Composite component (DESIGN.md "Module: RangeInput")
  Composes RangeSlider + RangePreview + HintLadder + commit logic

Reference: DESIGN.md "Appendix: Complete RangeInput Component"

Implementation:
  1. State management:
     - useState for range: [number, number]
     - useHints hook for hint state
     - useDebouncedValue for score calculation (150ms debounce)
  2. Composition:
     - HintLadder (top): shows hints, onHintTaken updates hintsUsed
     - RangeSlider (middle): onChange updates range state
     - RangePreview (below slider): shows width, score preview, multiplier
     - Button (bottom): "Commit Range" (disabled if width > 200)
  3. Score preview:
     - Calculate on every range change (debounced)
     - Pass targetYear only for client preview (never reveals answer)
     - Update predictedScore state
  4. Commit flow:
     - Call onCommit({ start, end, hintsUsed })
     - Reset range to full width
     - Reset hints

Success Criteria:
  ✓ Full user flow works: drag slider → take hint → see score update → commit
  ✓ Score preview updates (debounced, no lag)
  ✓ Hint multiplier affects score preview
  ✓ Commit button disabled if width > 200
  ✓ BC/AD years display correctly
  ✓ Resets after commit

Test Strategy:
  - Integration test (full flow)
  - Follow pattern: src/components/__tests__/GuessInput.test.tsx
  - Mock onCommit prop, verify data structure

Dependencies:
  - Task 3.2 (RangeSlider)
  - Task 3.3 (RangePreview)
  - Task 3.4 (HintLadder)
  - Task 1.3 (useHints hook)
  - Task 1.1 (scoreRange)
Time: 60min
```

---

## Phase 4: Timeline Visualization

- [ ] **Task 4.1: Rewrite Timeline as RangeTimeline**

```
Files:
  - src/components/Timeline.tsx (DELETE)
  - src/components/RangeTimeline.tsx (NEW)
  - src/components/__tests__/RangeTimeline.test.tsx (NEW)

Architecture:
  SVG visualization (DESIGN.md "Module: Timeline")
  Horizontal bars replace point markers

Pseudocode: DESIGN.md section "Algorithm: Timeline Range Visualization"

Implementation:
  1. SVG setup:
     - ViewBox: 800×200
     - Timeline axis: horizontal line at y=100
     - Year markers: -5000 to current year
  2. Range bars:
     - Each range: rect element
     - X position: yearToX = (year - min) / (max - min) * 800
     - Width: yearToX(end) - yearToX(start)
     - Y position: stack vertically (20 + idx * 25)
     - Color: contained ? "green" : "red"
     - Opacity: 0.6
     - Score label: text centered on bar
  3. Answer marker (shown after completion):
     - Vertical dashed line at yearToX(targetYear)
     - Gold color (#ffd700)
     - Full height (0 to 200)
  4. Animations:
     - Framer Motion layout prop for bar positioning
     - Respect prefers-reduced-motion (useReducedMotion hook)

Success Criteria:
  ✓ Renders SVG with timeline axis
  ✓ Shows range bars (green if contained, red if missed)
  ✓ Stacks ranges vertically (no overlap)
  ✓ Answer marker appears only after game complete
  ✓ BC years render correctly (negative X positions)
  ✓ Smooth animations (60fps)
  ✓ Reduced motion mode disables animations

Test Strategy:
  - Render test (SVG elements present)
  - Data test (3 ranges → 3 rect elements)
  - Color test (contained=true → green fill)
  - Follow pattern: src/components/__tests__/GameLayout.test.tsx

Dependencies:
  - src/lib/animationConstants.ts (useReducedMotion)
  - motion (already installed)
Time: 60min
```

---

## Phase 5: State Management Integration

- [ ] **Task 5.1: Update deriveGameState for Ranges**

```
Files:
  - src/lib/deriveGameState.ts (MODIFY)
  - src/lib/__tests__/deriveGameState.unit.test.ts (MODIFY)
  - src/types/gameState.ts (MODIFY)

Architecture:
  Pure functional state derivation (DESIGN.md "Module: State Management")
  Add ranges[] support, keep backward compat

Implementation:
  1. Update GameState type:
     - Add: ranges: RangeGuess[]
     - Add: totalScore: number
     - Keep: guesses: number[] (for legacy data)
     - Add: remainingAttempts: number (6 - ranges.length)
  2. Update deriveGameState():
     - Extract ranges from progress or session
     - Calculate totalScore: ranges.reduce((sum, r) => sum + r.score, 0)
     - Determine completion: hasWon || ranges.length >= 6
     - Calculate remainingAttempts
  3. Backward compat:
     - If progress has guesses but not ranges, treat as legacy
     - Don't break existing game state for single-year mode

Success Criteria:
  ✓ GameState has ranges and totalScore fields
  ✓ deriveGameState handles ranges[] data
  ✓ totalScore calculated correctly
  ✓ remainingAttempts = 6 - ranges.length
  ✓ isComplete when ranges.length >= 6 or score > 0
  ✓ Legacy guesses[] data still works (doesn't crash)

Test Strategy:
  - Update existing tests in deriveGameState.unit.test.ts
  - Add range-specific test cases
  - Test legacy data handling

Dependencies:
  - Task 1.1 (RangeGuess type)
Time: 45min
```

---

- [ ] **Task 5.2: Rename useChrondle to useRangeGame**

```
Files:
  - src/hooks/useChrondle.ts → src/hooks/useRangeGame.ts (RENAME + MODIFY)
  - src/hooks/__tests__/useChrondle.race-condition.test.tsx → useRangeGame.test.tsx (RENAME)

Architecture:
  Hook composition (DESIGN.md "Module: State Management")
  Same pattern as useChrondle, new return type

Implementation:
  1. Rename file and export:
     - useChrondle → useRangeGame
     - UseChronldeReturn → UseRangeGameReturn
  2. No internal changes needed yet (pure rename)
  3. Update imports across codebase:
     - src/app/page.tsx
     - Any other files importing useChrondle
  4. Update tests to match new name

Success Criteria:
  ✓ File renamed: useRangeGame.ts exists
  ✓ Export renamed: useRangeGame function exported
  ✓ Tests pass with new name
  ✓ No references to useChrondle remain (grep confirms)
  ✓ Type-check passes: pnpm type-check

Test Strategy:
  - Rename test file
  - Update test imports
  - Verify all tests still pass (no logic changes)

Dependencies:
  - Task 5.1 (GameState updated)
Time: 20min
```

---

- [ ] **Task 5.3: Implement useGameActions for Ranges**

```
Files:
  - src/hooks/actions/useGameActions.ts (MODIFY)
  - src/hooks/actions/__tests__/useGameActions.test.ts (NEW)

Architecture:
  Action handlers (DESIGN.md "Core Algorithm: Range Submission Flow")
  Add submitRange action alongside submitGuess

Implementation:
  1. Add submitRange action:
     - Call convex submitRange mutation
     - Optimistic update: add predicted range to local state
     - Server reconciliation: update with authoritative score
     - Error handling: rollback optimistic update on failure
  2. Keep submitGuess for backward compat (legacy data)
  3. Update return type:
     - Add: submitRange: (range: RangeInput) => Promise<void>
     - Keep: submitGuess (for archive puzzles)

Success Criteria:
  ✓ submitRange mutation called with correct args
  ✓ Optimistic update shows immediately
  ✓ Server score reconciles client prediction
  ✓ Error handling works (rollback on failure)
  ✓ isSubmitting state prevents double-submit

Test Strategy:
  - Mock Convex mutation
  - Test optimistic update
  - Test reconciliation (predicted ≠ actual score)
  - Test error rollback

Dependencies:
  - Task 2.2 (submitRange mutation exists)
Time: 50min
```

---

## Phase 6: Main Game Integration

- [ ] **Task 6.1: Wire Up RangeInput in Main Game**

```
Files:
  - src/app/page.tsx (MODIFY)

Architecture:
  Main game flow (DESIGN.md "Data Flow")
  Replace GuessInput with RangeInput

Implementation:
  1. Replace GuessInput import with RangeInput
  2. Update component usage:
     - Change onGuess prop to onCommit
     - Pass targetYear for score preview (only during play, hide after complete)
     - Pass disabled={gameState.isComplete}
  3. Remove proximity feedback display (LastGuessDisplay)
  4. Replace Timeline with RangeTimeline
  5. Update GameComplete modal to show ranges instead of guesses

Success Criteria:
  ✓ Page compiles (no TypeScript errors)
  ✓ Range input renders
  ✓ Can commit range and see it in timeline
  ✓ Score updates in UI
  ✓ Game completes after 6 attempts or win
  ✓ No references to GuessInput or LastGuessDisplay

Test Strategy:
  - E2E test (full game flow)
  - Manual testing (dev environment)

Dependencies:
  - Task 3.5 (RangeInput)
  - Task 4.1 (RangeTimeline)
  - Task 5.3 (submitRange action)
Time: 40min
```

---

- [ ] **Task 6.2: Update GameComplete Modal for Ranges**

```
Files:
  - src/components/modals/GameComplete.tsx (MODIFY - if exists)
  - src/components/ui/ShareCard.tsx (MODIFY)

Architecture:
  Results display (DESIGN.md "Data Flow")
  Show ranges instead of single guesses

Implementation:
  1. Update props to accept ranges[] instead of guesses[]
  2. Display:
     - Each range as bar (mini-timeline preview)
     - Score per range
     - Total score prominently
     - "X/6 contained" summary
  3. Share card:
     - Visualize ranges as horizontal bars (no spoilers)
     - Show scores without revealing target year
     - Include hint indicators (H0, H1, H2, H3)

Success Criteria:
  ✓ Displays all ranges with scores
  ✓ Total score shown
  ✓ Share card generates correctly
  ✓ No target year revealed in share card
  ✓ Hint indicators visible

Test Strategy:
  - Snapshot test (share card appearance)
  - Mock data test (3 ranges → correct display)

Dependencies:
  - Task 4.1 (RangeTimeline component for preview)
Time: 45min
```

---

## Phase 7: Cleanup & Migration

- [ ] **Task 7.1: Delete Obsolete Components**

```
Files:
  - src/components/GuessInput.tsx (DELETE)
  - src/components/ui/LastGuessDisplay.tsx (DELETE)
  - src/lib/game/proximity.ts (DELETE)
  - src/lib/enhancedFeedback.ts (DELETE)
  - Associated test files (DELETE)

Rationale:
  Range IS Chrondle - no proximity feedback, no single-year input

Implementation:
  1. Verify no imports remain:
     grep -r "GuessInput" src/ (should be empty except RangeInput)
     grep -r "LastGuessDisplay" src/ (should be empty)
     grep -r "proximity" src/ (should be empty)
  2. Delete files
  3. Remove tests
  4. Update .gitignore if needed

Success Criteria:
  ✓ Files deleted
  ✓ No import errors: pnpm type-check
  ✓ Tests pass: pnpm test
  ✓ Git shows deletions: git status

Dependencies:
  - Task 6.1 (RangeInput fully integrated)
Time: 15min
```

---

- [ ] **Task 7.2: Add Migration Documentation**

```
Files:
  - convex/lib/MIGRATION.md (NEW)

Content:
  Document the 30-day migration plan:
  - Phase 1 (Days 1-7): Both fields coexist
  - Phase 2 (Days 8-30): Monitor usage, verify no guesses[] dependencies
  - Phase 3 (Day 30+): Run migration script, drop guesses field
  - Rollback plan if issues arise

Success Criteria:
  ✓ MIGRATION.md exists
  ✓ Covers all 3 phases
  ✓ Includes queries to check migration status
  ✓ Rollback plan documented

Dependencies: None
Time: 20min
```

---

## Success Criteria (Overall)

**Week 1 MVP:**

- ✓ Range input functional (dual-handle slider works)
- ✓ Scoring calculation correct (unit tests pass)
- ✓ Timeline shows ranges (not point markers)
- ✓ Hint system works (H1/H2/H3 generation)
- ✓ Basic game flow (commit, reveal, complete)

**Week 2 Launch:**

- ✓ Production deploy with zero downtime
- ✓ Legacy plays readable (no data loss)
- ✓ Performance budget met (60fps slider)
- ✓ Migration complete (both formats supported)
- ✓ All tests green: pnpm test
- ✓ Type-check passes: pnpm type-check

**Quality Gates:**

- 60fps slider performance (Chrome DevTools)
- <300ms range submission (server timing)
- 100% test coverage on scoring module
- Zero TypeScript errors
- All existing tests pass (no regressions)

---

## Design Iteration Checkpoints

**After Phase 3 (UI Components Complete):**

- Review component interfaces
- Extract any duplicate logic into shared utilities
- Verify module boundaries (RangeInput shouldn't know about Convex)

**After Phase 5 (State Management):**

- Review data flow (pure functional derivation working?)
- Check for emerging patterns (any repeated logic?)
- Performance profiling (any bottlenecks?)

**After Phase 6 (Integration):**

- User testing (range UX intuitive?)
- A/B test scoring formula if needed (adjust S/Wmax)
- Monitor hint usage patterns

---

## Automation Opportunities

- Script to validate scoring formula examples (golden test)
- Script to generate test data (random ranges with expected scores)
- Script to check migration status (query Convex for guesses vs ranges usage)
- Pre-commit hook to enforce test coverage on scoring.ts

---

## Non-Implementation Tasks (Not in TODO)

These are workflow/process tasks, not code:

- Running tests (that's validation, not implementation)
- Creating PR (that's git workflow)
- Deploying to production (that's ops)
- Writing CHANGELOG (that's documentation, not code)
- Code review (that's process)

These go in BACKLOG.md or issue tracker, NOT TODO.md.

---

## Summary

**Total Tasks:** 19 implementation tasks
**Estimated Time:** ~14 hours of focused coding
**Parallel Paths:**

- Phase 1: All 3 tasks parallel (scoring, hints, useHints)
- Phase 3: All 5 tasks parallel (after Phase 2 backend complete)

**Critical Path:**

1. Phase 1.1 (Scoring) → Phase 2.2 (submitRange) → Phase 3.5 (RangeInput) → Phase 6.1 (Integration)

**Next Step:** Check out feature branch and start with Phase 1 tasks (can all run in parallel).

```bash
git checkout -b feature/chrondle-range
```

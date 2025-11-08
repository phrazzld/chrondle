# CHRONDLE RANGE - ARCHITECTURAL DESIGN

**Version:** 1.0
**Date:** 2025-11-07
**Status:** Ready for Implementation
**Author:** Architecture Team
**Based on:** TASK.md (Chrondle 2.0: Range Overhaul Production PRD)

---

## Architecture Overview

**Selected Approach:** Modular Range-Based Game with Clean Module Boundaries

**Rationale:** Range guessing transforms Chrondle from binary (right/wrong) to strategic (precision/risk tradeoff). The architecture replaces single-year guessing with dual-handle ranges while preserving the core game loop and Convex integration. This is NOT a "mode" - it IS Chrondle evolved.

**Core Modules:**

- **RangeInput Module**: Dual-handle slider with real-time scoring preview
- **Scoring Module**: Logarithmic scoring calculation (client preview + server authority)
- **Hint Module**: Progressive 3-tier hint system with multiplier reduction
- **Timeline Module**: Horizontal range bar visualization (replaces point markers)
- **State Module**: Pure functional game state derivation with range-based guesses
- **Migration Module**: Zero-downtime schema evolution (legacy `guesses[]` → new `ranges[]`)

**Data Flow:**

```
User drags slider → RangeInput → Calculate score preview → Commit →
submitRange mutation → Server validates + scores → Update Convex →
Derive game state → Timeline visualizes ranges → Game complete → Share card
```

**Key Design Decisions:**

1. **Range IS Chrondle** (not a mode toggle): Delete proximity feedback, temperature emojis, single-year logic. No `if (mode === "range")` conditionals. One codebase, one game flow.

2. **Server-Side Scoring Authority**: Client calculates score preview for UX, server recalculates authoritatively to prevent tampering. Client score is optimistic; server score is canonical.

3. **Soft Schema Migration**: Add `ranges[]` field alongside `guesses[]` (both optional). Queries support both formats during transition. After 30 days, hard cutover to `ranges` only.

4. **Logarithmic Scoring Formula**: `Score = S * log2((Wmax + 1) / (W + 1)) * Hmult` where `W` = range width. Rewards narrowness exponentially, punishes spray-and-pray.

5. **Algorithmic Hints**: No hint storage - generate H1/H2/H3 dynamically from `answer_year`. Reduces schema complexity, ensures consistency.

---

## Module Design (Deep Dive)

### Module: RangeInput

**Responsibility:** Hide the complexity of dual-handle slider interaction, era conversion (BC/AD), and score preview calculation from the rest of the game.

**Public Interface:**

```typescript
// src/components/game/RangeInput.tsx
interface RangeInputProps {
  onCommit: (range: { start: number; end: number; hintsUsed: number }) => void;
  disabled: boolean;
  minYear?: number; // Default: -5000 (5000 BC)
  maxYear?: number; // Default: current year
  targetYear?: number; // For client-side score preview only (never reveals answer)
}

export function RangeInput(props: RangeInputProps): JSX.Element;
```

**Internal Implementation (hidden complexity):**

- Radix UI Slider primitive with `minStepsBetweenThumbs={1}` to prevent overlap
- BC/AD year display formatting (negative numbers → "44 BC")
- Real-time score calculation (debounced 150ms to prevent lag)
- Keyboard navigation (Arrow keys, Page Up/Down, Home/End)
- Touch gesture support (pinch to zoom, drag handles)
- Hint ladder integration (shows current multiplier)
- Width validation (1-200 years enforced)

**Dependencies:**

- Requires: `@radix-ui/react-slider`, `useHints` hook, `scoreRange` function
- Used by: Main game component (`src/app/page.tsx`)

**Data Structures:**

```typescript
type RangeValue = [startYear: number, endYear: number]; // Always [min, max]

interface RangeState {
  value: RangeValue;
  hintsUsed: 0 | 1 | 2 | 3;
  predictedScore: number; // Client-calculated preview
}
```

**Error Handling:**

- Width > Wmax → Show validation error, disable commit button
- Invalid year conversion → Log error, show generic message to user
- Slider drag failures → Gracefully degrade to text input fallback

---

### Module: Scoring

**Responsibility:** Encapsulate logarithmic scoring formula and ensure server-client consistency. Callers only know "narrow = high score, wide = low score, hints reduce score". They don't know the formula.

**Public Interface:**

```typescript
// src/lib/scoring.ts

export const SCORING_CONSTANTS = {
  S: 100, // Scale factor (points)
  W_MAX: 200, // Maximum range width (years)
  HINT_MULTIPLIERS: [1.0, 0.85, 0.7, 0.5] as const,
} as const;

/**
 * Calculate score for a range guess
 *
 * @param start - Start year (can be negative for BC)
 * @param end - End year (always >= start)
 * @param answer - Target year to guess
 * @param tolerance - Allowable fuzz (default 0, future-proofing)
 * @param hintsUsed - Number of hints taken (0-3)
 * @returns Integer score (0 if missed, > 0 if contained)
 */
export function scoreRange(
  start: number,
  end: number,
  answer: number,
  tolerance: number = 0,
  hintsUsed: 0 | 1 | 2 | 3,
): number;
```

**Internal Implementation:**

```typescript
function scoreRange(start, end, answer, tolerance, hintsUsed) {
  // 1. Calculate width
  const W = end - start + 1;

  // 2. Validation
  if (W <= 0 || W > SCORING_CONSTANTS.W_MAX) {
    throw new Error(`Invalid range width: ${W}`);
  }

  // 3. Containment check (with tolerance for fuzzy events)
  const contains = answer >= start - tolerance && answer <= end + tolerance;

  if (!contains) return 0;

  // 4. Logarithmic base score
  const base = SCORING_CONSTANTS.S * Math.log2((SCORING_CONSTANTS.W_MAX + 1) / (W + 1));

  // 5. Apply hint multiplier
  const hmult = SCORING_CONSTANTS.HINT_MULTIPLIERS[hintsUsed];

  return Math.floor(base * hmult);
}
```

**Dependencies:**

- Requires: None (pure function)
- Used by: `RangeInput` (preview), `convex/puzzles.ts:submitRange` (authority), tests

**Data Structures:**

```typescript
interface ScoreResult {
  score: number; // Final score (0 if missed)
  contained: boolean; // Did range contain target?
  baseScore: number; // Before hint multiplier (for debugging)
  width: number; // Range width in years
}
```

**Error Handling:**

- Invalid width → Throw error with descriptive message
- NaN inputs → Throw error immediately (fail fast)
- Server scoring mismatch → Log warning, use server score (authoritative)

---

### Module: Hints

**Responsibility:** Generate progressive hints algorithmically and manage hint state. Hide hint generation logic from UI - callers only know "take hint → multiplier reduces".

**Public Interface:**

```typescript
// src/hooks/useHints.ts

export interface Hint {
  level: 1 | 2 | 3;
  content: string; // Display text ("After 1900", "Between 1980-2010", etc.)
  multiplier: number; // 0.85, 0.70, or 0.50
  revealed: boolean; // Has user taken this hint?
}

export interface UseHintsReturn {
  hints: Hint[]; // All 3 hints
  hintsUsed: 0 | 1 | 2 | 3; // Number taken
  currentMultiplier: number; // Active multiplier
  takeHint: (level: 1 | 2 | 3) => void;
  resetHints: () => void;
}

export function useHints(targetYear: number): UseHintsReturn;
```

**Internal Implementation:**

```typescript
// src/lib/hintGeneration.ts

export function generateHints(answerYear: number): Hint[] {
  // H1: Era bucket (algorithmic, no storage needed)
  let h1Content: string;
  if (answerYear >= 1900) {
    h1Content = "20th century or later";
  } else if (answerYear >= 1700) {
    h1Content = "Modern era (1700-1900)";
  } else if (answerYear >= 1400) {
    h1Content = "Early Modern era (1400-1700)";
  } else if (answerYear >= 500) {
    h1Content = "Medieval period (500-1400)";
  } else if (answerYear >= 0) {
    h1Content = "Classical antiquity (0-500)";
  } else {
    h1Content = "Ancient history (before 0 AD)";
  }

  // H2: Coarse bracket (±25 years)
  const h2Content = `Between ${answerYear - 25} and ${answerYear + 25}`;

  // H3: Fine bracket (±10 years)
  const h3Content = `Between ${answerYear - 10} and ${answerYear + 10}`;

  return [
    { level: 1, content: h1Content, multiplier: 0.85 },
    { level: 2, content: h2Content, multiplier: 0.7 },
    { level: 3, content: h3Content, multiplier: 0.5 },
  ];
}
```

**Dependencies:**

- Requires: None (pure function for generation)
- Used by: `RangeInput`, `HintLadder` component

**Data Structures:**

```typescript
interface HintState {
  hints: Hint[];
  hintsUsed: 0 | 1 | 2 | 3;
  currentMultiplier: number;
}
```

**Error Handling:**

- Invalid hint level → Log error, no-op
- Hint already revealed → No-op (idempotent)
- Sequential enforcement → Can't take H3 before H2

---

### Module: Timeline

**Responsibility:** Visualize range guesses as horizontal bars on a temporal axis. Hide SVG rendering complexity and coordinate calculations from callers.

**Public Interface:**

```typescript
// src/components/RangeTimeline.tsx

interface Range {
  start: number;
  end: number;
  score: number;
  contained: boolean;
  hintsUsed: number;
}

interface RangeTimelineProps {
  ranges: Range[];
  targetYear: number;
  minYear?: number; // Default: -5000
  maxYear?: number; // Default: current year
  isComplete: boolean;
}

export function RangeTimeline(props: RangeTimelineProps): JSX.Element;
```

**Internal Implementation:**

- SVG-based visualization (800×200 viewBox, scales to container)
- Year-to-X coordinate mapping: `x = (year - min) / (max - min) * 800`
- Contained ranges: green bars (`fill="green"` opacity 0.6)
- Missed ranges: red bars (`fill="red"` opacity 0.6)
- Answer marker: gold dashed line (only shown after completion)
- Smooth layout animations (Framer Motion `layout` prop)
- BCE year support (negative X positions)

**Dependencies:**

- Requires: `motion` (Framer Motion), `ANIMATION_CONSTANTS`
- Used by: Main game component

**Data Structures:**

```typescript
interface TimelineState {
  ranges: VisualRange[];
  targetMarker: { visible: boolean; x: number };
  viewBox: { width: number; height: number };
}

interface VisualRange {
  x: number; // Start X coordinate
  width: number; // Bar width in SVG units
  y: number; // Y position (stacked vertically)
  color: string; // "green" | "red"
  score: number; // Display score on bar
}
```

**Error Handling:**

- Invalid year → Clamp to min/max bounds
- Empty ranges → Show empty state message
- SVG render failures → Fallback to text list

---

### Module: State Management

**Responsibility:** Derive game state from data sources using pure functional logic. Handle range-based guesses while preserving existing state derivation architecture.

**Public Interface:**

```typescript
// src/hooks/useRangeGame.ts (renamed from useChrondle)

export interface UseRangeGameReturn {
  gameState: GameState;
  submitRange: (range: { start: number; end: number; hintsUsed: number }) => Promise<void>;
  resetGame: () => void;
  isSubmitting: boolean;
}

export function useRangeGame(puzzleNumber?: number): UseRangeGameReturn;
```

**Internal Implementation:**

```typescript
// src/lib/deriveGameState.ts (modified)

interface RangeGuess {
  start: number;
  end: number;
  hintsUsed: 0 | 1 | 2 | 3;
  score: number;
  timestamp: number;
}

interface GameState {
  status: "loading" | "ready" | "playing" | "complete";
  puzzle: Puzzle | null;
  ranges: RangeGuess[];
  totalScore: number;
  remainingAttempts: number; // Max 6 attempts
  isComplete: boolean;
}

export function deriveGameState(dataSources: DataSources): GameState {
  // 1. Extract ranges from server progress or local session
  const ranges: RangeGuess[] = dataSources.progress?.ranges || dataSources.session?.ranges || [];

  // 2. Calculate total score
  const totalScore = ranges.reduce((sum, r) => sum + r.score, 0);

  // 3. Determine completion
  const hasWon = ranges.some((r) => r.score > 0);
  const maxAttempts = 6;
  const isComplete = hasWon || ranges.length >= maxAttempts;

  // 4. Calculate remaining attempts
  const remainingAttempts = Math.max(0, maxAttempts - ranges.length);

  // 5. Determine status
  let status: GameState["status"] = "loading";
  if (dataSources.puzzle.puzzle) {
    status = isComplete ? "complete" : ranges.length > 0 ? "playing" : "ready";
  }

  return {
    status,
    puzzle: dataSources.puzzle.puzzle,
    ranges,
    totalScore,
    remainingAttempts,
    isComplete,
  };
}
```

**Dependencies:**

- Requires: `usePuzzleData`, `useAuthState`, `useUserProgress`, `useLocalSession`
- Used by: Main game component

**Data Structures:**

```typescript
interface DataSources {
  puzzle: { puzzle: Puzzle | null; isLoading: boolean };
  auth: { userId: string | null; isAuthenticated: boolean };
  progress: { ranges?: RangeGuess[]; totalScore?: number };
  session: { ranges?: RangeGuess[]; localScore?: number };
}
```

**Error Handling:**

- Missing data sources → Return loading state
- Corrupted range data → Filter invalid ranges, log warning
- Score mismatch → Trust server score, discard client calculation

---

### Module: Migration

**Responsibility:** Enable zero-downtime transition from `guesses[]` to `ranges[]` without breaking existing user data.

**Public Interface:**

```typescript
// convex/lib/migrationHelpers.ts

/**
 * Convert legacy single-year guesses to range format
 * Used during transition period when old data exists
 */
export function legacyGuessesToRanges(guesses: number[]): Range[] {
  return guesses.map((year) => ({
    start: year,
    end: year, // Degenerate range (width = 1)
    hintsUsed: 0, // Old system had no hints
    score: 0, // Can't retro-calculate without target
    timestamp: Date.now(),
  }));
}

/**
 * Normalize play data to new format (supports both schemas)
 */
export function normalizePlayData(play: any): NormalizedPlay {
  if (play.ranges && play.ranges.length > 0) {
    // New format
    return {
      ranges: play.ranges,
      totalScore: play.totalScore || 0,
      format: "range",
    };
  } else if (play.guesses && play.guesses.length > 0) {
    // Legacy format
    return {
      ranges: legacyGuessesToRanges(play.guesses),
      totalScore: 0,
      format: "legacy",
    };
  } else {
    // Empty
    return {
      ranges: [],
      totalScore: 0,
      format: "empty",
    };
  }
}
```

**Internal Implementation:**

- Phase 1 (Day 1): Deploy schema with both `ranges` and `guesses` fields (both optional)
- Phase 2 (Days 2-7): Update mutations to write `ranges`, queries to read both
- Phase 3 (Days 8-30): Monitor usage, verify no queries depend on `guesses`
- Phase 4 (Day 30+): Run migration script, drop `guesses` field, delete helpers

**Dependencies:**

- Requires: Convex schema, existing `plays` table
- Used by: All play queries and mutations

**Data Structures:**

```typescript
// convex/schema.ts (evolved)

plays: defineTable({
  userId: v.id("users"),
  puzzleId: v.id("puzzles"),

  // NEW: Primary guess format
  ranges: v.optional(
    v.array(
      v.object({
        start: v.number(),
        end: v.number(),
        hintsUsed: v.number(),
        score: v.number(),
        timestamp: v.number(),
      }),
    ),
  ),

  // DEPRECATED: Legacy format (read-only after migration)
  guesses: v.optional(v.array(v.number())),

  totalScore: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  updatedAt: v.number(),
});
```

**Error Handling:**

- Missing fields → Treat as empty arrays
- Invalid range data → Skip corrupted entries, log to monitoring
- Migration failures → Rollback, investigate, retry with fixes

---

## Implementation Pseudocode

### Core Algorithm: Range Submission Flow

```pseudocode
function handleRangeCommit(start: number, end: number, hintsUsed: number):
  1. Client-side validation
     - Check width: 1 <= (end - start + 1) <= 200
     - Check order: start <= end
     - If invalid: show error, return early

  2. Optimistic UI update
     - predictedScore = scoreRange(start, end, puzzle.targetYear, 0, hintsUsed)
     - newRange = { start, end, hintsUsed, score: predictedScore, timestamp: now() }
     - updateLocalState(ranges: [...ranges, newRange])

  3. Server submission
     - result = await submitRange.mutate({
         puzzleId: puzzle.id,
         start,
         end,
         hintsUsed,
       })

  4. Server validation & scoring
     - puzzle = db.get(puzzleId)
     - authoritativeScore = scoreRange(start, end, puzzle.targetYear, 0, hintsUsed)
     - contained = authoritativeScore > 0

  5. Database persistence
     - existing = db.query("plays").find({ userId, puzzleId })
     - if existing:
         db.patch(existing._id, {
           ranges: [...existing.ranges, {
             start, end, hintsUsed,
             score: authoritativeScore,
             timestamp: now()
           }],
           totalScore: existing.totalScore + authoritativeScore,
           updatedAt: now(),
         })
     - else:
         db.insert("plays", {
           userId, puzzleId,
           ranges: [{ start, end, hintsUsed, score: authoritativeScore, timestamp: now() }],
           totalScore: authoritativeScore,
           updatedAt: now(),
         })

  6. Client reconciliation
     - If result.score !== predictedScore:
         log("Score mismatch", { predicted: predictedScore, actual: result.score })
         updateLocalState(ranges: ranges.map((r, idx) =>
           idx === ranges.length - 1 ? { ...r, score: result.score } : r
         ))

  7. Game completion check
     - hasWon = result.score > 0
     - maxAttempts = 6
     - isComplete = hasWon || ranges.length >= maxAttempts
     - if isComplete:
         showGameCompleteModal()
         trackAnalytics("game_complete", { score: totalScore, attempts: ranges.length })
```

---

### Algorithm: Logarithmic Scoring

```pseudocode
function scoreRange(start, end, answer, tolerance, hintsUsed):
  // Step 1: Calculate width
  W = end - start + 1

  // Step 2: Validate
  if W <= 0:
    throw Error("Start must be <= end")
  if W > W_MAX:
    throw Error("Range too wide (max 200 years)")

  // Step 3: Containment check (with tolerance)
  lowerBound = start - tolerance
  upperBound = end + tolerance
  contains = (answer >= lowerBound) AND (answer <= upperBound)

  if NOT contains:
    return 0

  // Step 4: Logarithmic base score
  base = S * log2((W_MAX + 1) / (W + 1))

  // Step 5: Apply hint multiplier
  multipliers = [1.0, 0.85, 0.7, 0.5]
  hmult = multipliers[hintsUsed]

  // Step 6: Floor to integer
  return floor(base * hmult)

// Example calculations:
// scoreRange(1969, 1969, 1969, 0, 0) = floor(100 * log2(201/2) * 1.0) = 766 points
// scoreRange(1965, 1975, 1969, 0, 2) = floor(100 * log2(201/11) * 0.7) = 301 points
// scoreRange(1900, 2000, 1969, 0, 0) = floor(100 * log2(201/101) * 1.0) = 100 points
// scoreRange(1900, 2000, 1800, 0, 0) = 0 points (missed)
```

---

### Algorithm: Hint Generation

```pseudocode
function generateHints(answerYear: number) -> Hint[]:
  hints = []

  // H1: Era bucket (coarse)
  if answerYear >= 1900:
    h1 = "20th century or later"
  else if answerYear >= 1700:
    h1 = "Modern era (1700-1900)"
  else if answerYear >= 1400:
    h1 = "Early Modern era (1400-1700)"
  else if answerYear >= 500:
    h1 = "Medieval period (500-1400)"
  else if answerYear >= 0:
    h1 = "Classical antiquity (0-500)"
  else:
    h1 = "Ancient history (before 0 AD)"

  hints.push({ level: 1, content: h1, multiplier: 0.85 })

  // H2: Coarse bracket (±25 years)
  h2Start = answerYear - 25
  h2End = answerYear + 25
  h2 = `Between ${formatYear(h2Start)} and ${formatYear(h2End)}`
  hints.push({ level: 2, content: h2, multiplier: 0.70 })

  // H3: Fine bracket (±10 years)
  h3Start = answerYear - 10
  h3End = answerYear + 10
  h3 = `Between ${formatYear(h3Start)} and ${formatYear(h3End)}`
  hints.push({ level: 3, content: h3, multiplier: 0.50 })

  return hints

function formatYear(year: number) -> string:
  if year < 0:
    return `${abs(year)} BC`
  else:
    return `${year} AD`
```

---

### Algorithm: Timeline Range Visualization

```pseudocode
function renderRangeTimeline(ranges: Range[], targetYear: number, isComplete: boolean):
  // SVG setup
  viewBox = { width: 800, height: 200 }
  minYear = -5000
  maxYear = currentYear

  // Helper: Convert year to X coordinate
  function yearToX(year: number) -> number:
    return ((year - minYear) / (maxYear - minYear)) * viewBox.width

  // Render timeline axis
  renderLine(x1: 0, y1: 100, x2: 800, y2: 100, stroke: "currentColor", width: 2)

  // Render range bars (stacked vertically)
  for each range in ranges (indexed as idx):
    x1 = yearToX(range.start)
    x2 = yearToX(range.end)
    barWidth = x2 - x1
    y = 20 + (idx * 25)  // Stack ranges vertically

    // Determine color
    color = range.contained ? "green" : "red"
    opacity = 0.6

    // Render bar
    renderRect(
      x: x1,
      y: y,
      width: barWidth,
      height: 15,
      fill: color,
      opacity: opacity
    )

    // Render score label
    renderText(
      x: x1 + barWidth / 2,
      y: y + 12,
      text: range.score.toString(),
      anchor: "middle",
      fontSize: 10
    )

  // Render answer marker (only after completion)
  if isComplete:
    answerX = yearToX(targetYear)
    renderLine(
      x1: answerX,
      y1: 0,
      x2: answerX,
      y2: viewBox.height,
      stroke: "gold",
      width: 3,
      dashArray: "5,5"
    )
```

---

## File Organization

```
src/
├── components/
│   ├── game/
│   │   ├── RangeInput.tsx              # NEW: Main range input component
│   │   ├── RangeSlider.tsx             # NEW: Radix UI dual-handle slider wrapper
│   │   ├── RangePreview.tsx            # NEW: Width + score preview display
│   │   ├── HintLadder.tsx              # NEW: H1/H2/H3 button stack
│   │   ├── HintDisplay.tsx             # NEW: Expanded hint content card
│   │   ├── RangeTimeline.tsx           # REWRITE: Timeline.tsx for range bars
│   │   ├── ScoreDisplay.tsx            # NEW: Running total + per-range breakdown
│   │   └── GameComplete.tsx            # UPDATED: Range reveal modal
│   │
│   ├── ui/
│   │   ├── LastGuessDisplay.tsx        # DELETE: Obsolete with ranges
│   │   └── EraToggle.tsx               # KEEP: Still useful for BC/AD
│   │
│   └── GuessInput.tsx                  # DELETE: Replaced by RangeInput
│
├── hooks/
│   ├── useRangeGame.ts                 # RENAME: useChrondle → useRangeGame
│   ├── useRangeInput.ts                # NEW: Range slider state management
│   ├── useHints.ts                     # NEW: Hint state + generation
│   ├── useDebouncedScore.ts            # NEW: Real-time score preview
│   │
│   ├── actions/
│   │   └── useGameActions.ts           # UPDATE: submitRange replaces submitGuess
│   │
│   └── data/
│       └── useUserProgress.ts          # UPDATE: Handle ranges[] field
│
├── lib/
│   ├── scoring.ts                      # NEW: scoreRange() + constants
│   ├── rangeValidation.ts              # NEW: Zod schemas for ranges
│   ├── hintGeneration.ts               # NEW: Algorithmic hint generation
│   ├── deriveGameState.ts              # UPDATE: Handle range guesses
│   │
│   └── game/
│       └── proximity.ts                # DELETE: No more temperature feedback
│
├── types/
│   ├── gameState.ts                    # UPDATE: ranges[] instead of guesses[]
│   └── range.ts                        # NEW: Range type definitions
│
└── app/
    └── page.tsx                        # UPDATE: Wire up RangeInput

convex/
├── schema.ts                           # UPDATE: Add ranges[] field (soft migration)
├── puzzles.ts                          # UPDATE: Add submitRange mutation
├── puzzles/
│   └── mutations.ts                    # UPDATE: submitRange implementation
└── lib/
    └── migrationHelpers.ts             # NEW: Legacy conversion functions
```

**Modification to existing files:**

| File                                                | Changes                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `src/lib/deriveGameState.ts`                        | Add `ranges: RangeGuess[]` to GameState, handle range scoring      |
| `src/hooks/useChrondle.ts` → `useRangeGame.ts`      | Rename file, update to use `ranges` instead of `guesses`           |
| `src/hooks/actions/useGameActions.ts`               | Replace `submitGuess` with `submitRange`                           |
| `src/components/Timeline.tsx` → `RangeTimeline.tsx` | Complete rewrite for horizontal bars (not point markers)           |
| `convex/schema.ts`                                  | Add optional `ranges` field, keep `guesses` for migration          |
| `convex/puzzles.ts`                                 | Add `submitRange` mutation, keep `submitGuess` for backward compat |

---

## Integration Points

### Convex Database Schema

```typescript
// convex/schema.ts (evolved)

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables (events, puzzles, users) unchanged

  plays: defineTable({
    userId: v.id("users"),
    puzzleId: v.id("puzzles"),

    // NEW: Primary guess format (write-only after migration complete)
    ranges: v.optional(
      v.array(
        v.object({
          start: v.number(), // Integer year (negative = BC)
          end: v.number(), // Always >= start
          hintsUsed: v.number(), // 0 | 1 | 2 | 3
          score: v.number(), // Server-calculated
          timestamp: v.number(), // Unix timestamp
        }),
      ),
    ),

    // DEPRECATED: Legacy format (read-only, delete after 30 days)
    guesses: v.optional(v.array(v.number())),

    totalScore: v.optional(v.number()), // NEW: Sum of all range scores
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user_puzzle", ["userId", "puzzleId"])
    .index("by_user", ["userId"])
    .index("by_puzzle", ["puzzleId"]),
});
```

### Convex Mutations

```typescript
// convex/puzzles/mutations.ts

export const submitRange = mutation({
  args: {
    puzzleId: v.id("puzzles"),
    start: v.number(),
    end: v.number(),
    hintsUsed: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Load puzzle to get target year
    const puzzle = await ctx.db.get(args.puzzleId);
    if (!puzzle) throw new Error("Puzzle not found");

    // 2. Server-side authoritative scoring
    const score = scoreRange(
      args.start,
      args.end,
      puzzle.targetYear,
      0, // tolerance (default 0)
      args.hintsUsed as 0 | 1 | 2 | 3,
    );

    const contained = score > 0;

    // 3. Get user ID from auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 4. Find or create play record
    const existing = await ctx.db
      .query("plays")
      .withIndex("by_user_puzzle", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("puzzleId", args.puzzleId),
      )
      .first();

    if (existing) {
      // Append new range
      const newRanges = [
        ...(existing.ranges || []),
        {
          start: args.start,
          end: args.end,
          hintsUsed: args.hintsUsed,
          score,
          timestamp: Date.now(),
        },
      ];

      await ctx.db.patch(existing._id, {
        ranges: newRanges,
        totalScore: (existing.totalScore || 0) + score,
        updatedAt: Date.now(),
      });
    } else {
      // Create new play record
      await ctx.db.insert("plays", {
        userId: identity.tokenIdentifier,
        puzzleId: args.puzzleId,
        ranges: [
          {
            start: args.start,
            end: args.end,
            hintsUsed: args.hintsUsed,
            score,
            timestamp: Date.now(),
          },
        ],
        totalScore: score,
        updatedAt: Date.now(),
      });
    }

    // 5. Return result
    return { score, contained };
  },
});
```

### Convex Queries

```typescript
// convex/plays/queries.ts

export const getPlay = query({
  args: {
    userId: v.string(),
    puzzleId: v.id("puzzles"),
  },
  handler: async (ctx, args) => {
    const play = await ctx.db
      .query("plays")
      .withIndex("by_user_puzzle", (q) => q.eq("userId", args.userId).eq("puzzleId", args.puzzleId))
      .first();

    if (!play) return null;

    // Normalize to new format (support legacy data during migration)
    return {
      ...play,
      ranges: play.ranges || legacyGuessesToRanges(play.guesses || []),
      totalScore: play.totalScore || 0,
    };
  },
});

// Helper: Convert old guesses to range format
function legacyGuessesToRanges(guesses: number[]): Range[] {
  return guesses.map((year) => ({
    start: year,
    end: year, // Degenerate range (width = 1)
    hintsUsed: 0, // Old system had no hints
    score: 0, // Can't retro-calculate without target
    timestamp: Date.now(),
  }));
}
```

---

## State Management

### Client State

**React State (useRangeGame hook):**

```typescript
interface ClientState {
  // Derived from Convex queries
  puzzle: Puzzle | null;
  ranges: RangeGuess[];
  totalScore: number;
  isComplete: boolean;

  // Local ephemeral state
  currentRange: [number, number];
  hintsUsed: 0 | 1 | 2 | 3;
  predictedScore: number;
  isSubmitting: boolean;
}
```

**State Update Flow:**

1. User drags slider → `setCurrentRange([start, end])`
2. Debounced score calculation → `setPredictedScore(score)`
3. User takes hint → `setHintsUsed(hintsUsed + 1)`
4. User commits → Optimistic update → Server mutation → Reconcile

### Server State

**Convex Database:**

- `plays.ranges[]` - Persistent, authoritative
- `plays.totalScore` - Cached sum (recalculated on submit)
- `plays.completedAt` - Timestamp of game completion

**State Consistency:**

- Client score is **preview only**
- Server score is **authoritative**
- If mismatch: log warning, use server score

---

## Error Handling Strategy

### Error Categories

1. **Validation Errors (4xx):** User-facing, recoverable

   - Invalid range width → "Range must be 1-200 years"
   - Start > End → "Start year must be before end year"
   - Not authenticated → Redirect to sign-in

2. **Server Errors (5xx):** Log, show generic message

   - Database failures → "Something went wrong. Please try again."
   - Mutation timeouts → Retry with exponential backoff

3. **Race Conditions:** Handle gracefully

   - Multiple rapid submissions → Debounce, queue
   - Concurrent auth state changes → Cancel in-flight requests

4. **Data Corruption:** Defensive
   - Invalid range data → Filter out, log warning
   - Missing fields → Use sensible defaults

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: "VALIDATION_ERROR" | "SERVER_ERROR" | "AUTH_ERROR";
    message: string; // User-facing message
    details?: any; // Debug info (dev only)
  };
}
```

### Logging Strategy

```typescript
// Production logging (no console.log spam)
const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    if (process.env.NODE_ENV === "production") {
      // Send to monitoring service (Vercel Analytics)
    }
  },
  error: (message: string, error?: Error, meta?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, error, meta);
    // Send to error tracking (Sentry or similar)
  },
};

// Usage
logger.error("Range submission failed", error, {
  userId,
  puzzleId,
  range: { start, end },
});
```

---

## Testing Strategy

### Unit Tests (fast, isolated)

```typescript
// src/lib/__tests__/scoring.test.ts

describe("scoreRange", () => {
  test("perfect single-year range scores 766 points", () => {
    const score = scoreRange(1969, 1969, 1969, 0, 0);
    expect(score).toBe(766);
  });

  test("5-year range scores 533 points", () => {
    const score = scoreRange(1967, 1971, 1969, 0, 0);
    expect(score).toBe(533);
  });

  test("hint H2 reduces score by 30%", () => {
    const baseScore = scoreRange(1969, 1969, 1969, 0, 0); // 766
    const hintScore = scoreRange(1969, 1969, 1969, 0, 2); // H2
    expect(hintScore).toBe(Math.floor(baseScore * 0.7)); // 536
  });

  test("missed range scores 0", () => {
    const score = scoreRange(1900, 1950, 1969, 0, 0);
    expect(score).toBe(0);
  });

  test("invalid width throws error", () => {
    expect(() => scoreRange(1969, 1969, 1969, 0, 0, 201)).toThrow();
  });
});
```

```typescript
// src/lib/__tests__/hintGeneration.test.ts

describe("generateHints", () => {
  test("20th century event gets correct H1", () => {
    const hints = generateHints(1969);
    expect(hints[0].content).toBe("20th century or later");
  });

  test("H2 bracket is ±25 years", () => {
    const hints = generateHints(1969);
    expect(hints[1].content).toContain("1944");
    expect(hints[1].content).toContain("1994");
  });

  test("H3 bracket is ±10 years", () => {
    const hints = generateHints(1969);
    expect(hints[2].content).toContain("1959");
    expect(hints[2].content).toContain("1979");
  });

  test("multipliers are correct", () => {
    const hints = generateHints(1969);
    expect(hints[0].multiplier).toBe(0.85);
    expect(hints[1].multiplier).toBe(0.7);
    expect(hints[2].multiplier).toBe(0.5);
  });
});
```

### Integration Tests (slower, real dependencies)

```typescript
// src/components/game/__tests__/RangeInput.integration.test.tsx

describe("RangeInput integration", () => {
  test("full range submission flow", async () => {
    const onCommit = vi.fn();
    render(<RangeInput onCommit={onCommit} disabled={false} targetYear={1969} />);

    // 1. User drags slider
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: [1965, 1975] } });

    // 2. Score preview updates
    await waitFor(() => {
      expect(screen.getByText(/score:/i)).toHaveTextContent("430");
    });

    // 3. User takes hint
    const hintButton = screen.getByText(/hint 1/i);
    fireEvent.click(hintButton);

    // 4. Multiplier updates
    expect(screen.getByText(/0.85×/i)).toBeInTheDocument();

    // 5. User commits
    const commitButton = screen.getByText(/commit range/i);
    fireEvent.click(commitButton);

    // 6. Callback fired with correct data
    expect(onCommit).toHaveBeenCalledWith({
      start: 1965,
      end: 1975,
      hintsUsed: 1,
    });
  });
});
```

### E2E Tests (slowest, full stack)

```typescript
// e2e/range-game-flow.spec.ts (Playwright)

test("complete range game flow", async ({ page }) => {
  // 1. Load daily puzzle
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Chrondle");

  // 2. Set range
  const slider = page.locator('[role="slider"]');
  await slider.first().fill("1965");
  await slider.last().fill("1975");

  // 3. Take hint
  await page.click("text=Hint 1");
  await expect(page.locator("text=/0.85×/")).toBeVisible();

  // 4. Commit
  await page.click("text=Commit Range");

  // 5. Verify timeline shows range bar
  await expect(page.locator("svg rect[fill='green']")).toBeVisible();

  // 6. Verify score updates
  await expect(page.locator("text=/Total: \\d+ points/")).toBeVisible();
});
```

### Mocking Strategy

**Minimal mocking** - Heavy mocking indicates coupling problems

- Mock Convex mutations in component tests
- Use real scoring functions (they're pure, fast)
- Use real hint generation (algorithmic, no I/O)
- Mock only at integration boundaries (API calls, database)

---

## Performance Considerations

### Expected Load

- Daily active users: 10,000 (initial target)
- Peak concurrent users: 1,000
- Range submissions/day: 60,000 (6 attempts × 10k users)
- P95 response time target: 100ms (slider drag) → 300ms (range submit)

### Optimizations

1. **Slider Performance (60fps)**

   - Use CSS `transform` only (no layout thrashing)
   - Debounce score calculation (150ms)
   - `requestAnimationFrame` for smooth updates
   - Avoid re-renders during drag (controlled component)

2. **Scoring Calculation (<10ms)**

   - Pure function (no I/O)
   - Simple math (log2, multiplication)
   - Memoize if needed (unlikely bottleneck)

3. **Timeline Rendering (<33ms)**

   - SVG virtualization (only render visible bars)
   - Framer Motion `layout` animations (GPU-accelerated)
   - Memoize coordinate calculations

4. **Database Queries (<100ms)**
   - Indexed lookups (`by_user_puzzle` index)
   - Denormalized scores (pre-calculated)
   - Batch mutations (avoid N+1)

### Performance Budget

| Metric                 | Target       | Measurement                 |
| ---------------------- | ------------ | --------------------------- |
| Slider drag frame time | 16ms (60fps) | Chrome DevTools Performance |
| Score calculation      | <10ms        | `console.time()`            |
| Range submission       | <300ms       | Server-side timing          |
| Timeline render        | <33ms        | React DevTools Profiler     |
| Page load (TTI)        | <2s          | Lighthouse                  |

### Scaling Strategy

**Horizontal scaling** (stateless Next.js servers):

- Deploy behind Vercel Edge network
- Convex handles database scaling automatically
- No in-memory state (everything in Convex or client)

**Database scaling**:

- Convex automatically shards by user
- No manual optimization needed initially
- Monitor query performance in dashboard

---

## Security Considerations

### Threats Mitigated

1. **Score Tampering**

   - Client score is preview only
   - Server recalculates authoritatively
   - Signed puzzleId prevents replay attacks

2. **Brute Force Guessing**

   - 6 attempts max (enforced server-side)
   - No hints reveal exact answer
   - Hints are progressive (can't skip to H3)

3. **Data Injection**

   - Zod validation on all inputs
   - Convex schema enforces types
   - No raw SQL (Convex query builder)

4. **Puzzle Snooping**
   - Target year never sent to client until completion
   - Hints generated client-side (no API calls)
   - Puzzle selection is deterministic (no preview)

### Security Best Practices

- Never log sensitive data (userIds, authTokens)
- Validate all inputs server-side (don't trust client)
- Use Convex auth for all mutations
- Rate limit submissions (future: if abuse detected)
- Set security headers (CSP, HSTS, etc.) - Next.js defaults

---

## Alternative Architectures Considered

### Alternative A: Client-Side Scoring Only

**Approach:** Calculate scores entirely on client, send final scores to server.

**Pros:**

- Simpler backend (no scoring logic)
- Faster UX (no server round-trip)

**Cons:**

- **Cheating is trivial** (modify localStorage, browser devtools)
- No way to fix scoring bugs retroactively
- User scores can't be trusted for leaderboards

**Verdict:** ❌ **Rejected** - Security violation. Scores must be authoritative.

---

### Alternative B: Range Mode Toggle

**Approach:** Add "Classic" vs "Range" mode selector, maintain both codepaths.

**Pros:**

- Preserve existing gameplay
- A/B test easier
- Gradual rollout

**Cons:**

- **Doubles code complexity** (two game loops to maintain)
- Splits user base (leaderboards don't work)
- Proximity feedback conflicts with range scoring
- State management nightmare (which mode's data?)

**Verdict:** ❌ **Rejected** - Violates "Range IS Chrondle" principle. One game, one codebase.

---

### Alternative C: Wide Range Default (200 years)

**Approach:** Start users with a 200-year range, let them narrow it down.

**Pros:**

- Feels like "narrowing down" search
- First guess always contains target

**Cons:**

- **No decision pressure** (first guess always scores)
- Reduces strategic depth
- Feels like busywork (narrowing obvious range)
- Share cards less interesting (all green bars)

**Verdict:** ❌ **Rejected** - Removes skill expression. Players should start narrow and adjust based on hints.

---

### Alternative D: Pre-Generated Hints in Database

**Approach:** Store H1/H2/H3 hints as text fields in `puzzles` table.

**Pros:**

- More flexibility (editorial hints)
- Could add personality/flavor

**Cons:**

- **Increases schema complexity** (3 fields per puzzle)
- Manual curation required (slows content pipeline)
- Consistency issues (different curators, different styles)
- Harder to maintain (typos, outdated references)

**Verdict:** ❌ **Rejected** - Algorithmic hints are simpler, consistent, and maintainable. Save editorial hints for future "special events".

---

## Selected Architecture Justification

**Why the chosen architecture wins:**

1. **Simplicity** (40% weight):

   - Fewest concepts: ranges, hints, scores. No mode toggles, no proximity, no temperature.
   - Clear module boundaries: each module hides complexity behind simple interfaces.
   - Algorithmic hints: no database overhead, consistent generation.

2. **Module Depth** (30% weight):

   - `RangeInput`: Simple prop interface, hides Radix UI complexity, era conversion, keyboard handling.
   - `scoreRange`: Pure function, hides logarithmic math, trivial to test.
   - `useRangeGame`: Same contract as `useChrondle`, hides data source orchestration.

3. **Explicitness** (20% weight):

   - Server-side scoring: authority is explicit, client score is clearly labeled "preview".
   - Migration strategy: dual-field schema makes intent obvious.
   - Type safety: Zod + TypeScript strict mode catches errors at compile time.

4. **Robustness** (10% weight):
   - Zero-downtime migration: soft schema changes, gradual rollout.
   - Error boundaries: graceful degradation at component level.
   - Validation layers: client (UX) → server (security) → database (integrity).

This architecture **maximizes user value** (strategic gameplay) while **minimizing implementation complexity** (simple modules, clear interfaces). It's the sweet spot.

---

## Summary

**What We're Shipping:**

**Week 1 (Core Mechanics):**

- RangeInput with dual-handle slider (Radix UI)
- Hint system with 3-tier ladder (algorithmic)
- Logarithmic scoring (client + server)
- Timeline rewrite for range bars (SVG)

**Week 2 (Polish & Deploy):**

- Game flow integration (useRangeGame hook)
- Share card generation (range bars visualization)
- Schema migration (soft-deprecate guesses)
- Production deploy (zero downtime)

**Philosophy:**

- **One game** - Range IS Chrondle, not "range mode"
- **Zero compromises** - Delete legacy code, don't maintain parallel paths
- **Ship fast** - 2 weeks MVP to production
- **Measure success** - D7 retention ≥ baseline, 60fps slider, <500ms share

**Outcome:**
Chrondle evolves from binary guessing to strategic precision. Range width = skill expression. Scores = bragging rights. Hints = accessibility without removing challenge. **This is the game we should have built from day 1.**

---

**Next Step:** Run `/plan` to break this architecture into atomic implementation tasks, or start implementing modules in parallel (RangeInput, Scoring, Hints can all be built concurrently).

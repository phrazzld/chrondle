# CHRONDLE 2.0: RANGE OVERHAUL — PRODUCTION PRD

**Last updated:** 2025-11-07
**Status:** READY TO SHIP
**Timeline:** 2 weeks (MVP week 1, production week 2)
**Philosophy:** Ruthless simplicity. One game. Zero compromises.

---

## Executive Summary

**Problem:** Single-year point guessing is binary (right/wrong) with no skill expression. Players either get lucky or don't. Scores aren't comparable.

**Solution:** Range-based guessing with logarithmic scoring. Players set `[start_year, end_year]` ranges. Narrower ranges = higher scores. Hints reduce multiplier. 6 attempts to contain the target year.

**User Value:** Strategic depth (risk/reward on width), skill expression (precision matters), social comparison (scores are meaningful), hint system (helps struggling players without removing challenge).

**Success Criteria:** D7 retention ≥ baseline Classic, 60fps slider performance, <500ms share card generation, 2-week ship date.

---

## What Dies Today

### Code to DELETE

```bash
# Proximity feedback system (obsolete with range containment)
rm src/lib/game/proximity.ts
rm src/components/ui/LastGuessDisplay.tsx

# Temperature emoji system
git grep -l "🔥\|♨️\|❄️" | xargs sed -i '' '/🔥\|♨️\|❄️/d'

# Single-year input component (replaced by RangeInput)
rm src/components/GuessInput.tsx

# Point marker logic from Timeline
# (will rewrite Timeline.tsx for range bars)
```

### Concepts to KILL

- **"Classic mode"** - Range is the only mode. No mode toggles.
- **Proximity feedback** - "Warmer/colder" is noise. Containment is binary.
- **Temperature emojis** - Range bars are the visualization.
- **Point guessing** - Single year is degenerate range `[year, year]`.

---

## Architecture Decision: Range IS Chrondle

### Core Principle

Range guessing isn't a "new mode" - it's the **evolved form** of Chrondle. Single-year guessing was a prototype. This is the real game.

### Design Philosophy

1. **One codebase** - No `if (mode === "range")` conditionals
2. **One game flow** - No parallel paths or mode switching
3. **One scoring system** - Logarithmic always
4. **One migration path** - Soft-deprecate old data, hard-cutover to new format

### Module Boundaries

```
Data Layer (Convex)
├── plays.ranges[] - Primary guess format
├── plays.guesses[] - Legacy read-only (deleted after 30 days)
└── scoreRange() - Authoritative server-side calculation

State Layer (React)
├── useRangeGame() - Replaces useChrondle (same contract)
├── deriveGameState() - Same pure function, different guess type
└── useGameActions() - submitRange replaces submitGuess

UI Layer (Components)
├── RangeInput - Dual-handle slider + hints
├── RangeTimeline - Horizontal bars (not point markers)
└── ScoreDisplay - Running total + per-range breakdown
```

### Information Hiding

**What callers know:**

- Range guesses have `{ start, end, hintsUsed, score }`
- Score increases with narrower ranges
- Hints reduce multiplier

**What callers don't know:**

- Logarithmic formula details
- Server-side validation logic
- Legacy data conversion

**If these change, callers aren't affected.**

---

## Data Model: Clean Migration

### Convex Schema Evolution

```typescript
// convex/schema.ts

plays: defineTable({
  userId: v.id("users"),
  puzzleId: v.id("puzzles"),

  // NEW: Primary guess format (write-only after migration)
  ranges: v.array(
    v.object({
      start: v.number(), // Integer year (negative = BC)
      end: v.number(), // Always >= start
      hintsUsed: v.number(), // 0 | 1 | 2 | 3
      score: v.number(), // Server-calculated
      timestamp: v.number(), // Unix timestamp
    }),
  ),

  // DEPRECATED: Legacy format (read-only, delete after 30 days)
  guesses: v.optional(v.array(v.number())),

  totalScore: v.number(), // NEW: Sum of all range scores
  completedAt: v.optional(v.number()),
  updatedAt: v.number(),
})
  .index("by_user_puzzle", ["userId", "puzzleId"])
  .index("by_user", ["userId"])
  .index("by_puzzle", ["puzzleId"]);
```

### Migration Strategy (Zero Downtime)

**Phase 1: Deploy Schema (Day 1)**

```typescript
// Add `ranges` and `totalScore` fields (nullable initially)
// Keep `guesses` field (backward compat)
// Deploy to production - no code changes yet
```

**Phase 2: Update Mutations (Days 2-3)**

```typescript
// convex/puzzles.ts

export const submitRange = mutation({
  args: {
    puzzleId: v.id("puzzles"),
    start: v.number(),
    end: v.number(),
    hintsUsed: v.number(),
  },
  handler: async (ctx, args) => {
    // Calculate score server-side (authoritative)
    const puzzle = await ctx.db.get(args.puzzleId);
    if (!puzzle) throw new Error("Puzzle not found");

    const score = scoreRange(
      args.start,
      args.end,
      puzzle.targetYear,
      0, // tolerance (default 0 for now)
      args.hintsUsed as 0 | 1 | 2 | 3,
    );

    // Find existing play or create new
    const existing = await ctx.db
      .query("plays")
      .withIndex("by_user_puzzle", (q) =>
        q.eq("userId", ctx.auth.getUserIdentity()!.tokenIdentifier).eq("puzzleId", args.puzzleId),
      )
      .first();

    if (existing) {
      // Append new range
      await ctx.db.patch(existing._id, {
        ranges: [
          ...existing.ranges,
          {
            start: args.start,
            end: args.end,
            hintsUsed: args.hintsUsed,
            score,
            timestamp: Date.now(),
          },
        ],
        totalScore: existing.totalScore + score,
        updatedAt: Date.now(),
      });
    } else {
      // Create new play record
      await ctx.db.insert("plays", {
        userId: ctx.auth.getUserIdentity()!.tokenIdentifier,
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

    return { score, contained: score > 0 };
  },
});
```

**Phase 3: Update Queries (Days 4-7)**

```typescript
export const getPlay = query({
  args: { userId: v.string(), puzzleId: v.id("puzzles") },
  handler: async (ctx, args) => {
    const play = await ctx.db
      .query("plays")
      .withIndex("by_user_puzzle", (q) => q.eq("userId", args.userId).eq("puzzleId", args.puzzleId))
      .first();

    if (!play) return null;

    // Normalize to new format (support legacy data)
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

**Phase 4: Cleanup (Day 30)**

```typescript
// After 30 days of dual-format support:
// 1. Verify no queries read `guesses` field
// 2. Run data migration to backfill `ranges` for all old plays
// 3. Drop `guesses` field from schema
// 4. Delete legacyGuessesToRanges helper
```

### Why This Works

- **No downtime** - Schema changes are additive
- **Gradual rollout** - Old clients keep working during transition
- **Data preservation** - Old plays remain readable
- **Clean cutover** - After migration, legacy code is deleted

---

## Scoring System: Logarithmic Precision

### Formula (Immutable)

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
 * @param tolerance - Allowable fuzz (default 0)
 * @param hintsUsed - Number of hints taken (0-3)
 * @returns Integer score (0 if missed)
 */
export function scoreRange(
  start: number,
  end: number,
  answer: number,
  tolerance: number = 0,
  hintsUsed: 0 | 1 | 2 | 3,
): number {
  // Validate inputs
  const W = end - start + 1;
  if (W <= 0 || W > SCORING_CONSTANTS.W_MAX) {
    throw new Error(`Invalid range width: ${W} (must be 1-${SCORING_CONSTANTS.W_MAX})`);
  }

  // Containment check (with tolerance)
  const contains = answer >= start - tolerance && answer <= end + tolerance;

  if (!contains) return 0;

  // Logarithmic base score
  const base = SCORING_CONSTANTS.S * Math.log2((SCORING_CONSTANTS.W_MAX + 1) / (W + 1));

  // Apply hint multiplier
  const hmult = SCORING_CONSTANTS.HINT_MULTIPLIERS[hintsUsed];

  return Math.floor(base * hmult);
}
```

### Scoring Examples

| Range Width | Base Score | H0 (1.0×) | H1 (0.85×) | H2 (0.7×) | H3 (0.5×) |
| ----------- | ---------- | --------- | ---------- | --------- | --------- |
| 1 year      | 766        | 766       | 651        | 536       | 383       |
| 5 years     | 533        | 533       | 453        | 373       | 266       |
| 10 years    | 430        | 430       | 365        | 301       | 215       |
| 25 years    | 301        | 301       | 255        | 210       | 150       |
| 50 years    | 200        | 200       | 170        | 140       | 100       |
| 100 years   | 100        | 100       | 85         | 70        | 50        |
| 200 years   | 1          | 1         | 0          | 0         | 0         |

**Key Properties:**

- **Sharp rewards** - Going from 5y → 1y gains +233 points
- **Diminishing returns** - Going from 100y → 200y loses only ~99 points
- **Spray-and-pray punishment** - Max width barely scores

---

## Component Architecture

### File Structure

```
src/
├── components/
│   ├── game/
│   │   ├── RangeInput.tsx           # NEW: Dual-handle slider
│   │   ├── RangeSlider.tsx          # NEW: Radix UI wrapper
│   │   ├── RangePreview.tsx         # NEW: Width + score display
│   │   ├── HintLadder.tsx           # NEW: H1/H2/H3 buttons
│   │   ├── HintDisplay.tsx          # NEW: Expanded hint content
│   │   ├── RangeTimeline.tsx        # REWRITE: Bar visualization
│   │   ├── ScoreDisplay.tsx         # NEW: Running total
│   │   └── GameComplete.tsx         # UPDATED: Range reveals
│   │
│   ├── ui/
│   │   ├── LastGuessDisplay.tsx     # DELETE: Obsolete with ranges
│   │   └── EraToggle.tsx            # KEEP: Still useful for BC/AD
│   │
│   └── GuessInput.tsx               # DELETE: Replaced by RangeInput
│
├── hooks/
│   ├── useRangeGame.ts              # RENAME: useChrondle → useRangeGame
│   ├── useRangeInput.ts             # NEW: Range slider state
│   ├── useHints.ts                  # NEW: Hint state management
│   └── useDebouncedScore.ts         # NEW: Real-time score preview
│
├── lib/
│   ├── scoring.ts                   # NEW: scoreRange() + constants
│   ├── rangeValidation.ts           # NEW: Zod schemas
│   ├── hintGeneration.ts            # NEW: Algorithmic hints
│   ├── game/
│   │   └── proximity.ts             # DELETE: No more temperature feedback
│   │
│   └── deriveGameState.ts           # UPDATE: Handle range guesses
│
└── types/
    ├── gameState.ts                 # UPDATE: ranges[] instead of guesses[]
    └── range.ts                     # NEW: Range type definitions
```

### Component Hierarchy

```tsx
<ChronldePage>
  <GameHeader />

  {/* Hint system - first class citizen */}
  <HintsDisplay hints={currentHints} onHintTaken={handleHintTaken} />

  {/* Range input - replaces GuessInput */}
  <RangeInput onCommit={handleRangeCommit} disabled={isComplete} minYear={-5000} maxYear={2025}>
    <RangeSlider value={[startYear, endYear]} onChange={handleRangeChange} />
    <RangePreview width={width} predictedScore={debouncedScore} hintsUsed={hintsUsed} />
    <HintLadder
      onHintTaken={handleHintTaken}
      currentMultiplier={currentMultiplier}
      availableHints={availableHints}
    />
  </RangeInput>

  {/* Timeline - rewritten for range bars */}
  <RangeTimeline ranges={committedRanges} targetYear={puzzle.targetYear} isComplete={isComplete} />

  {/* Score display - running total */}
  <ScoreDisplay totalScore={totalScore} ranges={committedRanges} />

  {/* Game complete modal */}
  {isComplete && (
    <GameComplete
      ranges={committedRanges}
      targetYear={puzzle.targetYear}
      totalScore={totalScore}
      onShare={handleShare}
    />
  )}
</ChronldePage>
```

---

## Implementation Phases

### Phase 1: Core Mechanics (Week 1)

#### **Days 1-2: Range Input Component**

**Files to create:**

```
src/components/game/RangeSlider.tsx
src/components/game/RangePreview.tsx
src/components/game/RangeInput.tsx
src/hooks/useRangeInput.ts
src/lib/rangeValidation.ts
```

**RangeSlider.tsx** (Radix UI wrapper):

```typescript
import * as SliderPrimitive from '@radix-ui/react-slider';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onCommit?: (value: [number, number]) => void;
}

export function RangeSlider({ min, max, value, onChange, onCommit }: RangeSliderProps) {
  const handleChange = (vals: number[]) => {
    if (vals.length === 2) {
      onChange([vals[0], vals[1]]);
    }
  };

  const handleCommit = (vals: number[]) => {
    if (vals.length === 2) {
      onCommit?.([vals[0], vals[1]]);
    }
  };

  return (
    <SliderPrimitive.Root
      min={min}
      max={max}
      value={value}
      onValueChange={handleChange}
      onValueCommit={handleCommit}
      minStepsBetweenThumbs={1}
      className="relative flex w-full touch-none select-none items-center"
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>

      <SliderPrimitive.Thumb
        className="block h-6 w-6 rounded-full bg-primary shadow-lg focus:outline-none focus:ring-2"
        aria-label="Start year"
      />
      <SliderPrimitive.Thumb
        className="block h-6 w-6 rounded-full bg-primary shadow-lg focus:outline-none focus:ring-2"
        aria-label="End year"
      />
    </SliderPrimitive.Root>
  );
}
```

**Success criteria:**

- [ ] Dual-handle slider renders
- [ ] Both handles draggable independently
- [ ] Handles cannot overlap (minStepsBetweenThumbs enforced)
- [ ] BC/AD year display (negative numbers formatted as "44 BC")
- [ ] Keyboard navigation (Arrow keys, Page Up/Down, Home/End)
- [ ] 60fps performance during drag

---

#### **Days 3-4: Hint System**

**Files to create:**

```
src/components/game/HintLadder.tsx
src/components/game/HintDisplay.tsx
src/hooks/useHints.ts
src/lib/hintGeneration.ts
```

**hintGeneration.ts** (Algorithmic):

```typescript
export interface Hint {
  level: 1 | 2 | 3;
  content: string;
  multiplier: number;
}

export function generateHints(answerYear: number, allEvents?: Event[]): Hint[] {
  // H1: Era bucket
  let h1Content: string;
  if (answerYear >= 1900) {
    h1Content = "20th century or later";
  } else if (answerYear >= 1700) {
    h1Content = "Modern era (1700-1900)";
  } else if (answerYear >= 1400) {
    h1Content = "Early Modern era (1400-1700)";
  } else if (answerYear >= 500) {
    h1Content = "Medieval period (500-1400)";
  } else {
    h1Content = "Ancient history (before 500)";
  }

  // H2: Coarse bracket (±25 years)
  const h2Content = `Between ${answerYear - 25} and ${answerYear + 25}`;

  // H3: Fine bracket (±10 years) OR relative to another event
  let h3Content = `Between ${answerYear - 10} and ${answerYear + 10}`;

  // If other events available, try relative hint
  if (allEvents && allEvents.length > 1) {
    const nearby = allEvents.find(
      (e) =>
        e.year !== answerYear &&
        Math.abs(e.year - answerYear) >= 5 &&
        Math.abs(e.year - answerYear) <= 50,
    );

    if (nearby) {
      const direction = answerYear < nearby.year ? "Earlier" : "Later";
      h3Content = `${direction} than "${nearby.event.slice(0, 40)}..."`;
    }
  }

  return [
    { level: 1, content: h1Content, multiplier: 0.85 },
    { level: 2, content: h2Content, multiplier: 0.7 },
    { level: 3, content: h3Content, multiplier: 0.5 },
  ];
}
```

**HintLadder.tsx**:

```typescript
interface HintLadderProps {
  hints: Hint[];
  hintsUsed: number;
  onHintTaken: (level: number) => void;
  currentMultiplier: number;
}

export function HintLadder({ hints, hintsUsed, onHintTaken, currentMultiplier }: HintLadderProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">
        Current multiplier: {currentMultiplier.toFixed(2)}×
      </div>

      {hints.map((hint, idx) => {
        const level = idx + 1;
        const isUsed = hintsUsed >= level;
        const isNext = hintsUsed === level - 1;

        return (
          <button
            key={level}
            onClick={() => !isUsed && onHintTaken(level)}
            disabled={isUsed || !isNext}
            className={cn(
              "w-full p-3 rounded-md text-left transition-all",
              isUsed && "bg-muted opacity-50",
              isNext && "bg-primary/10 hover:bg-primary/20 cursor-pointer",
              !isNext && !isUsed && "opacity-30 cursor-not-allowed"
            )}
          >
            <div className="font-semibold">Hint {level} ({hint.multiplier}×)</div>
            {isUsed && <div className="text-sm mt-1">{hint.content}</div>}
            {!isUsed && <div className="text-sm text-muted-foreground">Take hint to reveal</div>}
          </button>
        );
      })}
    </div>
  );
}
```

**Success criteria:**

- [ ] 3 hints generated algorithmically
- [ ] Hints revealed sequentially (H1 → H2 → H3)
- [ ] Multiplier updates when hint taken
- [ ] Hint content clear and helpful
- [ ] Relative hints work (H3 references other events)

---

#### **Days 5-7: Timeline Rewrite + Scoring**

**Files to modify:**

```
src/components/Timeline.tsx (complete rewrite)
src/lib/scoring.ts (new file)
convex/puzzles.ts (submitRange mutation)
```

**RangeTimeline.tsx** (complete rewrite):

```typescript
interface Range {
  start: number;
  end: number;
  score: number;
  contained: boolean;
}

interface RangeTimelineProps {
  ranges: Range[];
  targetYear: number;
  minYear: number;
  maxYear: number;
  isComplete: boolean;
}

export function RangeTimeline({ ranges, targetYear, minYear, maxYear, isComplete }: RangeTimelineProps) {
  const width = 800; // SVG viewBox width
  const height = 200;

  const yearToX = (year: number) => {
    return ((year - minYear) / (maxYear - minYear)) * width;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Timeline axis */}
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeWidth="2" />

      {/* Range bars */}
      {ranges.map((range, idx) => {
        const x1 = yearToX(range.start);
        const x2 = yearToX(range.end);
        const y = 20 + (idx * 25);
        const barWidth = x2 - x1;

        return (
          <g key={idx}>
            {/* Range bar */}
            <rect
              x={x1}
              y={y}
              width={barWidth}
              height={15}
              fill={range.contained ? "green" : "red"}
              opacity={0.6}
            />

            {/* Score label */}
            <text x={x1 + barWidth / 2} y={y + 12} textAnchor="middle" fontSize="10">
              {range.score}
            </text>
          </g>
        );
      })}

      {/* Answer marker (shown after completion) */}
      {isComplete && (
        <line
          x1={yearToX(targetYear)}
          y1="0"
          x2={yearToX(targetYear)}
          y2={height}
          stroke="gold"
          strokeWidth="3"
          strokeDasharray="5,5"
        />
      )}
    </svg>
  );
}
```

**Success criteria:**

- [ ] Timeline shows horizontal bars (not points)
- [ ] Each range displayed with start/end/width
- [ ] Contained ranges green, missed ranges red
- [ ] Answer marker shown after completion
- [ ] Handles BCE years (negative X positions)
- [ ] Smooth animations (Framer Motion layout)

---

### Phase 2: Polish & Deploy (Week 2)

#### **Days 8-10: Game Flow**

**Files to modify:**

```
src/hooks/useChrondle.ts → useRangeGame.ts (rename + update)
src/lib/deriveGameState.ts (update for ranges)
src/pages/index.tsx (wire up RangeInput)
```

**useRangeGame.ts** (adapted from useChrondle):

```typescript
export function useRangeGame() {
  const puzzle = usePuzzleData();
  const auth = useAuthState();
  const progress = useUserProgress(auth.userId, puzzle?.id);

  const [localRanges, setLocalRanges] = useState<Range[]>([]);
  const [currentRange, setCurrentRange] = useState<[number, number]>([0, 2025]);
  const [hintsUsed, setHintsUsed] = useState(0);

  const submitRange = useMutation(api.puzzles.submitRange);

  const handleCommit = async () => {
    const [start, end] = currentRange;

    // Optimistic update
    const predictedScore = scoreRange(start, end, puzzle.targetYear, 0, hintsUsed);
    setLocalRanges((prev) => [...prev, { start, end, score: predictedScore, hintsUsed }]);

    // Server validation
    const result = await submitRange({
      puzzleId: puzzle.id,
      start,
      end,
      hintsUsed,
    });

    // Update with authoritative score
    setLocalRanges((prev) =>
      prev.map((r, idx) => (idx === prev.length - 1 ? { ...r, score: result.score } : r)),
    );
  };

  return {
    puzzle,
    ranges: localRanges,
    currentRange,
    hintsUsed,
    setCurrentRange,
    setHintsUsed,
    handleCommit,
    isComplete: localRanges.length >= 6 || localRanges.some((r) => r.score > 0),
  };
}
```

**Success criteria:**

- [ ] Commit flow works (lock range, send to server)
- [ ] Optimistic updates (instant feedback)
- [ ] Server validation (authoritative score)
- [ ] Game completion logic (6 attempts or win)
- [ ] Streak tracking updated for range completion

---

#### **Days 11-12: Share Cards**

**Files to create:**

```
src/lib/shareCardGeneration.ts
src/components/game/ShareCard.tsx
```

**shareCardGeneration.ts** (Satori):

```typescript
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export async function generateShareCard(data: {
  puzzleNumber: number;
  ranges: Range[];
  totalScore: number;
  date: string;
}): Promise<Buffer> {
  const svg = await satori(
    <div style={{
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#1a1a1a',
      padding: 60,
      color: '#fff',
    }}>
      <h1 style={{ fontSize: 64, margin: 0 }}>
        Chrondle #{data.puzzleNumber}
      </h1>
      <p style={{ fontSize: 24, color: '#888', margin: '10px 0' }}>
        {data.date}
      </p>

      {/* Range visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        {data.ranges.map((range, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Range bar */}
            <div style={{
              width: range.score / 10, // Scale for visualization
              height: 30,
              backgroundColor: range.contained ? '#22c55e' : '#ef4444',
              opacity: 0.8,
            }} />
            <span style={{ fontSize: 20 }}>
              {range.score} pts {range.contained ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, fontSize: 28 }}>
        Total: {data.totalScore} points
      </div>

      <div style={{ marginTop: 20, fontSize: 20, color: '#888' }}>
        {data.ranges.filter(r => r.contained).length}/{data.ranges.length} contained
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [/* Load Inter font */],
    }
  );

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}
```

**Success criteria:**

- [ ] Share card renders correctly
- [ ] Range bars visualized
- [ ] Scores displayed (no spoilers of target year)
- [ ] Generation time <500ms
- [ ] Web Share API on mobile

---

#### **Days 13-14: Migration & Deploy**

**Deployment checklist:**

- [ ] Schema deployed to production (both fields exist)
- [ ] Mutations write `ranges` field
- [ ] Queries read both formats (backward compat)
- [ ] Frontend deployed with new RangeInput
- [ ] Legacy plays readable (no 404s for old users)
- [ ] Performance verified (60fps slider)
- [ ] Share cards working
- [ ] Analytics tracking range-specific events

**Rollback plan:**
If critical bug found:

1. Revert frontend to previous version
2. Keep schema changes (no data loss)
3. Fix bug in staging
4. Redeploy when ready

---

## Technical Specifications

### Dependencies to Add

```json
{
  "dependencies": {
    "satori": "^0.10.0",
    "@resvg/resvg-js": "^2.6.0"
  }
}
```

**Already in stack (use these):**

- `@radix-ui/react-slider` - Dual-handle slider
- `motion` - Animations
- `zod` - Validation
- `convex` - Backend

### Performance Budget

| Metric                | Target       | Measurement                     |
| --------------------- | ------------ | ------------------------------- |
| Slider drag           | 16ms (60fps) | Chrome DevTools Performance tab |
| Score calculation     | <10ms        | Server-side timing logs         |
| Share card generation | <500ms       | End-to-end timer                |
| Timeline render       | <33ms        | React DevTools Profiler         |
| Page load             | <2s          | Lighthouse                      |

**Enforcement:**

```typescript
// Add performance assertions to tests
test("slider maintains 60fps", () => {
  const frames = measureFrameRate(simulateDrag);
  expect(frames).toBeGreaterThanOrEqual(60);
});
```

### Accessibility Checklist

- [ ] Slider keyboard navigable (Arrow keys, Page Up/Down, Home/End)
- [ ] Screen reader announces range changes
- [ ] Focus indicators visible
- [ ] Color contrast 4.5:1 minimum
- [ ] Reduced motion respected (no animations if `prefers-reduced-motion`)
- [ ] Touch targets 44×44px minimum
- [ ] Hint buttons have clear labels
- [ ] Timeline SVG has ARIA labels

---

## Success Criteria

### Week 1 (MVP)

- [ ] Range input functional (dual-handle slider works)
- [ ] Scoring calculation correct (unit tests pass)
- [ ] Timeline shows ranges (not point markers)
- [ ] Hint system works (H1/H2/H3 generation)
- [ ] Basic game flow (commit, reveal, complete)

### Week 2 (Launch)

- [ ] Production deploy with zero downtime
- [ ] Legacy plays readable (no data loss)
- [ ] Share cards rendering (Satori working)
- [ ] Performance budget met (60fps slider)
- [ ] Migration complete (both formats supported)

### Week 4 (Validation)

- [ ] D7 retention ≥ baseline Classic retention
- [ ] Average session length 2.5-4.5 minutes
- [ ] Share rate ≥12% of completed games
- [ ] Hint usage 60-75% of players use ≥1 hint
- [ ] No critical bugs reported

---

## Risks & Mitigation

| Risk                                 | Likelihood | Impact   | Mitigation                                                               |
| ------------------------------------ | ---------- | -------- | ------------------------------------------------------------------------ |
| User backlash ("bring back Classic") | Medium     | High     | Frame as "Chrondle 2.0" upgrade, show benefits in onboarding             |
| Mobile slider UX (hard to drag)      | Medium     | High     | 44px touch targets, test on real devices, add increment buttons fallback |
| Performance regression (laggy)       | Low        | High     | 60fps budget enforced, debounce slider, use `transform` only             |
| Score inflation (too easy)           | Low        | Medium   | Monitor metrics, adjust S/Wmax if needed                                 |
| Schema migration failure             | Low        | Critical | Test extensively in staging, have rollback plan                          |
| Legacy data corruption               | Low        | Critical | Read-only mode first, validate all queries work                          |

---

## Future Unlocks

### What This Enables (Day 1)

**Leaderboards:**
Scores are now comparable. Rank users by `totalScore`. Simple.

**Skill Expression:**
Narrow ranges = mastery. Players naturally improve over time.

**Meaningful Streaks:**
Streak = consecutive days with ≥1 contained range. Score differentiates skill.

**Visual Sharing:**
Range bars are **more shareable** than emoji soup.

### Future Modes (Month 2+)

**Order Mode:**

- Same puzzle, arrange events chronologically
- Uses same `answer_year` data
- Different input UI (drag-and-drop)

**Matchmaker Mode:**

- Match events to decade tokens
- Same scoring principles
- Different visual presentation

**All use range scoring as foundation.**

---

## Appendix: Reference Implementation

### Complete RangeInput Component

```typescript
// src/components/game/RangeInput.tsx

import { useState, useMemo } from 'react';
import { RangeSlider } from './RangeSlider';
import { RangePreview } from './RangePreview';
import { HintLadder } from './HintLadder';
import { Button } from '@/components/ui/button';
import { scoreRange } from '@/lib/scoring';
import { generateHints } from '@/lib/hintGeneration';
import { useDebouncedCallback } from 'use-debounce';

interface RangeInputProps {
  onCommit: (range: { start: number; end: number; hintsUsed: number }) => void;
  disabled: boolean;
  targetYear: number; // For hint generation (client-side preview only)
  minYear?: number;
  maxYear?: number;
}

export function RangeInput({
  onCommit,
  disabled,
  targetYear,
  minYear = -5000,
  maxYear = 2025,
}: RangeInputProps) {
  const [range, setRange] = useState<[number, number]>([1900, 2000]);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Generate hints algorithmically
  const hints = useMemo(() => generateHints(targetYear), [targetYear]);

  // Calculate predicted score (debounced for performance)
  const calculateScore = useDebouncedCallback((r: [number, number], h: number) => {
    return scoreRange(r[0], r[1], targetYear, 0, h as 0 | 1 | 2 | 3);
  }, 150);

  const [predictedScore, setPredictedScore] = useState(0);

  const handleRangeChange = (newRange: [number, number]) => {
    setRange(newRange);
    const score = calculateScore(newRange, hintsUsed);
    setPredictedScore(score);
  };

  const handleHintTaken = (level: number) => {
    setHintsUsed(level);
  };

  const handleCommit = () => {
    onCommit({
      start: range[0],
      end: range[1],
      hintsUsed,
    });

    // Reset for next guess
    setRange([minYear, maxYear]);
    setHintsUsed(0);
  };

  const width = range[1] - range[0] + 1;
  const currentMultiplier = [1.0, 0.85, 0.7, 0.5][hintsUsed];

  return (
    <div className="space-y-4">
      {/* Hint ladder */}
      <HintLadder
        hints={hints}
        hintsUsed={hintsUsed}
        onHintTaken={handleHintTaken}
        currentMultiplier={currentMultiplier}
      />

      {/* Range slider */}
      <div className="space-y-2">
        <RangeSlider
          min={minYear}
          max={maxYear}
          value={range}
          onChange={handleRangeChange}
        />

        <RangePreview
          start={range[0]}
          end={range[1]}
          width={width}
          predictedScore={predictedScore}
          multiplier={currentMultiplier}
        />
      </div>

      {/* Commit button */}
      <Button
        onClick={handleCommit}
        disabled={disabled || width > 200}
        size="lg"
        className="w-full"
      >
        Commit Range
      </Button>
    </div>
  );
}
```

---

## Summary: What We're Shipping

**Week 1:**

- Range input with dual-handle slider (Radix UI)
- Hint system with 3-tier ladder (algorithmic generation)
- Logarithmic scoring calculation (client + server)
- Timeline rewrite for range bars (SVG)

**Week 2:**

- Share card generation (Satori + resvg)
- Schema migration (soft-deprecate guesses)
- Production deploy (zero downtime)
- Performance validation (60fps confirmed)

**Philosophy:**

- **One game** - Range is Chrondle, not "range mode"
- **Zero compromises** - Delete legacy code, don't maintain parallel paths
- **Ship fast** - 2 weeks MVP to production
- **Measure success** - Retention, performance, engagement

**Outcome:**
Chrondle evolved from binary guessing to strategic precision. Range width = skill expression. Scores = bragging rights. Hints = accessibility. **This is the game we should have shipped from day 1.**

---

**Ready to build? Run `/plan` to break this into implementation tasks.**

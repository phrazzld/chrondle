# CHRONDLE OPERATIONS BRIEF

**Chrondle** = Daily historical year-guessing game. Players submit year ranges, get scored on range width + hints used + containment. Built with Next.js 15, React 19, TypeScript, Convex, Clerk.

## 🚨 CRITICAL: Puzzle Integrity

**NEVER implement features that reveal answers outside the 6-hint system.**

**Anti-patterns:**

- Auto-selecting BC/AD based on typed year
- Smart validation messages ("Too early for AD")
- Predictive era suggestions
- UI behaviors that change based on correct answer proximity

**Why:** Players deduce the year from historical event hints ("Construction of Pyramids" → BC, "Battle of Waterloo" → AD), not from UI tells.

## Architecture (Current Development)

**Range-Based Game:**

- Players submit year ranges (e.g., 1960-1980 AD), not single guesses
- Scoring: `BASE_POTENTIAL (100) - hint_penalty × range_width_factor × containment_multiplier`
- Core hook: `useRangeGame` (NOT `useChrondle` - that's dead code)
- Game state derivation: Pure functional via `deriveGameState` in `src/lib/gameState.ts`

**Puzzle Generation:**

- Dynamic, not static: 1,821 events in Convex `events` table
- Deterministic hash selects year daily → events for that year = hints
- Same date = same puzzle globally

**Convex Deployments:**

- **DEV:** `handsome-raccoon-955` (for development)
- **PROD:** `fleet-goldfish-183` (all event data lives here)

**Historical Context:**

- OpenRouter Responses API Alpha + GPT-5
- BC/AD format enforced (never BCE/CE) via `enforceADBC()` post-processing
- File: `convex/actions/historicalContext.ts`

## Stack

**Hard requirements:** pnpm (npm blocked), Vitest+Chai (NOT Jest-DOM), motion (NOT framer-motion)

**Core:** Next.js 15, React 19, TypeScript 5 (strict), Convex, Clerk, Tailwind 4, Radix UI

## Quality Gates

```bash
# Before committing
pnpm lint && pnpm type-check && pnpm test

# Convex DB integrity
npx convex run puzzles:getTotalPuzzles

# Start dev environment
npx convex dev  # Terminal 1
pnpm dev        # Terminal 2
```

## Live Patterns

**Search before building:**

```bash
rg "formatYear" --type ts  # Find existing patterns
ast-grep --lang typescript -p 'function $_($$$)' # Semantic search
```

**Vitest + Chai (NOT Jest-DOM):**

- ✅ `expect(element).toBeTruthy()` + `element.getAttribute("aria-label").toBe("value")`
- ❌ `expect(element).toBeInTheDocument()` (Jest-DOM matchers don't exist)

**Motion mocks (required):**

```typescript
vi.mock("motion/react", () => ({
  motion: { div: ({ children, ...props }) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }) => <>{children}</>,
}));
```

**Animation constants:**

- Import from `@/lib/animationConstants`
- Always divide durations by 1000 (Framer Motion uses seconds)
- Always check `useReducedMotion()` before animating

## Common Traps

1. **Hydration:** Return safe defaults until `mounted=true`
2. **Convex paths:** `npx convex run dir/file:fn` (NOT `dir:fn`)
3. **Perf tests:** CI needs 1.5× local threshold (25ms vs 16ms)
4. **BC/AD:** Internal = negative numbers (BC), positive (AD)

## References

- **Detailed Patterns:** `.claude/context.md` (1,246 lines of discovered patterns)
- **Backlog:** `BACKLOG.md` (prioritized issues + estimates)
- **README:** Deployment, setup, architecture overview
- **Archive:** `CLAUDE.archive.md` (full 1,091-line original guide)

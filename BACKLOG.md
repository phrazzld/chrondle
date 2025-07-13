# BACKLOG

## Miscellaneous

- integrate convex db
  - https://www.convex.dev/
- integrate effect
  - https://effect.website/
- store all puzzles -- date of the puzzle, target year, hints in order, etc -- in a database
- build out puzzle archive
- paywall puzzle archive with stripe

## Critical Priority - Security & Production Readiness

- [ ] [HIGH] [SECURITY] Validate localStorage data to prevent JSON injection attacks | Risk: Malicious data could crash app or expose information
- [ ] [HIGH] [SECURITY] Remove debug utilities from production builds | Risk: Game state manipulation and sensitive data exposure via window.chrondle
- [ ] [HIGH] [SECURITY] Add rate limiting to historical context API endpoint | Risk: API abuse and OpenRouter cost overruns
- [ ] [HIGH] [MAINTAIN] Implement proper error boundaries and production telemetry | Debt: Invisible production errors with no monitoring
- [ ] [HIGH] [SECURITY] Configure security headers in Next.js config | Risk: XSS, clickjacking, and client-side attacks

## High Priority - Core Functionality & Architecture

- [ ] [HIGH] [ALIGN] Add comprehensive tests for useStreak hook - manages user progress tracking without test verification
- [ ] [HIGH] [ALIGN] Add component integration tests for GuessInput + game state interaction - verify user input flows
- [ ] [HIGH] [PERF] Optimize localStorage operations with debouncing and caching | Gain: 50-70% reduction in I/O operations
- [ ] [HIGH] [ALIGN] Split GameTimeline.tsx (311 lines) into focused sub-components | Principle: Simplicity & Modularity
- [ ] [HIGH] [MAINTAIN] Add comprehensive test coverage for untested custom hooks | Debt: 10+ hooks without any tests

## Medium Priority - Developer Experience & Performance

- [ ] [MED] [DX] Add comprehensive test watch mode with intelligent filtering | Time saved: 2-3 hours per week
- [ ] [MED] [ALIGN] Replace 60+ console.log/error calls with structured logging | Principle: No-secret-suppression
- [ ] [MED] [PERF] Memoize event sorting algorithm with puzzle-specific cache | Gain: ~90% reduction in string operations
- [ ] [MED] [ALIGN] Extract storage operations from gameState.ts into separate module | Principle: Single Responsibility
- [ ] [MED] [DX] Create development environment validation script | Time saved: 0.5-1 hour per week
- [ ] [MED] [ALIGN] Add tests for remaining custom hooks (useNotifications, useClipboard, useDebugMode)
- [ ] [MED] [UI/UX] Configure BTCPayServer or easy Bitcoin donation method in footer

## Low Priority - Optimization & Cleanup

- [ ] [LOW] [ALIGN] Decompose GuessInput component - violates simplicity principle
- [ ] [LOW] [PERF] Optimize component re-renders with memo and callbacks | Gain: 20-30% fewer re-renders
- [ ] [LOW] [ALIGN] Extract reusable focus management hook from GuessInput

## Innovation & Future Features

- [ ] [FEATURE] Time Travel Mode - Post-game interactive historical exploration with AI-generated timelines
- [ ] [FEATURE] Chrondle Academy - Adaptive learning system tracking weak spots and generating practice puzzles
- [ ] [FEATURE] Battle Mode - Asynchronous multiplayer with strategic hint selection
- [ ] [FEATURE] Historical Detective Mode - Multi-layered deduction puzzles requiring reasoning
- [ ] [FEATURE] Chrondle Collections - Virtual history museum with collectible artifacts

## Radical Simplification Ideas (Gordian Knots)

- [ ] [GORDIAN] Consider removing ALL fancy button animations - replace with single button component
- [ ] [GORDIAN] Consider removing AI-powered historical context entirely - game works without it
- [ ] [GORDIAN] Consider using only browser's prefers-color-scheme for theming
- [ ] [GORDIAN] Consider collapsing modals into inline UI elements

## Completed

- [x] [HIGH] [ALIGN] Add comprehensive tests for useGameState hook - manages game state transitions, derived calculations, localStorage integration without test verification (✅ 2025-06-29: Implemented comprehensive test suite with 22 passing tests covering hook initialization, state management, error handling, and performance requirements)
- [x] [HIGH] [ALIGN] Add comprehensive tests for core business functions in src/lib/gameState.ts - getDailyYear(), initializePuzzle(), saveProgress(), loadProgress() handle critical game mechanics (✅ 2025-06-29: Implemented comprehensive test suite with 28 passing tests covering deterministic daily puzzle selection, localStorage persistence, error handling, and performance benchmarks)
- [x] [HIGH] [BUG] Year zero is not considered a valid year -- but it should be!

---

## Grooming Summary - 2025-07-08

### Items Added

- 5 security improvements (3 critical)
- 6 simplification opportunities
- 5 innovation features
- 5 DX enhancements
- 4 performance optimizations
- 7 philosophy alignment tasks

### Key Themes

- **Security gaps** in localStorage validation and production debugging
- **Over-engineering** in UI components (6 unused button variants)
- **Test coverage** critically lacking for core hooks
- **Performance** issues with localStorage I/O and event sorting

### Recommended Focus

1. **Security hardening** - localStorage validation and production safety
2. **Test infrastructure** - Hook coverage and intelligent test tooling
3. **Component simplification** - Remove duplicate systems and unused code

---

### Task Format

- `- [ ] [HIGH/MED/LOW] [TYPE] Description | Impact/Risk`
- Types: SECURITY, ALIGN, SIMPLIFY, PERF, DX, MAINTAIN, FEATURE, GORDIAN, BUG, UI/UX
- Example: `- [ ] [HIGH] [SECURITY] Add input validation | Risk: XSS attacks`

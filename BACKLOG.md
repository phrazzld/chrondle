# BACKLOG

## Miscellaneous

- paywall puzzle archive with stripe

## Timeline Component Enhancements (from PR #11 review)

- [ ] [LOW] Add unit tests for BC/AD formatYear edge cases (year 0, large negative years) | Gain: Prevent formatting bugs
- [ ] [FUTURE] Implement virtual timeline rendering for 10,000+ year ranges | Gain: Support for prehistoric dates
- [ ] [LOW] Create GitHub issue for timeline zoom controls and era markers | Gain: Enhanced user interaction

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

## Radical Simplification Ideas (Gordian Knots)

- [ ] [GORDIAN] Consider removing ALL fancy button animations - replace with single button component
- [ ] [GORDIAN] Consider using only browser's prefers-color-scheme for theming
- [ ] [GORDIAN] Consider collapsing modals into inline UI elements

## Future Enhancements (From Convex Migration)

- [ ] [LOW] [FEATURE] Add puzzle difficulty ratings based on aggregate completion data
- [ ] [LOW] [FEATURE] Implement puzzle search and filtering in archive
- [ ] [LOW] [FEATURE] Create shareable links for specific past puzzles
- [ ] [LOW] [FEATURE] Add achievement badges for milestones
- [ ] [LOW] [FEATURE] Build puzzle statistics page (most/least guessed correctly)
- [ ] [LOW] [FEATURE] Add custom color scheme options for premium users
- [ ] [LOW] [FEATURE] Implement puzzle of the week/month highlights
- [ ] [LOW] [FEATURE] Create puzzle recommendation engine based on play history
- [ ] [MED] [FEATURE] Add feature flag system for gradual rollout of new features
- [ ] [MED] [SECURITY] Implement rate limiting for API endpoints when needed
- [ ] [LOW] [FEATURE] Offline fallback behavior (localStorage when Convex unavailable)

### Task Format

- `- [ ] [HIGH/MED/LOW] [TYPE] Description | Impact/Risk`
- Types: SECURITY, ALIGN, SIMPLIFY, PERF, DX, MAINTAIN, FEATURE, GORDIAN, BUG, UI/UX
- Example: `- [ ] [HIGH] [SECURITY] Add input validation | Risk: XSS attacks`

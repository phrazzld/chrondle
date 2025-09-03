# BACKLOG

## PR Review Feedback (GPT-5 Migration)

### Cost Monitoring & Management

- [ ] [HIGH] [MONITORING] Implement GPT-5 cost monitoring with alerts when daily spend exceeds thresholds | Impact: ~4x higher costs than Gemini
- [ ] [HIGH] [MONITORING] Track historical context generation latency and success rates | Data: Monitor API response times < 10s
- [ ] [MED] [PERF] A/B test GPT-5 vs Gemini quality with user feedback | Gain: Data-driven decision on cost vs quality tradeoff

### Production Monitoring & Logging

- [ ] [HIGH] [MAINTAIN] Replace console.error() calls with structured logging for production | Debt: Better error tracking and debugging
- [ ] [MED] [MONITORING] Implement production telemetry for context generation (success/failure rates, latency, costs) | Gain: Operational visibility

### Code Quality Improvements

- [x] [LOW] [CLEANUP] ~~Remove lingering BCE/CE references from comments in 2 files~~ | **COMPLETED**: Changed to avoid BCE/CE mentions
- [ ] [LOW] [CLEANUP] Remove commented-out Gemini model configuration code | Debt: Dead code cleanup

## Miscellaneous

## Timeline Component Enhancements (from PR #11 review)

- [ ] [LOW] Add unit tests for BC/AD formatYear edge cases (year 0, large negative years) | Gain: Prevent formatting bugs
- [ ] [FUTURE] Implement virtual timeline rendering for 10,000+ year ranges | Gain: Support for prehistoric dates
- [ ] [LOW] Create GitHub issue for timeline zoom controls and era markers | Gain: Enhanced user interaction

## Critical Priority - Security & Production Readiness

- [ ] [HIGH] [SECURITY] Validate localStorage data to prevent JSON injection attacks | Risk: Malicious data could crash app or expose information
- [ ] [HIGH] [SECURITY] Remove debug utilities from production builds | Risk: Game state manipulation and sensitive data exposure via window.chrondle
- [ ] [HIGH] [SECURITY] Add rate limiting to historical context API endpoint | Risk: API abuse and OpenRouter cost overruns
- [ ] [HIGH] [RELIABILITY] Add request timeout (AbortController) to Convex historicalContext action fetch to prevent indefinite hangs
- [ ] [HIGH] [DOCS] Unify documentation: Convex generated files MUST be committed (update docs/guides/contributing.md to remove conflicting guidance about gitignoring)
- [ ] [HIGH] [DOCS] Update docs and tooling to state OPENROUTER_API_KEY must be set in Convex environment (not Vercel) now that generation runs server-side in Convex
- [ ] [HIGH] [MAINTAIN] Implement proper error boundaries and production telemetry | Debt: Invisible production errors with no monitoring
- [ ] [HIGH] [SECURITY] Configure security headers in Next.js config | Risk: XSS, clickjacking, and client-side attacks

## High Priority - Core Functionality & Architecture

- [ ] [HIGH] [ALIGN] Add comprehensive tests for useStreak hook - manages user progress tracking without test verification
- [ ] [HIGH] [ALIGN] Add component integration tests for GuessInput + game state interaction - verify user input flows
- [ ] [HIGH] [PERF] Optimize localStorage operations with debouncing and caching | Gain: 50-70% reduction in I/O operations
- [ ] [HIGH] [ALIGN] Split GameTimeline.tsx (311 lines) into focused sub-components | Principle: Simplicity & Modularity
- [ ] [HIGH] [MAINTAIN] Add comprehensive test coverage for untested custom hooks | Debt: 10+ hooks without any tests
- [ ] [HIGH] [RELIABILITY] Handle 429 rate limits in Convex context generation: either retry with backoff or reschedule later via ctx.scheduler; avoid dropping work during migrations
- [ ] [HIGH] [RELIABILITY] Throttle migration scheduling to a steady drip rate to avoid upstream overload (batch spacing and per-item delay tuning)

## Medium Priority - Developer Experience & Performance

- [ ] [MED] [DX] Add comprehensive test watch mode with intelligent filtering | Time saved: 2-3 hours per week
- [ ] [MED] [ALIGN] Replace 60+ console.log/error calls with structured logging | Principle: No-secret-suppression
- [ ] [MED] [PERF] Memoize event sorting algorithm with puzzle-specific cache | Gain: ~90% reduction in string operations
- [ ] [MED] [ALIGN] Extract storage operations from gameState.ts into separate module | Principle: Single Responsibility
- [ ] [MED] [DX] Create development environment validation script | Time saved: 0.5-1 hour per week
- [ ] [MED] [ALIGN] Add tests for remaining custom hooks (useNotifications, useClipboard, useDebugMode)
- [ ] [MED] [UI/UX] Configure BTCPayServer or easy Bitcoin donation method in footer
- [ ] [MED] [ARCH] Centralize AI prompt/model/params in a shared constants module; reduce max_tokens in action to a measured safe value; keep one source of truth
- [ ] [MED] [OBS] Enrich puzzles with historical context metadata (e.g., model, temperature, promptVersion) for provenance and audits
- [ ] [MED] [OBS] Track historicalContextStatus (pending/success/failed) on puzzles to enable retries and operational visibility
- [ ] [MED] [LOGGING] Use info/log for normal progress in actions/migrations; reserve error for failures to keep logs meaningful
- [ ] [MED] [CI] Revisit CI codegen step: since convex/\_generated is committed, consider removing or guarding it to avoid production deployment coupling and fork/PR failures

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

## Code Quality & Cleanup (From Historical Context PR Review)

- [ ] [LOW] [MAINTAIN] Remove unused OpenRouterTimeoutError class | Debt: Dead code after AbortError changes
- [ ] [LOW] [MAINTAIN] Clarify retry semantics (maxRetries vs maxRetries+1) | Debt: Semantic confusion
- [ ] [LOW] [SIMPLIFY] Simplify AbortError detection to rely on err.name only | Gain: Cleaner code

## Feature Enhancements (From Historical Context PR Review)

- [ ] [MED] [PERF] Implement client-side timeout in OpenRouterService | Gain: Prevent hanging requests
- [ ] [LOW] [UI/UX] Surface rate limit retry information in HistoricalContextCard | Gain: Smart retry UI with countdown
- [ ] [LOW] [MAINTAIN] Clean up unused config.timeout if client timeout not needed | Debt: Unused configuration

---

## Post-merge follow-ups (Current Hint relocation)

- [x] [UI/UX] Show current hint above guess input — completed in feat/current-hint-above-input
- [MED] [DEV] Update validateHintsDisplayProps to reflect new HintsDisplay API (remove currentHintIndex and isLoading checks; keep events, guesses, targetYear, isGameComplete, error, className)
- [MED] [TEST] Add a negative/edge-case test for GameProgress after clamping (e.g., guessCount > totalHints)
- [LOW] [A11Y] Consider announcing the “Unused Hints Revealed” section with an aria-live region on game completion
- [LOW] [UX] Revisit HintsDisplay auto-scroll-to-top behavior or make the container explicitly scrollable if that behavior is desired
- [LOW] [ALIGN] Decide whether events must always have length 6; align validator, docs, and tests accordingly
- [LOW] [DOCS] Update architecture/docs to reflect that CurrentHintCard owns the current hint, and HintsDisplay only renders past/future hints

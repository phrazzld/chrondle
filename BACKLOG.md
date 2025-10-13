# BACKLOG

## Critical [Fix This Week]

### ✅ PR Review Fixes - Streak Persistence (COMPLETED - PR #34)

All P1 bugs fixed across 6 Codex review cycles:

- ✅ [P1] Fix authenticated player loss streak reset | Commit: b4603db
- ✅ [P1] Fix streak merge date preservation logic | Commit: 5d49adf
- ✅ [P1] Fix multi-day anonymous streak combination | Commit: 1021dc2
- ✅ [P0] Add anonymous streak security validation | Commit: 1676949
- ✅ [P1] Fix equal-length streak tiebreaker | Commit: 1541037
- ✅ [P1] Fix first-time sign-in migration timing | Commit: 239258e
- ✅ [UX] Add optimistic updates for authenticated users | Commit: 239258e

**Status**: Ready for final Codex review and merge

### 🔒 Security & Production Readiness

- [S] [SECURITY] Update vulnerable dependencies (@eslint/plugin-kit, vite) | Impact: 3 | Risk: Low severity
- [S] [SECURITY] Add runtime environment variable validation with Zod | Impact: 8 | Risk: Config errors
- [M] [SECURITY] Add rate limiting to historicalContext API endpoint | Impact: 9 | Risk: Cost overruns
- [S] [RELIABILITY] Add request timeout (AbortController) to Convex fetch | Impact: 8 | Risk: Hangs
- [M] [SECURITY] Review Bitcoin address handling and QR code generation | Impact: 7 | Risk: Cryptocurrency security | Source: PR #31 review
- [M] [SECURITY] Add rate limiting to mergeAnonymousStreak mutation | Impact: 6 | convex/users.ts:417 | Source: PR #34 review (deferred - post-merge enhancement)

## High Priority [This Sprint]

### 🧪 Testing & Quality

- [L] [TEST] Add comprehensive tests for useChrondle hook | Impact: 9 | Coverage: Core game logic
- [L] [TEST] Add tests for GameTimeline (330 lines) and HintsDisplay (407 lines) | Impact: 7
- [M] [TEST] Add E2E integration tests for streak system | Impact: 7 | Coverage: anonymous → auth migration | Source: PR #34 review
- [M] [TEST] Add localStorage corruption recovery tests | Impact: 6 | Coverage: Error handling | Source: PR #34 review
- [M] [TEST] Add tests for useStreak, useNotifications, useClipboard hooks | Impact: 6
- [M] [TEST] Add integration tests for BC/AD toggle workflow | Impact: 6 | Coverage: New UI flow | Source: PR #31 review
- [S] [TEST] Add edge case tests for Bitcoin address validation | Impact: 5 | Coverage: Security | Source: PR #31 review
- [S] [TEST] Add performance tests for large streak values | Impact: 4 | Coverage: Edge cases (1000+ days) | Source: PR #34 review

### ⚡ Performance & Monitoring

- [M] [MONITORING] Track historical context generation latency (<10s target) | Impact: 7
- [M] [MONITORING] Implement production telemetry (errors, API metrics) | Impact: 7

### 🏗️ Code Quality

- [L] [REFACTOR] Split GameTimeline.tsx (330 lines) into sub-components | Impact: 8 | Principle: Simplicity
- [M] [CLEANUP] Replace 60+ console.log/error with structured logging | Impact: 6 | Security risk
- [S] [DOCS] Add JSDoc to mergeAnonymousStreak mutation | Impact: 3 | convex/users.ts:417 | Source: PR #34 review (deferred)
- [S] [DOCS] Enhance error messages with format examples | Impact: 2 | streakCalculation.ts:74,77 | Source: PR #34 review (deferred)
- [S] [DOCS] Create streak system troubleshooting guide | Impact: 3 | localStorage corruption, migration failures | Source: PR #34 review (deferred)

## Medium Priority [This Quarter]

### 🎨 UI Polish & Visual Hierarchy [Ready for Implementation]

#### Enhanced Visual Hierarchy

- [M] [UI] Make hint card the hero element with elevated glass morphism | Impact: 8 | Time: 45 mins
  - Increase hint text: 20px desktop, 18px mobile
  - Glass morphism: backdrop blur + gradient background
  - Deep elevation shadow with primary color glow
  - Reduce opacity of past hints (0.9 → 0.7)
  - Add scale micro-animation on hint change

#### Smart Keyboard Focus

- [S] [UI] Add custom focus ring with shimmer animation | Impact: 7 | Time: 30 mins
  - Glowing focus ring with primary color
  - Prevent viewport zoom on mobile focus
  - Keep keyboard persistent between guesses
  - Add focus-pulse animation

#### Paper Background & Typewriter Effect

- [M] [UI] Add subtle paper texture background | Impact: 7 | Time: 30 mins
  - Layered paper effect with SVG noise
  - Different textures for light/dark modes
  - CSS-only implementation (no JS)
- [L] [UI] Implement typewriter animation for hints | Impact: 8 | Time: 1 hour
  - Create TypewriterText component
  - 25ms per character with blinking cursor
  - Respects prefers-reduced-motion
  - Subtle confetti on completion

### 📱 Mobile & Accessibility

- [M] [A11Y] Increase button touch targets to 44x44px minimum | Impact: 6 | Current: 32-40px
- [S] [A11Y] Create mobile-specific button size variant (h-11) | Impact: 5
- [S] [A11Y] Update game submit button to size="lg" for mobile | Impact: 5

### 🎮 Features & Engagement

- [M] [FEATURE] Add notification scheduling (morning/evening) | Impact: 5 | Flexibility
- [M] [FEATURE] Implement streak freeze tokens for vacations | Impact: 6 | Retention
- [M] [FEATURE] Add archive page filtering and search | Impact: 6 | Discovery

### 🔧 Developer Experience

- [M] [DX] Add test watch mode with intelligent filtering | Impact: 5 | Time: 2-3 hrs/week
- [S] [DX] Create development environment validation script | Impact: 4 | Time: 0.5-1 hr/week
- [S] [CI] Configure bundle size monitoring in CI pipeline | Impact: 5

### 💰 Monetization

- [L] [FEATURE] Design paywall for puzzle archive (Stripe/BTCPay) | Impact: 5

## Low Priority [Someday]

### 🎨 UI/UX Enhancements

- [S] [FEATURE] Add push notifications via service worker | Impact: 4
- [S] [FEATURE] Create notification sound options | Impact: 3
- [S] [FEATURE] Add streak milestone celebrations | Impact: 4
- [L] [PERF] Implement virtual timeline for 10,000+ year ranges | Impact: 3

### 🚀 Performance Optimizations

- [L] [PERF] Implement virtual scrolling for archive | Impact: 4 | Large collections
- [M] [PERF] Optimize localStorage with debouncing/caching | Impact: 5 | 50-70% I/O reduction
- [M] [PERF] Memoize event sorting with puzzle cache | Impact: 4 | ~90% string op reduction

### 📊 Analytics & Features

- [L] [FEATURE] Add puzzle difficulty ratings from completion data | Impact: 3
- [L] [FEATURE] Create shareable links for past puzzles | Impact: 4
- [L] [FEATURE] Build puzzle statistics page | Impact: 3
- [L] [FEATURE] Add achievement badges for milestones | Impact: 3
- [L] [FEATURE] Implement puzzle recommendation engine | Impact: 4
- [M] [FEATURE] Add feature flag system for gradual rollouts | Impact: 5

### 🧹 Technical Debt

- [S] [CLEANUP] Remove commented Gemini model configuration | Impact: 2
- [S] [CLEANUP] Remove unused OpenRouterTimeoutError class | Impact: 2
- [S] [CLEANUP] Clarify retry semantics (maxRetries vs +1) | Impact: 3
- [M] [ARCH] Centralize AI prompt/model config in shared module | Impact: 4
- [M] [OBS] Enrich puzzles with context metadata (model, temperature) | Impact: 3
- [L] [TEST] Add network error tests for localStorage in private mode | Impact: 3
- [L] [TEST] Add rapid input stress tests for GuessInput | Impact: 3

### 🔮 Future Considerations

- [L] [FEATURE] Implement offline fallback with localStorage | Impact: 4
- [L] [FEATURE] Add custom color schemes for premium users | Impact: 3
- [L] [FEATURE] Create puzzle of the week/month highlights | Impact: 3

## Radical Simplifications [Gordian Knots]

- [GORDIAN] Replace ALL fancy animations with single button component
- [GORDIAN] Use only browser prefers-color-scheme for theming
- [GORDIAN] Collapse modals into inline UI elements

---

## OpenRouter Responses API Migration - Future Enhancements

### Gradual Rollout Infrastructure

**Description**: Implement probabilistic feature flag system for controlled percentage-based rollout (10% → 50% → 100%)

**Value**: Reduces risk by enabling incremental deployment with real-time monitoring of quality/cost/performance before full rollout

**Estimated Effort**: 2-3 hours

- Add `RESPONSES_API_ROLLOUT_PERCENTAGE` environment variable
- Implement `Math.random() < rolloutPercentage` gate in endpoint selection logic
- Add logging to track which API was used for each puzzle
- Create dashboard query to monitor API usage distribution

---

### A/B Testing Infrastructure

**Description**: Parallel generation system that creates historical context using both APIs and compares quality/cost/performance metrics

**Value**: Quantitative comparison of Responses API improvements vs. Chat Completions baseline

**Estimated Effort**: 4-6 hours

- Modify `generateHistoricalContext` to support dual generation mode
- Store both contexts with metadata (API type, cost, generation time, token counts)
- Create Convex query to compare side-by-side for manual quality review
- Add analytics dashboard showing cost/performance distributions

---

### Cost Monitoring Dashboard

**Description**: Real-time cost tracking dashboard showing per-puzzle costs, daily totals, and cost trends over time

**Value**: Proactive cost management and budget forecasting for historical context generation

**Estimated Effort**: 3-4 hours

- Add `costEstimate` field to puzzles schema
- Create aggregation queries for daily/weekly/monthly costs
- Build admin dashboard component showing cost metrics
- Add alerting for unexpected cost spikes

---

### Quality Metrics Tracking

**Description**: Automated quality scoring system for generated narratives (word count, BC/AD compliance, event integration, readability scores)

**Value**: Objective measurement of narrative quality improvements from Responses API parameters

**Estimated Effort**: 5-7 hours

- Implement automated checks: word count (350-450 target), BC/AD ratio, event mention count
- Add readability score calculation (Flesch-Kincaid or similar)
- Store quality metrics with each puzzle's historical context
- Create quality dashboard showing trends and distributions
- Flag low-quality contexts for manual review

---

### Dynamic Parameter Tuning

**Description**: Adaptive system that adjusts reasoning effort and verbosity based on year complexity (e.g., wartime years get high effort, quiet years get medium)

**Value**: Optimizes cost/quality tradeoff by allocating more reasoning effort to historically complex years

**Estimated Effort**: 6-8 hours

- Define year complexity heuristics (event count, diversity, historical significance)
- Implement complexity scoring function
- Map complexity scores to reasoning effort levels (low/medium/high)
- Add complexity metadata to events table
- Create algorithm to select optimal parameters per year

---

### Multi-Model Fallback Chain

**Description**: Cascade system that tries GPT-5 → GPT-5-mini → GPT-4o → Gemini 2.5 based on availability and rate limits

**Value**: Improved reliability and uptime for historical context generation despite API rate limits

**Estimated Effort**: 3-4 hours

- Define fallback priority list with model configurations
- Implement cascade logic in retry loop
- Add logging to track fallback frequency
- Create metrics dashboard showing model usage distribution

---

### Streaming Response Support

**Description**: Use Server-Sent Events (SSE) streaming for progressive narrative generation

**Impact**: Reduces perceived latency for users waiting for historical context after puzzle completion

**Estimated Effort**: 4-5 hours

---

### Historical Context Regeneration Tool

**Description**: Admin tool to batch regenerate all existing puzzle contexts using Responses API with new parameters

**Impact**: Brings all historical puzzles up to new quality standards without manual intervention

**Estimated Effort**: 2-3 hours

---

### Context Quality Voting System

**Description**: Allow users to rate historical context quality (helpful/not helpful) to identify low-quality narratives for regeneration

**Impact**: User feedback drives continuous quality improvement

**Estimated Effort**: 4-6 hours

---

## OpenRouter Responses API Migration - Technical Debt Opportunities

### Remove Chat Completions API Code Path

**Description**: After successful Responses API rollout (1-2 weeks), remove all Chat Completions fallback code and simplify implementation

**Benefit**: Reduces code complexity, removes dual-mode maintenance burden, improves readability

**Estimated Effort**: 1 hour

**Timing**: Only after 2+ weeks of stable Responses API usage in production

---

### Migrate from Alpha to Stable Responses API

**Description**: When OpenRouter promotes Responses API from Alpha to stable, migrate to production endpoint

**Benefit**: Removes "Alpha" risk, potentially gains additional features and guarantees

**Estimated Effort**: 30 minutes (endpoint URL change + testing)

**Timing**: When OpenRouter announces stable Responses API release

---

### Add Response Caching Layer

**Description**: Cache generated historical contexts in CDN or edge storage to reduce API calls for frequently viewed puzzles

**Benefit**: Reduces API costs for popular puzzles, improves response latency

**Estimated Effort**: 3-4 hours

**Timing**: After observing puzzle view patterns in production analytics

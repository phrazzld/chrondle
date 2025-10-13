# TODO: Chrondle Development Tasks

## 🎯 Active Work

No active tasks. All recent work completed and ready for merge.

---

## ✅ Recently Completed

### Migrate to OpenRouter Responses API (Oct 13, 2025)

**Status**: ✅ Complete - 11 commits on `feat/responses-api-migration` branch
**Outcome**: Successfully migrated to Responses API Alpha with comprehensive testing

**Key Results**:

- Reasoning effort="high" + verbosity="high" → richer 350-450 word narratives
- Cost: ~$0.026 per puzzle (+13% for reasoning tokens, acceptable quality tradeoff)
- Testing: 100% event integration, 100% BC/AD compliance, all 500 tests passing
- Docs: Complete API configuration reference in CLAUDE.md and .env.example

**Files Modified**: `convex/actions/historicalContext.ts`, `scripts/test-responses-api.ts`, `.env.example`, `CLAUDE.md`, `TODO.md`, `BACKLOG.md`

**Next Step**: Merge `feat/responses-api-migration` to `master`

---

### Fix Streak Persistence System - Security Fixes (Oct 9, 2025)

**Status**: ✅ Complete - Merged in PR #34
**Outcome**: Closed critical security vulnerability in anonymous streak validation

**Key Protections**:

- Date format and plausibility validation (ISO YYYY-MM-DD, not future, <90 days old)
- Streak count bounds (0-365 days, within 90-day window)
- Streak-to-date consistency verification
- 36 comprehensive security tests covering attack vectors

**What Was Fixed**:

1. Authenticated player loss streak reset (`b4603db`)
2. Streak merge date preservation (`5d49adf`)
3. Multi-day anonymous streak logic (`1021dc2`)
4. Anonymous streak security validation (`1676949`)
5. Equal-length streak tiebreaker (`1541037`)
6. First-time sign-in migration timing (`239258e`)

---

## 📋 Backlog (Prioritized)

### Critical [Fix This Week]

#### Security & Production Readiness

- ✅ ~~Update vulnerable dependencies~~ - No vulnerabilities found (2025-10-13)
- [ ] **Add runtime environment variable validation with Zod** | Impact: 8 | Risk: Config errors
- [ ] **Add rate limiting to historicalContext API endpoint** | Impact: 9 | Risk: Cost overruns
- [ ] **Add request timeout (AbortController) to Convex fetch** | Impact: 8 | Risk: Hangs
- [ ] **Review Bitcoin address handling and QR code generation** | Impact: 7 | Source: PR #31 review
- [ ] **Add rate limiting to mergeAnonymousStreak mutation** | Impact: 6 | Source: PR #34 review (deferred)

### High Priority [This Sprint]

#### Testing & Quality

- [ ] **Add comprehensive tests for useChrondle hook** | Impact: 9 | Coverage: Core game logic
- [ ] **Add tests for GameTimeline (330 lines) and HintsDisplay (407 lines)** | Impact: 7
- [ ] **Add E2E integration tests for streak system** | Impact: 7 | Coverage: anonymous → auth migration
- [ ] **Add localStorage corruption recovery tests** | Impact: 6 | Source: PR #34 review
- [ ] **Add tests for useStreak, useNotifications, useClipboard hooks** | Impact: 6
- [ ] **Add integration tests for BC/AD toggle workflow** | Impact: 6 | Source: PR #31 review
- [ ] **Add edge case tests for Bitcoin address validation** | Impact: 5 | Source: PR #31 review
- [ ] **Add performance tests for large streak values** | Impact: 4 | Source: PR #34 review

#### Performance & Monitoring

- [ ] **Track historical context generation latency** | Impact: 7 | Target: <10s
- [ ] **Implement production telemetry (errors, API metrics)** | Impact: 7

#### Code Quality

- [ ] **Split GameTimeline.tsx (330 lines) into sub-components** | Impact: 8 | Principle: Simplicity
- [ ] **Replace 60+ console.log/error with structured logging** | Impact: 6 | Security risk
- [ ] **Add JSDoc to mergeAnonymousStreak mutation** | Impact: 3 | Source: PR #34 review (deferred)
- [ ] **Enhance error messages with format examples** | Impact: 2 | `streakCalculation.ts:74,77`
- [ ] **Create streak system troubleshooting guide** | Impact: 3 | localStorage corruption, migration failures

### Medium Priority [This Quarter]

#### UI Polish & Visual Hierarchy

- [ ] **Make hint card the hero element with elevated glass morphism** | Impact: 8 | Time: 45 mins
- [ ] **Add custom focus ring with shimmer animation** | Impact: 7 | Time: 30 mins
- [ ] **Add subtle paper texture background** | Impact: 7 | Time: 30 mins
- [ ] **Implement typewriter animation for hints** | Impact: 8 | Time: 1 hour
- [ ] **Increase button touch targets to 44x44px minimum** | Impact: 6 | Current: 32-40px

#### Features & Engagement

- [ ] **Add notification scheduling (morning/evening)** | Impact: 5
- [ ] **Implement streak freeze tokens for vacations** | Impact: 6
- [ ] **Add archive page filtering and search** | Impact: 6
- [ ] **Design paywall for puzzle archive (Stripe/BTCPay)** | Impact: 5

#### Developer Experience

- [ ] **Add test watch mode with intelligent filtering** | Impact: 5 | Time savings: 2-3 hrs/week
- [ ] **Create development environment validation script** | Impact: 4 | Time savings: 0.5-1 hr/week
- [ ] **Configure bundle size monitoring in CI pipeline** | Impact: 5

### Low Priority [Someday]

#### Performance Optimizations

- [ ] **Implement virtual scrolling for archive** | Impact: 4 | Large collections
- [ ] **Optimize localStorage with debouncing/caching** | Impact: 5 | 50-70% I/O reduction
- [ ] **Memoize event sorting with puzzle cache** | Impact: 4 | ~90% string op reduction
- [ ] **Implement virtual timeline for 10,000+ year ranges** | Impact: 3

#### Analytics & Features

- [ ] **Add puzzle difficulty ratings from completion data** | Impact: 3
- [ ] **Create shareable links for past puzzles** | Impact: 4
- [ ] **Build puzzle statistics page** | Impact: 3
- [ ] **Add achievement badges for milestones** | Impact: 3
- [ ] **Implement puzzle recommendation engine** | Impact: 4
- [ ] **Add feature flag system for gradual rollouts** | Impact: 5
- [ ] **Add push notifications via service worker** | Impact: 4
- [ ] **Create notification sound options** | Impact: 3
- [ ] **Add streak milestone celebrations** | Impact: 4

#### Technical Debt

- [ ] **Remove commented Gemini model configuration** | Impact: 2
- [ ] **Remove unused OpenRouterTimeoutError class** | Impact: 2
- [ ] **Clarify retry semantics (maxRetries vs +1)** | Impact: 3
- [ ] **Centralize AI prompt/model config in shared module** | Impact: 4
- [ ] **Enrich puzzles with context metadata (model, temperature)** | Impact: 3
- [ ] **Add network error tests for localStorage in private mode** | Impact: 3
- [ ] **Add rapid input stress tests for GuessInput** | Impact: 3

---

## 🔮 Future Enhancements (Post-Launch)

### OpenRouter Responses API Enhancements

- [ ] **Gradual rollout infrastructure** | 2-3 hours | Percentage-based feature flag
- [ ] **A/B testing infrastructure** | 4-6 hours | Parallel generation quality comparison
- [ ] **Cost monitoring dashboard** | 3-4 hours | Real-time cost tracking and alerting
- [ ] **Quality metrics tracking** | 5-7 hours | Automated narrative quality scoring
- [ ] **Dynamic parameter tuning** | 6-8 hours | Adjust reasoning effort by year complexity
- [ ] **Multi-model fallback chain** | 3-4 hours | GPT-5 → GPT-5-mini → GPT-4o → Gemini 2.5
- [ ] **Streaming response support** | 4-5 hours | SSE for progressive generation
- [ ] **Historical context regeneration tool** | 2-3 hours | Batch regenerate with new parameters
- [ ] **Context quality voting system** | 4-6 hours | User feedback for quality improvement

### Technical Debt Cleanup (After Responses API Stable)

- [ ] **Remove Chat Completions API code path** | 1 hour | Timing: After 2+ weeks stable
- [ ] **Migrate from Alpha to Stable Responses API** | 30 mins | When OpenRouter promotes endpoint
- [ ] **Add response caching layer** | 3-4 hours | CDN/edge cache for popular puzzles

### Future Considerations

- [ ] **Implement offline fallback with localStorage** | Impact: 4
- [ ] **Add custom color schemes for premium users** | Impact: 3
- [ ] **Create puzzle of the week/month highlights** | Impact: 3
- [ ] **Progressive Web App capabilities** | Impact: 4
- [ ] **Enhanced mobile experience with native app features** | Impact: 4
- [ ] **Integration with educational platforms** | Impact: 3
- [ ] **Multi-language and internationalization support** | Impact: 4

---

## 📊 Current Metrics

**Test Suite**: 500 tests passing
**TypeScript**: Strict mode, clean compilation
**Coverage**: >90% on critical paths (streak logic, game state)
**Bundle Size**: Monitored (requires CI integration)
**Performance**: <100ms puzzle initialization

**Last Updated**: 2025-10-13

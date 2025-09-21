# BACKLOG: Future Considerations

_\"If it's not needed for THIS pull request, it's not a TODO.\" - Linus Torvalds_

## Strike Donation Enhancements [Maybe Someday]

### Advanced Payment Features

- [ ] Multiple payment PSPs (OpenNode, BTCPay Server) | Impact: 4
- [ ] Recurring subscriptions via Lightning | Impact: 3
- [ ] Fiat settlement options for some regions | Impact: 2
- [ ] Card payment rails integration | Impact: 2
- [ ] Multi-currency invoice generation | Impact: 3
- [ ] Lightning Address as primary UX | Impact: 4
- [ ] LNURL-pay support | Impact: 3
- [ ] Nostr zaps integration | Impact: 2

### Analytics & Reporting

- [ ] Donation analytics dashboard | Impact: 4
- [ ] Export reports for accounting | Impact: 3
- [ ] Real-time donation feed | Impact: 3
- [ ] Donor wall with optional names | Impact: 2
- [ ] Goal thermometer widget | Impact: 2
- [ ] Monthly email summaries | Impact: 2

### UX Polish

- [ ] Animated success confirmations | Impact: 2
- [ ] Sound effects on payment | Impact: 1
- [ ] Custom thank you messages | Impact: 3
- [ ] Donation history for users | Impact: 3
- [ ] Social sharing of donations | Impact: 2
- [ ] Leaderboard of top donors | Impact: 2

### Technical Optimizations

- [ ] WebSocket for instant updates | Impact: 3
- [ ] Redis cache for rate limits | Impact: 3
- [ ] CDN for QR code generation | Impact: 2
- [ ] Webhook replay dashboard | Impact: 3
- [ ] Monitoring integration (Datadog/Sentry) | Impact: 4
- [ ] A/B test different amounts | Impact: 3

## Existing Chrondle Backlog

- fix notifications -- or remove them

## Critical [Fix This Week]

### 🔒 Security & Production Readiness

- [S] [SECURITY] Update vulnerable dependencies (@eslint/plugin-kit, vite) | Impact: 3 | Risk: Low severity
- [S] [SECURITY] Add runtime environment variable validation with Zod | Impact: 8 | Risk: Config errors
- [M] [SECURITY] Add rate limiting to historicalContext API endpoint | Impact: 9 | Risk: Cost overruns
- [S] [RELIABILITY] Add request timeout (AbortController) to Convex fetch | Impact: 8 | Risk: Hangs

## High Priority [This Sprint]

### 🧪 Testing & Quality

- [L] [TEST] Add comprehensive tests for useChrondle hook | Impact: 9 | Coverage: Core game logic
- [L] [TEST] Add tests for GameTimeline (330 lines) and HintsDisplay (407 lines) | Impact: 7
- [M] [TEST] Add tests for useStreak, useNotifications, useClipboard hooks | Impact: 6

### ⚡ Performance & Monitoring

- [M] [MONITORING] Implement GPT-5 cost monitoring with spend alerts | Impact: 8 | ~4x Gemini costs
- [M] [MONITORING] Track historical context generation latency (<10s target) | Impact: 7
- [M] [MONITORING] Implement production telemetry (errors, API metrics) | Impact: 7

### 🏗️ Code Quality

- [L] [REFACTOR] Split GameTimeline.tsx (330 lines) into sub-components | Impact: 8 | Principle: Simplicity
- [M] [CLEANUP] Replace 60+ console.log/error with structured logging | Impact: 6 | Security risk

## Medium Priority [This Quarter]

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

# BACKLOG

## Critical [Fix This Week]

### 🔒 Security & Production Readiness

- [S] [SECURITY] Update vulnerable dependencies (@eslint/plugin-kit, vite) | Impact: 3 | Risk: Low severity
- [S] [SECURITY] Add runtime environment variable validation with Zod | Impact: 8 | Risk: Config errors
- [M] [SECURITY] Add rate limiting to historicalContext API endpoint | Impact: 9 | Risk: Cost overruns
- [S] [RELIABILITY] Add request timeout (AbortController) to Convex fetch | Impact: 8 | Risk: Hangs
- [M] [SECURITY] Review Bitcoin address handling and QR code generation | Impact: 7 | Risk: Cryptocurrency security | Source: PR #31 review

## High Priority [This Sprint]

### 🧪 Testing & Quality

- [L] [TEST] Add comprehensive tests for useChrondle hook | Impact: 9 | Coverage: Core game logic
- [L] [TEST] Add tests for GameTimeline (330 lines) and HintsDisplay (407 lines) | Impact: 7
- [M] [TEST] Add tests for useStreak, useNotifications, useClipboard hooks | Impact: 6
- [M] [TEST] Add integration tests for BC/AD toggle workflow | Impact: 6 | Coverage: New UI flow | Source: PR #31 review
- [S] [TEST] Add edge case tests for Bitcoin address validation | Impact: 5 | Coverage: Security | Source: PR #31 review

### ⚡ Performance & Monitoring

- [M] [MONITORING] Implement GPT-5 cost monitoring with spend alerts | Impact: 8 | ~4x Gemini costs
- [M] [MONITORING] Track historical context generation latency (<10s target) | Impact: 7
- [M] [MONITORING] Implement production telemetry (errors, API metrics) | Impact: 7

### 🏗️ Code Quality

- [L] [REFACTOR] Split GameTimeline.tsx (330 lines) into sub-components | Impact: 8 | Principle: Simplicity
- [M] [CLEANUP] Replace 60+ console.log/error with structured logging | Impact: 6 | Security risk

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

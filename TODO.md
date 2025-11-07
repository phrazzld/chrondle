# TODO: Chrondle Order Implementation

## Context

**Architecture:** Deep module with shared infrastructure (TASK.md section "Architecture Decision")

- Reuses Classic's orthogonal data source pattern (puzzle, auth, progress, session)
- Pure functional state derivation (`deriveOrderGameState`)
- Module boundaries defined with clear interfaces
- 60% code reuse from Classic, 40% Order-specific

**Key Files:**

- Backend: `convex/orderPuzzles/` (schema, queries, mutations, generation)
- State: `src/lib/deriveOrderGameState.ts`, `src/types/orderGameState.ts`
- Scoring: `src/lib/order/scoring.ts`, `src/lib/order/hints.ts`
- Components: `src/components/order/` (OrderGameContainer, DraggableEventCard, OrderReveal)
- Routes: `app/order/page.tsx`, `app/page.tsx` (smart homepage)

**Patterns to Follow:**

- State derivation: `src/lib/deriveGameState.ts` (orthogonal data sources → discriminated union)
- Convex schema: `convex/schema.ts` (tables with indexes)
- Custom hooks: `src/hooks/useChrondle.ts` (composition of data sources)
- Components: `src/components/GameLayout.tsx` (server preload → client hydration)
- Tests: `src/lib/__tests__/*.test.ts` (Vitest with comprehensive coverage)

**Timeline:** 3 weeks (60 hours) to MVP launch
**Bundle Budget:** +40KB gzipped (dnd-kit 25KB + Order code 15KB)

---

## Phase 1: Infrastructure & Backend (Week 1 - 20 hours)

### 1.1 Convex Schema & Backend Foundation

- [x] **Define Order puzzles Convex schema**

  ```
  Files: convex/schema.ts (add orderPuzzles and orderPlays tables)
  Architecture: Database layer - defines persistence for Order mode
  Pattern: Follow existing events/puzzles/plays table structure
  Success: Tables created with indexes, types generated in convex/_generated/
  Test: Verify schema compiles, indexes created, can insert test records
  Dependencies: None (independent task)
  Time: 1 hour

  Details:
  - orderPuzzles table: { puzzleNumber, date, events: Array<{id, year, text}>, seed, updatedAt }
  - orderPlays table: { userId, puzzleId, ordering: string[], hints: string[], completedAt, updatedAt }
  - Indexes: orderPuzzles.by_date, orderPuzzles.by_number, orderPlays.by_user_puzzle
  - No "targetYear" field (avoid Classic naming confusion per TASK.md risk mitigation)
  ```

- [x] **Implement event selection algorithm with spread constraint**

  ```
  Files: convex/orderPuzzles/generation.ts (new file)
  Architecture: Event Selection Module - implements stratified sampling
  Pseudocode: TASK.md Appendix "Event Selection Algorithm"
  Success: Generates 6 events with 100-2000 year span, excludes Classic year, deterministic
  Test: Unit tests for constraint validation, retry logic, edge cases (sparse periods, BC/AD)
  Dependencies: convex/schema.ts (reads events table)
  Time: 4 hours

  Details:
  - Implement selectEventsWithSpread() per TASK.md pseudocode
  - Stratified sampling: divide timeline into 6 buckets, pick one event per bucket
  - Retry logic (max 10 attempts) if span constraints violated
  - Edge cases: handle year 0 transition, sparse time periods, duplicate prevention
  - Deterministic PRNG from seed (date hash)
  ```

- [x] **Create daily Order puzzle generation cron job**

  ```
  Files: convex/crons.ts (add Order job), convex/orderPuzzles/mutations.ts (new file)
  Architecture: Scheduled action - generates Order puzzles at 00:00 UTC
  Pattern: Follow existing Classic puzzle generation cron structure
  Success: Cron runs daily, creates Order puzzle with no Classic year overlap, persists to DB
  Test: Manual trigger cron, verify puzzle created, no overlap with Classic for same date
  Dependencies: convex/orderPuzzles/generation.ts
  Time: 2 hours

  Details:
  - Add cron schedule: "0 0 * * *" (midnight UTC)
  - Mutation: generateDailyOrderPuzzle() calls selectEventsWithSpread()
  - Fetch Classic's daily year, pass as excludeYears param
  - Shuffle events deterministically before storing
  - Log generation metrics (span, retry count)
  ```

- [ ] **Implement Order puzzle queries (getDaily, getByNumber)**

  ```
  Files: convex/orderPuzzles/queries.ts (new file)
  Architecture: Query layer - fetch Order puzzles for client
  Pattern: Follow convex/puzzles/queries.ts structure
  Success: Queries return OrderPuzzle with events[], support archive mode
  Test: Query today's puzzle, query by number, handle not-found cases
  Dependencies: convex/schema.ts
  Time: 1.5 hours

  Details:
  - getDailyOrderPuzzle(): fetch by today's date
  - getOrderPuzzleByNumber(n): fetch specific puzzle for archive
  - Return events pre-shuffled (client doesn't see correct order until reveal)
  - Handle edge case: puzzle not yet generated (return error state)
  ```

### 1.2 Type System & State Derivation

- [ ] **Define OrderGameState discriminated union types**

  ```
  Files: src/types/orderGameState.ts (new file)
  Architecture: Type system - defines all Order game states
  Pattern: Follow src/types/gameState.ts structure (discriminated unions)
  Success: Types compile, cover all states (loading, ready, completed, error)
  Test: TypeScript compilation, exhaustive switch statement checking
  Dependencies: None (independent task)
  Time: 1 hour

  Details:
  - type OrderGameState = loading-puzzle | loading-auth | loading-progress | ready | completed | error
  - interface OrderPuzzle, OrderEvent, OrderHint, OrderScore
  - Discriminated unions ensure type safety in state machine
  - Export all types for use in hooks and components
  ```

- [ ] **Implement deriveOrderGameState pure function**

  ```
  Files: src/lib/deriveOrderGameState.ts (new file)
  Architecture: Order Game State Module - pure functional state derivation
  Pattern: Follow src/lib/deriveGameState.ts (orthogonal data sources)
  Success: Returns correct OrderGameState for all input combinations, no race conditions
  Test: Unit tests for all state transitions, edge cases (auth loading, puzzle missing)
  Dependencies: src/types/orderGameState.ts
  Time: 3 hours

  Details:
  - Input: DataSources { puzzle, auth, progress, session }
  - Output: OrderGameState (discriminated union)
  - Reconcile server ordering (progress) with session ordering (localStorage)
  - Detect completion: all events ordered + committed, or completedAt timestamp
  - Handle loading states: prioritize puzzle loading → auth → progress
  - Edge case: anonymous user completion (no server persistence)
  ```

- [ ] **Create useOrderGame composition hook**

  ```
  Files: src/hooks/useOrderGame.ts (new file)
  Architecture: State Management Layer - composes orthogonal data sources
  Pattern: Follow src/hooks/useChrondle.ts structure
  Success: Returns OrderGameState and actions, updates reactively via Convex
  Test: Integration test with mocked data sources, verify state derivation
  Dependencies: src/lib/deriveOrderGameState.ts, Convex queries
  Time: 2.5 hours

  Details:
  - useOrderPuzzleData() - fetch daily Order puzzle
  - useAuthState() - reuse from Classic
  - useOrderProgress() - fetch user's play for this puzzle
  - useOrderSession() - localStorage for anonymous users
  - Compose via deriveOrderGameState()
  - Return actions: { reorderEvents, takeHint, commitOrdering }
  ```

### 1.3 Routing & Navigation

- [ ] **Implement smart homepage with cookie-based mode routing**

  ```
  Files: app/page.tsx (modify existing)
  Architecture: Navigation Layer - smart default with contextual discovery
  Pattern: Cookie-based preference persistence, server-side redirect
  Success: Returning users auto-redirect to preferred mode, first-time see gallery
  Test: Test with/without cookie, verify crawler sees gallery, redirect works
  Dependencies: None (independent task)
  Time: 2 hours

  Details:
  - Check chrondle_mode cookie
  - If no cookie: render GamesGallery component
  - If cookie='classic': redirect to /classic
  - If cookie='order': redirect to /order
  - Crawler detection: show gallery to bots (SEO)
  - Set cookie on mode selection (365 day expiry)
  ```

- [ ] **Create Order game page with server preload**

  ```
  Files: app/order/page.tsx (new file)
  Architecture: Page Layer - server component with Convex preload
  Pattern: Follow app/page.tsx (Classic) structure
  Success: Order puzzle pre-loaded server-side, instant client hydration
  Test: Verify no loading state on initial render, puzzle data present
  Dependencies: convex/orderPuzzles/queries.ts, useOrderGame hook
  Time: 1.5 hours

  Details:
  - Server component: preloadQuery(api.orderPuzzles.getDaily)
  - Pass preloaded data to OrderGameIsland (client component)
  - OrderGameIsland uses usePreloadedQuery for instant hydration
  - Add mode switcher in header
  ```

- [ ] **Create games gallery component for first-time visitors**

  ```
  Files: src/components/GamesGallery.tsx (new file)
  Architecture: Navigation UI - mode discovery for new users
  Pattern: Simple grid layout with mode cards
  Success: Shows Classic and Order options, sets cookie on selection
  Test: Click Classic → redirect + cookie set, click Order → redirect + cookie set
  Dependencies: None (UI only)
  Time: 2 hours

  Details:
  - Two mode cards: Classic (Guess the Year) and Order (Arrange Events)
  - Each card: title, description, icon, "Play" button
  - On click: set chrondle_mode cookie, navigate to /classic or /order
  - Responsive layout (mobile-first)
  - Accessible (keyboard nav, screen reader labels)
  ```

---

## Phase 2: Core Mechanics (Week 2 - 20 hours)

### 2.1 Drag-and-Drop System

- [ ] **Install and configure dnd-kit dependencies**

  ```
  Files: package.json, pnpm-lock.yaml
  Architecture: Dependency management
  Success: dnd-kit installed, TypeScript types available, no conflicts
  Test: pnpm install runs cleanly, imports work, bundle size < budget
  Dependencies: None (independent task)
  Time: 15 minutes

  Command: pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  ```

- [ ] **Create DraggableEventCard component with dnd-kit integration**

  ```
  Files: src/components/order/DraggableEventCard.tsx (new file)
  Architecture: Draggable Event Card Module - controlled drag-drop component
  Pattern: dnd-kit useSortable hook with Motion animations
  Success: Card draggable via mouse/touch, shows drag preview, keyboard accessible
  Test: Drag card with mouse, drag with touch, reorder with keyboard, screen reader announces
  Dependencies: @dnd-kit/sortable, motion
  Time: 4 hours

  Details:
  - Props: event, index, isLocked, activeHints, onMoveUp, onMoveDown
  - useSortable() hook for drag behavior
  - Drag handle with accessible label
  - Keyboard alternatives: up/down arrow buttons
  - Show hint indicators (🔒 anchor, 📊 relative, 📅 bracket)
  - Respect prefers-reduced-motion for animations
  - Touch optimization: proper touch targets (56px minimum)
  ```

- [ ] **Implement OrderEventList with SortableContext**

  ```
  Files: src/components/order/OrderEventList.tsx (new file)
  Architecture: Sortable List Container - manages event ordering state
  Pattern: DndContext + SortableContext wrapper
  Success: Events reorderable via drag, keyboard, and buttons; state updates reactively
  Test: Reorder events all 3 ways, verify state updates, test on mobile
  Dependencies: DraggableEventCard, @dnd-kit/sortable
  Time: 3 hours

  Details:
  - DndContext with PointerSensor and KeyboardSensor
  - SortableContext with verticalListSortingStrategy
  - onDragEnd handler updates ordering state
  - useDndMonitor for screen reader announcements
  - Live region for accessibility announcements
  - Handle locked events (disable dragging for anchored cards)
  ```

### 2.2 Hint System

- [ ] **Implement hint generation functions (Anchor, Relative, Bracket)**

  ```
  Files: src/lib/order/hints.ts (new file)
  Architecture: Hint Generation Module - pure functions for hint logic
  Pseudocode: TASK.md section "Hint Generation"
  Success: All 3 hint types generate correctly, handle edge cases
  Test: Unit tests for each hint type, test with various orderings
  Dependencies: None (pure functions)
  Time: 3 hours

  Details:
  - generateAnchorHint(current, correct): find event in correct position or reveal one
  - generateRelativeHint(current, events): find misordered pair, return comparison
  - generateBracketHint(event): reuse Classic's year range logic (±25 years)
  - All functions pure, deterministic, testable in isolation
  - Handle edge cases: all correct (no misordered pairs), BC/AD transitions
  ```

- [ ] **Create HintDisplay component with expandable UI**

  ```
  Files: src/components/order/HintDisplay.tsx (new file)
  Architecture: Hint UI - shows active hints without card clutter
  Pattern: Expandable accordion section with hint list
  Success: Hints display clearly, Hmult shown, expandable/collapsible
  Test: Take hint → displays, take multiple → all visible, Hmult updates correctly
  Dependencies: src/lib/order/hints.ts, Radix UI Accordion
  Time: 2.5 hours

  Details:
  - Accordion for expandable hint section
  - Show hint type icon (🔒, 📊, 📅) and description
  - Display current Hmult (e.g., "0.85× multiplier")
  - Button to take each hint type (disable if already taken)
  - Accessible: keyboard nav, screen reader support
  - Mobile: bottom sheet pattern for hints
  ```

### 2.3 Scoring System

- [ ] **Implement pairwise correctness scoring algorithm**

  ```
  Files: src/lib/order/scoring.ts (new file)
  Architecture: Scoring Module - pure function for pairwise scoring
  Pseudocode: TASK.md Appendix "Scoring Algorithm"
  Success: Calculates correct pairs, applies Hmult, returns OrderScore object
  Test: 15+ unit tests (perfect, reversed, random, edge cases)
  Dependencies: None (pure function)
  Time: 2 hours

  Details:
  - scoreOrderSubmission(playerOrdering, events, hintsUsed): OrderScore
  - O(n²) pairwise comparison: for all i < j, check if order matches true chronology
  - Apply hint multiplier: Hmult = [1.00, 0.85, 0.70, 0.50][hintsUsed]
  - Return: { total_score, correct_pairs, total_pairs, hmult }
  - Test edge cases: perfect order (15/15), reversed (0/15), partial (8/15)
  ```

- [ ] **Create server-side scoring mutation with validation**

  ```
  Files: convex/orderPuzzles/mutations.ts (add submitOrderPlay mutation)
  Architecture: Mutation Layer - persist play and validate score
  Pattern: Follow convex/puzzles/mutations.ts (submitGuess)
  Success: Server validates client score, persists play, returns verified score
  Test: Submit play with correct/incorrect ordering, verify server score matches
  Dependencies: src/lib/order/scoring.ts (reuse algorithm server-side)
  Time: 2 hours

  Details:
  - Input: { puzzleId, userId, ordering, hints, clientScore }
  - Fetch puzzle events, calculate server score
  - Validate: abs(clientScore - serverScore) < 1 (account for rounding)
  - Persist to orderPlays table
  - Update user stats if authenticated (streak, totalPlays)
  - Return: { verifiedScore, correct_pairs, total_pairs }
  ```

### 2.4 Session Management

- [ ] **Implement useOrderSession hook for localStorage**

  ```
  Files: src/hooks/useOrderSession.ts (new file)
  Architecture: Session Management - localStorage for anonymous users
  Pattern: Follow useLocalSession from Classic (debounced writes, 30-day pruning)
  Success: Ordering persisted to localStorage, survives refresh, pruning works
  Test: Reorder events → refresh → state restored, test pruning after 30 days
  Dependencies: None (localStorage API)
  Time: 2.5 hours

  Details:
  - localStorage key: `chrondle_order_session_${puzzleId}`
  - Store: { ordering: string[], hints: OrderHint[], lastUpdated: timestamp }
  - Debounce writes (300ms) to reduce localStorage thrashing
  - Aggressive pruning: delete sessions older than 30 days on mount
  - Handle quota exceeded error (warn user, try to free space)
  ```

---

## Phase 3: Polish & Launch (Week 3 - 20 hours)

### 3.1 Reveal Screen

- [ ] **Create OrderReveal component with simple list layout**

  ```
  Files: src/components/order/OrderReveal.tsx (new file)
  Architecture: Reveal UI - shows correct order and score breakdown
  Pattern: Simple list with staggered Motion animations (not timeline)
  Success: Shows correct chronological order, highlights misordered pairs, displays score
  Test: Complete game → see reveal, verify correct order shown, misordered pairs marked
  Dependencies: src/lib/order/scoring.ts
  Time: 3 hours

  Details:
  - List of events in correct chronological order with years
  - Visual indicator for misordered pairs (red X icon or highlight)
  - Score breakdown: "12/15 pairs correct - Score: 20 points"
  - Staggered entrance animation (100ms delay per card)
  - Share button (generates spoiler-free card)
  - Respect prefers-reduced-motion
  ```

- [ ] **Implement share card generation for Order mode**

  ```
  Files: src/lib/order/shareCard.ts (new file)
  Architecture: Share Card - canvas-based spoiler-free result image
  Pattern: Follow Classic's share card generation (if exists)
  Success: Generates image with ordering result, no spoilers (hides years)
  Test: Generate card → verify format matches TASK.md design, test on mobile
  Dependencies: OrderReveal component
  Time: 2 hours

  Details:
  - Canvas-based rendering (no external dependencies)
  - Format: "CHRONDLE ORDER [Date] ✓✗✓✓✗✓ 12/15 pairs correct, Score: 20"
  - No year spoilers (just checkmarks/X for correct/incorrect)
  - Copy to clipboard functionality
  - Include chrondle.com link
  ```

### 3.2 Animations & Polish

- [ ] **Integrate drag-drop animations with existing animation constants**

  ```
  Files: src/components/order/DraggableEventCard.tsx (modify), src/lib/animationConstants.ts (add Order constants)
  Architecture: Animation system - coordinate drag animations with hint reveals
  Pattern: Reuse ANIMATION_DURATIONS, ANIMATION_SPRINGS from Classic
  Success: Drag feels smooth (60fps), doesn't conflict with hint animations
  Test: Drag while hint animating → no jank, test on throttled device (iPhone SE)
  Dependencies: src/lib/animationConstants.ts, motion
  Time: 2 hours

  Details:
  - Drag preview: lift with shadow (150ms)
  - Drop animation: spring physics (400ms)
  - Priority system: pause non-critical animations during drag
  - Add ORDER_DRAG, ORDER_DROP constants to animationConstants.ts
  - Respect prefers-reduced-motion (instant position changes)
  ```

- [ ] **Add reveal stagger animation with spring physics**

  ```
  Files: src/components/order/OrderReveal.tsx (modify)
  Architecture: Animation - staggered reveal for visual impact
  Pattern: Motion staggerChildren with spring animations
  Success: Events reveal sequentially, feels polished, respects reduced motion
  Test: Complete game → reveal animates smoothly, test reduced motion preference
  Dependencies: motion, src/lib/animationConstants.ts
  Time: 1.5 hours

  Details:
  - containerVariants with staggerChildren: 0.1s delay between items
  - itemVariants with spring physics (ANIMATION_SPRINGS.GENTLE)
  - First item delay: 300ms (let score animate first)
  - Reduced motion: instant appearance, no stagger
  ```

### 3.3 Accessibility Testing & Fixes

- [ ] **Conduct comprehensive accessibility audit (VoiceOver, NVDA, keyboard-only)**

  ```
  Files: All Order components (audit and fix issues)
  Architecture: Accessibility compliance - WCAG 2.1 AA validation
  Success: Lighthouse accessibility score ≥95, no blocking issues
  Test: Manual testing with screen readers, keyboard only, TalkBack (Android)
  Dependencies: All Order components completed
  Time: 6 hours (2 days dedicated)

  Details:
  - VoiceOver (macOS): test full game flow, verify announcements
  - NVDA (Windows): test on Windows machine or VM
  - Keyboard-only: complete game without mouse (tab, arrow keys, space/enter)
  - TalkBack (Android): test mobile drag-drop and buttons
  - Lighthouse audit: run and fix all issues until ≥95 score
  - Common fixes: missing ARIA labels, focus order, contrast violations
  ```

- [ ] **Fix accessibility violations from audit**

  ```
  Files: Multiple components (based on audit findings)
  Architecture: Accessibility fixes - address specific violations
  Success: All violations resolved, Lighthouse score ≥95
  Test: Re-run Lighthouse, verify all screen reader announcements work
  Dependencies: Accessibility audit completed
  Time: 2 hours (included in audit time above)

  Details:
  - Add missing ARIA labels (drag handles, buttons, status regions)
  - Fix focus order (logical tab sequence)
  - Fix color contrast violations (ensure 4.5:1 minimum)
  - Add live regions for dynamic content (reordering, score)
  - Test fixes with screen readers
  ```

### 3.4 Cross-Mode Integration

- [ ] **Add mode switcher to Classic header**

  ```
  Files: src/components/GameHeader.tsx or similar (modify existing)
  Architecture: Navigation UI - compact dropdown for mode selection
  Pattern: Radix UI Select or custom dropdown
  Success: User can switch between Classic and Order from any page
  Test: Click dropdown → select Order → navigate, cookie updates
  Dependencies: GamesGallery cookie logic
  Time: 1.5 hours

  Details:
  - Compact dropdown in header (top-right)
  - Options: "Classic (Guess Year)", "Order (Arrange Events)"
  - On select: set chrondle_mode cookie, navigate to /classic or /order
  - Show current mode as selected
  - Accessible: keyboard nav, screen reader support
  ```

- [ ] **Add cross-promotion after Classic completion**

  ```
  Files: src/components/GameComplete.tsx or similar (modify existing)
  Architecture: Cross-promotion - contextual discovery
  Pattern: CTA banner after Classic game over
  Success: After Classic completion, see "Try Order mode" promotion
  Test: Complete Classic → see promotion, click → navigate to Order
  Dependencies: Mode switcher logic
  Time: 1 hour

  Details:
  - Show banner: "Try Order mode! Arrange events chronologically."
  - "Play Order" button (primary CTA)
  - Only show if user hasn't played Order yet (check cookie or session)
  - Dismissible (close button)
  - Track click in analytics
  ```

### 3.5 Performance & QA

- [ ] **Performance testing on slow device (iPhone SE, throttled CPU)**

  ```
  Files: All Order components (measure and optimize)
  Architecture: Performance validation
  Success: 60fps drag on iPhone SE, <100ms localStorage ops, <300ms reveal
  Test: Chrome DevTools throttling (4x slowdown), real iPhone SE if available
  Dependencies: All Order components completed
  Time: 2 hours

  Details:
  - Chrome DevTools: Throttle CPU 4x, test drag performance
  - Measure: drag frame rate (should be 60fps), localStorage read/write time
  - Profile: identify slow operations, optimize hot paths
  - Test: reveal animation timing (should complete in <300ms)
  - Real device: test on actual iPhone SE 2020 if available
  ```

- [ ] **Cross-browser testing (Chrome, Safari, Firefox)**

  ```
  Files: All Order components (test and fix browser-specific issues)
  Architecture: Cross-browser compatibility
  Success: Order works identically on Chrome, Safari, Firefox (desktop + mobile)
  Test: Manual testing on all browsers, fix browser-specific bugs
  Dependencies: All Order components completed
  Time: 2 hours

  Details:
  - Test: Chrome (desktop + mobile), Safari (desktop + mobile), Firefox
  - Focus areas: drag-drop behavior, localStorage, CSS animations
  - Fix: browser-specific CSS issues, drag-drop quirks
  - Verify: dnd-kit works across all browsers (should be compatible)
  - Mobile: test on iOS Safari and Chrome Android
  ```

### 3.6 Documentation & Deployment

- [ ] **Update BACKLOG.md with deferred features**

  ```
  Files: BACKLOG.md (append Order deferred features)
  Architecture: Documentation - track future enhancements
  Success: Timeline visualization, hard mode, leaderboards added to backlog
  Test: File exists, formatted correctly, features clearly described
  Dependencies: None (documentation only)
  Time: 30 minutes

  Details:
  - Add section: "## Order Mode - Post-Launch Enhancements"
  - Timeline visualization with connection lines (deferred per TASK.md Decision 5)
  - Hard mode (no hints allowed)
  - Challenge mode (same events, compete with friends)
  - Leaderboards (daily/weekly/all-time)
  ```

- [ ] **Write CHANGELOG entry for Order mode launch**

  ```
  Files: CHANGELOG.md (add Order launch entry)
  Architecture: Documentation - release notes
  Success: Changelog describes Order mode, features, and improvements
  Test: File exists, follows existing format, complete description
  Dependencies: None (documentation only)
  Time: 30 minutes

  Details:
  - Add entry: "## [1.1.0] - 2025-XX-XX"
  - Section: "### Added"
  - Features: Order mode (drag-to-arrange events), 3 hint types, pairwise scoring
  - Improvements: Games gallery, mode switcher, smart homepage
  - Bundle size: +40KB (note for transparency)
  ```

---

## Design Iteration Checkpoints

### After Phase 1 (Week 1 Review)

**Goal:** Validate architecture before building UI

**Review:**

- [ ] Is event selection generating interesting puzzles? (test with 30 days of data)
- [ ] Are module boundaries clean? (data sources truly orthogonal?)
- [ ] Is state derivation logic clear and testable?

**Potential Refactoring:**

- If event selection produces boring puzzles → adjust min/max span, add manual curation
- If state derivation has coupling → extract shared logic, simplify interfaces
- If types are unclear → rename for clarity, add documentation

### After Phase 2 (Week 2 Review)

**Goal:** Validate game feel and mechanics

**Review:**

- [ ] Does drag-drop feel smooth? (60fps on mobile?)
- [ ] Are hints intuitive and helpful?
- [ ] Is scoring algorithm balanced? (60-70% average score?)

**Potential Refactoring:**

- If drag is janky → optimize animations, reduce complexity
- If hints are confusing → redesign UI, improve messaging
- If scoring is too easy/hard → adjust pair_value constant, tune Hmult

### After Phase 3 (Week 3 Review)

**Goal:** Validate polish and launch readiness

**Review:**

- [ ] Does reveal screen feel satisfying?
- [ ] Are there any accessibility gaps?
- [ ] Is performance acceptable on slow devices?

**Potential Refactoring:**

- If reveal is underwhelming → enhance animations, add celebratory elements
- If accessibility issues → fix immediately (blocking for launch)
- If performance issues → profile, optimize, consider cutting features

---

## Automation Opportunities

**Identified Repetitive Tasks:**

1. **Daily puzzle generation testing:** Script to generate 30 days of puzzles, verify constraints

   ```bash
   # scripts/test-order-generation.ts
   # Generates 30 days, checks span, overlap, logs metrics
   ```

2. **Bundle size monitoring:** Add size-limit check for Order-specific code

   ```json
   // .size-limit.json
   { "name": "Order mode bundle", "path": "dist/order/**/*", "limit": "50 KB" }
   ```

3. **Accessibility regression prevention:** Add Lighthouse CI to prevent score drops

   ```yaml
   # .github/workflows/lighthouse.yml
   # Run Lighthouse on /order route, fail if score < 95
   ```

4. **Cross-browser screenshot testing:** Playwright visual regression tests for Order UI
   ```typescript
   // e2e/order-visual.spec.ts
   // Screenshot tests for drag-drop states, reveal screen
   ```

---

## Notes

**Critical Path:**
Phase 1 → Phase 2 → Phase 3 (sequential, but tasks within each phase can be parallelized)

**Parallelization Opportunities:**

- Phase 1.1 (backend) can run in parallel with Phase 1.2 (types)
- Phase 2.1 (drag-drop) independent of Phase 2.2 (hints) and Phase 2.3 (scoring)
- Phase 3 tasks mostly sequential (need completed mechanics for testing)

**Risk Mitigation Built-In:**

- Event selection: Manual curation of first 30 days (catch boring puzzles early)
- Performance: Test on iPhone SE throughout (not just end)
- Accessibility: 2 days dedicated testing (can't skip)
- localStorage: Aggressive pruning prevents quota issues

**Success Metrics Tracking:**

- Monitor adoption (20% target), completion rate (80% target), share rate (8% target)
- Lighthouse score (95+ target), bundle size (40KB target)
- 60fps drag performance (mandatory)

---

**Estimated Total Time:** 60 hours (3 weeks at 20 hours/week)
**Tasks:** 35 implementation tasks
**Documentation:** 2 tasks (BACKLOG, CHANGELOG)
**Testing:** Built into each task + 2 dedicated accessibility days

**Status:** ✅ Ready for implementation
**Next Step:** Check out feature branch, start with Phase 1.1 (Convex schema)

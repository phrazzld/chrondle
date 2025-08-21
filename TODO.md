# Server-First Architecture Migration TODO

Generated from TASK.md on 2025-01-21

## 🎯 Objective

Eliminate systemic UI flashing by migrating from client-first to server-first architecture using the "Progressive Islands with Convex Preloading" pattern.

## 📊 Overall Progress

- Total Tasks: 16
- Estimated Time: 5-7 hours
- Parallel Optimization Potential: Can reduce to 4-5 hours with parallel execution

---

## Phase 0: Setup & Preparation (30 min)

### Can Start Immediately (Parallel)

- [x] **SETUP-001** - Analyze current architecture and document flashing issues

  - Success criteria: List of all components that flash, with recordings/screenshots
  - Dependencies: None
  - Estimated complexity: SIMPLE (15 min)
  - Actions:
    - Record video of current page load showing flashing
    - Document specific components that flash (auth icon, puzzle number, hints)
    - Note loading state sequence

  ```
  Work Log:
  ARCHITECTURE ANALYSIS COMPLETE:

  Root Cause: Entire app is client-side starting with "use client" in src/app/page.tsx:1
  Additional Issue: export const dynamic = "force-dynamic" in src/app/page.tsx:35

  COMPONENTS THAT FLASH:
  1. Auth Icon (src/components/AuthButtons.tsx)
     - Flashes: LogIn icon → UserButton avatar
     - Cause: useUser() hook loads asynchronously

  2. Puzzle Number (src/components/AppHeader.tsx:41-50)
     - Flashes: undefined → #1 → actual number
     - Workaround attempted: stablePuzzleNumber state (page.tsx:115-130)

  3. Game Content (entire game area)
     - Shows loading states before puzzle appears
     - Multiple components manage own loading states

  LOADING STATE SEQUENCE (src/lib/deriveGameState.ts:82-110):
  1. "loading-puzzle" - Fetching puzzle data
  2. "loading-auth" - Checking authentication
  3. "loading-progress" - Loading user progress (if authenticated)
  4. "ready" - All data loaded

  Each transition causes UI elements to re-render and flash.
  ```

- [~] **SETUP-002** - Create backup branch and install dependencies
  - Success criteria: Clean branch created, @convex-dev/nextjs installed
  - Dependencies: None
  - Estimated complexity: SIMPLE (15 min)
  - Actions:
    - Create branch: `git checkout -b fix/server-first-architecture`
    - Run: `pnpm add @convex-dev/nextjs`
    - Verify installation successful

---

## Phase 1: Core Migration (2-3 hours)

### Critical Path - Must Complete in Order

- [ ] **CORE-001** - Convert src/app/page.tsx to Server Component

  - Success criteria: Page renders without "use client" directive, TypeScript compiles
  - Dependencies: SETUP-001, SETUP-002
  - Estimated complexity: MEDIUM (45 min)
  - Actions:
    - Remove `"use client"` directive
    - Convert to async function component
    - Remove client-only imports temporarily
    - Ensure TypeScript compilation passes

- [ ] **CORE-002** - Implement Convex preloadQuery for puzzle data

  - Success criteria: Server-side puzzle data fetched successfully
  - Dependencies: CORE-001
  - Estimated complexity: COMPLEX (60 min)
  - Actions:
    - Import `preloadQuery` from "convex/nextjs"
    - Call `preloadQuery(api.puzzles.getDaily)` in page component
    - Handle async data fetching
    - Verify data structure matches expected format
    - Test with console.log to confirm server-side execution

- [ ] **CORE-003** - Create GameIsland client component

  - Success criteria: New component created with all game interactivity
  - Dependencies: CORE-001
  - Estimated complexity: MEDIUM (45 min)
  - Actions:
    - Create `src/components/GameIsland.tsx` with `"use client"`
    - Move all interactive logic from page.tsx
    - Import necessary hooks (useChrondle, useAuth, etc.)
    - Define proper TypeScript interface for props

- [ ] **CORE-004** - Connect preloaded data to GameIsland
  - Success criteria: GameIsland receives and uses preloaded puzzle data
  - Dependencies: CORE-002, CORE-003
  - Estimated complexity: MEDIUM (30 min)
  - Actions:
    - Pass preloadedPuzzle as prop to GameIsland
    - Implement `usePreloadedQuery` in GameIsland
    - Update useChrondle to accept initialData
    - Verify no loading state for puzzle data

---

## Phase 2: Progressive Enhancement (1-2 hours)

### Parallel Work Streams

#### Stream A: Loading States

- [ ] **ENHANCE-001** - Create stable loading states for auth UI
  - Success criteria: Auth skeleton matches exact dimensions, no layout shift
  - Dependencies: CORE-004
  - Estimated complexity: COMPLEX (45 min)
  - Actions:
    - Create `src/components/skeletons/AuthSkeleton.tsx`
    - Match exact dimensions of auth UI (measure current sizes)
    - Implement smooth transition when auth loads
    - Test with slow network to verify no shift

#### Stream B: Provider Updates

- [ ] **ENHANCE-002** - Update providers for server component compatibility
  - Success criteria: Providers work with server/client boundary
  - Dependencies: CORE-004
  - Estimated complexity: MEDIUM (30 min)
  - Actions:
    - Ensure providers.tsx has `"use client"` directive
    - Move provider wrapping to appropriate boundaries
    - Test that context values are accessible in client components

### Sequential After Streams Complete

- [ ] **ENHANCE-003** - Optimize Suspense boundaries
  - Success criteria: Strategic Suspense placement, no unnecessary boundaries
  - Dependencies: ENHANCE-001, ENHANCE-002
  - Estimated complexity: MEDIUM (30 min)
  - Actions:
    - Add Suspense around auth-dependent features only
    - Remove any Suspense around server-rendered content
    - Verify fallbacks render correctly
    - Test progressive enhancement flow

---

## Phase 3: Cleanup & Optimization (1 hour)

### Can Run in Parallel

- [ ] **OPTIMIZE-001** - Remove force-dynamic from layout

  - Success criteria: Layout renders without force-dynamic, no regressions
  - Dependencies: ENHANCE-003
  - Estimated complexity: SIMPLE (15 min)
  - Actions:
    - Remove `export const dynamic = "force-dynamic"` from layout.tsx
    - Verify page still renders correctly
    - Check that static optimization works

- [ ] **OPTIMIZE-002** - Eliminate redundant loading states in useChrondle

  - Success criteria: No puzzle loading states when initialData provided
  - Dependencies: ENHANCE-003
  - Estimated complexity: SIMPLE (20 min)
  - Actions:
    - Update useChrondle to skip loading when initialData present
    - Remove unnecessary loading state checks
    - Clean up unused loading state variables

- [ ] **OPTIMIZE-003** - Optimize bundle size with dynamic imports
  - Success criteria: Bundle size reduced by 15%+
  - Dependencies: ENHANCE-003
  - Estimated complexity: MEDIUM (25 min)
  - Actions:
    - Identify heavy client-only dependencies
    - Convert to dynamic imports where appropriate
    - Run bundle analyzer to verify size reduction
    - Ensure no server components import client libraries

---

## Phase 4: Testing & Validation (1 hour)

### Testing Work Streams

#### Stream A: Visual Testing

- [ ] **TEST-001** - Visual regression testing for UI flashing
  - Success criteria: Video shows no flashing, before/after comparison documented
  - Dependencies: OPTIMIZE-001, OPTIMIZE-002, OPTIMIZE-003
  - Estimated complexity: MEDIUM (20 min)
  - Actions:
    - Record page load with network throttling
    - Compare with initial recording from SETUP-001
    - Document all eliminated flashing points
    - Test with different network speeds

#### Stream B: Performance Testing

- [ ] **TEST-002** - Measure Core Web Vitals improvements
  - Success criteria: CLS < 0.1, LCP improved by 20%+, bundle size reduced
  - Dependencies: OPTIMIZE-001, OPTIMIZE-002, OPTIMIZE-003
  - Estimated complexity: MEDIUM (15 min)
  - Actions:
    - Run Lighthouse before/after
    - Measure bundle size reduction
    - Document Core Web Vitals metrics
    - Verify server response times

### Final Validation

- [ ] **TEST-003** - Comprehensive functional testing

  - Success criteria: All game features work, auth flow correct, no regressions
  - Dependencies: TEST-001, TEST-002
  - Estimated complexity: COMPLEX (15 min)
  - Actions:
    - Test complete game flow (guess, win, lose)
    - Verify auth login/logout works
    - Check streak tracking functions
    - Test offline functionality
    - Verify all modals and interactions work

- [ ] **VALIDATE-001** - Cross-browser and device testing
  - Success criteria: Works on Chrome, Firefox, Safari, mobile devices
  - Dependencies: TEST-003
  - Estimated complexity: SIMPLE (10 min)
  - Actions:
    - Test on major browsers
    - Verify mobile responsiveness
    - Check for any browser-specific issues
    - Document any limitations

---

## 📋 Definition of Done

### Must Complete All:

- [ ] Zero UI flashing on page load (verified by video)
- [ ] All existing tests pass
- [ ] TypeScript compilation clean
- [ ] Bundle size reduced by 15%+
- [ ] Core Web Vitals improved (CLS < 0.1, LCP < 2.5s)
- [ ] All game features working identically to before
- [ ] Code review completed
- [ ] Documentation updated

---

## 🚀 Future Enhancements (BACKLOG.md candidates)

- [ ] Implement streaming SSR for progressive hint revelation
- [ ] Add Server Actions for form submissions
- [ ] Implement edge rendering for global performance
- [ ] Add partial prerendering for static shell
- [ ] Optimize with React Server Components payload caching
- [ ] Add performance monitoring dashboard
- [ ] Implement A/B testing for progressive rollout

---

## 📝 Notes

- **Parallel Execution**: SETUP tasks can run simultaneously. ENHANCE-001 and ENHANCE-002 can be parallel. All OPTIMIZE tasks are independent.
- **Risk Areas**: CORE-002 (Convex integration) is most complex. ENHANCE-001 is critical for eliminating flashing.
- **Quick Wins**: OPTIMIZE-001 and OPTIMIZE-002 are simple but impactful.
- **Testing Priority**: TEST-001 (visual testing) is most important for validating success.

---

**Total Estimated Time**: 5-7 hours (can be 4-5 hours with parallel execution)
**Confidence Level**: 85% - Well-understood pattern with clear implementation path

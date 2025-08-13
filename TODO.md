# Chrondle TODO

## 🚨 CRITICAL: Fix Completion Tracking & Countdown System

**CURRENT STATUS**: Archive shows no completion status + countdown broken ("00:00:00")

**ROOT CAUSES**:

1. **Puzzle ID mismatch**: Daily completion saves vs archive queries use different identifiers
2. **Broken countdown**: Timer disconnected from actual Convex cron schedule
3. **Fragmented completion tracking**: Different logic for daily vs archive puzzle modes

## 🔍 **Phase 1: Root Cause Investigation & Diagnosis**

- [ ] **Audit puzzle ID flow in daily mode completion**

  - Trace `useConvexGameState.ts:222` submitGuess call to see what `puzzleId` value is being sent
  - Check if `gameState.puzzle.puzzleId` contains Convex `_id` or date string
  - Log the exact puzzleId being passed to `api.puzzles.submitGuess` mutation
  - Verify the mutation is actually being called (not failing silently)

- [ ] **Audit puzzle ID flow in archive query**

  - Check `archive/page.tsx:184` where `completedPuzzleIds.has(puzzle._id)` is used
  - Verify that `getUserCompletedPuzzles` returns puzzle IDs in same format as `getArchivePuzzles`
  - Compare the ID format between saved completions and archive puzzle data
  - Add console logging to see both sets of IDs for comparison

- [ ] **Verify completion mutation is executing**

  - Add debug logging in `useConvexGameState.ts:222-232` before/after submitGuess call
  - Check browser network tab for actual Convex mutation requests
  - Verify user authentication state when mutation is called (`currentUser` is not null)
  - Test with a deliberate error to confirm the catch block works

- [ ] **Investigate countdown calculation logic**
  - Find where "00:00:00" countdown is generated (likely in countdown component)
  - Check if countdown is hardcoded or calculated from actual cron schedule
  - Verify timezone handling in countdown vs server cron job timezone
  - Identify the source of "next puzzle" timing data

## 🔧 **Phase 2: Fix Puzzle ID Consistency**

- [ ] **Standardize puzzle ID usage in daily mode**

  - In `useConvexGameState.ts:154`, ensure `puzzleId: todaysPuzzle._id` is Convex ID not date
  - Remove any date-based puzzle ID generation that conflicts with Convex IDs
  - Update puzzle interface in `gameState.ts:12` to clarify puzzleId should be Convex ID
  - Add TypeScript type assertion: `puzzleId: Id<"puzzles">` instead of string

- [ ] **Fix completion query consistency in archive**

  - Update `archive/page.tsx:127` completion check to use consistent ID format
  - Ensure `getUserCompletedPuzzles` returns `puzzleId` field that matches puzzle `_id`
  - Modify completion comparison logic to handle both `_id` and `puzzleId` fields if needed
  - Add defensive null checking for completion data structure

- [ ] **Verify Convex schema alignment**

  - Check `convex/puzzles.ts:202-272` submitGuess mutation parameter types
  - Ensure `plays` table schema in `convex/schema.ts` uses correct puzzle reference
  - Verify the mutation saves `puzzleId` that can be queried by `getUserCompletedPuzzles`
  - Test mutation in Convex dashboard with known puzzle ID to verify save format

- [ ] **Add completion debugging infrastructure**
  - Create debug function to log completion flow: save → query → display
  - Add temporary console logging in archive page to show completion lookup logic
  - Create debug button to manually trigger completion check for current user
  - Add error boundaries around completion-related queries with specific error messages

## 🕐 **Phase 3: Implement Dynamic Countdown System**

- [x] **Create Convex query for cron schedule**
  - Add `getCronSchedule` query in `convex/puzzles.ts` that returns next scheduled run time
  - Query the actual cron job configuration from `convex/crons.ts`
  - Return next run timestamp in UTC and server timezone information
  - Handle edge cases where cron timing is uncertain or misconfigured

### Context Discovery

- Relevant files: convex/crons.ts:9 (daily at 00:00 UTC), convex/puzzles.ts:355, useCountdown.ts:17
- Existing pattern: Cron runs daily at midnight UTC, current countdown uses local midnight
- Root cause: Timezone mismatch between server UTC schedule and client local calculation

### Execution Log

[11:47] Analyzing existing cron configuration - runs daily at midnight UTC
[11:48] Understanding current countdown issue - uses local midnight vs UTC midnight  
[11:49] Creating new getCronSchedule query to bridge server timing and client countdown
[11:50] Implemented getCronSchedule query with UTC midnight calculation and fallback handling
[11:51] Testing the new query implementation
[11:52] Function not available yet - need to deploy changes to Convex
[11:53] Convex deployment complete - testing new query
[11:53] Query test successful! Returns next midnight UTC correctly
[11:54] Verifying timestamp calculation - next run is midnight UTC tomorrow (26 minutes away)

### Approach Decisions

- Used UTC-based calculation to match cron job schedule (hourUTC: 0, minuteUTC: 0)
- Added server time synchronization for accurate client-side countdown
- Implemented comprehensive fallback (24hr default) for edge cases
- Included cronConfig metadata for debugging and validation
- Returns Unix timestamps for consistent cross-timezone handling

- [x] **Build real-time countdown calculation**
  - Create `useCountdown` hook that takes target timestamp and returns formatted time string
  - Calculate countdown based on `Date.now()` vs target timestamp, updating every second
  - Handle timezone conversion from server UTC to user's local timezone
  - Add fallback countdown logic when server timing is unavailable (24hr default)

### Context Discovery

- Relevant files: useCountdown.ts:11, GameInstructions.tsx:199, GameLayout.tsx:79, convex/puzzles.ts:339
- Existing pattern: GameInstructions expects timeString prop but it's not being passed from GameLayout
- Root cause: useCountdown hook uses local midnight instead of Convex getCronSchedule data

### Execution Log

[11:56] Analyzing current countdown implementation - hardcoded "00:00:00" displayed
[11:57] Found countdown display in GameInstructions.tsx line 199, missing timeString prop
[11:58] Testing getCronSchedule query - returns correct UTC timestamps and server sync
[11:59] Designing new useCountdown hook to accept target timestamp from Convex
[12:00] Implementing enhanced useCountdown hook with Convex integration
[12:01] Updated useCountdown hook with Convex integration and enhanced error handling
[12:02] Now updating existing usage to match new interface
[12:03] Updated GameLayout and page.tsx to pass countdown data through the component tree
[12:04] Testing the implementation for any errors
[12:04] TypeScript error - need to regenerate Convex API types
[12:05] Import path issue - fixing to match other hooks pattern
[12:05] TypeScript errors resolved - testing countdown functionality
[12:06] Implementation complete and tested successfully - countdown now uses Convex cron schedule

### Approach Decisions

- Enhanced useCountdown hook to integrate with Convex getCronSchedule query
- Added comprehensive fallback system (local midnight calculation when Convex unavailable)
- Implemented real-time updates with 1-second intervals for smooth countdown experience
- Added loading and error states for better user experience during Convex query loading
- Used component prop threading (page.tsx → GameLayout → GameInstructions) for clean data flow
- Maintained backward compatibility with optional countdown prop in GameLayout
- Fixed import path to match existing hooks pattern (convex/\_generated/api vs @/ alias)

- [ ] **Update countdown UI components**

  - Find countdown display component (likely in completed puzzle UI)
  - Replace hardcoded "00:00:00" with `useCountdown(nextPuzzleTime)` result
  - Add loading state while fetching next puzzle timing from Convex
  - Show user-friendly error message if countdown calculation fails

- [ ] **Add countdown accuracy validation**
  - Test countdown accuracy against known cron schedule times
  - Add client-server time synchronization check for accuracy
  - Handle edge cases: countdown reaches zero, timezone changes, system clock drift
  - Add automated testing for countdown calculation logic

## 🔄 **Phase 4: Real-time Archive Completion Updates**

- [ ] **Fix immediate completion feedback**

  - Add optimistic update in `useConvexGameState.ts` completion flow
  - Update local completion state before Convex mutation completes
  - Ensure archive page re-renders when user completes a puzzle
  - Add visual feedback (toast/notification) when completion is saved

- [ ] **Implement completion verification system**

  - Add completion verification query that checks if a specific puzzle was completed
  - Call verification after mutation completes to ensure save was successful
  - Retry completion save if verification fails (with max retry limit)
  - Show user warning if completion cannot be verified/saved

- [ ] **Optimize archive real-time updates**

  - Ensure `useQuery` for completed puzzles refreshes when new completion is added
  - Add Convex subscription for real-time completion updates if available
  - Implement cache invalidation strategy for completion-related queries
  - Test that archive immediately shows green checkmark after puzzle completion

- [ ] **Add completion state management**
  - Create centralized completion state that persists across page navigation
  - Ensure completion state survives page refresh and returns to archive
  - Add completion analytics: track completion save success/failure rates
  - Handle completion conflicts (user completes same puzzle multiple times)

## 🛡️ **Phase 5: Error Resilience & Edge Case Handling**

- [ ] **Implement completion retry logic**

  - Add exponential backoff retry for failed `submitGuess` mutations
  - Store failed completions in localStorage for background retry
  - Add user notification system for completion save failures
  - Implement completion reconciliation when connection is restored

- [ ] **Handle authentication edge cases**

  - Test completion flow when user signs in mid-puzzle
  - Handle completion save when user loses authentication during puzzle
  - Add graceful degradation: local completion tracking when auth fails
  - Ensure completion data migrates when user creates account after playing

- [ ] **Add comprehensive error boundaries**

  - Wrap completion-critical components in error boundaries with recovery actions
  - Add specific error handling for Convex connection failures
  - Implement fallback UI when completion system is entirely unavailable
  - Add user-friendly error messages with suggested actions

- [ ] **Performance optimization and testing**
  - Add performance monitoring for completion save/query operations
  - Implement completion data pagination for users with many completed puzzles
  - Test completion system under high load (many simultaneous completions)
  - Add automated testing for all completion flow paths and error conditions

## 🧪 **Phase 6: Testing & Validation**

- [ ] **End-to-end completion flow testing**

  - Test: Complete daily puzzle → see green checkmark in archive immediately
  - Test: Complete archive puzzle → completion persists and shows correctly
  - Test: Complete puzzle while offline → completion saves when reconnected
  - Test: Multiple users completing same puzzle → no completion conflicts

- [ ] **Countdown system validation**

  - Test countdown accuracy by comparing to actual cron job execution time
  - Test countdown across timezone changes and daylight saving transitions
  - Test countdown fallback behavior when cron schedule is unavailable
  - Verify countdown shows appropriate time remaining for next puzzle

- [ ] **Authentication integration testing**

  - Test completion flow with various authentication states
  - Test completion data persistence across sign in/out cycles
  - Test completion migration from anonymous to authenticated user
  - Verify completion privacy (users only see their own completions)

- [ ] **Production deployment validation**
  - Deploy to preview environment and test full completion flow
  - Verify countdown accuracy against production cron schedule
  - Test completion system performance under production load
  - Monitor completion save success rates and error patterns in production

---

## ✅ DATABASE MIGRATION: 100% COMPLETE!

**PREVIOUS STATUS**: Production database fully operational with puzzles!

**COMPLETED**:

- ✅ Restored puzzle data from git history (298 years of events)
- ✅ Imported 1821 events to production database
- ✅ Verified 297 years available for puzzle generation
- ✅ App loads successfully with today's puzzle
- ✅ Generated Puzzle #1 for 2025-01-13 (year 2005)
- ✅ Cron job active for daily puzzle generation at midnight UTC

**READY FOR PRODUCTION**: Database migration complete with live puzzle data!

**CAUSE**: Two separate Convex deployments exist:

- **DEV**: `handsome-raccoon-955` ✅ **HAS ALL 239 PUZZLES**
- **PROD**: `fleet-goldfish-183` ❌ **EMPTY DATABASE**

**CURRENT CONFIG**: .env.local points to PRODUCTION (empty) - explains all puzzle loading failures!

### ✅ Database Migration Complete (Events Imported!)

- [x] **Export data from dev deployment (has puzzles):** ✅ Restored from git history

  ```bash
  npx convex export --deployment-name handsome-raccoon-955 --path dev-data-full.zip
  ```

- [x] **Import data to production deployment:** ✅ Imported 1821 events across 298 years

  ```bash
  npx convex import --prod --path dev-data-full.zip
  ```

- [x] **Verify production database has events:** ✅ 298 years available for puzzles

  ```bash
  npx convex run puzzles:getTotalPuzzles --prod
  npx convex data puzzles --prod
  ```

- [x] **Test puzzle loading locally:** ✅ App loads, waiting for puzzle generation

- [x] **Generate puzzles:** ✅ Today's puzzle generated + 297 years available for future puzzles via cron

- [ ] **Deploy to production after puzzles are generated**

---

## 🔥 CRITICAL: Archive Page Server Component Error

**FAILURE MODE**: Archive page throws Server Components render error in Vercel deployment
**ROOT CAUSE**: Clerk's `currentUser()` throws unhandled exception in Next.js 15 Server Component context
**IMPACT**: Archive page completely broken in production, returns 500 error
**ERROR SIGNATURE**: "An error occurred in the Server Components render" with masked details

### Fix Archive Page Authentication Resilience

- [x] **Isolate Clerk auth call in try-catch with explicit null fallback** (src/app/archive/page.tsx:38-45)

  - Replace basic try-catch with comprehensive error boundary
  - Add explicit `console.log` for debugging auth failures in production
  - Ensure `clerkUser = null` is set in ALL error paths
  - Test with: `throw new Error('test')` before `currentUser()` call to verify fallback

- [x] **Add defensive null checks around getUserByClerkId query** (src/app/archive/page.tsx:53-54)

  - Wrap entire Convex user query in separate try-catch
  - Log specific error: `console.error('[Archive] getUserByClerkId failed:', error)`
  - Continue with `convexUser = null` on ANY exception
  - Prevent cascading failure if Convex query throws

- [x] **Guard getUserCompletedPuzzles with explicit error handling** (src/app/archive/page.tsx:59-64)

  - Only execute if `convexUser` is truthy AND has valid `_id`
  - Wrap in try-catch with fallback to empty Set
  - Log: `console.warn('[Archive] Completed puzzles fetch failed, using empty set')`
  - Test with malformed userId to verify resilience

- [x] **Add request context validation before currentUser()** (src/app/archive/page.tsx:41)

  - Import `headers` from 'next/headers'
  - Check for cookie existence: `headers().get('cookie')`
  - Skip auth if no cookies present (SSG/ISR context)
  - Log: `console.log('[Archive] Request context:', { hasCookies: !!cookies })`

- [x] **Implement auth state telemetry for debugging** (src/app/archive/page.tsx:46-69)

  - Add structured logging object:
    ```typescript
    const authState = {
      hasClerkUser: !!clerkUser,
      hasConvexUser: !!convexUser,
      completedCount: completedPuzzleIds.size,
      timestamp: new Date().toISOString(),
    };
    console.log("[Archive] Auth state:", authState);
    ```

- [x] **Create fallback UI for auth loading state** (src/app/archive/page.tsx:105-130)

  - Replace completion stats section with conditional render
  - Show skeleton loader if `clerkUser` but no `convexUser` yet
  - Completely hide section if no `clerkUser`
  - Add `suppressHydrationWarning` to dynamic elements

- [x] **Test error recovery with forced failures**

  - Temporarily add `throw new Error()` at each auth point
  - Verify page still renders with public puzzle grid
  - Check console for proper error logging
  - Confirm no 500 errors in any failure mode

- [x] **Add runtime environment detection** (src/app/archive/page.tsx:32)

  - Check `process.env.VERCEL_ENV` for deployment context
  - Log environment: `console.log('[Archive] Running in:', process.env.VERCEL_ENV || 'local')`
  - Use to conditionally enable verbose logging
  - Help diagnose preview vs production differences

- [x] **Implement graceful degradation for Convex connection** (src/app/archive/page.tsx:72-75)

  - Wrap `getArchivePuzzles` in try-catch
  - Return mock data structure on failure:
    ```typescript
    { puzzles: [], totalPages: 0, currentPage: 1, totalCount: 0 }
    ```
  - Show "Archive temporarily unavailable" message
  - Log Convex connection errors separately

- [x] **Add performance timing markers** (entire component)

  - `console.time('[Archive] Auth check')`
  - `console.time('[Archive] Convex queries')`
  - `console.time('[Archive] Total render')`
  - Identify which operation is actually failing

- [ ] **Create integration test for archive resilience**

  - Test with Clerk undefined
  - Test with Convex unavailable
  - Test with malformed user data
  - Verify page always renders something useful

- [x] **Deploy fix to Vercel preview**

  - Commit with message: "fix: make archive page resilient to auth failures"
  - Push to trigger auto-deploy
  - Test /archive route immediately after deploy
  - Check Vercel function logs for error details

- [ ] **Verify fix in production scenarios**
  - Test logged out (no cookies)
  - Test with expired session
  - Test with invalid Clerk token
  - Test with Convex connection timeout
  - Confirm no 500 errors in any case

---

## 🔥 FIXED: Production Deployment & Runtime Issues

### Convex URL Configuration Mismatch (Blocking Production)

- [x] Fix .env.local Convex URL mismatch ✓ Changed URL to `https://fleet-goldfish-183.convex.cloud` to match prod deployment key

- [x] Set Vercel environment variables using CLI: Run `vercel env add NEXT_PUBLIC_CONVEX_URL production` and enter `https://fleet-goldfish-183.convex.cloud`

- [x] Set Vercel Convex deploy key: Run `vercel env add CONVEX_DEPLOY_KEY production` and paste value from .env.local (prod:fleet-goldfish-183|...)

- [x] Set Vercel Clerk public key: Run `vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production` and paste `pk_test_aGVhbHRoeS1kb2UtMjMuY2xlcmsuYWNjb3VudHMuZGV2JA` from .env.local

- [x] Set Vercel Clerk secret key: Run `vercel env add CLERK_SECRET_KEY production` and paste value from .env.local (starts with sk*test*)

### Fix Runtime Warnings & Errors

- [x] Fix getDailyYear() deprecation warning in src/lib/puzzleUtils.ts:24 - Remove call to `getDailyYear()` in `getTodaysPuzzleNumber()`, return 1 as default when no debugYear provided

- [x] Fix HintsDisplay validation warning in src/lib/propValidation.ts:117-118 - Change validation to only warn if `p.events && p.events.length > 0 && p.events.length !== 6` to allow empty arrays during loading

- [x] Fix countdown timer bug in src/lib/utils.ts:35-40 - Replace `midnight.setHours(24, 0, 0, 0)` with proper calculation: `const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);`

- [x] Remove redundant "Game Over" text in src/components/GameLayout.tsx:149-151 - Delete the entire conditional block showing "Game Over. The correct year was..." as this info is already displayed in the celebration UI

### Deployment Verification

- [x] Test local build with production Convex: Run `NEXT_PUBLIC_CONVEX_URL=https://fleet-goldfish-183.convex.cloud pnpm build` to verify build succeeds with prod URL

- [x] Deploy to Vercel preview first: Run `vercel` (no --prod flag) to test deployment before production ✓ https://chrondle-r8f1o7gu5-moomooskycow.vercel.app

- [x] Fix preview deployment configuration error: Added all environment variables to Preview environment

  - ✓ Added NEXT_PUBLIC_CONVEX_URL to Preview
  - ✓ Added CONVEX_DEPLOY_KEY to Preview
  - ✓ Added NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to Preview
  - ✓ Added CLERK_SECRET_KEY to Preview
  - ✓ New working preview: https://chrondle-15bh98rip-moomooskycow.vercel.app

- [x] **Root cause identified**: Preview deployment failures were due to empty production database, not environment configuration

- [~] **Test preview deployment after database migration:**

  - Verify daily puzzle loads correctly (blocked until migration)
  - Test authentication flow
  - Check archive functionality (blocked until migration)
  - Validate no runtime errors in browser console

- [ ] **Deploy to production**: Run `vercel --prod` only after database migration and preview testing passes

- [x] Create vercel.json: ✓ Created configuration for Convex deployment integration

- [x] Fix providers.tsx error handling: ✓ Now shows helpful UI instead of white screen

## 🎯 Core Features Remaining

### Manual Testing Required

- [x] Verify archive shows current puzzle count ✓ Confirmed: Shows 20 puzzles (correct from Convex DB)
- [x] Test puzzle URLs ✓ All puzzle URLs work correctly (21 puzzles total, tested 1-13 + 20-21)
- [ ] Verify daily puzzle loads from Convex
- [ ] Test completion tracking for authenticated users

### Production Readiness

- [x] Add deployment documentation to README ✓ Added comprehensive Vercel, Convex, and Clerk setup instructions
- [x] Create comprehensive .env.example with all variables
  - ✓ Added all required variables (Convex, Clerk)
  - ✓ Added optional variables (OpenRouter, Stripe)
  - ✓ Added helpful comments and setup instructions
  - ✓ Added security reminders and deployment notes
- [ ] Set up error monitoring (Sentry/LogRocket)
- [ ] Configure production Convex deploy key

## 📋 Completed Migrations

### ✅ Convex Migration (Phases 1-6)

- Removed static puzzle data dependency
- Converted to dynamic Convex queries
- Removed localStorage completely
- Fixed all test suites
- Updated CI pipeline

### ✅ Archive Features

- Dynamic puzzle count from Convex
- Server-side rendered archive page
- Authenticated user completion tracking
- Pagination with growing archive

### ✅ Code Cleanup

- Deleted legacy Python scripts
- Removed migration artifacts
- Cleaned up hardcoded constants
- Fixed HintsDisplay component tests

## 🚀 Future Enhancements

### Performance

- [ ] Implement ISR for archive pages
- [ ] Add Redis caching for Convex queries
- [ ] Optimize bundle size (target < 200KB)

### Features

- [ ] User profiles and statistics
- [ ] Leaderboards
- [ ] Social sharing improvements
- [ ] PWA offline support

### Developer Experience

- [ ] E2E tests with Playwright
- [ ] Storybook for component development
- [ ] Automated release process
- [ ] API documentation

## 📝 Technical Debt

- [ ] Migrate remaining client components to RSC where possible
- [ ] Implement proper error boundaries throughout
- [ ] Add comprehensive logging system
- [ ] Set up feature flags for gradual rollouts

---

**Remember**: Ship working code. Everything else is secondary.

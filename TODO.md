# Chrondle TODO

## ✅ DATABASE MIGRATION: 90% COMPLETE!

**CURRENT STATUS**: Events imported successfully! Just need to generate puzzles.

**COMPLETED**:

- ✅ Restored puzzle data from git history (298 years of events)
- ✅ Imported 1821 events to production database
- ✅ Verified 298 years available for puzzle generation
- ✅ App loads successfully (waiting for puzzles)

**REMAINING**: Generate puzzles from events (manual trigger or wait for cron)

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

- [ ] **Generate puzzles:** Trigger generateDailyPuzzle in Convex dashboard or wait for midnight UTC

- [ ] **Deploy to production after puzzles are generated**

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

- [ ] **Test preview deployment after database migration:**

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

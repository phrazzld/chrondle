# Chrondle TODO

## 🔥 CRITICAL: Fix Production Deployment & Runtime Issues

### Convex URL Configuration Mismatch (Blocking Production)

- [x] Fix .env.local Convex URL mismatch ✓ Changed URL to `https://fleet-goldfish-183.convex.cloud` to match prod deployment key

- [ ] Set Vercel environment variables using CLI: Run `vercel env add NEXT_PUBLIC_CONVEX_URL production` and enter `https://fleet-goldfish-183.convex.cloud`

- [ ] Set Vercel Convex deploy key: Run `vercel env add CONVEX_DEPLOY_KEY production` and paste value from .env.local (prod:fleet-goldfish-183|...)

- [ ] Set Vercel Clerk public key: Run `vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production` and paste `pk_test_aGVhbHRoeS1kb2UtMjMuY2xlcmsuYWNjb3VudHMuZGV2JA` from .env.local

- [ ] Set Vercel Clerk secret key: Run `vercel env add CLERK_SECRET_KEY production` and paste value from .env.local (starts with sk*test*)

### Fix Runtime Warnings & Errors

- [ ] Fix getDailyYear() deprecation warning in src/lib/puzzleUtils.ts:24 - Remove call to `getDailyYear()` in `getTodaysPuzzleNumber()`, return 1 as default when no debugYear provided

- [ ] Fix HintsDisplay validation warning in src/lib/propValidation.ts:117-118 - Change validation to only warn if `p.events && p.events.length > 0 && p.events.length !== 6` to allow empty arrays during loading

- [ ] Fix countdown timer bug in src/lib/utils.ts:35-40 - Replace `midnight.setHours(24, 0, 0, 0)` with proper calculation: `const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);`

- [ ] Remove redundant "Game Over" text in src/components/GameLayout.tsx:149-151 - Delete the entire conditional block showing "Game Over. The correct year was..." as this info is already displayed in the celebration UI

### Deployment Verification

- [ ] Test local build with production Convex: Run `NEXT_PUBLIC_CONVEX_URL=https://fleet-goldfish-183.convex.cloud pnpm build` to verify build succeeds with prod URL

- [ ] Deploy to Vercel: Run `vercel --prod` after all fixes are complete and environment variables are set

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

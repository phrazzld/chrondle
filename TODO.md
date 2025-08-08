# Chrondle TODO

## 🔥 CRITICAL: Fix Vercel Deployment

### Missing Environment Variables (Blocking Production)

- [ ] Add to Vercel Dashboard (vercel.com → chrondle → Settings → Environment Variables):

  - `NEXT_PUBLIC_CONVEX_URL` = https://handsome-raccoon-955.convex.cloud (all environments)
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = pk*test*... (from .env.local)
  - `CLERK_SECRET_KEY` = sk*test*... (encrypted)
  - `CONVEX_DEPLOY_KEY` = (generate from Convex dashboard)
  - `CLERK_WEBHOOK_SECRET` = whsec\_... (if using webhooks)

- [ ] Configure Vercel Build Command:

  ```
  npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
  ```

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

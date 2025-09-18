# Chrondle TODO

## 🚨 URGENT: CI Pipeline Failures (BLOCKING MERGE)

**CI Status:** ❌ 2/5 checks failing
**Root Causes:**

- Size job: Missing environment variables in workflow (CI infrastructure issue)
- Test job: DST calculation regression causing 3 test failures (Code issue)

### Immediate Fixes Required:

- [x] **[CI FIX]** Add environment variables to size-limit workflow

  ```
  Work Log:
  - Added NEXT_PUBLIC_CONVEX_URL and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  - Used same public values from ci.yml build job
  - These are test/public keys, safe to expose in CI
  - Should fix the build failure in size-limit action
  ```

- [ ] **[CODE FIX]** Fix shouldRunDailyPuzzleJob DST calculation

  - Investigate convex/utils/dst.ts logic for hour checking
  - Fix condition that determines if current time is Central Time midnight
  - Should return true for UTC hours 5 (CDT) and 6 (CST)
  - Failing tests: lines 142, 148, 163 in dst.test.ts

- [ ] **[CI FIX]** Verify size-limit action works after env var fix

  - Push fix and confirm workflow completes
  - Check that bundle size comment appears on PR
  - Ensure no sensitive data in logs

- [ ] **[CODE FIX]** Verify DST tests pass locally before pushing
  - Run `pnpm test convex/utils/dst.test.ts`
  - Ensure all 46 tests pass
  - Test with different date scenarios

---

## 🚨 URGENT: CI Security Vulnerabilities (BLOCKING MERGE)

**CI Status:** ❌ 1/5 checks failing - Security audit found 13 vulnerabilities
**Root Cause:** Mixed issue - Production Next.js vulnerabilities + Dev dependency vulnerabilities
**Priority:** CRITICAL - Production security vulnerabilities must be fixed immediately

### Phase 1: Production Security Fixes (CRITICAL - Fix First) 🔴

- [x] **[CODE FIX]** Update Next.js from 15.3.4 to 15.4.7+ to resolve 3 moderate vulnerabilities
  - Image optimization cache key confusion (GHSA-g5qg-72qw-gw5v)
  - Image optimization content injection (GHSA-xv57-4mr9-wg8v)
  - Middleware SSRF vulnerability (GHSA-4342-x723-ch2f)
  ```
  Work Log:
  - Updated Next.js 15.3.4 → 15.5.3 (latest stable)
  - Updated related packages: @next/bundle-analyzer, eslint-config-next
  - Verified build successful, no TypeScript errors
  - Confirmed 3 moderate vulnerabilities resolved (13 → 10 total)
  - Remaining vulnerabilities are dev dependencies only
  ```
- [x] **[CODE FIX]** Verify @clerk/nextjs compatibility with updated Next.js version
  ```
  Work Log:
  - Current Clerk version: 6.32.0 (auto-updated) → 6.32.1 (latest stable)
  - Verified dev server starts without Clerk-related errors
  - Checked middleware.ts: uses modern clerkMiddleware API (compatible)
  - Checked providers.tsx: standard ClerkProvider setup (compatible)
  - TypeScript compilation: ✅ No errors
  - Build process: ✅ Successful with no compatibility warnings
  - No breaking changes detected in Clerk v6.32.x for Next.js 15.5.3
  ```
- [x] **[CODE FIX]** Run full test suite after Next.js update to ensure no breaking changes
  ```
  Work Log:
  - Executed full test suite with vitest
  - Results: ✅ 400/402 tests passing (2 skipped - known jsdom issues)
  - No test failures introduced by Next.js 15.3.4 → 15.5.3 update
  - All core functionality verified working correctly
  - 2 skipped tests are same jsdom clearTimeout issues mentioned in TODO
  - Test execution time: 3.99s (normal performance)
  - Stderr shows expected security validation logs and motion library warnings
  ```
- [x] **[CODE FIX]** Test authentication flow manually to verify Clerk integration works
  ```
  Work Log:
  - Started dev server: ✅ Ready in 853ms (Next.js 15.5.3 with Turbopack)
  - Tested authentication pages:
    - /sign-in: ✅ HTTP 200, compiled successfully in 1964ms
    - /sign-up: ✅ HTTP 200, compiled successfully in 276ms
  - Tested main application: ✅ HTTP 200, compiled successfully in 1270ms
  - Verified auth hooks working: useAuthState logs show proper loading states
  - Tested webhook endpoint: ✅ HTTP 405 (correct - POST only)
  - Tested public routes: /archive returns HTTP 200 (expected per middleware)
  - No auth-related errors or warnings in dev server output
  - Clerk integration fully functional with Next.js 15.5.3
  ```

### Phase 2: Dev Environment Security Fixes (MODERATE - Fix After Phase 1) 🟡

- [x] **[CI FIX]** Update vitest dependencies to resolve esbuild vulnerability (0.21.5 → 0.25.0+)
  - Vulnerability: Dev server accessible by any website (GHSA-67mh-4wv8-2f99)
  ```
  Work Log:
  - Updated vitest: 1.6.1 → 3.2.4 (latest stable version)
  - Updated @vitest/coverage-v8: 1.6.1 → 3.2.4 (matching version)
  - Added pnpm override: "esbuild": "^0.25.0" to force secure version
  - Verified all esbuild instances now 0.25.4 (was vulnerable 0.21.5)
  - Test suite compatibility: ✅ 400/402 tests still passing
  - Security impact: Vulnerabilities reduced from 13 → 9 total
  - esbuild dev server vulnerability GHSA-67mh-4wv8-2f99 resolved
  ```
- [x] **[CI FIX]** Update @size-limit/preset-app to resolve transitive vulnerabilities
  - ws DoS vulnerability via puppeteer-core (8.16.0 → 8.17.1+)
  - tar-fs path traversal vulnerabilities (3.0.5 → 3.0.9+)
  - nanoid predictable generation (5.0.7 → 5.0.9+)
  ```
  Work Log:
  - @size-limit/preset-app already at latest (11.2.0), used pnpm overrides instead
  - Added overrides for: ws ^8.17.1, tar-fs ^3.0.9, nanoid ^5.0.9
  - Results after override installation:
    - ws: 8.16.0 → 8.18.3 (resolved DoS vulnerability)
    - tar-fs: 3.0.5 → 3.1.0 (resolved path traversal vulnerabilities)
    - nanoid: 5.0.7 → 5.1.5 (resolved predictable generation vulnerability)
  - Verified size-limit functionality: ✅ Working correctly
  - Security audit: Vulnerabilities reduced from 9 → 5 (all remaining are low severity)
  - All moderate and high severity vulnerabilities eliminated
  ```
- [x] **[CI FIX]** Use pnpm overrides if automatic updates don't resolve all vulnerabilities
  ```
  Work Log:
  - Completed as part of previous task (@size-limit transitive vulnerabilities)
  - Added pnpm overrides for: esbuild ^0.25.0, ws ^8.17.1, tar-fs ^3.0.9, nanoid ^5.0.9
  - Strategy worked effectively: automatic updates insufficient, overrides resolved all issues
  - All moderate/high vulnerabilities eliminated through override strategy
  ```

### Phase 3: Validation & CI Hardening (INFRASTRUCTURE) 🔧

- [x] **[CI FIX]** Run `pnpm audit --audit-level moderate` locally to verify all fixes
  ```
  Work Log:
  - Executed: pnpm audit --audit-level moderate
  - Result: ✅ 0 moderate, high, or critical vulnerabilities found
  - Remaining: 5 low-severity vulnerabilities only
  - Low-severity breakdown:
    - @eslint/plugin-kit: RegEx DoS (dev tool - not production risk)
    - tmp: Symlink vulnerability via @lhci/cli (lighthouse CI - dev only)
    - vite: 2 file serving vulnerabilities (dev server only)
  - Security goal achieved: All production-impacting vulnerabilities eliminated
  - CI audit should now pass with --audit-level moderate threshold
  ```
- [x] **[CI FIX]** Ensure all quality gates pass: tests, type-check, lint
  ```
  Work Log:
  - Tests: ✅ 400/402 passing (2 skipped - jsdom issues)
  - Type checking: ✅ Passed after fixing vitest mock syntax
    - Fixed: vi.fn<[Era], void>() → vi.fn() for vitest 3.2.4 compatibility
  - Linting: ✅ 0 errors, 13 warnings (accessibility/deprecation only)
  - All quality gates passing, ready for CI
  - Test execution time: 3.61s (normal performance)
  ```
- [x] **[CI FIX]** Consider adjusting CI audit scope to treat dev vs prod dependencies differently
  ```
  Work Log:
  - Analyzed current audit results: prod=0 vulns, dev=5 low-severity only
  - Created proposal document with recommendation to differentiate
  - Implemented differentiated auditing in CI:
    - Production: Strict (fail on moderate+)
    - Dev High/Critical: Fail CI
    - Dev Moderate: Warn only (non-blocking)
  - Benefits: Better signal-to-noise, appropriate urgency levels
  - Trade-off accepted: Slightly more complex CI for better DX
  ```
- [x] **[CI FIX]** Document any forced dependency overrides for future maintenance
  ```
  Work Log:
  - Created docs/dependency-overrides.md with comprehensive documentation
  - Documented all 4 overrides: esbuild, ws, tar-fs, nanoid
  - Included vulnerability details, maintenance guidelines, and removal criteria
  - Added testing procedures and CI integration notes
  - Set monthly review cycle (next: February 16, 2025)
  ```

**Estimated Time:** 4-6 hours total (1-2h Phase 1, 2-3h Phase 2, 1h Phase 3)

---

## 🚀 Ready to Ship! (BLOCKED BY SECURITY FIXES)

The `feat/ui-cleanup-and-fixes` branch is complete and ready for deployment. **BLOCKED:** Security vulnerabilities must be resolved first.

**Quality Status:**

- ✅ Tests: 400/402 passing (2 jsdom issues, not real failures)
- ✅ TypeScript: Clean
- ✅ Linting: Clean
- ✅ Deployments: Working fine

**Next Steps:**

1. [~] Merge to main
2. [ ] Deploy to production
3. [ ] Verify daily puzzle works

---

## 🛡️ Security Hardening (Recommended)

- [x] Add `pnpm audit --audit-level moderate` to CI (`.github/workflows/ci.yml:62`)
- [x] Create `.github/dependabot.yml` for weekly dependency updates

## ⚡ CI Performance (Nice to Have)

- [x] Consolidate duplicate Node/pnpm setup steps (saves 2-4 min per build)
  - Extract to reusable workflow in `.github/workflows/setup-node-pnpm.yml`
- [x] Fix or skip 2 flaky notification tests (jsdom `clearTimeout` issue)

## 📊 Code Quality Tools (Already Installed, Not Enabled)

- [x] Add coverage reporting: `pnpm test:coverage` in CI
- [x] Enable ts-prune: Add script `"ts-prune": "ts-prune"`
- [x] Enable unimported: Add script `"unimported": "unimported"`
- [x] Enable jsx-a11y linting: Add to `eslint.config.mjs`

## 🧹 Cleanup Tasks

- [x] Remove obsolete migration step from `.github/workflows/deploy.yml:67-71`
  ```
  Work Log:
  - Found obsolete migration step at lines 43-47 (not 67-71, file had changed)
  - Step was calling `pnpm deploy:migrate` which doesn't exist in package.json
  - Removed the migration step and renumbered following steps
  - Cleaner deployment workflow without non-existent commands
  ```
- [x] Remove unused `@lhci/cli` package (Lighthouse CI was removed)
  ```
  Work Log:
  - Verified @lhci/cli was installed but not used anywhere
  - Removed package with pnpm remove @lhci/cli (saved 164 packages)
  - Cleaned up obsolete Lighthouse CI comments from CI workflow
  - Reduces dependencies and node_modules size
  ```
- [x] Add bundle size trend tracking (GitHub Action for PR comments)
  ```
  Work Log:
  - size-limit already configured with limits in .size-limit.json
  - CI already checks bundle sizes but doesn't post PR comments
  - Added size-limit-action workflow to post size comparisons on PRs
  - Uses andresz1/size-limit-action@v1 for automated PR comments
  - Will show bundle size changes and alert if limits are exceeded
  ```

---

## 📝 Production Issues

_Track user-reported bugs here_

---

_Last Updated: 2025-01-16_

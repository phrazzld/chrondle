# 🚀 CI Debugging Playbook

Quick reference guide for diagnosing and fixing CI/CD pipeline failures.

## Table of Contents

- [Quick Diagnosis](#quick-diagnosis)
- [Common CI Failures](#common-ci-failures)
- [Node.js & Module Issues](#nodejs--module-issues)
- [Test Suite Failures](#test-suite-failures)
- [Build & Bundle Issues](#build--bundle-issues)
- [Cache Problems](#cache-problems)
- [Emergency Procedures](#emergency-procedures)

## Quick Diagnosis

### 1. Identify the Failed Job

Check which job failed in the GitHub Actions UI:

- **test**: Linting, type-check, or test failures
- **build**: Next.js build or bundle size issues
- **bundle-size**: Bundle size regression checks

### 2. Read Error Messages

Look for these key patterns:

- `ESM vs CommonJS`: Module system mismatch
- `Cannot find module`: Missing dependencies
- `Timeout`: Tests hanging or infinite loops
- `Bundle size exceeded`: Over 170KB limit

### 3. Check Recent Changes

```bash
# See what changed
git log --oneline -10
git diff HEAD~1
```

## Common CI Failures

### Problem: "The CJS build of Vite's Node API is deprecated"

**Symptom:**

```
Error: require() of ES Module /node_modules/vite/index.js not supported
```

**Solution:**

1. Ensure CI uses Node.js 20+ (check `.github/workflows/ci.yml`)
2. Verify `"type": "module"` in package.json
3. Check all config files use `.mjs` extension or TypeScript

### Problem: Tests timeout after 5000ms

**Symptom:**

```
Test timeout of 5000ms exceeded
```

**Solution:**

1. Check for notification service timers:
   ```typescript
   // Should have this guard in notification service
   if (process.env.NODE_ENV === "test") return;
   ```
2. Look for infinite loops in test setup
3. Ensure fake timers are properly advanced

### Problem: "pnpm: command not found"

**Solution:**

```yaml
# Ensure this is in CI workflow:
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: 9.1.0
```

## Node.js & Module Issues

### Problem: Module resolution errors

**Debug Steps:**

1. Check Node.js version matches local:

   ```bash
   node --version  # Should be v20+
   ```

2. Verify module system consistency:

   ```bash
   pnpm test-module-system
   ```

3. Common fixes:
   - Update imports to use `.js` extensions for local files
   - Ensure TypeScript `moduleResolution` is set correctly
   - Check for mixed ESM/CJS in dependencies

### Problem: Vitest/Vite version conflicts

**Solution:**
Dependencies are pinned for stability:

```json
"vitest": "3.2.4",
"@vitest/coverage-v8": "3.2.4"
```

Don't update these without testing thoroughly!

## Test Suite Failures

### Problem: Tests pass locally but fail in CI

**Common Causes:**

1. **Timezone differences**: CI runs in UTC

   ```typescript
   // Use UTC dates in tests
   const date = new Date(Date.UTC(2025, 0, 1));
   ```

2. **Missing environment variables**:

   ```bash
   # Add to test setup if needed
   process.env.NODE_ENV = 'test';
   ```

3. **Race conditions**: CI may be slower
   ```typescript
   // Add explicit waits
   await waitFor(() => expect(element).toBeInTheDocument());
   ```

### Problem: Specific test file hanging

**Debug locally:**

```bash
# Run single test file
pnpm vitest run src/path/to/test.unit.test.ts

# With timeout info
pnpm vitest run --reporter=verbose
```

## Build & Bundle Issues

### Problem: Bundle size exceeds 170KB

**Quick Check:**

```bash
pnpm build
pnpm size
```

**Solutions:**

1. Check for accidental large imports:

   ```bash
   # Analyze bundle
   pnpm build
   npx bundle-analyzer
   ```

2. Common culprits:
   - Importing entire libraries instead of specific functions
   - Development-only code in production
   - Large assets or data files

### Problem: Build fails with memory error

**Solution:**

```yaml
# Increase Node memory in CI
env:
  NODE_OPTIONS: --max-old-space-size=4096
```

## Cache Problems

### Problem: "EINTEGRITY" or corrupted dependencies

**Solution:**

1. Clear caches in GitHub UI:

   - Go to Actions → Caches
   - Delete caches with the branch name

2. Or bump cache key:
   ```yaml
   key: ${{ runner.os }}-pnpm-store-v2-${{ hashFiles('**/pnpm-lock.yaml') }}
   ```

### Problem: Old dependency versions despite updates

**Force fresh install:**

```yaml
- name: Install dependencies
  run: |
    pnpm store prune
    pnpm install --frozen-lockfile --force
```

## Emergency Procedures

### Nuclear Option: Skip CI Temporarily

**⚠️ EMERGENCY ONLY:**

```bash
# Add [skip ci] to commit message
git commit -m "fix: emergency patch [skip ci]"
```

### Rollback Procedure

```bash
# Find last working commit
git log --oneline --grep="CI.*pass"

# Revert to it
git revert HEAD
git push
```

### Get Help

1. Check GitHub Actions logs thoroughly
2. Run failing command locally with same Node version
3. Check similar issues in git history:
   ```bash
   git log --grep="CI" --grep="fix.*test"
   ```

## Prevention Checklist

Before pushing:

- [ ] Run `pnpm test:ci` locally
- [ ] Check `pnpm build && pnpm size`
- [ ] Verify Node.js 20+ with `node --version`
- [ ] Run `pnpm lint:fix` to auto-fix issues
- [ ] Test with `NODE_ENV=production` if changing env logic

## Useful Commands

```bash
# Full CI simulation locally
pnpm install --frozen-lockfile
pnpm lint
pnpm type-check
pnpm test:ci
pnpm build
pnpm size

# Quick pre-push check
pnpm lint && pnpm type-check && pnpm test

# Debug specific test
pnpm vitest run --reporter=verbose path/to/test

# Check module system
pnpm test-module-system
```

---

Remember: Most CI issues are environment differences. When in doubt, match the CI environment exactly (Node.js 20, Ubuntu, UTC timezone).

# TODO: Quality Infrastructure Optimization

_"The best code is no code at all. The second best is code that's so simple it obviously has no bugs."_ - John Carmack

## Goal: Eliminate 3+ minutes of CI waste and make quality gates actually meaningful

---

## 1. Eliminate CI Waste [15 minutes] ✅

- [x] Open `.github/workflows/ci.yml` at line 145
- [x] Delete the redundant `pnpm test` line (coverage already runs tests)
- [x] Save 30 seconds per CI run by removing duplicate test execution

- [x] Extract Convex verification to `.github/actions/verify-convex/action.yml`
  ```yaml
  name: "Verify Convex Files"
  runs:
    using: "composite"
    steps:
      - run: |
          for file in api.d.ts api.js dataModel.d.ts server.d.ts server.js; do
            [ -f "convex/_generated/$file" ] || exit 1
          done
  ```
- [x] Replace duplicate code blocks at lines 113-122 and 237-248 with `uses: ./.github/actions/verify-convex`
- [x] Save 40 lines of YAML duplication

## 2. Fix Coverage Theater [10 minutes]

- [ ] Open `vitest.config.ts` at line 43
- [ ] Run `pnpm test:coverage` and note actual coverage percentages
- [ ] Update thresholds to real values minus 5% buffer:
  ```typescript
  thresholds: {
    lines: 55,      // was 14 (meaningless)
    functions: 55,  // was 20 (theater)
    branches: 45,   // was 50 (keep similar)
    statements: 55, // was 14 (joke)
  },
  ```
- [ ] Now coverage actually gates bad code instead of being decoration

## 3. Parallelize CI Jobs [20 minutes]

- [ ] Open `.github/workflows/ci.yml` at line 138
- [ ] Replace sequential lint/type-check/test with parallel matrix:
  ```yaml
  quality-checks:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        check: [lint, type-check, test:unit]
    steps:
      # ... existing setup steps ...
      - name: Run ${{ matrix.check }}
        run: pnpm ${{ matrix.check }}
  ```
- [ ] Change build job to depend on `quality-checks` instead of `test`
- [ ] Save 2-3 minutes per CI run through parallelization

## 4. Add Missing Prettier Config [5 minutes]

- [ ] Create `prettier.config.js`:
  ```javascript
  export default {
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "all",
    printWidth: 100,
    plugins: ["prettier-plugin-tailwindcss"],
  };
  ```
- [ ] Run `pnpm add -D prettier-plugin-tailwindcss`
- [ ] Run `pnpm format` to apply consistent formatting
- [ ] End style debates forever with automated formatting

## 5. Fix or Delete Skipped Test [10 minutes]

- [ ] Open `src/components/__tests__/NotificationModal.test.tsx`
- [ ] Determine why tests are skipped (check git blame)
- [ ] Either:
  - [ ] Fix the test if component still exists
  - [ ] Delete the file if component was removed
  - [ ] Update test for current implementation
- [ ] No skipped tests allowed - they're dead code

## 6. Optimize Build Caching [15 minutes]

- [ ] Open `.github/workflows/ci.yml` at line 227
- [ ] Add `.next/server` to Next.js cache paths:
  ```yaml
  path: |
    .next/cache
    .next/.next-build-cache
    .next/server              # Add server bundle cache
    node_modules/.cache       # Add bundler caches
  ```
- [ ] Update cache key to include source hash:
  ```yaml
  key: ${{ runner.os }}-nextjs-${{ hashFiles('pnpm-lock.yaml') }}-${{ hashFiles('src/**/*.[jt]sx?') }}
  ```
- [ ] Save 5-10 seconds per build through better caching

## 7. Remove Zombie Workflows [5 minutes]

- [ ] Check if `.github/workflows/claude.yml` is used (likely not)
- [ ] Check if `.github/workflows/claude-code-review.yml` is used (probably redundant)
- [ ] Delete unused workflows with `git rm`
- [ ] Less YAML to maintain = fewer bugs

## 8. Create Quality Dashboard [10 minutes]

- [ ] Create `scripts/quality-report.mjs`:

  ```javascript
  #!/usr/bin/env node
  import { execSync } from "child_process";
  import fs from "fs";

  const metrics = {
    testCount: execSync('find . -name "*.test.ts*" | wc -l').toString().trim(),
    coverage: JSON.parse(fs.readFileSync("coverage/coverage-summary.json"))
      .total,
    buildTime: execSync("time pnpm build 2>&1 | grep real").toString(),
    bundleSize: execSync("du -sh .next").toString().trim(),
  };

  console.table(metrics);
  ```

- [ ] Add to package.json: `"quality": "node scripts/quality-report.mjs"`
- [ ] Run after each sprint to track quality trends

---

## Validation Checklist

After implementing all tasks:

- [ ] CI runs 2+ minutes faster
- [ ] Coverage thresholds catch actual regressions
- [ ] No duplicate code in workflows
- [ ] All tests run (none skipped)
- [ ] Formatting is consistent project-wide
- [ ] Build cache hit rate > 80%

---

## Impact Metrics

| Metric          | Before   | After   | Improvement     |
| --------------- | -------- | ------- | --------------- |
| CI Runtime      | ~5 min   | ~2 min  | -60%            |
| Coverage Gate   | 14%      | 55%     | Real protection |
| Duplicate Code  | 40 lines | 0 lines | -100%           |
| Build Cache Hit | ~50%     | >80%    | +30%            |
| Skipped Tests   | 2        | 0       | -100%           |

---

## NOT Doing (Process Theater)

- ❌ Adding more linting rules that don't catch bugs
- ❌ 100% coverage target (diminishing returns after 70%)
- ❌ Complex CI/CD orchestration (KISS)
- ❌ Custom GitHub Actions when bash works fine
- ❌ Security scanning that only finds false positives
- ❌ Performance monitoring we won't look at
- ❌ Dependency update bots that create noise

---

**Total Time: 90 minutes**

**Result: CI runs 3 minutes faster and coverage actually means something**

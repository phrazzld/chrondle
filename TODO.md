# Chrondle TODO

## ✅ Completed Tasks

### CI/Build Infrastructure

- **Fixed CI test failures**: Upgraded Node.js 18→20, resolved Vitest 3.2.4 ESM/CJS issues
- **Full ESM migration**: Converted all config files to ESM (.mjs), added "type": "module"
- **Test suite optimization**: Separated unit/integration tests, parallel execution (<2s total)
- **Pre-commit hooks**: Optimized to <1s (lint/format only, no type-check)
- **Bundle monitoring**: Replaced 12 custom scripts with size-limit (110KB/170KB limit)
- **Lighthouse CI**: Automated performance tracking on main branch merges

### Developer Experience

- **Fixed test hanging**: Resolved 24-hour timer issue in notification service
- **CI stability**: Pinned critical dependencies, added module system validation
- **Documentation**: Created docs/guides/contributing.md, docs/operations/emergency.md, docs/operations/troubleshooting.md

### Platform Improvements

- **Share UX fix**: Desktop now uses clipboard+toast (no more "Plain Text" dialog)
- **Platform detection**: Proper mobile/desktop routing for share functionality

### CI/Test Fixes

- **Fixed Date mocking in gameState tests**: Replaced manual mocks with Vitest's `vi.useFakeTimers()` (28 tests passing)

## 🚀 Remaining Tasks

### Merge Blockers (Must Fix Before Merge)

- [x] **Fix timeout race condition in OpenRouterService**
  - Remove internal AbortController/setTimeout from `makeRequest()` method
  - Accept optional `AbortSignal` parameter instead
  - Pass signal directly to fetch: `await fetch(url, { signal })`
  - Location: `src/lib/openrouter.ts` lines 142-143, 160-161
  - Why: Creates potential race conditions between competing timeouts

## Task: Fix timeout race condition in OpenRouterService [x]

### Complexity: SIMPLE

### Started: 2025-07-13 09:04

### Completed: 2025-07-13 09:17

### Context Discovery

- OpenRouterService is a client-side service that calls local API route `/api/historical-context`
- The API route then calls the actual OpenRouter API
- Hook passes AbortSignal to service, but service was creating its own timeout

### Execution Log

[09:04] Examined OpenRouterService implementation in src/lib/openrouter.ts
[09:06] Checked API route to understand full timeout flow
[09:08] Identified dual timeout management issue
[09:10] Removed internal AbortController/setTimeout logic from makeRequest()
[09:12] Updated test expecting AbortSignal to match new behavior
[09:17] All tests passing (17 passed, 1 skipped)

### Approach Decisions

- Simplified makeRequest() to only use provided AbortSignal
- Removed all internal timeout management
- Let caller (hook/API route) control timeouts entirely

### Learnings

- Service was creating unnecessary complexity with dual timeout management
- Tests needed updating to reflect simpler signal passing behavior
- Removing code often improves reliability

## Task: Align Node.js version to v20 in Lighthouse workflow [x]

### Status: COMPLETED AND PUSHED

### Complexity: SIMPLE

### Started: 2025-07-13 10:42

### Completed: 2025-07-13 10:43

### Context Discovery

- Found Node.js version set to '18' in `.github/workflows/lighthouse.yml` line 22
- Rest of project uses Node.js 20+ (confirmed in README and other CI workflows)

### Execution Log

[10:42] Located Lighthouse workflow file
[10:43] Updated node-version from '18' to '20' on line 22
[10:43] Task completed - version alignment achieved

### Approach Decisions

- Direct config update as specified
- No additional changes needed

### Learnings

- Simple config alignment prevents CI environment inconsistencies
- All GitHub workflows should use consistent Node.js versions

- [x] **Align Node.js version to v20 in Lighthouse workflow**
  - Update `.github/workflows/lighthouse.yml` line 18
  - Change from `node-version: '18'` to `node-version: '20'`
  - Why: Environment inconsistency can cause CI-specific bugs

### Documentation

- [x] Update README with new module requirements
- [x] Add CI debugging playbook
- [x] Document emergency procedures in detail

### Future Optimizations (Not Blocking This PR)

- [ ] Add Node.js version matrix testing in CI
- [ ] Configure Dependabot for careful dependency updates
- [ ] Add mobile Lighthouse CI testing
- [ ] Implement version pinning strategy for remaining dependencies
- [ ] Remove duplicate validation from useHistoricalContext hook
- [ ] Complete platform detection centralization
- [ ] Standardize logging (replace console.\* with logger)
- [ ] Convert lighthouserc.cjs to ESM if supported

## 📊 Success Metrics Achieved

- ✅ Pre-commit: <1s (was 3-4s)
- ✅ CI pipeline: ~2min (parallel jobs)
- ✅ Test suite: <2s (was timing out)
- ✅ Bundle size: 110KB (limit: 170KB)
- ✅ Zero developer friction

---

Remember: If it slows you down, delete it. Speed wins.

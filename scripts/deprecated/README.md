# Deprecated Scripts

These scripts were deprecated on 2025-01-10 when we switched to using `size-limit` for bundle size monitoring.

## Deprecated Scripts:

- **analyze-bundle-changes.js** - Analyzed bundle size changes between commits
- **analyze-gaps.js** - Analyzed gaps in puzzle data
- **analyze-puzzle-quality.js** - Analyzed quality of puzzle content
- **bundle-alerts.js** - Generated alerts for bundle size violations
- **detect-regressions.js** - Detected performance regressions
- **monitor-bundle-size.js** - Monitored bundle size over time
- **monitor-performance.js** - Monitored performance metrics
- **test-bundle-analysis.js** - Tested bundle analysis scripts
- **test-daily-selection-fixed.js** - Tested daily puzzle selection
- **test-end-to-end-daily-selection.js** - E2E tests for puzzle selection
- **track-bundle-composition.js** - Tracked bundle composition changes
- **validate-monitoring.js** - Validated monitoring setup

## Replacement:

All bundle monitoring is now handled by `size-limit`:

- Run `pnpm size` to check bundle sizes
- Configuration in `.size-limit.js`
- Integrated into CI pipeline

## Note:

These scripts are kept for historical reference only. Do not use them in production.

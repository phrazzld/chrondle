# Context

## Patterns

### Utility Function Development - Discovery-First Approach

- **Pattern-Scout Before Building**: Always use pattern-scout or search tools to identify existing patterns before creating new utilities
  ```bash
  # ✅ Discover first, then extend
  rg "formatYear" --type ts  # Find existing patterns
  ast-grep --lang typescript -p 'function formatYear($_)' # Semantic search
  ```
- **Extend Don't Replace**: When existing utilities are found, create comprehensive extensions rather than replacements
- **Backward Compatibility Preservation**: Export aliases for existing function names to maintain compatibility
  ```typescript
  // ✅ Preserve existing API while extending
  export { formatYearStandard as formatYear }; // Backward compatibility
  ```
- **Test-Driven Validation**: Write comprehensive test suites (35+ tests) covering all functionality before implementation
- **Style Flexibility Planning**: Include multiple formatting styles (standard, abbreviated, BCE/CE, compact) even if not immediately needed

### Display Formatting Architecture

- **Internal Representation Pattern**: Chrondle uses negative numbers for BC years, positive for AD years consistently across codebase
- **Format Consistency**: Standard format is "NUMBER SPACE ERA" (e.g., "776 BC", "1969 AD") - maintain this pattern
- **Options-Based API Design**: Use configuration objects with sensible defaults for flexible utility functions
  ```typescript
  // ✅ Flexible options pattern
  interface FormatOptions {
    style?: FormatStyle;
    includeEra?: boolean;
    lowercase?: boolean;
  }
  ```
- **Era Range Optimization**: Same-era ranges can be optimized to "START–END ERA" format instead of "START ERA – END ERA"

### Testing Excellence Indicators

- **First-Try Success**: Well-designed utilities with comprehensive tests pass on first implementation attempt
- **Edge Case Coverage**: Test century boundaries, ordinal suffixes (11th, 12th, 13th edge cases), year 0 handling
- **Compatibility Testing**: Include specific tests for backward compatibility aliases and existing API preservation
- **Performance Validation**: Test functions designed for frequent UI updates should be optimized for repeated calls

### Convex Function Invocation

- **Function Path Format**: Convex functions require full path format `directory/file:functionName` not `directory:functionName`

  ```bash
  # ✅ Correct format
  npx convex run migrations/gptMigration:runMigration

  # ❌ Incorrect format
  npx convex run migrations:runMigration
  ```

- **Dry-Run Verification**: Always test migrations in dry-run mode first - provides sample data preview, cost estimation, and batch strategy validation
- **Cost Transparency**: Migration scripts should include upfront cost estimation (tokens, API calls, USD amounts) before execution
- **Log Level Interpretation**: Convex console shows "ERROR" level for all logs by default - not actual errors, just log formatting

### Convex Migration Scripts

- **Migration Structure**: Convex migrations use `internalMutation` with comprehensive args validation, batch processing, dry-run mode, test mode, progress tracking, error handling, and detailed logging
- **Batch Processing**: Process items in configurable batches with delays between batches and individual items to avoid rate limits (e.g., `batchSize: 5, delayMs: 2000`)
- **Error Handling**: Track processed/scheduled/errors counts, continue on individual failures, log detailed error information for debugging
- **Testing Modes**: Include dry-run (count without processing), test-mode (single item), and configurable filters (startFromPuzzle, maxPuzzles)
- **Progress Tracking**: Log batch progress, percentage completion, estimated time, and final statistics summary

### Historical Context Generation

- **GPT-5 Integration**: Uses OpenRouter API with GPT-5 model, includes rate limit handling and fallback to GPT-5-mini
- **Retry Logic**: Exponential backoff with jitter, max 3 attempts, smart retry conditions based on error types
- **BC/AD Enforcement**: Post-processing function `enforceADBC()` to replace BCE/CE with BC/AD format as safety net
- **Cost Tracking**: Token estimation and cost calculation for GPT-5 usage monitoring

### Async Data Migration Patterns

- **Scheduled Work Timing**: Convex mutations/actions schedule async work that continues after initial API response returns
  ```typescript
  // Migration completes in ~12s API response, but async work continues for ~60s total
  // Must wait and verify completion rather than assuming immediate completion
  ```
- **Verification Strategy**: Use delayed verification queries after migrations to confirm async processing completed
- **Rate Limit Prevention**: Stagger individual item processing (600ms delays) and batch processing (3s between batches) to prevent API throttling
- **Async Progress Monitoring**: Check database state multiple times as async operations complete rather than relying on single post-migration check

### Database Update Verification

- **Read-back Pattern**: After database operations, immediately read the record back to confirm updates were successful
  ```typescript
  // Pattern from users.ts:163-166
  const newUser = await ctx.db.get(userId);
  if (!newUser) {
    throw new Error("Failed to retrieve newly created user record");
  }
  ```
- **Success Response Structure**: Return structured success objects with metadata
  ```typescript
  // Pattern from puzzles.ts:509-515
  return {
    success: true,
    puzzleId,
    contextLength: context.length,
    generatedAt: Date.now(),
  };
  ```
- **Field Validation**: Check specific fields exist and are not null/undefined after updates

### Convex Database Backup Operations

- **Pre-migration Safety**: Always create timestamped backups before major operations using `npx convex export`
- **Backup Storage**: Convex provides dual storage - local file export (timestamped filename) + cloud dashboard snapshot
- **Backup Size Tracking**: Monitor export file size to verify database content (161KB for Chrondle indicates healthy dataset)
- **Directory Structure**: Create organized backup directories before export operations for better file management

### CI Performance Testing

- **Environment-Specific Thresholds**: CI environments need ~25% higher performance thresholds than local development due to shared resources
  ```typescript
  // Local development: 16ms ideal (60fps frame budget)
  // CI environment: 25ms practical (accounts for resource variability)
  expect(duration).toBeLessThan(25); // CI threshold
  ```
- **Performance Context Documentation**: Always document why specific thresholds are chosen and include environment variance explanations
- **Statistical Testing Future Path**: Single-run absolute thresholds are brittle - future enhancement should use multiple runs with median/percentile approaches
- **TODO Structure Effectiveness**: Clear TODO items with specific line numbers and thresholds make CI fixes straightforward and fast to implement
- **Real-World Performance Validation**: Actual usage patterns (8-12ms average) provide confidence that test thresholds (25ms) maintain good UX

## Bugs & Fixes

### Timeline Performance Test CI Failures

- **Problem**: CI environments failing performance tests at 16ms threshold (16.2ms actual vs 16ms limit)
- **Root Cause**: GitHub Actions runners have ~25% performance variance due to shared/limited CPU resources
- **Solution**: Increase threshold to 25ms (still ensures 40fps minimum) with comprehensive documentation of rationale
- **Prevention**: Consider statistical approaches (median of multiple runs, percentiles) for future resilience

## Decisions

### Display Formatting Utilities Architecture

- **Decision**: Create comprehensive formatting utilities library instead of scattered format functions
- **Rationale**: Found existing `formatYear()` in utils.ts and `formatEraYear()` in eraUtils.ts - centralized approach provides consistency and maintainability
- **Implementation**: `/src/lib/displayFormatting.ts` with 10+ formatting functions, extensive test coverage, and backward compatibility
- **Success Metrics**: 35 tests passing on first implementation, ~20 minute execution time (within estimate), zero breaking changes to existing code

### Utility Development Time Estimation Patterns

- **Accurate Estimation**: 20-30 minute estimate for utility creation matched 20 minute actual execution
- **Contributing Factors**: Pattern discovery first, comprehensive test writing, existing code analysis
- **Replication Strategy**: Always start with codebase exploration, write tests before implementation, plan for multiple formatting styles

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

### Performance Testing Patterns

- **Template Discovery**: Use pattern-scout to find existing performance test templates before creating new ones
  ```bash
  # ✅ Find performance test patterns first
  find . -name "*performance*.test.ts" | head -1
  # Look for: timeline-performance.test.ts as template
  ```
- **Assertion Overhead Accounting**: High iteration counts + many expect() calls add measurable overhead to test timing
  ```typescript
  // ✅ Account for test framework overhead in thresholds
  // Pure function: 10ms local → 16ms CI threshold
  // With many assertions: 25ms local → 40ms CI threshold
  ```
- **CI Environment Multipliers**: CI environments need 1.5-2x local thresholds due to shared resources and assertion overhead
- **Separate Performance Files**: Create dedicated `.performance.test.ts` files for timing-critical tests to isolate from functional tests
- **Memory Tracking Capability**: Node environment allows `process.memoryUsage()` tracking for memory performance validation

### Form Component Performance Testing

- **State Reset Requirements**: Form submission tests require input clearing between submissions to prevent cached behavior
  ```typescript
  // ✅ Clear state between performance iterations
  fireEvent.change(input, { target: { value: "" } });
  fireEvent.change(input, { target: { value: testYear } });
  ```
- **Re-rendering Testing**: Component performance tests need actual re-renders during submission cycles
- **Real-World Thresholds**: Set thresholds based on frame budgets (16ms = 60fps, 25ms = 40fps) with CI environment padding
- **Input Latency Focus**: Test the critical path from user keystroke to UI update for responsive feeling

### Feature Flag Implementation Patterns

- **Settings Modal Integration**: Use existing Settings modal patterns for feature toggles - follow notification toggle structure
  ```typescript
  // ✅ Pattern from useNotifications hook
  interface UseBCADToggleReturn {
    useBCADToggle: boolean;
    setBCADToggle: (enabled: boolean) => void;
  }
  ```
- **Wrapper Component Strategy**: Create separate legacy components to maintain clean separation between feature flag modes
  ```typescript
  // ✅ Clean separation pattern
  return useBCADToggle ? <GuessInput {...props} /> : <GuessInputLegacy {...props} />
  ```
- **Custom Hook Per Feature**: Follow established hook patterns - one hook per feature flag following useNotifications structure
- **localStorage with Fallback**: Use localStorage for authenticated users with sessionStorage fallback for anonymous users
  ```typescript
  // ✅ Graceful fallback pattern
  const storage = isSignedIn ? localStorage : sessionStorage;
  ```

### Settings Modal Feature Toggle Patterns

- **Consistent Toggle Structure**: All feature toggles in Settings follow the same notification toggle pattern
- **Icon + Text Pattern**: Each toggle has corresponding icon (from lucide-react) + descriptive text + toggle switch
- **Accessibility Standards**: Proper ARIA labels, role attributes, and keyboard navigation for all toggles
- **Storage Consistency**: All settings use same storage strategy (localStorage primary, sessionStorage fallback)

### Component Wrapper Architecture for Feature Flags

- **Conditional Rendering at Top Level**: Feature flag logic should be in parent component, not scattered throughout child components
- **Props Interface Consistency**: Both legacy and new components should accept identical props interface for seamless swapping
- **Separate Test Files**: Legacy components get separate test files to avoid test pollution between modes
- **Zero Breaking Changes**: Feature flags should never break existing functionality - always graceful fallback

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

### React Component Testing Patterns

- **Motion Library Mocking**: Mock motion/react for consistent test behavior

  ```typescript
  // From HintsDisplay.test.tsx:18-35
  vi.mock("motion/react", () => ({
    motion: {
      div: ({ children, ...props }: React.HTMLProps<HTMLDivElement>) => (
        <div {...props}>{children}</div>
      ),
      p: ({ children, ...props }: React.HTMLProps<HTMLParagraphElement>) => (
        <p {...props}>{children}</p>
      ),
      span: ({ children, ...props }: React.HTMLProps<HTMLSpanElement>) => (
        <span {...props}>{children}</span>
      ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    LayoutGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReducedMotion: () => false,
  }));
  ```

- **Accessibility Testing**: Test ARIA attributes, roles, and live regions

  ```typescript
  // From HintsDisplay.test.tsx:250-262
  it("provides proximity aria-labels on past hints", () => {
    // Proximity indicator has a role and aria-label
    const emoji = screen.getByRole("img", {
      name: /Very close|Close|Warm|Cold|Very cold|Perfect/i,
    });
    expect(emoji).toBeTruthy();
  });

  // From CurrentHintCard.test.tsx:50-56
  it("announces hint text in a polite live region", () => {
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });
  ```

- **Keyboard Event Testing**: Test Enter key and other keyboard interactions

  ```typescript
  // From GuessInput.test.tsx:170-185
  it("handles Enter key submission", async () => {
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1969" } });
    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    const form = input.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnGuess).toHaveBeenCalledWith(1969);
    });
  });
  ```

- **Variant Props Testing**: Test different component states and variants

  ```typescript
  // From GuessInput.button-width.test.tsx:54-101
  it("button text changes correctly for different states", () => {
    const { rerender } = render(<Component {...baseProps} />);

    // Test loading state
    rerender(<Component {...baseProps} isLoading={true} />);
    expect(button.textContent).toBe("Loading game...");

    // Test disabled state
    rerender(<Component {...baseProps} disabled={true} />);
    expect(button.textContent).toBe("Game Over");
  });
  ```

- **Animation State Testing**: Test loading states and button animations

  ```typescript
  // From GuessInput.button-width.test.tsx:34-40
  await waitFor(() => {
    expect(button.textContent).toBe("Guessing...");
  });

  // Button should have the animation classes during submission
  expect(button.className).toContain("scale-105");
  expect(button.className).toContain("animate-pulse");
  ```

- **Radio Group Testing**: Test radio button components with roles

  ```typescript
  // From GuessInput.test.tsx:157-167
  // Select BC era
  const bcButton = screen.getByRole("radio", { name: /BC/i });
  fireEvent.click(bcButton);

  // Enter positive year value
  fireEvent.change(input, { target: { value: "776" } });
  fireEvent.submit(form);

  await waitFor(() => {
    expect(mockOnGuess).toHaveBeenCalledWith(-776);
  });
  ```

- **Width/Size Variant Testing**: Test component width consistency
  ```typescript
  // From GuessInput.button-width.test.tsx:103-116
  it("button maintains full width", () => {
    const button = screen.getByRole("button");
    expect(button.className).toContain("w-full");
  });
  ```

### Testing Framework Compatibility - Vitest/Chai vs Jest-DOM

- **Critical Framework Difference**: Chrondle uses Vitest with Chai assertions, NOT Jest-DOM matchers

  ```typescript
  // ❌ Jest-DOM patterns (don't work in this project)
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute("aria-label", "value");
  expect(element).toBeDisabled();

  // ✅ Vitest/Chai patterns (correct for Chrondle)
  expect(element).toBeTruthy();
  expect(element.getAttribute("aria-label")).toBe("value");
  expect((element as HTMLButtonElement).disabled).toBe(true);
  ```

- **Pattern Discovery for Testing**: Use existing test files as templates - search for `*.test.tsx` files to find established patterns before writing tests

  ```bash
  # ✅ Find testing patterns first
  find . -name "*.test.tsx" | head -3 | xargs ls -la
  # Look for: GuessInput.test.tsx, HintsDisplay.test.tsx patterns
  ```

- **Motion Library Testing Pattern**: Standard mock prevents animation test flakiness

  ```typescript
  # ✅ Required for any component using motion/react
  vi.mock("motion/react", () => ({ /* standard mock structure */ }));
  ```

- **Accessibility Attribute Testing**: Use `getAttribute()` method instead of Jest-DOM's `toHaveAttribute`

  ```typescript
  # ✅ Vitest/Chai approach for ARIA testing
  expect(button.getAttribute('aria-expanded')).toBe('true');
  expect(button.getAttribute('aria-label')).toBe('Toggle to BC era');
  ```

- **TypeScript Assertion Patterns**: Cast elements to specific types when accessing properties
  ```typescript
  # ✅ Type-safe disabled property testing
  const button = screen.getByRole('button') as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  ```

### Complex Component Integration Testing

- **Pattern Discovery Strategy**: Use pattern-scout/grep to find similar test structures before writing new integration tests

  ```bash
  # ✅ Find existing BC/AD toggle test patterns
  rg "BC.*AD" --type tsx -A 5 -B 5
  # Find radio button testing patterns in codebase
  ```

- **Mock Reuse**: When testing integrated components, reuse motion/react mock patterns from successful tests (EraToggle.test.tsx → GuessInput.test.tsx)
- **State Persistence Testing**: Test that user interactions persist across form submissions

  ```typescript
  # ✅ Test era selection persists during input changes
  const bcButton = screen.getByRole("radio", { name: /BC/i });
  fireEvent.click(bcButton);

  # Verify BC stays selected when typing
  fireEvent.change(input, { target: { value: "776" } });
  expect(bcButton.getAttribute('aria-checked')).toBe('true');
  ```

- **Keyboard Modifier Testing**: Test advanced keyboard interactions with modifiers

  ```typescript
  # ✅ Test Shift+Tab keyboard navigation
  fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
  await waitFor(() => {
    expect(bcButton).toHaveFocus();
  });
  ```

- **Real-Time Display Testing**: Use document.getElementById to test formatted display updates
  ```typescript
  # ✅ Test formatted year display during typing
  fireEvent.change(input, { target: { value: '1969' } });
  const formatted = document.getElementById('formatted-display');
  expect(formatted?.textContent).toBe('1969 AD');
  ```

### Motion/React Test Mock Patterns

- **HTML Props Type Conflicts**: Motion/react button mocks need special handling for HTML button props

  ```typescript
  // ✅ Handle type prop conflicts in motion mocks
  vi.mock("motion/react", () => ({
    motion: {
      button: ({ type, children, ...props }: any) => (
        <button type={type as "button" | "submit" | "reset"} {...props}>
          {children}
        </button>
      ),
    },
  }));
  ```

- **Explicit Type Casting**: When motion components have prop conflicts, explicitly cast problematic props
- **Comprehensive Mock Coverage**: Include all motion components used (div, button, span, etc.) in single mock
- **Animation Prevention**: Motion mocks should render static elements to prevent test timing issues

## Bugs & Fixes

### Timeline Performance Test CI Failures

- **Problem**: CI environments failing performance tests at 16ms threshold (16.2ms actual vs 16ms limit)
- **Root Cause**: GitHub Actions runners have ~25% performance variance due to shared/limited CPU resources
- **Solution**: Increase threshold to 25ms (still ensures 40fps minimum) with comprehensive documentation of rationale
- **Prevention**: Consider statistical approaches (median of multiple runs, percentiles) for future resilience

### Testing Framework Mismatches

- **Problem**: Writing tests with Jest-DOM matchers (`toBeInTheDocument`, `toHaveAttribute`, `toBeDisabled`) in Vitest/Chai environment
- **Root Cause**: Assumed Jest-DOM availability without checking project's test setup configuration
- **Solution**: Use Vitest/Chai equivalents (`toBeTruthy()`, `getAttribute().toBe()`, property access with type casting)
- **Prevention**: Always examine existing test files first to understand framework patterns and available matchers

### Year Boundary Assumptions in Tests

- **Problem**: Test failing due to incorrect assumption about AD year minimum bounds (expected year 1, implementation uses year 0)
- **Root Cause**: Didn't verify actual implementation constraints before writing boundary condition tests
- **Solution**: Investigated implementation in `src/lib/constants.ts` - confirmed Chrondle uses year 0 as minimum AD year (historical accuracy for year of Christ's birth)
- **Prevention**: Check implementation constants and validation logic before writing edge case tests

### Performance Test Form State Issues

- **Problem**: Form submission performance tests failing due to input state not resetting between iterations
- **Root Cause**: Cached form values persisted across test iterations, affecting timing measurements and expected behavior
- **Solution**: Explicitly clear input values between performance test iterations
  ```typescript
  // ✅ Reset input state for accurate performance timing
  fireEvent.change(input, { target: { value: "" } });
  await waitFor(() => expect(input.value).toBe(""));
  ```
- **Prevention**: Always reset component state between performance test iterations to ensure consistent conditions

### Era Conversion Boundary Logic

- **Problem**: Year 0 handling in convertFromInternalYear function using incorrect comparison operator
- **Root Cause**: Used `> 0` instead of `>= 0` for AD year detection, causing year 0 to be treated as BC
- **Solution**: Changed condition to `>= 0` to properly handle year 0 as AD
  ```typescript
  // ✅ Correct year 0 handling
  return internalYear >= 0
    ? { year: internalYear, era: "AD" }
    : { year: Math.abs(internalYear), era: "BC" };
  ```
- **Prevention**: Test boundary conditions explicitly (year 0, year 1, year -1) when dealing with era conversions

### Motion/React Mock Type Conflicts

- **Problem**: TypeScript errors in test mocks for motion/react button props - 'type' prop conflict
- **Root Cause**: Motion button component accepts different type definitions than HTML button element
- **Solution**: Explicitly handle and cast the type prop in motion mocks
  ```typescript
  // ✅ Handle type prop casting in mocks
  button: ({ type, ...props }: any) => (
    <button type={type as "button" | "submit" | "reset"} {...props} />
  ),
  ```
- **Prevention**: When mocking motion/react components, handle HTML prop conflicts by explicit casting

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

### Testing Framework Approach

- **Decision**: Continue using Vitest with Chai assertions instead of migrating to Jest-DOM
- **Rationale**: Existing codebase has established patterns, migration would require updating all existing tests
- **Implementation**: Document Vitest/Chai patterns clearly, create standard mocking patterns for common libraries (motion/react)
- **Success Indicators**: New tests pass on first attempt when following established patterns, comprehensive accessibility coverage achieved

### Complex Integration Testing Approach

- **Decision**: Add comprehensive BC/AD toggle integration tests (15 new tests) to GuessInput rather than separate test file
- **Rationale**: Integration behavior is core to component functionality - users need seamless era selection with input
- **Implementation**: Pattern-scout approach + motion mock reuse + keyboard navigation testing + real-time display validation
- **Success Metrics**: All 35 tests pass on first run, 30-minute completion (vs 60-90 min estimate), comprehensive coverage of edge cases
- **Time Accuracy Improvement**: Discovered pattern-scout + mock reuse dramatically improves estimation accuracy for complex component testing

### Performance Testing Strategy

- **Decision**: Create separate `.performance.test.ts` files for timing-critical tests with realistic CI thresholds
- **Rationale**: Performance tests need different thresholds and iteration counts than functional tests; mixing them creates brittle test suites
- **Implementation**: Split BC/AD performance tests into dedicated files with 10,000 iteration cycles and CI-appropriate thresholds (25ms vs 16ms local)
- **Success Metrics**: All performance tests pass on first attempt in both local and CI environments, accurate time estimates (20 min actual vs 30-45 min estimate)
- **Threshold Strategy**: Use 1.5x multiplier for CI environments + document frame-rate rationale (25ms = 40fps minimum)

### Feature Flag Architecture for BC/AD Toggle

- **Decision**: Implement BC/AD input toggle as feature flag using wrapper component pattern
- **Rationale**: Allows gradual rollout while maintaining both input methods - legacy negative numbers and new BC/AD toggle system
- **Implementation**: Created `useBCADToggle` hook following `useNotifications` pattern + `GuessInputLegacy` wrapper component + Settings modal toggle
- **Success Metrics**: 25-minute completion (faster than 30-45 min estimate), both modes working correctly, zero breaking changes to existing functionality
- **Benefits**: Clean separation of concerns, established Settings patterns, graceful localStorage/sessionStorage fallback for anonymous users

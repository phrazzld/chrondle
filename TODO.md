# BC/AD Input Fix Implementation TODO

Generated from TASK.md on 2025-09-03

**Goal**: Fix iOS numeric keyboard issue by implementing positive year input + BC/AD toggle

## Critical Path Items (Must complete in order)

### Foundation Phase

- [x] **CP-1: Create Era Conversion Utilities** - Build core BC/AD conversion logic
  - Success criteria: Bidirectional conversion functions work for all years (-3000 to 2024)
  - Dependencies: None
  - Estimated complexity: MEDIUM (45-60 min)
  - Files: Create `src/lib/eraUtils.ts`
- [x] **CP-2: Build EraToggle Component** - Create accessible BC/AD toggle control
  - Success criteria: Toggle switches states, announces to screen readers, keyboard accessible
  - Dependencies: CP-1 (era utilities for validation)
  - Estimated complexity: MEDIUM (60-75 min)
  - Files: Create `src/components/ui/EraToggle.tsx`
- [ ] **CP-3: Refactor GuessInput Component** - Integrate positive input + era toggle
  - Success criteria: Accepts only positive numbers, era toggle integrated, real-time display works
  - Dependencies: CP-1, CP-2
  - Estimated complexity: COMPLEX (90-120 min)
  - Files: Modify `src/components/GuessInput.tsx`

## Parallel Work Streams

### Stream A: Visual & Display Enhancements

- [ ] **PA-1: Create Display Formatting Utilities** - Consistent BC/AD display formatting
  - Success criteria: Formats "776 BC" and "1969 AD" correctly across app
  - Can start: After CP-1
  - Estimated complexity: SIMPLE (20-30 min)
- [ ] **PA-2: Update Year Display Components** - Apply new formatting everywhere
  - Success criteria: All year displays use consistent BC/AD format
  - Dependencies: PA-1, CP-3
  - Estimated complexity: MEDIUM (45-60 min)

### Stream B: Mobile Optimization

- [ ] **PB-1: Configure Mobile Keyboard Settings** - Optimize input patterns for mobile
  - Success criteria: iOS shows numeric keyboard without minus sign
  - Can start: After CP-3
  - Estimated complexity: SIMPLE (15-30 min)
- [ ] **PB-2: Optimize Touch Targets** - Ensure 44px minimum touch targets
  - Success criteria: Era toggle easily tappable on small screens
  - Dependencies: CP-2
  - Estimated complexity: SIMPLE (20-30 min)

### Stream C: Backward Compatibility

- [ ] **PC-1: Implement Migration Logic** - Handle existing negative number data
  - Success criteria: Existing games load correctly, localStorage preserved
  - Can start: After CP-1
  - Estimated complexity: MEDIUM (45-60 min)

## Testing & Validation

### Unit Testing

- [ ] **T-1: Test Era Conversion Utilities** - Comprehensive unit tests
  - Success criteria: 100% coverage, all edge cases handled (year 0, boundaries)
  - Dependencies: CP-1
  - Estimated complexity: MEDIUM (30-45 min)
- [ ] **T-2: Test EraToggle Component** - Component and accessibility tests
  - Success criteria: ARIA compliance verified, keyboard nav works
  - Dependencies: CP-2
  - Estimated complexity: MEDIUM (30-45 min)

### Integration Testing

- [ ] **T-3: Update GuessInput Tests** - Full integration test suite
  - Success criteria: All existing tests pass, new functionality covered
  - Dependencies: CP-3
  - Estimated complexity: COMPLEX (60-90 min)
- [ ] **T-4: Cross-Browser Mobile Testing** - Manual device testing
  - Success criteria: Works on iOS Safari, Android Chrome, desktop browsers
  - Dependencies: CP-3, PB-1, PB-2
  - Estimated complexity: MEDIUM (45-60 min)

### Performance Testing

- [ ] **T-5: Performance Benchmarks** - Ensure no regression
  - Success criteria: Input latency < 16ms, conversion < 1ms
  - Dependencies: CP-3
  - Estimated complexity: SIMPLE (30-45 min)

## Risk Mitigation

- [ ] **R-1: Add Feature Flag** - Enable gradual rollout and rollback
  - Success criteria: Can toggle between old/new systems without errors
  - Dependencies: CP-3
  - Estimated complexity: SIMPLE (30-45 min)
- [ ] **R-2: Update Error Boundaries** - Handle conversion failures gracefully
  - Success criteria: Era conversion errors caught, helpful messages shown
  - Dependencies: CP-1, CP-3
  - Estimated complexity: SIMPLE (20-30 min)

## Documentation & Cleanup

- [ ] **D-1: Add Code Documentation** - JSDoc comments and usage examples
  - Success criteria: All public APIs documented with examples
  - Dependencies: CP-1, CP-2
  - Estimated complexity: SIMPLE (20-30 min)
- [ ] **D-2: Update CLAUDE.md** - Document new BC/AD input system
  - Success criteria: Architecture and testing sections updated
  - Dependencies: All implementation complete
  - Estimated complexity: SIMPLE (15-30 min)
- [ ] **D-3: Code Review Pass** - Final quality check
  - Success criteria: No linting errors, follows conventions, accessible
  - Dependencies: All tasks complete
  - Estimated complexity: SIMPLE (30 min)

## Validation Checklist

Before marking complete:

- [ ] iOS users can enter BC years without external keyboard
- [ ] Android users have optimized numeric keyboard
- [ ] Screen readers announce era changes properly
- [ ] Keyboard navigation (arrow keys) still works
- [ ] Existing game data migrates correctly
- [ ] Performance metrics meet targets (< 16ms input latency)
- [ ] All tests passing (unit, integration, E2E)
- [ ] Feature flag tested for rollback capability

## Future Enhancements (BACKLOG.md candidates)

- [ ] Smart era detection based on hint context
- [ ] Keyboard shortcuts (B/A keys) for power users
- [ ] Era preference memory (remember last selection)
- [ ] Support BCE/CE notation option
- [ ] Internationalization for different calendar systems
- [ ] Visual indication when year is ambiguous (could be BC or AD)

## Implementation Notes

**Key Technical Decisions:**

- Use positive numbers in UI, convert to negative internally for backward compatibility
- Leverage existing Radix UI Switch pattern for consistency
- Maintain all keyboard shortcuts and navigation patterns
- No backend changes required - UI layer handles all conversion

**Success Metrics:**

- Mobile input error rate reduced by 50%+
- No accessibility regressions
- Performance unchanged or improved
- Zero data loss for existing users

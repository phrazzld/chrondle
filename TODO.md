# Chrondle Implementation TODO

Generated from TASK.md on 2024-01-13

## Critical Path Items (Must complete in order)

### Phase 1: Clean UI Removals

- [x] Remove "Review Hints" feature - Delete unnecessary modal and button

  - Success criteria: No review hints button visible, modal completely removed
  - Dependencies: None
  - Estimated complexity: SIMPLE
  - Files: `GameIsland.tsx`, `HintReviewModal.tsx`, `LazyModals.tsx`

- [x] Remove Sync Indicator - Delete green cloud/check icon from navbar
  - Success criteria: Header renders without sync indicator, no errors
  - Dependencies: None
  - Estimated complexity: SIMPLE
  - Files: `AppHeader.tsx`, `SyncIndicator.tsx`

### Phase 2: UI Transformation

- [ ] Transform Settings Modal to Notification Controls - Replace settings with bell icon
  - Success criteria: Bell icon in header, notification panel functional
  - Dependencies: Phase 1 complete (cleaner codebase)
  - Estimated complexity: MEDIUM
  - Files: `AppHeader.tsx`, `SettingsModal.tsx`

## Parallel Work Streams

### Stream A: Simple UI Cleanup (Can start immediately)

- [x] Delete HintReviewModal component file

  - Success criteria: File removed, no import errors
  - Can start: Immediately
  - Complexity: SIMPLE

- [x] Remove HintReviewModal from LazyModals

  - Success criteria: Import and export removed, no compilation errors
  - Dependencies: None
  - Complexity: SIMPLE

- [x] Remove review hints button from GameIsland

  - Success criteria: Button removed, state cleaned up, no UI remnants
  - Dependencies: None
  - Complexity: SIMPLE

- [x] Delete SyncIndicator component file

  - Success criteria: File removed, no import errors
  - Can start: Immediately
  - Complexity: SIMPLE

- [x] Remove SyncIndicator from AppHeader
  - Success criteria: Component usage removed, header displays correctly
  - Dependencies: None
  - Complexity: SIMPLE

### Stream B: Critical Bug Fixes (Can start immediately)

- [x] Fix streak counter timezone handling

  - Success criteria: Streak increments correctly, handles timezone changes
  - Can start: Immediately
  - Complexity: MEDIUM
  - Critical: Uses local timezone instead of UTC

- [x] Create local date formatting utility

  - Success criteria: Consistent date handling across streak logic
  - Dependencies: None
  - Complexity: SIMPLE

- [x] Update calculateCurrentStreak function

  - Success criteria: Correctly calculates streak using local dates
  - Dependencies: Date utility created
  - Complexity: MEDIUM

- [x] Update recordGamePlayed function

  - Success criteria: Records games with local timezone dates
  - Dependencies: Date utility created
  - Complexity: MEDIUM

- [x] Fix input focus management after guess

  - Success criteria: Input stays focused, mobile keyboard remains open
  - Can start: Immediately
  - Complexity: SIMPLE

- [x] Consolidate focus useEffect hooks

  - Success criteria: Single useEffect manages all focus scenarios
  - Dependencies: None
  - Complexity: SIMPLE

- [x] Add mobile keyboard optimization
  - Success criteria: `inputmode="numeric"`, keyboard stays open
  - Dependencies: None
  - Complexity: SIMPLE

### Stream C: Notification System Redesign

- [ ] Replace Settings icon with Bell icon

  - Success criteria: Bell icon displays in header
  - Dependencies: UI cleanup complete
  - Complexity: SIMPLE

- [ ] Implement notification permission flow

  - Success criteria: Two-step permission pattern works
  - Dependencies: Bell icon in place
  - Complexity: MEDIUM

- [ ] Add notification state management

  - Success criteria: Icon shows enabled/disabled/pending states
  - Dependencies: Permission flow implemented
  - Complexity: MEDIUM

- [ ] Update ARIA labels and accessibility

  - Success criteria: Screen readers announce notification states
  - Dependencies: Notification UI complete
  - Complexity: SIMPLE

- [ ] Test service worker integration
  - Success criteria: Background notifications work on supported browsers
  - Dependencies: Notification system complete
  - Complexity: MEDIUM

### Stream D: Backend Infrastructure

- [ ] Research DST handling for Central Time

  - Success criteria: Clear implementation approach documented
  - Can start: Immediately
  - Complexity: MEDIUM

- [ ] Implement DST detection logic

  - Success criteria: Correctly identifies CST vs CDT periods
  - Dependencies: DST research complete
  - Complexity: COMPLEX

- [ ] Update cron job schedule for Central Time

  - Success criteria: Runs at midnight CT year-round
  - Dependencies: DST logic implemented
  - Complexity: SIMPLE

- [ ] Add cron monitoring and logging
  - Success criteria: Execution times logged, alerts configured
  - Dependencies: Cron updated
  - Complexity: MEDIUM

### Stream E: Mobile Polish

- [ ] Audit archive page mobile styling

  - Success criteria: Issues documented with screenshots
  - Can start: Immediately
  - Complexity: SIMPLE

- [ ] Fix archive padding and spacing

  - Success criteria: Proper spacing on all mobile devices
  - Dependencies: Audit complete
  - Complexity: SIMPLE

- [ ] Verify touch target sizes
  - Success criteria: All targets ≥44x44px
  - Dependencies: Styling fixes applied
  - Complexity: SIMPLE

## Testing & Validation

### UI Testing

- [ ] Verify review hints completely removed
  - Success criteria: No button, no modal, no console errors
- [ ] Verify sync indicator removed
  - Success criteria: No cloud icon, header layout correct
- [ ] Test notification icon functionality
  - Success criteria: Bell icon works, permission flow correct

### Functional Testing

- [ ] Test streak counter across timezones
  - Success criteria: Increments correctly, handles DST, no resets
- [ ] Test input focus on multiple devices
  - Success criteria: Focus persists, keyboard stays open on mobile
- [ ] Test cron job at DST transitions
  - Success criteria: Runs at midnight CT during spring/fall changes

### Cross-Browser Testing

- [ ] Test notifications on Chrome/Firefox/Safari
  - Success criteria: Permissions work, notifications display
- [ ] Test mobile experience on iOS/Android
  - Success criteria: Archive looks good, input focus works

### Performance Testing

- [ ] Verify no performance regressions
  - Success criteria: Page load times unchanged or better
- [ ] Check bundle size impact
  - Success criteria: Bundle size reduced after removals

## Documentation & Cleanup

- [ ] Update README if notification setup changed
  - Success criteria: Clear instructions for notification permissions
- [ ] Document DST handling approach
  - Success criteria: Future developers understand timezone logic
- [ ] Remove unused imports and dead code
  - Success criteria: No unused dependencies or imports
- [ ] Run linter and fix any issues
  - Success criteria: `pnpm lint` passes with no errors

## Deployment Checklist

- [ ] Test all changes locally
- [ ] Run full test suite (`pnpm test`)
- [ ] Build production bundle (`pnpm build`)
- [ ] Deploy to staging environment
- [ ] Verify cron job timing in staging
- [ ] Monitor for 24 hours
- [ ] Deploy to production
- [ ] Monitor streak and notification metrics

## Future Enhancements (BACKLOG.md candidates)

- [ ] Add notification scheduling options (morning/evening)
- [ ] Implement streak freeze tokens for missed days
- [ ] Add push notification support via service worker
- [ ] Create notification preference profiles
- [ ] Add archive page filtering and search
- [ ] Implement virtual scrolling for archive performance
- [ ] Add streak milestone celebrations
- [ ] Create notification sound options

## Risk Mitigation Tasks

- [ ] Backup user streak data before timezone changes
- [ ] Create rollback plan for cron job changes
- [ ] Test notification fallbacks when blocked
- [ ] Monitor error rates after deployment
- [ ] Have hotfix process ready for critical issues

## Success Metrics

- UI cleaner with only essential elements ✓
- Streak tracking reliable across timezones ✓
- Mobile input experience smooth ✓
- Notification system simplified ✓
- Daily reset consistent for all users ✓
- Archive mobile experience professional ✓

---

**Total Estimated Time: 15-22 hours**

**Priority Order:**

1. Simple removals (1-2 hours)
2. Critical bug fixes (6-8 hours)
3. UI transformation (4-6 hours)
4. Backend changes (4-6 hours)
5. Mobile polish (1-2 hours)

**High Risk Items:**

- Streak counter timezone fix
- Cron job DST handling

**Quick Wins:**

- Remove review hints
- Remove sync indicator
- Fix input focus

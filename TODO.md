# TODO: Remove Notifications Feature

## Context

- **Approach**: Complete feature removal with clean architecture restoration
- **Scope**: 14 files, ~1,500 lines of notification code
- **Current Branch**: `feature/remove-notifications`
- **Current State**: Phase 1 (dependency decoupling) already completed in working directory
- **Strategy**: Three-commit approach for clean git history

## Phase 1: Commit Current Decoupling Work [5 minutes] ✅ IN PROGRESS

- [x] Stage and commit current dependency removals

  ```
  Files already modified:
  - src/components/AppHeader.tsx (removed Bell import, notification functions)
  - src/components/GameIsland.tsx (removed NotificationModal)
  - src/components/LazyModals.tsx (removed NotificationModal lazy load)
  - src/components/SessionThemeProvider.tsx (removed useNotifications)
  - TASK.md (specification document)

  Commit command:
  git add -A
  git commit -m "refactor: decouple notification dependencies from UI components

  - Remove notification UI elements from AppHeader
  - Remove notification modal from GameIsland
  - Remove notification hook from SessionThemeProvider
  - Clean up lazy loading for removed modal

  Prepares for complete notification system removal."

  Time estimate: 5 minutes
  ```

## Phase 2: Remove Core Notification Files [15 minutes]

- [x] Remove Service Worker registration from app layout

  ```
  File to modify:
  - src/app/layout.tsx:4 - Remove ServiceWorkerRegistration import
  - src/app/layout.tsx:60 - Remove <ServiceWorkerRegistration /> component

  Success criteria:
  - [ ] No ServiceWorker registration in layout
  - [ ] Build still succeeds

  Time estimate: 2 minutes
  ```

- [x] Delete core notification system files

  ```
  Files to delete:
  - src/lib/notifications.ts
  - src/hooks/useNotifications.ts
  - src/components/modals/NotificationModal.tsx
  - src/components/ui/TimePicker.tsx
  - src/lib/serviceWorker.ts
  - src/components/ServiceWorkerRegistration.tsx
  - src/components/__tests__/ServiceWorkerRegistration.test.tsx
  - public/sw.js

  Commands:
  rm src/lib/notifications.ts
  rm src/hooks/useNotifications.ts
  rm src/components/modals/NotificationModal.tsx
  rm src/components/ui/TimePicker.tsx
  rm src/lib/serviceWorker.ts
  rm src/components/ServiceWorkerRegistration.tsx
  rm src/components/__tests__/ServiceWorkerRegistration.test.tsx
  rm public/sw.js

  Success criteria:
  - [ ] All 8 files deleted
  - [ ] No broken imports reported

  Time estimate: 3 minutes
  ```

- [x] Remove test-sw directory

  ```
  Directory to remove:
  - src/app/test-sw/

  Command:
  rm -rf src/app/test-sw

  Time estimate: 1 minute
  ```

- [x] Verify no broken imports

  ```
  Commands:
  pnpm type-check

  Success criteria:
  - [ ] TypeScript compilation succeeds
  - [ ] No import errors

  Time estimate: 2 minutes
  ```

- [x] Commit core removal

  ```
  Commands:
  git add -A
  git commit -m "feat!: remove notification system core files

  - Remove 8 notification-related files (1500+ lines)
  - Remove Service Worker and registration components
  - Remove notification hooks and utilities
  - Remove test-sw development page
  - Remove public/sw.js service worker

  BREAKING CHANGE: Notification feature completely removed
  All notification functionality has been removed to simplify
  the codebase and eliminate Service Worker complexity."

  Time estimate: 2 minutes
  ```

## Phase 3: Configuration and Constants Cleanup [10 minutes]

- [x] Remove NOTIFICATION_CONFIG from constants

  ```
  File to modify:
  - src/lib/constants.ts:258-293 - Remove entire NOTIFICATION_CONFIG object

  Implementation:
  1. Delete lines 256-293 (includes comments and full config)
  2. This removes:
     - DEFAULT_TIME constant
     - TIME_OPTIONS array (24 entries)
     - MESSAGES array (7 notification messages)
     - RETRY_INTERVAL
     - PERMISSION_REMINDER_DELAY

  Success criteria:
  - [ ] No NOTIFICATION_CONFIG in file
  - [ ] File still compiles

  Time estimate: 3 minutes
  ```

- [x] Search for any remaining notification references

  ```
  Commands:
  rg -i "notification" --type ts --type tsx
  rg -i "serviceWorker|service.?worker" --type ts --type tsx
  rg "TimePicker" --type ts --type tsx
  rg "useNotifications" --type ts --type tsx

  Success criteria:
  - [ ] No notification imports found
  - [ ] No notification types found
  - [ ] No notification function calls found

  Time estimate: 3 minutes
  ```

- [x] Final build validation

  ```
  Commands:
  pnpm build
  pnpm lint
  pnpm type-check

  Success criteria:
  - [ ] Build completes successfully
  - [ ] No TypeScript errors
  - [ ] No linting errors
  - [ ] Bundle size reduced (check build output)

  Time estimate: 3 minutes
  ```

- [~] Commit configuration cleanup

  ```
  Commands:
  git add -A
  git commit -m "refactor: clean up notification configuration and constants

  - Remove NOTIFICATION_CONFIG from constants.ts (35 lines)
  - Remove notification message templates
  - Remove time picker options
  - Verify no remaining notification references

  Completes notification system removal with ~50KB bundle reduction."

  Time estimate: 1 minute
  ```

## Phase 4: Manual Testing & Validation [5 minutes]

- [ ] Start development server

  ```
  Command:
  pnpm dev

  Test areas:
  - [ ] Game loads without errors
  - [ ] No console errors in browser
  - [ ] Navbar displays correctly with even spacing
  - [ ] Theme toggle works
  - [ ] Auth buttons work
  - [ ] Archive button works
  - [ ] Streak counter displays

  Time estimate: 3 minutes
  ```

- [ ] Check bundle size reduction

  ```
  Compare build output before/after:
  - Expected reduction: ~40-50KB
  - Service Worker removed
  - Notification libraries removed

  Time estimate: 2 minutes
  ```

## Final Validation Checklist

### Build & Code Quality

- [ ] `pnpm build` succeeds without errors
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` shows no issues
- [ ] No TypeScript compilation errors
- [ ] No orphaned imports

### Runtime Validation

- [ ] Development server starts without errors
- [ ] No console errors in browser (Chrome DevTools)
- [ ] Game plays normally
- [ ] All UI interactions work

### Visual Validation

- [ ] Navbar buttons evenly spaced
- [ ] No visual gaps where bell icon was
- [ ] Mobile responsive layout intact
- [ ] Theme switching works correctly

### Performance Validation

- [ ] Bundle size reduced by 40KB+
- [ ] No Service Worker registration attempts
- [ ] No notification permission prompts

## Summary

**Total Estimated Time**: 35 minutes

**Commit Structure**:

1. ✅ Decouple dependencies (already done, needs commit)
2. Remove core notification files
3. Clean up configuration and constants

**Files Affected**: 14 files removed/modified
**Lines Removed**: ~1,500 lines
**Bundle Impact**: ~50KB reduction

**Risk Level**: Low - feature is well-isolated
**Rollback Strategy**: `git reset --hard` to previous commit if issues arise

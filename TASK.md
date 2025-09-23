- remove notifications navbar icon and feature

## Investigation Summary

Based on comprehensive research of the Chrondle codebase:

**Scope Discovery:**

- **14 files** directly contain notification functionality (~1,500+ lines of code)
- Notification system includes daily reminders, permission management, and UI settings
- Bell icon in navbar with color-coded status indicators (red/orange/green/gray)
- Complete modal interface for notification preferences and time selection
- Service Worker integration for background notification support

**Architecture Findings:**

- **Self-contained system** with minimal coupling to other features
- Uses native Web Notifications API (no external services or dependencies)
- Session-only storage (intentionally not persisted to avoid complexity)
- Integrated with theme provider for global state access
- No database tables or authentication system coupling

**Key Components Identified:**

1. Core service (`lib/notifications.ts`) - scheduling and permission management
2. React hook (`hooks/useNotifications.ts`) - state management interface
3. UI modal (`components/modals/NotificationModal.tsx`) - settings interface
4. Header integration (`components/AppHeader.tsx`) - bell icon with status
5. Service Worker files (`lib/serviceWorker.ts`, `public/sw.js`) - background support
6. Test page (`app/test-sw/page.tsx`) - development/testing interface

**Clean Removal Opportunity:**

- Well-isolated feature with clear boundaries
- No impact on core game mechanics
- No external API dependencies to migrate
- Can be removed without breaking other features

## Clarifying Questions

Please answer these questions to refine the specification:

1. **Completeness**: Should we remove ALL notification-related code, including the Service Worker test page and development utilities?
   **answer** yes, remove it

2. **Service Worker**: Should we keep the Service Worker registration for potential future PWA features, or remove it entirely since it was primarily for notifications?
   **answer** remove it entirely

3. **UI Space**: After removing the bell icon from the navbar, should the remaining buttons (streak, archive, theme, auth) maintain their current spacing or be adjusted?
   **answer** everything should be appropriately and evenly spaced

4. **Code Cleanup**: Should we remove the NOTIFICATION_CONFIG constants and notification message templates from constants.ts, or keep them commented for potential future reference?
   **answer** clean it up

5. **Git History**: Do you want a single atomic commit removing all notification code, or separate commits for core removal, UI removal, and cleanup?
   **answer** whatever is cleanest and adheres best to version control and software engineering best practices

6. **Testing**: Should we add any tests to verify the notification system is fully removed and doesn't break existing functionality?
   **answer** code is a liability, testing doubly so. sometimes it is worth incurring, when it adds real value. use your best judgment.

7. **Documentation**: Should we document why notifications were removed in the codebase (e.g., in CHANGELOG or a comment)?
   **answer** documentation is key as long as it's in the right place and worded well and implemented in such a way as to minimize the likelihood of falling out of sync with design and implementation

## Refined Specification

### Selected Approach

**Complete Feature Removal with Clean Architecture Restoration**

Justification: The notification system is well-isolated (14 files, ~1,500 lines) with minimal coupling. Complete removal simplifies the codebase, eliminates Service Worker complexity, and removes maintenance burden without affecting core game functionality.

### Requirements

#### Functional (What it MUST do)

- [ ] Remove all notification UI elements from navbar
- [ ] Remove notification modal and settings interface
- [ ] Remove Service Worker registration and notification handlers
- [ ] Remove notification scheduling and permission management
- [ ] Maintain proper navbar spacing after bell icon removal
- [ ] Preserve all core game functionality

#### Non-Functional (How well it must do it)

- **Performance**: Reduce bundle size by ~50KB (notification libs + SW)
- **Security**: Remove all notification permission requests
- **Reliability**: No console errors or broken imports after removal
- **Maintainability**: Clean git history with logical commit structure

### Implementation Strategy

#### Phase 1: Decouple Dependencies (Current State ✅)

**Already completed in working directory:**

- Removed notification imports from AppHeader
- Removed notification hook from SessionThemeProvider
- Removed NotificationModal from GameIsland
- Removed NotificationModal from LazyModals
- Cleaned up notification UI components

#### Phase 2: Core Removal (To Do)

**Files to delete:**

- `/src/lib/notifications.ts` - Core service
- `/src/hooks/useNotifications.ts` - React hook
- `/src/components/modals/NotificationModal.tsx` - Settings UI
- `/src/components/ui/TimePicker.tsx` - Time picker (notification-only)
- `/src/lib/serviceWorker.ts` - SW utilities
- `/src/components/ServiceWorkerRegistration.tsx` - SW registration
- `/src/app/test-sw/page.tsx` - Test page
- `/public/sw.js` - Service Worker file

#### Phase 3: Configuration Cleanup

**Constants to remove from `/src/lib/constants.ts`:**

- `NOTIFICATION_CONFIG` object and all sub-properties
- 24 time slot options
- Notification message templates

**Manifest cleanup:**

- Update `/public/site.webmanifest` if needed

### Success Criteria

- [ ] Build succeeds with no TypeScript errors
- [ ] No console errors in browser (dev or production)
- [ ] Navbar buttons evenly spaced without gap
- [ ] All tests pass (if any test notifications)
- [ ] Bundle size reduced by at least 40KB
- [ ] No orphaned imports or dead code

### Key Decisions

**1. Complete SW Removal**: Removing Service Worker entirely per user preference. PWA features can be re-added later with a cleaner implementation if needed.

**2. Three-Commit Strategy**: Following software engineering best practices:

- Commit 1: Decouple dependencies (already done in working dir)
- Commit 2: Remove core notification files
- Commit 3: Clean up configuration and constants

**3. No Additional Testing**: Following user guidance that test code is a liability. The TypeScript compiler and build process provide sufficient validation.

**4. Git Commit Documentation**: Each commit message will document what was removed and why, serving as permanent documentation in git history.

### Risk Mitigation

| Risk                                 | Mitigation                               |
| ------------------------------------ | ---------------------------------------- |
| Broken imports after file deletion   | TypeScript compilation will catch these  |
| UI layout issues from removed button | Visual inspection after removal          |
| Service Worker caching issues        | Users may need hard refresh after deploy |
| Missing notification types elsewhere | Full codebase grep before final commit   |

### Remaining Tasks

1. **Delete core notification files** (8 files)
2. **Remove NOTIFICATION_CONFIG** from constants.ts
3. **Verify no remaining imports** with grep/ripgrep
4. **Test build and runtime** behavior
5. **Create well-documented commits** (3 total)

### Validation Checklist

- [ ] `pnpm build` succeeds
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint` shows no issues
- [ ] Manual test: game plays normally
- [ ] Manual test: navbar looks correct
- [ ] No console errors in browser

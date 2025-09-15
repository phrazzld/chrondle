# Chrondle Improvement Tasks

## UI Cleanup Tasks

### 1. Remove "Review Hints" Feature

- [ ] **Remove the link/button** at the bottom of the game page that says "review hints"
- [ ] **Delete the modal** that opens when clicking the review hints button
- [ ] **Clean up all related code** - both the trigger and the modal are unnecessary

**Files to modify:**

- `src/components/GameIsland.tsx` - Remove button and modal logic (lines 172, 295-300, 316-337)
- `src/components/modals/HintReviewModal.tsx` - Delete entire file
- `src/components/LazyModals.tsx` - Remove lazy import (lines 13-16)

### 2. Remove Sync Indicator Icon

- [ ] **Remove the green cloud/check icon** to the left of the user auth icon in the navbar
- [ ] This sync indicator is unnecessary

**Files to modify:**

- `src/components/AppHeader.tsx` - Remove SyncIndicator component (line 8 import, line 120 usage)
- `src/components/SyncIndicator.tsx` - Delete entire file

## Functional Fixes

### 3. Fix Streak Counter

- [ ] **The streak counter is not working properly** - not incrementing or resetting unexpectedly
- [ ] **Root cause**: UTC date strings (`toISOString().slice(0, 10)`) don't match user's local timezone
- [ ] **Solution**: Use local timezone for all date calculations in streak logic

**Files to modify:**

- `src/hooks/useStreak.ts` - Fix timezone handling in `calculateCurrentStreak()` and `recordGamePlayed()`
  - Replace UTC date strings with local date formatting
  - Ensure consistent timezone handling throughout

### 4. Fix Input Focus After Guess

- [ ] **Keep input focused after submitting a guess** (when game is not over)
- [ ] When you submit an incorrect guess and have remaining guesses:
  - The next hint should be displayed
  - The guess input should remain focused
  - **Keyboard should stay open on mobile**
- [ ] Note: There is no feedback modal - game shows game over screen only when correct or last guess

**Files to modify:**

- `src/components/GuessInput.tsx` - Consolidate and fix focus management logic
  - Merge the two useEffect hooks that manage focus
  - Ensure focus persists after form submission
  - Add `inputmode="numeric"` for better mobile experience

## Settings & Notifications Redesign

### 5. Replace Settings Modal with Notification Icon

- [ ] **The reminders option is the only option in the settings modal**
- [ ] **Kill the settings modal** and replace the settings icon with a notification icon
- [ ] Make sure the notifications functionality works properly on both desktop and mobile

**Files to modify:**

- `src/components/AppHeader.tsx` - Change Settings icon to Bell icon
- `src/components/modals/SettingsModal.tsx` - Simplify to focus only on notification controls
  - Remove modal wrapper, make it notification-specific
  - Keep TimePicker integration
  - Update all labels and aria attributes

**Notification Requirements:**

- Two-step permission pattern (explain value before system prompt)
- Icon states: enabled, disabled, pending
- Fallback when notifications are blocked
- Service worker integration for background notifications

## Infrastructure

### 6. Update Cron Job Timing

- [ ] **Change cronjob to run at 00:00 Central Time**
- [ ] **Must handle daylight savings** (CST/CDT transitions)
- [ ] Current runs at midnight UTC (6 PM Central summer, 7 PM winter)

**Files to modify:**

- `convex/crons.ts` - Adjust UTC hour for Central Time
  - Set to UTC hour 6 (midnight CST) or hour 5 (midnight CDT)
  - Implement DST detection logic or use timezone library

### 7. Fix Archive Mobile Styling

- [x] **Fix archive mobile styling** (mostly padding issues)
- [x] Current responsive classes may have incorrect spacing on mobile devices
  ```
  Work Log:
  - Increased mobile card height from h-32 to h-36 (144px) for better content readability
  - Optimized card padding: p-3 on mobile, p-4 on desktop for better space utilization
  - Increased grid gap on mobile from gap-3 to gap-4 for improved visual separation
  - Made pagination buttons 44x44px on mobile (h-10 w-10) to meet WCAG touch target guidelines
  - Adjusted main container padding: py-6 on mobile, py-8 on desktop
  - Updated skeleton cards to match new responsive sizing
  ```

**Files to modify:**

- `src/app/archive/page.tsx` - Adjust padding and spacing for mobile breakpoints
  - Review grid gaps and card padding
  - Ensure proper touch targets (44x44px minimum)
  - Test on various mobile screen sizes

---

## Implementation Order

1. **Simple Removals** (Tasks 1-2): Delete unnecessary UI components
2. **UI Transformation** (Task 5): Convert settings to notifications
3. **Critical Fixes** (Tasks 3-4): Fix streak and focus bugs
4. **Backend** (Task 6): Update cron timing
5. **Polish** (Task 7): Mobile styling improvements

## Testing Checklist

- [ ] Review hints completely removed - no button, no modal
- [ ] Sync indicator removed from header
- [ ] Settings icon replaced with notification bell
- [ ] Notifications work on desktop and mobile browsers
- [ ] Streak increments correctly for daily plays
- [ ] Streak handles timezone changes properly
- [ ] Input stays focused after incorrect guess
- [ ] Mobile keyboard remains open between guesses
- [ ] Daily puzzle resets at midnight Central Time
- [ ] DST transitions handled correctly (spring forward/fall back)
- [ ] Archive page looks good on mobile devices
- [ ] All touch targets are appropriately sized

## Success Criteria

- Cleaner UI with only essential elements
- Reliable streak tracking across all timezones
- Smooth input experience on mobile devices
- Proper notification system without unnecessary modal
- Consistent daily reset time for all users
- Professional mobile experience in archive view

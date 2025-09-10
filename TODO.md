# Authentication Improvements Implementation TODO

Generated from TASK.md on 2025-01-09

## Critical Path Items (Must complete in order)

### Phase 1: Clerk Production Configuration

- [!] Clone Clerk dev instance to production

  - Success criteria: Production Clerk instance created with cloned settings
  - Dependencies: None
  - Estimated complexity: SIMPLE
  - Time estimate: 5 minutes

  ```
  Work Log:
  - Requires manual Clerk dashboard access
  - User needs to: Go to Clerk dashboard → Create production instance → Clone from dev
  - Waiting for user to complete dashboard configuration
  ```

- [ ] Configure production Clerk settings

  - Success criteria: Domain whitelist includes production domain, email sender set to noreply@chrondle.com
  - Dependencies: Cloned production instance
  - Estimated complexity: SIMPLE
  - Time estimate: 5 minutes

- [ ] Update environment variables with production keys
  - Success criteria: .env.local contains NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY for production
  - Dependencies: Production Clerk configuration complete
  - Estimated complexity: SIMPLE
  - Time estimate: 5 minutes

### Phase 2: Anonymous Session Persistence

- [x] Create useAnonymousGameState hook

  - Success criteria: Hook provides saveGameState, loadGameState, clearAnonymousState functions
  - Dependencies: None
  - Estimated complexity: MEDIUM
  - Location: `/src/hooks/useAnonymousGameState.ts`

- [x] Integrate anonymous persistence into useChrondle hook

  - Success criteria: Game state saves to localStorage after each guess for anonymous users
  - Dependencies: useAnonymousGameState hook created
  - Estimated complexity: MEDIUM
  - Location: `/src/hooks/useChrondle.ts`

- [x] Load anonymous state on game initialization
  - Success criteria: Anonymous users see their previous game state when returning to site
  - Dependencies: Anonymous persistence integrated
  - Estimated complexity: SIMPLE
  - Location: `/src/hooks/useChrondle.ts`

### Phase 3: Anonymous to Authenticated Migration

- [x] Create Convex mutation for merging anonymous state

  - Success criteria: api.users.mergeAnonymousState mutation exists and handles game state merge
  - Dependencies: Anonymous persistence working
  - Estimated complexity: MEDIUM
  - Location: `/convex/users.ts`

- [x] Add migration logic to UserCreationProvider

  - Success criteria: Anonymous game state migrates to user account on authentication
  - Dependencies: Convex mutation created
  - Estimated complexity: MEDIUM
  - Location: `/src/components/UserCreationProvider.tsx`

- [x] Clear anonymous state after successful migration
  - Success criteria: localStorage cleaned up after data migrated to authenticated account
  - Dependencies: Migration logic implemented
  - Estimated complexity: SIMPLE
  - Location: `/src/components/UserCreationProvider.tsx`

## Parallel Work Streams

### Stream A: Mobile Authentication Fix

- [x] Add mobile device detection utility

  - Success criteria: Function correctly identifies mobile browsers
  - Can start: Immediately
  - Estimated complexity: SIMPLE
  - Location: `/src/lib/utils.ts`

  ```
  Work Log:
  - Found existing implementation at /src/lib/platformDetection.ts:10-18
  - isMobileDevice() function already exists with SSR safety and comprehensive UA detection
  - No new implementation needed, utility is production-ready
  ```

- [x] Update AuthButtons for mobile redirect flow

  - Success criteria: Mobile users get redirect flow, desktop users get modal
  - Dependencies: Mobile detection utility
  - Estimated complexity: SIMPLE
  - Location: `/src/components/AuthButtons.tsx`

  ```
  Work Log:
  - Imported isMobileDevice from /src/lib/platformDetection
  - Added useState and useEffect to detect mobile after mount (avoid hydration mismatch)
  - SignInButton now uses mode={isMobile ? "redirect" : "modal"}
  - TypeScript checks pass successfully
  ```

- [ ] Test mobile authentication flow on real devices
  - Success criteria: Users can complete magic link auth on iOS and Android
  - Dependencies: Mobile redirect flow implemented
  - Estimated complexity: SIMPLE

### Stream B: Optional OTP Enhancement

- [ ] Research Clerk OTP configuration for mobile

  - Success criteria: Understanding of OTP setup requirements and UX flow
  - Can start: After mobile redirect implemented
  - Estimated complexity: SIMPLE

- [ ] Implement OTP as alternative to magic links (if needed)
  - Success criteria: Mobile users can authenticate with 6-digit codes
  - Dependencies: OTP research complete
  - Estimated complexity: MEDIUM

## Testing & Validation

- [ ] Test anonymous persistence across sessions

  - Success criteria: Game state persists through page refresh, browser close/reopen
  - Dependencies: Anonymous persistence implemented
  - Test cases:
    - Start puzzle → refresh → puzzle continues
    - Make guesses → close browser → return → guesses preserved
    - Complete puzzle → return next day → see completion

- [ ] Test anonymous to authenticated migration

  - Success criteria: All game data transfers correctly when user signs up
  - Dependencies: Migration logic implemented
  - Test cases:
    - Anonymous with progress → sign up → progress preserved
    - Anonymous with completed puzzle → sign in → history preserved
    - Multiple anonymous sessions → authenticate → latest data kept

- [ ] Test mobile authentication flow

  - Success criteria: Complete auth flow works on mobile devices
  - Dependencies: Mobile fixes implemented
  - Test devices: iPhone Safari, Android Chrome

- [ ] Test production email templates
  - Success criteria: Emails show correct branding and domain
  - Dependencies: Production Clerk configured
  - Test: Send test magic link, verify appearance

## Documentation & Cleanup

- [x] Document anonymous session behavior in README

  - Success criteria: Clear explanation of how anonymous users' data is handled
  - Dependencies: All features implemented

  ```
  Work Log:
  - Added comprehensive "User Accounts & Anonymous Play" section to README
  - Documented anonymous play features (local storage, 24-hour persistence)
  - Documented authenticated play benefits (cross-device sync, permanent history)
  - Explained automatic migration from anonymous to authenticated
  - Added mobile authentication notes about redirect flow optimization
  ```

- [x] Add environment variable documentation

  - Success criteria: .env.example updated with production Clerk variables
  - Dependencies: Production configuration complete

  ```
  Work Log:
  - Enhanced Clerk section in .env.example with dev vs production key differences
  - Added production setup checklist with 7 clear steps
  - Documented email configuration requirements (noreply@chrondle.com)
  - Noted mobile redirect flow in production testing step
  ```

- [x] Remove any debug console.log statements

  - Success criteria: No debug logging in production code
  - Dependencies: Implementation complete

  ```
  Work Log:
  - Removed all debug console.log statements from useChrondle.ts (lines 230-298)
  - Removed state machine debug logging from UserCreationProvider.tsx
  - Removed migration debug logging from UserCreationProvider.tsx
  - Cleaned up unused variables (prevState, timestamp)
  - TypeScript checks pass successfully
  ```

## Success Verification Checklist

- [ ] Anonymous users can leave and return without losing puzzle progress
- [ ] Production emails display "Chrondle" branding (not "development")
- [ ] Mobile users can complete magic link authentication
- [ ] Anonymous data successfully migrates when users authenticate
- [ ] No regression in existing authenticated user flows
- [ ] Code follows existing patterns and conventions
- [ ] All TypeScript types are properly defined
- [ ] No localStorage errors in console

## Future Enhancements (BACKLOG.md candidates)

- [ ] Add passkey authentication for passwordless biometric login
- [ ] Implement "Remember me" checkbox for extended sessions
- [ ] Add social login providers beyond Google (Apple, GitHub)
- [ ] Create onboarding flow highlighting benefits of authentication
- [ ] Add cross-device sync indicator in UI
- [ ] Implement gradual authentication prompts based on engagement
- [ ] Add offline mode with sync-when-online capability
- [ ] Create account deletion flow with data export

## Implementation Notes

**Order of Execution**:

1. Start with Clerk production config (Priority 1) - Quick win, fixes email issue
2. Implement anonymous persistence (Priority 2) - Core functionality improvement
3. Add migration logic (Priority 3) - Completes the anonymous → authenticated flow
4. Fix mobile modal in parallel - Can be done alongside other work

**Risk Mitigation**:

- Test localStorage availability before use (Safari private mode)
- Handle JSON parse errors gracefully
- Ensure backward compatibility for existing users
- Add feature flag for gradual rollout if needed

**Time Estimates**:

- Total implementation: ~2 hours
- Clerk config: 15 minutes
- Anonymous persistence: 1 hour
- Mobile fixes: 30 minutes
- Testing: 15 minutes

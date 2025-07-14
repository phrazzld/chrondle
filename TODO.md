# Chrondle CSP & Authentication Recovery TODO

Updated 2025-07-14 based on root cause analysis

## 🚨 CRITICAL: Fix CSP Blocking Authentication & Workers

### Root Cause Analysis

- **Issue**: CSP missing `worker-src blob:` directive causing Clerk authentication and canvas-confetti to fail with SecurityError when creating workers from blob URLs
- **Issue**: CSP blocking Clerk API calls to healthy-doe-23.clerk.accounts.dev causing 'Refused to connect' errors
- **Issue**: Unused API Ninjas endpoints still in CSP and codebase creating unnecessary attack surface
- **Result**: Authentication completely broken, confetti effects non-functional, console spam masking real issues

## Phase 1: Critical CSP Fixes (BLOCKING)

- [x] Add worker-src directive to CSP in next.config.ts to fix web worker blocking

  - Root cause: CSP missing 'worker-src blob:' directive causing Clerk authentication and canvas-confetti to fail with SecurityError when creating workers from blob URLs
  - Impact: Authentication completely broken, confetti effects non-functional, console spam
  - Files: next.config.ts line 38-48
  - Success criteria: No 'Refused to create a worker' errors in console
  - **COMPLETED**: Added worker-src 'self' blob: to CSP

- [x] Add complete Clerk authentication endpoints to CSP connect-src directive

  - Root cause: CSP blocking Clerk API calls to healthy-doe-23.clerk.accounts.dev causing 'Refused to connect' errors
  - Impact: Auth state stuck at isLoaded:false, login/signup broken
  - Files: next.config.ts line 44
  - Add: https://healthy-doe-23.clerk.accounts.dev to connect-src
  - Success criteria: Clerk auth loads, isLoaded becomes true
  - **COMPLETED**: Added Clerk endpoints to connect-src

- [x] Remove unused API Ninjas endpoint from CSP connect-src directive
  - Dead code cleanup: https://api.api-ninjas.com no longer used but still in CSP
  - Files: next.config.ts line 44
  - Remove: https://api.api-ninjas.com from connect-src array
  - Success criteria: CSP only contains active endpoints
  - **COMPLETED**: Removed API Ninjas from CSP

## Phase 2: API Ninjas Cleanup

- [x] Remove API_NINJAS_KEY and API_NINJAS endpoint from constants.ts

  - Dead code cleanup: API_NINJAS_KEY hardcoded on line 8, API_NINJAS endpoint in API_ENDPOINTS object line 12
  - Files: src/lib/constants.ts lines 6-8, 12
  - Remove: export const API_NINJAS_KEY and API_NINJAS from API_ENDPOINTS
  - Success criteria: No API Ninjas references in constants
  - **COMPLETED**: Removed API_NINJAS_KEY and API_NINJAS endpoint

- [x] Remove API_NINJAS_API_KEY from environment files
  - Dead code cleanup: API_NINJAS_API_KEY=O8VgZplfhWSNdCsgoeVaZg==2bwPJnxstEQPzmvn in .env.local line 7
  - Files: .env.local, .env.example
  - Remove: API_NINJAS_API_KEY entries and related comments
  - Success criteria: No API Ninjas in environment config
  - **COMPLETED**: Removed API_NINJAS_API_KEY from .env.local

## Phase 3: Confetti Worker Fixes

- [x] Disable web workers in canvas-confetti default config to prevent CSP errors

  - Root cause: confetti defaults to useWorker:true on line 44 but CSP blocks workers causing repeated SecurityErrors
  - Files: src/components/magicui/confetti.tsx line 44
  - Change: globalOptions = { resize: true, useWorker: false }
  - Success criteria: Confetti works without worker errors
  - **COMPLETED**: Changed default to useWorker: false

- [x] Improve confetti error handling to reduce console noise
  - Current: SecurityError logs spam console making debugging harder
  - Files: src/components/magicui/confetti.tsx lines 55-66
  - Add: try-catch around confetti.create() with graceful fallback
  - Success criteria: One clear error message instead of spam
  - **COMPLETED**: Added try-catch with graceful worker fallback

## Phase 4: Next.js 15 Metadata Migration

- [x] Move viewport from metadata export to generateViewport function in layout.tsx

  - Next.js 15 deprecation: 'Unsupported metadata viewport is configured in metadata export'
  - Files: src/app/layout.tsx line 27
  - Create: export const viewport = 'width=device-width, initial-scale=1'
  - Remove: viewport from metadata
  - Success criteria: No viewport deprecation warning
  - **COMPLETED**: Migrated to export const viewport

- [x] Move themeColor from metadata export to generateViewport function in layout.tsx
  - Next.js 15 deprecation: 'Unsupported metadata themeColor is configured in metadata export'
  - Files: src/app/layout.tsx lines 23-26
  - Move: themeColor array to generateViewport return
  - Success criteria: No themeColor deprecation warning
  - **COMPLETED**: Moved themeColor to viewport export

## Phase 5: Verification & Testing

- [ ] Test Clerk authentication initialization after CSP fixes

  - Verification: Ensure auth buttons render and isLoaded becomes true
  - Test: Load app, check AuthButtons.tsx console logs show isLoaded:true, verify sign-in button appears
  - Success criteria: Clerk Auth State shows isLoaded:true, user can see auth buttons

- [ ] Test confetti effects work without console errors after worker fixes

  - Verification: Ensure confetti animation plays on game completion without SecurityErrors
  - Test: Complete a puzzle, verify confetti animation appears, check console for worker errors
  - Success criteria: Confetti plays smoothly, no SecurityError messages

- [ ] Test Google Fonts load without ancient UI flash after CSP fixes

  - Verification: Ensure fonts load properly and no font flash occurs
  - Test: Hard refresh app, observe if UI flashes from fallback to Google Fonts
  - Success criteria: Smooth font loading, no visible flash from system fonts to Google Fonts

- [ ] Verify CSP console is completely clean after all fixes
  - Verification: No CSP violation errors in browser console
  - Test: Open DevTools, refresh app, check for any 'Refused to connect', 'Refused to create worker', or CSP violation messages
  - Success criteria: Zero CSP-related errors in console

## Key Principles

1. **Fail Fast**: Clear CSP errors instead of silent failures
2. **Security First**: Remove unused endpoints to reduce attack surface
3. **Performance**: Minimize console noise to improve debugging
4. **User Experience**: Smooth authentication and visual effects

## Expected Results After Completion

- ✅ Clerk authentication fully functional with proper isLoaded state
- ✅ Clean console with zero CSP violation errors
- ✅ Smooth font loading without UI flash
- ✅ Functional confetti effects without SecurityErrors
- ✅ No Next.js deprecation warnings
- ✅ Cleaner, more secure CSP with only required endpoints
- ✅ Removed dead API Ninjas code

## Total Estimated Time: 50 minutes

**Risk Level: Low** - All changes are configuration fixes and cleanup with no breaking changes to business logic.

## Next Immediate Action

Continue with API Ninjas cleanup in constants.ts and environment files.

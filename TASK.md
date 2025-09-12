improve auth! including but not limited to:

- [ ] clerk auth email still says development
- [ ] clerk auth modal closes when switching apps on mobile, which makes it impossible to use magic link auth
- [ ] auth should manage anonymous sessions better, leaving the site and coming back shouldn't nuke your puzzle progress / history even for anon users

---

# Enhanced Specification

## Simplified Auth Improvements for Chrondle

### Core Issues & Simple Solutions

#### 1. Anonymous Game State Persistence

**Problem**: Anonymous users lose puzzle progress when they leave  
**Solution**: Save game state to localStorage, just like a shopping cart

```typescript
// After each guess
localStorage.setItem("chrondle-game-state", JSON.stringify(gameState));

// On page load
const saved = localStorage.getItem("chrondle-game-state");
if (saved && !isAuthenticated) {
  setGameState(JSON.parse(saved));
}
```

#### 2. Anonymous → Authenticated Migration

**Problem**: Need to preserve progress when users sign up  
**Solution**: Simple one-way migration on authentication

```typescript
// When user authenticates
const anonymousState = localStorage.getItem("chrondle-game-state");
if (anonymousState) {
  await migrateToUserAccount(anonymousState);
  localStorage.removeItem("chrondle-game-state");
}
```

#### 3. Clerk Production Setup

**Approach**: Clone dev settings to production, then change:

- Domain whitelist (add production domain)
- Email sender address (noreply@yourdomain.com)
- Remove development environment warnings

**Why clone**: Dev setup already works. Starting fresh means reconfiguring everything.

### Opinionated Clerk Configuration

#### Authentication Methods (Keep It Simple)

✅ **Google OAuth** - Everyone has Gmail  
✅ **Magic Links** - Password-free, works everywhere  
❌ **Email/Password** - Skip it. Magic links are better.  
❌ **Other social logins** - Unnecessary complexity

#### Mobile Strategy

**Problem**: Modal closes when switching to email app  
**Simple fix**: Use **redirect flow** on mobile instead of modal

```typescript
// Detect mobile and use appropriate flow
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

<SignInButton mode={isMobile ? "redirect" : "modal"}>
  <Button>Sign In</Button>
</SignInButton>
```

**Alternative**: Use **OTP codes** instead of magic links for mobile

- 6-digit code instead of link
- No app switching required
- Auto-fills from SMS on most phones

#### Session Configuration

- **Session lifetime**: 30 days (for daily game habit)
- **Idle timeout**: None (it's a casual game)
- **Token rotation**: Default Clerk settings are fine

## Implementation Plan

### Priority 1: Fix Production Emails (10 minutes)

1. Clone dev → prod in Clerk dashboard
2. Update domain and sender email
3. Deploy with production keys

### Priority 2: Add Anonymous Persistence (1 hour)

1. Create `useAnonymousGameState` hook
2. Save game state to localStorage after each action
3. Load from localStorage on mount if not authenticated
4. Add migration logic when user authenticates
5. Test the complete flow

### Priority 3: Fix Mobile Modal (30 minutes)

1. Detect mobile devices in AuthButtons component
2. Switch to redirect flow on mobile
3. Consider adding OTP option for better mobile UX
4. Test on actual devices

## Technical Approach

### Files to Modify

- `/src/hooks/useChrondle.ts` - Add localStorage persistence for anonymous users
- `/src/components/AuthButtons.tsx` - Mobile detection for redirect flow
- `/src/components/UserCreationProvider.tsx` - Migration logic for anonymous → authenticated
- `.env.local` - Production Clerk keys

### Anonymous Persistence Implementation

```typescript
// hooks/useAnonymousGameState.ts
export function useAnonymousGameState() {
  const { isAuthenticated } = useAuthState();

  const saveGameState = (state: GameState) => {
    if (!isAuthenticated) {
      localStorage.setItem("chrondle-game-state", JSON.stringify(state));
    }
  };

  const loadGameState = (): GameState | null => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem("chrondle-game-state");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  };

  const clearAnonymousState = () => {
    localStorage.removeItem("chrondle-game-state");
  };

  return { saveGameState, loadGameState, clearAnonymousState };
}
```

### Migration Strategy

```typescript
// In UserCreationProvider after successful authentication
const migrateAnonymousData = async (userId: string) => {
  const anonymousState = localStorage.getItem("chrondle-game-state");
  if (anonymousState) {
    const parsed = JSON.parse(anonymousState);
    // Merge with existing user data (prefer authenticated)
    await convex.mutation(api.users.mergeAnonymousState, {
      userId,
      anonymousState: parsed,
    });
    localStorage.removeItem("chrondle-game-state");
  }
};
```

## What We're NOT Doing

- No complex session management beyond Clerk defaults
- No additional auth providers beyond Google + Magic Links
- No password requirements or account creation forms
- No enterprise features (SSO, SAML, etc.)
- No complex merge strategies for conflicting data

## Success Criteria

- [ ] Anonymous users can leave and return without losing progress
- [ ] Production emails show correct domain/branding
- [ ] Mobile users can complete authentication flow
- [ ] Anonymous → authenticated migration preserves game state
- [ ] Implementation remains simple and maintainable

## Rationale

This is a daily puzzle game, not a banking app. The auth should:

- Work reliably
- Be simple for users
- Not get in the way of playing

The solution prioritizes simplicity over feature completeness, using battle-tested patterns (localStorage for anonymous state, redirect flow for mobile) rather than complex engineering.

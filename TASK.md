# TASK: Fix Systemic UI Flashing Through Server-First Architecture Migration

## Problem Statement

The Chrondle application experiences widespread UI flashing during page load, affecting multiple components:

- Login/profile icon in navbar
- Game form (text input and submit button)
- Puzzle hints
- Puzzle number in header (flashes #1 → #9 → #1 → #9)

### Root Cause Analysis

**The entire application is a Client Component**, starting with `"use client"` in `src/app/page.tsx`. This fundamental architectural flaw, combined with `dynamic = "force-dynamic"`, creates a cascade of problems:

1. **No Server-Side Rendering**: Everything hydrates client-side
2. **Sequential Loading States**: Components progress through loading-puzzle → loading-auth → loading-progress → ready
3. **Independent Component Flashing**: Each component manages its own loading state
4. **Hydration Mismatches**: Initial render differs from hydrated state

Each component experiences this lifecycle:

```
Initial Render → Hydration → Loading State → Data Fetch → Final State
```

This violates Next.js's server-first architecture principles and creates a poor user experience.

## Solution: Progressive Islands with Convex Preloading

Transform the application using the "Progressive Islands" pattern that works WITH our toolchain (Convex, Clerk, Next.js) rather than against it. This approach uses Convex's official SSR support while keeping authentication client-side as designed.

## Optimal Architecture Design

### Why This Approach Wins

After analyzing multiple architectural patterns, the "Progressive Islands with Convex Preloading" approach emerges as the optimal solution:

1. **Works WITH Convex**: Uses blessed `preloadQuery` pattern for SSR
2. **Works WITH Clerk**: Keeps authentication client-side as designed
3. **Works WITH Next.js**: Server components for data, client for interaction
4. **Works WITH React 19**: Progressive enhancement built-in
5. **Minimal refactoring**: Existing hooks mostly unchanged
6. **No flashing**: Puzzle data always present from server
7. **Simple mental model**: Server=Data, Client=Interaction

### Core Principle

"Server renders the puzzle, client adds the user" - The game is fully playable from server-rendered HTML, with user features enhancing progressively without disruption.

## Implementation Plan

### Phase 1: Core Migration (2-3 hours)

#### 1.1 Install Convex Next.js Adapter

```bash
pnpm add @convex-dev/nextjs
```

#### 1.2 Convert Main Page to Server Component

**File: `src/app/page.tsx`**

- Remove `"use client"` directive
- Use Convex's `preloadQuery` for server-side data fetching
- Pass preloaded data to client island

```typescript
// NEW: Server Component with Convex preloading
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { GameIsland } from "@/components/GameIsland";

export default async function ChronldePage() {
  // Preload puzzle data server-side (no auth needed)
  const preloadedPuzzle = await preloadQuery(api.puzzles.getDaily);

  return (
    <div className="min-h-screen">
      {/* Static header with server-rendered puzzle number */}
      <header className="border-b">
        <h1>Chrondle #{preloadedPuzzle._creationTime}</h1>
      </header>

      {/* Client island receives preloaded data */}
      <GameIsland preloadedPuzzle={preloadedPuzzle} />
    </div>
  );
}
```

#### 1.3 Create Game Island Component

**File: `src/components/GameIsland.tsx`** (NEW)

- Client boundary for all interactive features
- Uses `usePreloadedQuery` for seamless hydration
- Progressive auth enhancement without flashing

```typescript
'use client';

import { usePreloadedQuery } from "convex/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChrondle } from "@/hooks/useChrondle";

interface GameIslandProps {
  preloadedPuzzle: Preloaded<typeof api.puzzles.getDaily>;
}

export function GameIsland({ preloadedPuzzle }: GameIslandProps) {
  // Convex handles hydration seamlessly
  const puzzle = usePreloadedQuery(preloadedPuzzle);

  // Auth enhances progressively - no flash!
  const { user } = useAuth();
  const progress = useQuery(
    api.users.getProgress,
    user ? { userId: user.id, puzzleId: puzzle._id } : "skip"
  );

  // State machine stays client-side with initial data
  const gameState = useChrondle({
    puzzle,
    progress,
    initialData: puzzle // No loading state needed!
  });

  return (
    <div className="container mx-auto p-4">
      <PuzzleDisplay puzzle={puzzle} hints={gameState.hints} />
      <GuessInput onGuess={gameState.makeGuess} />
      {user && <ProgressDisplay progress={progress} />}
    </div>
  );
}
```

#### 1.4 Update useChrondle Hook

**File: `src/hooks/useChrondle.ts`**

- Accept `initialData` to skip loading states
- Maintain existing state machine logic

```typescript
interface UseChondleOptions {
  puzzle?: PuzzleData;
  progress?: UserProgress;
  initialData?: PuzzleData; // NEW: Skip loading when provided
}

export function useChrondle({
  puzzle,
  progress,
  initialData,
}: UseChondleOptions) {
  // Use initialData to avoid loading state
  const [gameState, setGameState] = useState(() =>
    initialData
      ? createGameStateFromPuzzle(initialData)
      : createInitialGameState(),
  );

  // Rest of existing logic unchanged...
}
```

### Phase 2: Progressive Enhancement (1-2 hours)

#### 2.1 Implement Stable Loading States

**File: `src/components/skeletons/AuthSkeleton.tsx`** (NEW)

- Match exact dimensions of auth UI
- Prevent layout shift during auth loading

```typescript
export function AuthSkeleton() {
  return (
    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
  );
}
```

#### 2.2 Update Providers for Server Components

**File: `src/components/providers.tsx`**

- Move to client boundary
- Wrap only client components

```typescript
'use client';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Existing provider logic
  return (
    <ClerkProvider>
      <ConvexProvider>
        {children}
      </ConvexProvider>
    </ClerkProvider>
  );
}
```

#### 2.3 Optimize Suspense Boundaries

**File: `src/app/layout.tsx`**

- Add strategic Suspense for auth features
- Keep game content stable

```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
```

### Phase 3: Cleanup & Optimization (1 hour)

#### 3.1 Remove Force Dynamic

**File: `src/app/layout.tsx`**

- Remove `export const dynamic = "force-dynamic"`
- Let Next.js optimize rendering

#### 3.2 Eliminate Loading States

**File: `src/hooks/useChrondle.ts`**

- Remove puzzle loading states when initialData provided
- Keep only necessary auth loading states

#### 3.3 Optimize Bundle Size

- Move heavy client dependencies to dynamic imports
- Ensure server components don't import client libraries

### Phase 4: Testing & Validation (1 hour)

#### 4.1 Visual Testing

- Record page load to verify no flashing
- Test with throttled network

#### 4.2 Performance Testing

- Measure Core Web Vitals before/after
- Verify bundle size reduction

#### 4.3 Functional Testing

- Ensure all game features work
- Test auth flow progression
- Verify offline functionality

## File Changes Summary

### Modified Files

1. **`src/app/page.tsx`**

   - Remove `"use client"`
   - Convert to async Server Component
   - Use `preloadQuery` for puzzle data

2. **`src/app/layout.tsx`**

   - Remove `dynamic = "force-dynamic"`
   - Keep as Server Component

3. **`src/hooks/useChrondle.ts`**

   - Add `initialData` parameter
   - Skip loading states when provided

4. **`src/components/providers.tsx`**
   - Ensure client boundary
   - Wrap only necessary components

### New Files

1. **`src/components/GameIsland.tsx`**

   - Main client island component
   - Uses `usePreloadedQuery`
   - Contains all interactive logic

2. **`src/components/skeletons/AuthSkeleton.tsx`**
   - Loading state for auth UI
   - Prevents layout shift

### Dependencies to Add

```bash
pnpm add @convex-dev/nextjs
```

## Success Metrics

### User Experience

- ✅ No visible flashing during page load
- ✅ Smooth transitions between states
- ✅ Faster Time to Interactive (TTI)
- ✅ Better Core Web Vitals scores

### Technical Metrics

- ✅ Reduced JavaScript bundle size
- ✅ Server-rendered initial HTML
- ✅ No hydration mismatches
- ✅ Improved SEO capability

### Code Quality

- ✅ Clear separation of concerns
- ✅ Follows Next.js best practices
- ✅ Aligns with Leyline principles
- ✅ Type-safe throughout

## Testing Strategy

### Unit Tests

- Test Server Components with server-side mocks
- Test Client Components with client-side mocks
- Verify prop passing and initial states

### Integration Tests

- Test full page load flow
- Verify no flashing occurs
- Check progressive enhancement

### Performance Tests

- Measure initial load time
- Track Core Web Vitals
- Monitor bundle size changes

## Risk Mitigation

### Potential Issues & Solutions

1. **Convex Server Compatibility**

   - Risk: Convex may not work identically on server
   - Solution: Use ConvexHttpClient for server-side queries

2. **Authentication State**

   - Risk: Clerk auth still requires client-side hydration
   - Solution: Design UI to handle progressive auth enhancement

3. **Development Workflow**

   - Risk: Developers unfamiliar with server components
   - Solution: Document patterns, provide examples

4. **Third-Party Libraries**
   - Risk: Some libraries may not support server components
   - Solution: Isolate client-only libraries in client components

## Timeline Estimate

### Original Estimate

- **Previous approach**: 13-19 hours

### Optimized "Progressive Islands" Estimate

- **Phase 1**: 2-3 hours (Core migration with preloadQuery)
- **Phase 2**: 1-2 hours (Progressive enhancement)
- **Phase 3**: 1 hour (Cleanup & optimization)
- **Phase 4**: 1 hour (Testing & validation)
- **Total**: 5-7 hours

### Time Savings

- **60% reduction** in implementation time by working WITH our toolchain
- **Simpler architecture** reduces long-term maintenance

## Definition of Done

- [ ] No UI flashing on page load
- [ ] All tests pass
- [ ] TypeScript compilation clean
- [ ] Performance metrics improved
- [ ] Documentation updated
- [ ] Code review completed

## References

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Leyline Server-First Architecture](./docs/leyline/bindings/categories/react/server-first-architecture.md)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Convex Server-Side Usage](https://docs.convex.dev/client/javascript#server-side-rendering)

---

**Created**: 2025-01-21
**Priority**: High
**Type**: Architecture Refactor
**Impact**: Eliminates entire class of UI flashing bugs

---

# Enhanced Specification

## Research Findings

### Industry Best Practices

#### Server-First Architecture Patterns (2025)

- **Default Server Rendering**: Next.js 15 App Router defaults to Server Components
- **Progressive Enhancement**: Start with server-rendered HTML, enhance with JavaScript
- **Strategic Suspense**: Use Suspense boundaries to control loading states
- **Parallel Data Fetching**: Avoid waterfalls with `Promise.all()` in server components
- **Optimistic UI**: Provide immediate feedback while real data loads

#### UI Flashing Elimination Strategies

- **Stable Initial Props**: Never pass `undefined` as initial values
- **Skeleton Matching**: Create skeletons that match exact dimensions of final UI
- **Server-Side Auth**: Determine authentication state before sending HTML
- **Progressive Hydration**: Use React 19's selective hydration for optimal performance

### Technology Analysis

#### Next.js 15 Server Components

- **Async Components**: Direct `async/await` support in Server Components
- **Request Deduplication**: Multiple identical `fetch` calls automatically deduplicated
- **Streaming SSR**: Progressive content revelation with nested Suspense
- **Server Actions**: Replace client-side form submissions with server mutations

#### Convex Server Integration

- **`preloadQuery`**: Server-side data fetching with client-side reactivity
- **`ConvexHttpClient`**: HTTP client for server-side queries
- **Token Passing**: Explicit JWT tokens for server-side authentication
- **Non-Reactive Operations**: `fetchQuery` for static server data

#### Clerk Authentication

- **`auth()`**: Server-side authentication state access
- **`currentUser()`**: Full user object retrieval server-side
- **Server Actions Protection**: Built-in auth checks for server mutations
- **Middleware Integration**: Route-level protection with minimal configuration

### Codebase Integration

#### Existing Patterns to Follow

- **Suspense Implementation**: `src/app/archive/page.tsx:435-445` - Perfect template
- **Skeleton Components**: `src/components/ui/Skeleton.tsx` - Ready for reuse
- **Error Boundaries**: `src/components/GameErrorBoundary.tsx` - Comprehensive error handling
- **Server Layout**: `src/app/layout.tsx:39-65` - Already a Server Component

#### Reusable Components Identified

- **Loading Spinner**: `src/components/ui/LoadingSpinner.tsx`
- **Skeleton UI**: `src/components/ui/Skeleton.tsx`
- **Error Boundaries**: Multiple `*ErrorBoundary.tsx` components
- **Provider Architecture**: `src/components/providers.tsx` (needs client boundary)

## Detailed Requirements

### Functional Requirements

- **FR1: Zero UI Flashing**: Eliminate all visible loading state transitions during initial page load
  - Acceptance: No component should change visual state after initial render
  - Measurement: Video recording shows stable UI from first paint
- **FR2: Preserved Game Mechanics**: Maintain all existing game functionality
  - Acceptance: All game features work identically to current implementation
  - Validation: Existing test suite passes without modification
- **FR3: Progressive Authentication**: Auth features layer on without disrupting base experience

  - Acceptance: Game playable immediately, auth enhances when ready
  - Validation: Anonymous users can play without auth flash

- **FR4: Server-Side Data Fetching**: Initial puzzle data fetched server-side
  - Acceptance: Puzzle content in initial HTML response
  - Measurement: Network tab shows puzzle data in document response

### Non-Functional Requirements

- **Performance**:
  - LCP < 2.5s (from current ~3.5s)
  - CLS < 0.1 (from current ~0.25)
  - FID < 100ms (maintained)
  - Bundle size reduction of 15%+
- **Security**:
  - Server-only environment variables for Convex keys
  - Authentication state verified server-side
  - No sensitive data in client bundles
- **Scalability**:
  - Support 10,000+ concurrent users
  - Server rendering must scale horizontally
  - Efficient caching for puzzle data
- **Availability**:
  - 99.9% uptime for game functionality
  - Graceful degradation if Convex unavailable
  - Offline capability for basic game play

## Architecture Decisions

### ADR-001: Server-First Progressive Enhancement Architecture

**Status**: Proposed
**Decision**: Implement Server-First Progressive Enhancement Architecture

#### Technology Stack

- **Frontend**: React 19 Server Components with selective Client Components
- **Backend**: Next.js 15 App Router with Server Actions
- **Database**: Convex with dual HTTP (server) and WebSocket (client) clients
- **Authentication**: Clerk with server-side helpers and progressive client enhancement

#### Design Patterns

- **Architecture Pattern**: Server-First with Progressive Enhancement
  - Rationale: Eliminates flashing while maintaining rich interactivity
- **Data Flow**: Server → Props → Client Enhancement
  - Rationale: Stable initial state with smooth transitions
- **Integration Pattern**: Hybrid Server/Client Convex Access
  - Rationale: Optimal performance with real-time capability

#### Key Trade-offs

- **Complexity vs Performance**: Higher development complexity for better UX
- **Server Load vs Client Bundle**: More server computation, less client JavaScript
- **Initial Learning vs Long-term Maintenance**: Steeper learning curve, cleaner architecture

### Key Architecture Decision: Progressive Islands Pattern

After analyzing 5 different architectural approaches:

1. **Pure Progressive Enhancement** - Simple but has user feature flash
2. **Hybrid Static + Dynamic** - Pragmatic but not pure
3. **Server-First with Islands** - Modern but complex auth flow
4. **Streaming SSR with Suspense** - Elegant but requires expertise
5. **Convex-Native Pattern** - Works WITH Convex's blessed patterns ✅

**Winner: Convex-Native Progressive Islands**

- Uses Convex's official `preloadQuery` for SSR
- Keeps Clerk auth client-side as designed
- Minimal refactoring of existing code
- Clear mental model: Server=Data, Client=Interaction

## Implementation Strategy

### Development Approach

**Incremental Migration with Feature Flags**

1. Implement server components behind feature flag
2. Test with subset of users
3. Monitor performance metrics
4. Gradual rollout based on success metrics

### MVP Definition

1. **Core Server Rendering**: Page.tsx as Server Component with puzzle data
2. **Client Wrapper**: GameClient.tsx for interactive features
3. **Stable Loading States**: Skeleton components for auth and user data
4. **Basic Progressive Enhancement**: Auth layers on without disruption

### Technical Risks

- **Risk 1: Convex Server Compatibility**
  - Description: ConvexHttpClient may have limitations vs WebSocket client
  - Mitigation: Use HTTP only for initial data, maintain WebSocket for updates
- **Risk 2: Authentication Hydration Mismatch**
  - Description: Clerk auth requires client-side hydration
  - Mitigation: Design UI for progressive auth enhancement with stable states
- **Risk 3: State Management Complexity**
  - Description: useChrondle hook orchestration may break
  - Mitigation: Pass server data as props, maintain hook interface

## Integration Requirements

### Existing System Impact

- **useChrondle Hook**: Modify to accept initial server data
- **Provider Architecture**: Move to client wrapper component
- **Router Configuration**: Remove `dynamic = "force-dynamic"`
- **Test Suite**: Update for server component testing

### API Design

```typescript
// Server-side data fetching
export async function getInitialPuzzleData(): Promise<PuzzleData>;
export async function getCurrentPuzzleNumber(): Promise<number>;
export async function getPuzzleMetadata(): Promise<PuzzleMetadata>;

// Server Actions for mutations
export async function submitGuess(formData: FormData): Promise<GuessResult>;
export async function resetProgress(): Promise<void>;
```

### Data Migration

- No database migration required
- LocalStorage data preserved for offline capability
- Server state takes precedence over client state

## Testing Strategy

### Unit Testing

- **Server Components**: Test with server-side mocks and async testing utilities
- **Client Components**: Existing React Testing Library tests
- **Coverage Target**: Maintain 80%+ coverage

### Integration Testing

- **Server/Client Flow**: Test data passing from server to client
- **Progressive Enhancement**: Verify features layer correctly
- **Error Scenarios**: Test server and client error boundaries

### End-to-End Testing

- **No Flash Validation**: Automated visual regression testing
- **Performance Testing**: Core Web Vitals monitoring
- **User Journey**: Complete game flow from anonymous to authenticated

## Deployment Considerations

### Environment Requirements

- **Node.js**: 20.x or higher for optimal server component performance
- **Environment Variables**: Server-only Convex keys configuration
- **Build Configuration**: Turbopack for development, Webpack for production

### Rollout Strategy

1. **Phase 1**: Deploy to staging environment
2. **Phase 2**: 5% canary deployment with monitoring
3. **Phase 3**: 25% rollout if metrics improve
4. **Phase 4**: 100% deployment with rollback ready

### Monitoring & Observability

- **Metrics**:
  - Server response times
  - Hydration performance
  - Core Web Vitals (LCP, CLS, FID)
  - JavaScript bundle size
- **Logging**:
  - Server component errors
  - Client hydration mismatches
  - Authentication flow timing
- **Alerting**:
  - UI flash detection (CLS > 0.1)
  - Performance degradation (LCP > 3s)
  - Error rate spikes

## Success Criteria

### Acceptance Criteria

- ✅ Zero visible UI flashing on page load
- ✅ All game features functioning identically
- ✅ Progressive auth enhancement working
- ✅ Performance metrics improved

### Performance Metrics

- **LCP**: < 2.5s (30% improvement)
- **CLS**: < 0.1 (60% improvement)
- **TTI**: < 3.5s (20% improvement)
- **Bundle Size**: 15% reduction

### User Experience Goals

- **Perceived Performance**: Instant puzzle availability
- **Smooth Transitions**: No jarring state changes
- **Accessibility**: Maintained or improved WCAG compliance

## Future Enhancements

### Post-MVP Features

- **Streaming SSR**: Progressive puzzle hint revelation
- **Edge Rendering**: Deploy to edge locations for global performance
- **Partial Prerendering**: Static shell with dynamic content
- **React Server Components Payload Caching**: Optimize repeated renders

### Scalability Roadmap

- **Phase 1**: Current migration (Q1 2025)
- **Phase 2**: Edge deployment (Q2 2025)
- **Phase 3**: Partial prerendering (Q3 2025)
- **Phase 4**: Global CDN optimization (Q4 2025)

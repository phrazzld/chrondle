# Chrondle TODO

Updated: 2025-07-16

## 🚨 Critical: Fix Archive Puzzle Crashes

### HintsDisplay Component Interface Mismatch

- [x] Fix HintsDisplay props in `/src/app/archive/puzzle/[id]/page.tsx` (~line 180)

## Task: Fix HintsDisplay Component Interface Mismatch [x]

### Complexity: MEDIUM

### Started: 2025-07-16 10:45

### Completed: 2025-07-16 10:56

### Context Discovery

- HintsDisplay interface found at src/components/HintsDisplay.tsx:16-25
- Current incorrect usage at src/app/archive/puzzle/[id]/page.tsx:225-231
- Required props: events, guesses, targetYear, currentHintIndex, isGameComplete, isLoading, error
- All required data available from gameState and existing variables

### Execution Log

[10:45] Found HintsDisplay interface definition
[10:46] Located incorrect prop usage in archive puzzle page
[10:47] Verified all required data is available from gameState
[10:48] Implementing fix with correct props
[10:50] Fixed HintsDisplay props - now using correct interface
[10:52] Fixed useConvexGameState hook call - was passing wrong parameters  
[10:53] Fixed ProximityDisplay, Timeline, GameProgress, GuessInput props
[10:54] Fixed BackgroundAnimation, SettingsModal, LiveAnnouncer props
[10:55] Fixed getGuessDirectionInfo usage - checking direction === "correct"
[10:56] Temporarily disabled HintReviewModal - needs proper implementation

### Approach Decisions

- Fixed all component prop mismatches to match their TypeScript interfaces
- Corrected useConvexGameState call from (targetYear, true, key) to (false, targetYear)
- Added null safety for puzzle?.events
- Temporarily disabled HintReviewModal as it needs different implementation

### Learnings

- Archive page was using outdated component APIs from earlier implementation
- useConvexGameState takes (debugMode, archiveYear) not arbitrary parameters
- Components have evolved but archive page wasn't updated
- HintReviewModal is designed for single hint review, not bulk review

  ```typescript
  // WRONG (current):
  <HintsDisplay
    currentHint={puzzle.events[currentHintIndex]}
    hintIndex={currentHintIndex}
    maxHints={puzzle.events.length}
    showAllHints={isGameComplete}
    allHints={puzzle.events}
  />

  // CORRECT (required):
  <HintsDisplay
    events={gameState.puzzle?.events || []}
    guesses={gameState.guesses}
    targetYear={gameState.puzzle?.year || 0}
    currentHintIndex={gameState.currentHintIndex}
    isGameComplete={gameState.isGameOver || hasWon}
    isLoading={isLoading}
    error={error}
  />
  ```

### Next.js 15 Async Params

- [ ] ~~Update `/archive/[year]/page.tsx`~~ **NOT SUPPORTED** - We only support homepage, archive grid, and puzzle by ID routes
- [x] Update `/archive/puzzle/[id]/page.tsx`: `{ params }: { params: Promise<{ id: string }> }`

## Task: Update archive puzzle page for Next.js 15 async params [x]

### Complexity: SIMPLE

### Started: 2025-07-16 11:00

### Completed: 2025-07-16 11:03

### Context Discovery

- Current structure: Client component with "use client" directive
- Page export wraps client component in error boundary
- Need to handle async params at page level, pass resolved params to client

### Execution Log

[11:00] Found page structure - client component wrapped by page export
[11:01] Implementing async params pattern for Next.js 15
[11:02] Updated interface from ArchivePuzzlePageProps to ArchivePuzzleContentProps
[11:02] Changed component to accept id prop instead of params
[11:03] Updated page export to async function with params: Promise<{ id: string }>
[11:03] TypeScript compilation successful - only unrelated error remains

### Approach Decisions

- Split params handling: async at page level, resolved params passed to client component
- Clean interface separation between page and content component

### Learnings

- Next.js 15 async params work with client components by handling at page level
- Page component can be async while child components remain client-side

### AppHeader Hydration Mismatch

- [ ] Investigate Button component with `asChild` prop rendering differently on server/client
- [ ] Check archive button in AppHeader (~line 92-100) for conditional rendering issues

## 🏗️ Architecture Cleanup

### Archive Route Architecture

- [x] **DECISION**: We do NOT support `/archive/[year]/` routes - only puzzle by ID
- [x] **SUPPORTED ROUTES**:
  - `/` - Homepage with today's puzzle
  - `/archive` - Archive grid showing all puzzles
  - `/archive/puzzle/[id]` - Play specific puzzle by ID (1-based)
- [x] Remove `/archive/[year]/` route entirely to avoid confusion

## Task: Remove unsupported /archive/[year]/ route [x]

### Complexity: SIMPLE

### Started: 2025-07-16 11:05

### Completed: 2025-07-16 11:09

### Context Discovery

- Route marked as NOT SUPPORTED in architecture decisions
- Causing TypeScript errors in Next.js type generation
- Need to remove directory and all files

### Execution Log

[11:05] Found [year] directory with page.tsx file
[11:06] Checked for references to year routes - none found
[11:06] Removing directory and its contents
[11:07] Directory removed successfully
[11:07] TypeScript still showing errors from cached .next types
[11:08] Cleaning .next directory to regenerate types
[11:08] Removed cached types for deleted route
[11:09] TypeScript compilation now successful - no errors!

### Approach Decisions

- Simple removal of unsupported route directory
- Cleaned cached Next.js types to prevent stale errors

### Learnings

- Next.js caches route types in .next/types directory
- Need to clean cached types after removing routes
- No other code references the year-based routes

### Add Type Safety

- [ ] Enable strict TypeScript checking for archive routes
- [ ] Add runtime prop validation for critical components
- [ ] Create tests for component interfaces

## ✅ Completed Archive Features

### Phase 1-8: Core Archive Implementation

- [x] Archive context bar visible above fold
- [x] Archive grid with all 298 puzzles
- [x] Dynamic routes for playing historical puzzles
- [x] Separate localStorage keys for archive games
- [x] Completion tracking with visual indicators
- [x] Error boundaries and loading states
- [x] Strict year validation with user-friendly errors

## ✅ Completed: Archive Puzzle UX Issues

### Fixed Async Client Component Error

- [x] Updated archive puzzle page to use React's `use()` hook for unwrapping params Promise
- [x] Removed async/await pattern that was incompatible with "use client" directive
- [x] Maintained Next.js 15 params pattern while fixing the error

### Fixed State Pollution Bug

- [x] Updated useConvexGameState to use `getPuzzleByYear` for archive mode
- [x] Fixed incorrect usage of `initializePuzzle` which was loading daily puzzle for all archives
- [x] Each archive puzzle now correctly loads its own historical data

## 🔥 Critical: Fix Archive Puzzle UX Issues

### Root Cause Analysis

**PROBLEM**: Archive puzzle page duplicates homepage layout with 400+ lines of code, leading to:

1. Component order divergence (hints at top vs bottom)
2. Confetti behavior differences (auto-fire bug)
3. Maintenance burden of keeping two implementations in sync

**SOLUTION**: Don't fix symptoms - fix the architecture

## 🏗️ System Design Fix

### Phase 1: Create Shared Game Layout Component

- [ ] Extract common game layout pattern into `src/components/GameLayout.tsx`
  - **INTERFACE**:
    ```typescript
    interface GameLayoutProps {
      gameState: ConvexGameState;
      onGuess: (year: number) => void;
      headerContent?: React.ReactNode; // For archive navigation controls
      debugMode?: boolean;
      confettiConfig?: {
        enabled: boolean;
        onVictory?: () => void;
      };
    }
    ```
  - **COMPONENT ORDER** (enforce correct layout):
    1. Header content (passed as prop)
    2. GameInstructions
    3. GuessInput
    4. Timeline (show after first guess)
    5. ProximityDisplay (show after first guess)
    6. GameProgress
    7. HintsDisplay
    8. Confetti (with manualstart=true)
  - **BENEFITS**: Single source of truth, impossible for layouts to diverge

### Phase 2: Implement GameLayout in Both Pages

- [ ] Replace homepage layout (`/src/app/page.tsx`)

  - **REMOVE**: Lines ~400-500 of duplicated component rendering
  - **REPLACE WITH**: `<GameLayout gameState={gameLogic} onGuess={gameLogic.makeGuess} headerContent={<AppHeader />} />`
  - **VERIFY**: Exact same behavior as current implementation
  - **TEST**: Run full test suite to ensure no regressions

- [ ] Replace archive puzzle layout (`/src/app/archive/puzzle/[id]/page.tsx`)
  - **REMOVE**: Lines ~230-320 of duplicated component rendering
  - **REPLACE WITH**: `<GameLayout gameState={gameState} onGuess={handleGuess} headerContent={navigationControls} />`
  - **VERIFY**: Components now in correct order, confetti behavior fixed
  - **TEST**: No confetti on page load, correct layout order

### Phase 3: Extract Victory Logic

- [ ] Create `src/hooks/useVictoryConfetti.ts` to standardize victory handling
  - **HANDLES**: Confetti trigger, reduced motion preferences, "just won" vs "already won" state
  - **PREVENTS**: Auto-fire on mount, duplicate triggers, accessibility issues
  - **USAGE**: Both pages use same hook, ensuring consistent behavior

## 🎯 Next Steps

1. ~~**Immediate**: Fix HintsDisplay crash~~ ✅ COMPLETED
2. ~~**High**: Update to Next.js 15 async params pattern~~ ✅ COMPLETED
3. ~~**High**: Remove unsupported routes~~ ✅ COMPLETED
4. **Immediate**: Fix archive puzzle layout and confetti bugs
5. **High**: Create shared GameLayout component
6. **Medium**: Resolve hydration mismatch
7. **Low**: Add type safety and testing

## 📋 Testing Checklist

### Basic Functionality

- [ ] Navigate to /archive - grid loads without errors
- [ ] Click any puzzle - loads and plays without crashes
- [ ] Complete an archive puzzle - saves progress correctly
- [ ] Navigate between multiple puzzles - no state pollution
- [ ] Check browser console - zero errors/warnings
- [ ] Verify hydration - no mismatches on page load

### Layout Verification

- [ ] Archive puzzle page shows components in correct order (top to bottom):
  1. Navigation controls (Back to Archive, Previous/Next, Puzzle #)
  2. Game instructions ("Guess the year...")
  3. Guess input box
  4. Timeline visualization (after first guess)
  5. Proximity display (after first guess)
  6. Game progress dots
  7. Hints display at bottom
- [ ] Layout matches homepage exactly (except for navigation controls)

### Confetti Behavior

- [ ] Open a fresh puzzle - NO confetti on page load
- [ ] Make incorrect guesses - NO confetti
- [ ] Make correct guess - confetti fires ONCE
- [ ] Navigate away and back to won puzzle - NO confetti on return
- [ ] Click Previous/Next to another won puzzle - NO confetti on navigation
- [ ] Only see confetti when actively solving a puzzle

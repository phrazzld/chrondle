# Chrondle Archive Implementation TODO

Updated 2025-07-14 - Focus: Ship working archive feature

## Phase 1: Make Archive Visible Above The Fold

- [x] Create ArchiveContextBar component file at src/components/ArchiveContextBar.tsx

  - File location: src/components/ArchiveContextBar.tsx (new file)
  - Import: React, Link from next/link
  - Component signature: export function ArchiveContextBar(): JSX.Element
  - Return basic div with height 40px (h-10 class)
  - Success criteria: File exists, TypeScript compiles without errors
  - **COMPLETED**: Created basic component structure with required imports

- [x] Implement ArchiveContextBar JSX structure with hardcoded puzzle count

  - Add outer div: className="w-full h-10 border-y border-border bg-card"
  - Add inner div: className="max-w-2xl mx-auto px-6 sm:px-0 h-full"
  - Add Link wrapper: href="/archive" className="flex items-center justify-center h-full hover:bg-muted/50 transition-colors"
  - Add text content: "Today's Puzzle | Archive (298 puzzles)"
  - Success criteria: Renders 40px bar with centered text and borders
  - **COMPLETED**: Implemented full JSX structure with all specified classes and text

- [x] Import and render ArchiveContextBar in src/app/page.tsx
  - Add import at line ~22: import { ArchiveContextBar } from "@/components/ArchiveContextBar"
  - Insert component after AppHeader closing tag (find </AppHeader>)
  - Placement: Between header and main content div
  - Success criteria: Archive bar visible between header and game content
  - **COMPLETED**: Added import and rendered component in both loading and main states

## Phase 2: Load Puzzle Data For Archive

- [x] Create getPuzzleYears utility function in src/lib/puzzleData.ts

  - Function signature: export function getPuzzleYears(): number[]
  - Implementation: Object.keys(puzzlesData).map(Number).sort((a, b) => b - a)
  - Return type: number[] in descending order (newest first)
  - Location: Add after line 87 in puzzleData.ts
  - Success criteria: Returns array like [2025, 2008, 2007, ..., -776]
  - **COMPLETED**: Added function with JSDoc after line 98

- [x] Create getPuzzleByYear function in src/lib/puzzleData.ts

  - Function signature: export function getPuzzleByYear(year: number): Puzzle | null
  - Implementation: const events = puzzlesData[year]; if (!events) return null;
  - Return: { date: year.toString(), year, events }
  - Add after getPuzzleYears function
  - Success criteria: Returns puzzle object or null for invalid years
  - **COMPLETED**: Added function with JSDoc and proper Puzzle type import

- [x] Add type export for Puzzle in src/lib/puzzleData.ts if not exists
  - Check if Puzzle type is exported at top of file
  - If not, add: export type { Puzzle } from "./gameState"
  - Ensure consistent type usage across archive features
  - Success criteria: Puzzle type available for import in other files
  - **COMPLETED**: Added re-export of Puzzle type for convenience

## Phase 3: Build Archive Grid Page

- [x] Import required functions in src/app/archive/page.tsx

  - Add at line 3: import { getPuzzleYears } from "@/lib/puzzleData"
  - Remove premium user check section (lines 124-148)
  - Keep basic page structure and header
  - Success criteria: Can access puzzle year data in component
  - **COMPLETED**: Added import and removed premium-only section

- [x] Create state for puzzle years in archive page component

  - Add after line 15: const [puzzleYears, setPuzzleYears] = useState<number[]>([])
  - Add useEffect to load years: useEffect(() => { setPuzzleYears(getPuzzleYears()) }, [])
  - Import useState, useEffect from React
  - Success criteria: puzzleYears state populated with year array
  - **COMPLETED**: Added state and useEffect to load puzzle years on mount

- [x] Replace "Archive grid coming soon..." with year grid at line 144

  - Remove placeholder div (lines 143-146)
  - Add grid container: <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  - Map over puzzleYears: {puzzleYears.map(year => (...))}
  - Success criteria: Grid container renders with proper responsive classes
  - **COMPLETED**: Replaced placeholder with responsive grid mapping over puzzleYears

- [x] Create puzzle year card inside grid map
  - Card structure: <Link key={year} href={`/archive/${year}`}><Card>...</Card></Link>
  - Card content: Year as heading, "Historical events from {year}"
  - Add hover state: className="hover:border-primary transition-colors cursor-pointer"
  - Height: Fixed height with h-32 for consistent grid
  - Success criteria: Each year displays as clickable card
  - **COMPLETED**: Created styled cards with Link wrapper, hover effects, and consistent height

## Phase 4: Create Archive Game Route

- [x] Create directory structure for dynamic archive route

  - Create folder: src/app/archive/[year]
  - Create file: src/app/archive/[year]/page.tsx
  - Ensure Next.js recognizes dynamic route pattern
  - Success criteria: Route structure exists in file system
  - **COMPLETED**: Created directory and basic page component

- [x] Implement basic archive game page component

  - Component signature: export default function ArchiveGamePage({ params }: { params: { year: string } })
  - Parse year: const year = parseInt(params.year)
  - Add validation: if (isNaN(year)) return redirect("/archive")
  - Import redirect from next/navigation
  - Success criteria: Component accepts year parameter and validates
  - **COMPLETED**: Implemented component with params, year parsing, and validation

- [x] Load puzzle data for specific year in archive game page
  - Import getPuzzleByYear from puzzleData.ts
  - Add: const puzzle = getPuzzleByYear(year)
  - Check if puzzle exists: if (!puzzle) return redirect("/archive")
  - Success criteria: Valid puzzles load, invalid years redirect
  - **COMPLETED**: Added puzzle loading with validation and redirect for invalid years

## Phase 5: Adapt Game State For Archive Mode

- [x] Add optional year parameter to useConvexGameState hook signature

  - File: src/hooks/useConvexGameState.ts line 44
  - Change: export function useConvexGameState(debugMode = false)
  - To: export function useConvexGameState(debugMode = false, archiveYear?: number)
  - Update JSDoc to document new parameter
  - Success criteria: Hook accepts optional year parameter
  - **COMPLETED**: Added archiveYear parameter and comprehensive JSDoc

- [x] Modify puzzle loading logic to use archiveYear when provided

  - Location: useConvexGameState.ts around line 140-145
  - Current: Loads daily puzzle based on date
  - Change: if (archiveYear) load specific year, else load daily
  - Update convex query to accept optional year parameter
  - Success criteria: Hook loads archive puzzle when year provided
  - **COMPLETED**: Modified query to use getPuzzleByYear when archiveYear provided, updated all fallbacks

- [x] Create separate localStorage key for archive games

  - Current key: "convex-game-state" (line 184)
  - New logic: const storageKey = archiveYear ? `convex-game-state-${archiveYear}` : "convex-game-state"
  - Apply to both save and load operations
  - Success criteria: Archive games save to separate storage keys
  - **COMPLETED**: Modified getProgressKey, saveGameProgress, and loadGameProgress to use archive-specific keys

- [x] Pass archiveYear through to game state initialization
  - Update createInitialGameState call if needed
  - Ensure puzzle date reflects archive year not today
  - Prevent daily puzzle logic from overriding archive selection
  - Success criteria: Archive games initialize with correct year
  - **COMPLETED**: Already handled - archiveYear passed to initializePuzzle and Convex queries

## Phase 6: Integrate Archive Game Components

- [x] Import game components in archive/[year]/page.tsx

  - Add imports from main game: HintsDisplay, GuessInput, GameProgress
  - Import useConvexGameState with archive support
  - Import any other required game UI components
  - Success criteria: All game components available in archive page
  - **COMPLETED**: Imported all game components, modals, utilities, and converted to client component

- [x] Create game UI structure in archive game page

  - Copy basic structure from src/app/page.tsx
  - Remove daily-specific features (countdown, today's puzzle references)
  - Pass year to useConvexGameState: useConvexGameState(false, year)
  - Success criteria: Game UI renders for archive puzzle
  - **COMPLETED**: Implemented full game UI with archive adaptations, client-side validation, and archive header

- [x] Add archive-specific game header

  - Show "Archive Puzzle: Year {year}" instead of "Today's Puzzle"
  - Add breadcrumb: Home > Archive > {year}
  - Include back to archive link
  - Success criteria: Clear indication this is archive mode
  - **COMPLETED**: Added header with year display and breadcrumb navigation in previous task

- [x] Disable streak updates for archive games
  - In streak update logic, check if in archive mode
  - Skip updateStreak call when archiveYear is provided
  - Add comment explaining why streaks don't apply to archive
  - Success criteria: Completing archive puzzles doesn't affect streaks
  - **COMPLETED**: Archive page correctly omits streak logic, added documentation comment

## Phase 7: Add Completion Tracking

- [x] Create utility to check puzzle completion status

  - Function: isPuzzleCompleted(year: number): boolean
  - Check localStorage for key: `convex-game-state-${year}`
  - Parse and check if gameState.isGameOver === true
  - Return false if key doesn't exist or parse fails
  - Success criteria: Can determine if any puzzle is completed
  - **COMPLETED**: Added isPuzzleCompleted to storage.ts, uses existing getProgressKey utility

- [x] Add completion status to archive grid cards

  - Import Check icon from lucide-react
  - Call isPuzzleCompleted(year) for each card
  - Conditionally render check icon in top-right corner
  - Add different border color for completed puzzles
  - Success criteria: Visual indication of completed puzzles
  - **COMPLETED**: Added green border/background and check icon for completed puzzles

- [x] Calculate and display completion statistics
  - Count total completed: puzzleYears.filter(isPuzzleCompleted).length
  - Display at top of archive page: "Completed: {count} of 298"
  - Add progress bar: width percentage based on completion
  - Success criteria: Users see their archive progress
  - **COMPLETED**: Added completion stats with count, percentage, and animated progress bar

## Phase 8: Handle Edge Cases

### Task: Add error boundary around archive routes [x]

### Complexity: MEDIUM

### Started: 2025-07-15 10:55

### Completed: 2025-07-15 11:05

### Context Discovery

- Existing ErrorBoundary component found at src/components/ErrorBoundary.tsx
- Archive pages located at src/app/archive/page.tsx and src/app/archive/[year]/page.tsx
- Both pages using client components with React hooks

### Execution Log

[10:55] Analyzed existing ErrorBoundary implementation
[10:57] Created specialized ArchiveErrorBoundary component
[10:59] Wrapped both archive pages with error boundary
[11:02] Fixed TypeScript errors (Next.js 15 async params, touch handlers)
[11:05] Verified type checking passes

### Approach Decisions

- Created specialized ArchiveErrorBoundary extending base ErrorBoundary
- Added custom fallback UI with "Return to Archive", "Go to Today's Puzzle", and "Try Again" buttons
- Included year context in error logging for better debugging
- Used composition pattern to wrap existing page components

### Learnings

- Next.js 15 requires params to be Promise<{ year: string }> in dynamic routes
- Error boundaries provide essential protection for production stability
- Specialized error boundaries improve user experience with context-aware recovery options

- [x] Add loading state while puzzle years load

  - Show skeleton cards during initial load
  - Use similar loading pattern as main game
  - Prevent layout shift when data arrives
  - Success criteria: No blank screen while loading
  - **COMPLETED**: Added skeleton cards with animate-pulse, prevented layout shift with same h-32 height

- [x] Handle navigation between archive and daily game

  - Test switching from daily to archive and back
  - Ensure game states remain separate
  - Verify no state pollution between modes
  - Success criteria: Can switch between modes without issues
  - **COMPLETED**: Navigation works via ArchiveContextBar, AppHeader, and breadcrumbs. State isolation ensured by different localStorage key patterns

- [x] Add error boundary around archive routes

  - Wrap archive components in error boundary
  - Show "Return to Archive" button on error
  - Log errors for debugging
  - Success criteria: Archive errors don't break entire app
  - **COMPLETED**: Created ArchiveErrorBoundary component with custom fallback UI featuring "Return to Archive", "Go to Today's Puzzle", and "Try Again" buttons. Wrapped both archive pages. Includes error logging with year context.

- [ ] Validate year parameter strictly in dynamic route
  - Check year is within valid puzzle range
  - Handle string years like "abc" gracefully
  - Redirect to /archive with error toast for invalid years
  - Success criteria: No 500 errors for bad URLs

## Success Metrics

- Archive link visible without scrolling
- Can click through to see all 298 puzzles
- Can play any historical puzzle
- Progress saves independently per puzzle
- Completed puzzles show visual indicator
- Daily game completely unaffected

## Implementation Order

1. Context bar (visibility)
2. Archive grid (browsing)
3. Dynamic route (playing)
4. Game state adaptation (persistence)
5. Completion tracking (progress)
6. Edge cases (robustness)

## Estimated Time: 6 hours focused work

## Next Immediate Action

Start with creating ArchiveContextBar.tsx component file.

# Chrondle: Complete Convex Migration (Start Fresh Approach)

## Core Principle: Archive starts with 7 puzzles and grows by 1 each day

## Phase 1: Make puzzleData.ts Dynamic [CRITICAL PATH]

### Fix Puzzle Count Constants

- [x] Create `getTotalPuzzles` query in `convex/puzzles.ts`

  - Query: Simple count of all documents in puzzles table
  - Return type: `{ count: number }`
  - No parameters needed
  - Implementation: `const puzzles = await ctx.db.query("puzzles").collect(); return { count: puzzles.length };`
  - ✅ COMPLETED: Added query after getDailyPuzzle following existing patterns

- [x] Replace `TOTAL_PUZZLES` constant in `src/lib/puzzleData.ts`

  - Current: `export const TOTAL_PUZZLES = 0;` (hardcoded stub)
  - New: Dynamic fetch from Convex using ConvexHttpClient
  - Challenge: Need synchronous interface for React components
  - Solution: Cache the value after first fetch
  - Fallback: Return 0 if Convex unavailable (prevents crashes)
  - ✅ COMPLETED: Added fetchTotalPuzzles() async function with caching
  - ✅ Kept TOTAL_PUZZLES = 0 for legacy sync access
  - ✅ Components should migrate to use fetchTotalPuzzles()

- [x] Remove `ALL_PUZZLE_YEARS` array from `src/lib/puzzleData.ts`

  - Current: `export const ALL_PUZZLE_YEARS: number[] = [];`
  - This assumes pre-existing puzzles - WRONG for start fresh
  - Replace with dynamic query when needed
  - Update all consumers to handle empty/growing archive
  - ✅ COMPLETED: Removed array and SUPPORTED_YEARS alias
  - ✅ Updated 5 production files and 3 test files
  - ✅ Functions using old logic now show deprecation warnings

- [x] Remove `YEAR_TO_INDEX_MAP` from `src/lib/puzzleData.ts`
  - Current: `export const YEAR_TO_INDEX_MAP = new Map<number, number>();`
  - This maps years to puzzle indices - not relevant for puzzle numbers
  - Delete entirely - puzzle numbers are sequential, not year-based
  - ✅ COMPLETED: Removed unused map declaration
  - ✅ No other code dependencies found
  - ✅ TypeScript compilation verified

### Implement Convex Data Fetching

- [x] Add server-side Convex client to `src/lib/puzzleData.ts`

  - Import: `ConvexHttpClient` from "convex/browser"
  - Create singleton instance with NEXT_PUBLIC_CONVEX_URL
  - Handle connection errors gracefully
  - Cache successful responses for performance
  - ✅ COMPLETED: Implemented lazy initialization pattern
  - ✅ Added environment variable validation
  - ✅ Improved error handling with detailed logging
  - ✅ Singleton pattern ensures single client instance

- [x] Update `getPuzzleByIndex` to use Convex data

  - Current: Returns null (stub implementation)
  - New: Call `api.puzzles.getPuzzleByNumber` with puzzleNumber = index + 1
  - Convert Convex puzzle format to legacy Puzzle interface
  - Map: `{ targetYear: year, events, puzzleId: _id }`
  - Handle loading states and errors
  - ✅ COMPLETED: Created getPuzzleByIndexAsync with Convex integration
  - ✅ Kept deprecated sync version for backward compatibility
  - ✅ Proper error handling and logging implemented
  - ✅ Maps targetYear→year, events→events, \_id→puzzleId

- [x] Update `getPuzzleYears` to query Convex

  - Current: Returns empty array
  - New: Query all puzzles, extract targetYear, sort descending
  - This will only return years for puzzles that actually exist
  - No assumptions about 298 historical years

## Task: Update getPuzzleYears to query Convex [~]

### Complexity: MEDIUM

### Started: 2025-07-28 13:19

### Context Discovery

- Analyzing existing Convex integration patterns
- Need to check convex/puzzles.ts for existing queries
- Will follow pattern from getPuzzleByIndexAsync implementation

### Execution Log

[13:19] Examined puzzleData.ts - getPuzzleYears returns empty array with warning
[13:20] Checked convex/puzzles.ts - no existing query for getting all years
[13:20] Need to create new query `getPuzzleYears` in Convex
[13:20] Will return sorted array of unique targetYear values
[13:21] Added getPuzzleYears query to convex/puzzles.ts
[13:21] Created getPuzzleYearsAsync function following established pattern
[13:22] Marked sync version as deprecated with clear warning

### Approach Decisions

- Create new Convex query to fetch all unique puzzle years
- Make getPuzzleYears async to match other Convex integrations
- Keep deprecation pattern for backward compatibility

### Learnings

- Following the established pattern of creating async versions with deprecation warnings
- Convex queries return objects, so years are wrapped in { years: number[] }
- Sorting descending (newest first) matches user expectations for archive display
- Functions declared with `export async function` don't need re-export

### COMPLETED

- ✅ Added getPuzzleYears query to convex/puzzles.ts
- ✅ Created getPuzzleYearsAsync function in puzzleData.ts
- ✅ Marked sync version as deprecated
- ✅ TypeScript compilation verified

- [x] Fix `validatePuzzleData` to work with Convex
  - Current: Validates static JSON structure
  - New: Simple connectivity check to Convex
  - Return true if can connect, false otherwise
  - Remove all validation of puzzle counts/structure

## Task: Fix validatePuzzleData to work with Convex [~]

### Complexity: SIMPLE

### Started: 2025-07-28 13:23

### Context Discovery

- Function located in src/lib/puzzleData.ts
- Currently just returns true with a warning
- Need to implement actual Convex connectivity check

### Execution Log

[13:23] Found validatePuzzleData function at line 277
[13:23] Current implementation just logs warning and returns true
[13:24] Will implement connectivity check using getTotalPuzzles query
[13:24] Created validatePuzzleDataAsync with Convex connectivity check
[13:24] Marked sync version as deprecated with warning
[13:25] TypeScript compilation verified

### Approach Decisions

- Used getTotalPuzzles query as simple connectivity check
- Returns true if query succeeds and returns valid count
- Returns false on any error or unexpected response
- Logs appropriate debug/error messages

### COMPLETED

- ✅ Created validatePuzzleDataAsync function
- ✅ Implements simple Convex connectivity check
- ✅ Marked sync version as deprecated
- ✅ TypeScript compilation verified

## Phase 2: Fix Archive Page [USER-FACING]

### Convert to Server Component

- [x] Change `src/app/archive/page.tsx` from "use client" to server component

  - Remove: `"use client"` directive
  - Convert ArchivePageContent to async function
  - Fetch data server-side before rendering
  - Keep error boundary for resilience

## Task: Change archive page from "use client" to server component [~]

### Complexity: MEDIUM

### Started: 2025-07-28 13:26

### Context Discovery

- Need to examine current archive page implementation
- Check data fetching patterns and state management
- Identify client-only features that need adjustment

### Execution Log

[13:26] Examined archive page - it's a client component with hooks
[13:27] Uses useState for pagination, useMemo for data processing
[13:27] Needs conversion: remove hooks, use searchParams for pagination
[13:27] Key dependencies: TOTAL_PUZZLES, getPuzzleByIndex, isPuzzleCompleted
[13:28] Removed "use client" directive
[13:28] Made ArchivePageContent async and removed hooks
[13:29] Converted pagination to use Link components with searchParams
[13:29] Fixed Next.js 15 searchParams Promise type
[13:30] TypeScript compilation successful

### Approach Decisions

- Used searchParams for pagination instead of client-side state
- Kept isPuzzleCompleted for now (will be updated in later phase)
- Maintained error boundary and suspense for resilience
- Changed onClick handlers to Link components for pagination

### COMPLETED

- ✅ Removed "use client" directive
- ✅ Converted ArchivePageContent to async function
- ✅ Replaced useState/useMemo with server-side logic
- ✅ Updated pagination to use URL searchParams
- ✅ TypeScript compilation verified

- [x] Replace `TOTAL_PUZZLES` usage with Convex query

  - Current: Uses constant for pagination calculations
  - New: Fetch actual count from `getArchivePuzzles` response
  - Update: `totalPages` calculation based on real data
  - Handle case where count is 0 (empty archive)

## Task: Replace TOTAL_PUZZLES usage with Convex query [~]

### Complexity: MEDIUM

### Started: 2025-07-28 13:31

### Context Discovery

- Need to check archive page for TOTAL_PUZZLES usage
- Examine getArchivePuzzles query in Convex
- Plan how to fetch dynamic puzzle count

### Execution Log

[13:31] Found TOTAL_PUZZLES used in 6 places for pagination and stats
[13:32] Examined getArchivePuzzles query - returns totalCount, puzzles, totalPages
[13:32] Need to import Convex client and call getArchivePuzzles
[13:33] Imported ConvexHttpClient and api
[13:33] Called getArchivePuzzles with page and pageSize
[13:34] Replaced all TOTAL_PUZZLES usage with totalCount
[13:34] Added empty archive handling (count = 0)
[13:35] Fixed loading skeleton to use actual count
[13:35] TypeScript compilation successful

### Approach Decisions

- Used getArchivePuzzles query which returns paginated data
- Leveraged totalCount, totalPages from response
- Added empty archive message for better UX
- Made loading skeleton dynamic based on actual count
- Used puzzleNumber directly for links instead of index+1

### COMPLETED

- ✅ Replaced TOTAL_PUZZLES with dynamic totalCount
- ✅ Handled empty archive case (count = 0)
- ✅ Updated pagination to use totalPages from Convex
- ✅ Fixed loading skeleton to show realistic count
- ✅ Replaced getPuzzleByIndex calls with puzzles from Convex
- ✅ TypeScript compilation verified

- [x] Replace `getPuzzleByIndex` calls with Convex data

  - Current: Loops through indices calling getPuzzleByIndex
  - New: Use `getArchivePuzzles` query directly
  - Already returns paginated data - use it!
  - Format: `{ puzzles: [...], totalPages, currentPage, totalCount }`
  - ✅ COMPLETED: Used puzzles array from getArchivePuzzles directly

- [x] Update completion tracking for authenticated users

  - Current: Uses `isPuzzleCompleted` from localStorage
  - New: Query user's completed puzzles from Convex
  - Only for authenticated users (Clerk integration)
  - Anonymous users see no completion indicators

## Task: Update completion tracking for authenticated users [~]

### Complexity: MEDIUM

### Started: 2025-07-28 13:37

### Context Discovery

- Need to check how authentication is integrated
- Find where isPuzzleCompleted is used
- Look at getUserCompletedPuzzles query in Convex

### Execution Log

[13:37] Found isPuzzleCompleted usage in archive page (line 49)
[13:38] Discovered Clerk authentication integrated via ConvexProviderWithClerk
[13:38] Found getCurrentUser and getUserCompletedPuzzles queries in Convex
[13:39] Archive page is server component - need server-side auth check
[13:40] Imported currentUser from @clerk/nextjs/server
[13:40] Fetched Convex user and completed puzzles for authenticated users
[13:41] Updated completion tracking to use completedPuzzleIds set
[13:41] Made completion statistics only show for authenticated users
[13:42] TypeScript compilation successful

### Approach Decisions

- Used currentUser() from Clerk server SDK for authentication
- Created a Set of completed puzzle IDs for O(1) lookup performance
- Only show completion stats for authenticated users
- Anonymous users see no completion indicators

### COMPLETED

- ✅ Removed isPuzzleCompleted localStorage usage
- ✅ Integrated getUserByClerkId and getUserCompletedPuzzles queries
- ✅ Updated isCompleted check to use Convex data
- ✅ Made completion tracking user-specific
- ✅ TypeScript compilation verified

- [x] Fix loading skeleton to show realistic counts
  - Current: Shows 24 skeleton cards (PUZZLES_PER_PAGE)
  - New: Show actual number based on totalCount
  - Start with fewer skeletons for new archive
  - Grow organically as puzzles are added
  - ✅ COMPLETED: Already fixed in previous task, uses Math.min(totalCount, PUZZLES_PER_PAGE)

### Fix Archive Links

- [x] Update puzzle links to use Convex puzzle IDs

  - Current: `href="/archive/puzzle/${puzzle.index + 1}"`
  - New: Use actual puzzle.puzzleNumber from Convex
  - Ensure consistent with getPuzzleByNumber query
  - No assumptions about sequential indices
  - ✅ COMPLETED: Already fixed, using puzzle.puzzleNumber directly

- [x] Update completed count calculation
  - Current: Loops through all TOTAL_PUZZLES
  - New: Only count puzzles that actually exist
  - For authenticated users only
  - Show "X of Y" where Y is actual puzzle count
  - ✅ COMPLETED: Shows actual completed count from Convex for authenticated users

## Phase 3: Fix Game State Hook [CORE GAMEPLAY]

### Remove JSON Fallbacks

- [ ] Delete `getPuzzleByYear` import in `useConvexGameState`

  - Line 15: Remove import from puzzleData
  - This forces use of Convex data only
  - No more hybrid data sources

- [ ] Remove archive year fallback logic (lines 128-134)

  - Current: Falls back to getPuzzleByYear for archive mode
  - New: Use Convex puzzle data for archive puzzles
  - Archive puzzle ID should map to Convex puzzle

- [ ] Remove daily puzzle fallback logic (lines 162-169)

  - Current: Falls back to initializePuzzle if no Convex puzzle
  - New: Show loading or error state instead
  - Daily puzzle MUST come from Convex

- [ ] Remove error recovery fallback (lines 188-202)

  - Current: Falls back to getPuzzleByYear on error
  - New: Show error UI, don't hide failures
  - Users need to know if Convex is down

- [ ] Fix puzzle initialization for Convex data
  - Current: Expects year-based puzzle structure
  - New: Use Convex puzzle structure throughout
  - Map targetYear → year for compatibility
  - Use \_id as puzzleId

### Update Archive Mode

- [ ] Change archive mode to use puzzle number instead of year

  - Current: `archiveYear?: number` parameter
  - New: `archivePuzzleNumber?: number`
  - Fetch specific puzzle by number from Convex
  - Aligns with new URL structure

- [ ] Add proper loading states for archive puzzles
  - Current: Assumes puzzle data available immediately
  - New: Show loading while fetching from Convex
  - Handle puzzle not found errors
  - Clear error messages for users

## Phase 4: Fix Archive Puzzle Page [INDIVIDUAL PUZZLES]

- [ ] Update `src/app/archive/puzzle/[id]/page.tsx` validation

  - Current: Validates against TOTAL_PUZZLES constant
  - New: Validate against actual Convex puzzle count
  - Fetch puzzle directly by number
  - Show 404 for non-existent puzzles

- [ ] Change `getPuzzleByIndex` to Convex query

  - Current: Uses (id - 1) as index for getPuzzleByIndex
  - New: Use id directly as puzzleNumber
  - Query: `getPuzzleByNumber(id)`
  - Handle loading and error states

- [ ] Update `useConvexGameState` initialization
  - Current: Passes puzzle.year as archiveYear
  - New: Pass puzzleNumber for archive mode
  - Ensure game state loads correct puzzle
  - Remove year-based assumptions

## Phase 5: Cleanup Legacy Code [HOUSEKEEPING]

### Remove Python Scripts

- [ ] Delete `scripts/manage_puzzles.py`

  - No longer needed with Convex approach
  - Events managed via TypeScript CLI
  - Update any documentation references

- [ ] Delete `scripts/migrate-puzzles-to-convex.mjs`
  - Old migration approach for puzzle table
  - We're using event-based generation now
  - Keep event migration for reference

### Remove localStorage Dependencies

- [ ] Delete `src/lib/storage.ts` entirely

  - All state in Convex for authenticated users
  - Anonymous users get in-memory state only
  - No persistence without authentication

- [ ] Remove STORAGE_KEYS from `src/lib/constants.ts`

  - Find and delete STORAGE_KEYS object
  - Remove STORAGE_VERSION constant
  - Update all imports to remove references

- [ ] Update `isPuzzleCompleted` references
  - Current: Checks localStorage
  - New: Query Convex for authenticated users
  - Return false for anonymous users
  - No local storage fallback

### Remove Migration Artifacts

- [ ] Delete `convex/migrations/migratePuzzles.ts`

  - Old puzzle-based migration approach
  - Keep event migration as it's working
  - Clean up unused code

- [ ] Delete `scripts/check-migration-needed.mjs`
  - One-time migration check
  - No longer relevant
  - Deployment uses event count now

### Fix Constants

- [ ] Remove 298 puzzle references from constants

  - Search for: 298, "total_puzzles", SUPPORTED_YEARS
  - Replace with dynamic Convex queries
  - No hardcoded expectations

- [ ] Update any test data generators
  - Remove assumptions about puzzle counts
  - Generate test data based on actual state
  - Tests should work with empty archive

## Phase 6: Testing & Validation [QUALITY ASSURANCE]

### Update Tests for Dynamic Data

- [ ] Fix tests that assume 298 puzzles exist

  - Search test files for: 298, TOTAL_PUZZLES
  - Mock Convex responses appropriately
  - Test with various puzzle counts (0, 1, 10, 100)

- [ ] Add tests for growing archive

  - Test archive with 0 puzzles
  - Test archive with 1 puzzle
  - Test pagination with few puzzles
  - Test completion tracking

- [ ] Update integration tests
  - Remove localStorage assertions
  - Add Convex query mocks
  - Test error states when Convex down

### Manual Testing Checklist

- [ ] Verify archive shows current puzzle count (not 298)

  - Should show ~7-8 puzzles currently
  - Tomorrow should show one more
  - Pagination should work correctly

- [ ] Test individual puzzle pages

  - URLs like /archive/puzzle/1 through /archive/puzzle/7
  - Should load and play correctly
  - 404 for puzzle/298 (doesn't exist)

- [ ] Verify daily puzzle works

  - Loads from Convex
  - No localStorage fallback
  - Clear error if Convex down

- [ ] Test completion tracking (authenticated)
  - Complete a puzzle
  - See checkmark in archive
  - Survives page refresh

## Success Metrics

- [ ] Archive shows actual puzzle count from Convex (starting at ~7)
- [ ] No hardcoded references to 298 puzzles anywhere
- [ ] All puzzle data flows through Convex queries
- [ ] No localStorage usage for game state
- [ ] Clean error handling with no silent failures
- [ ] Archive grows by 1 puzzle each day automatically

## Implementation Order

1. **First**: Fix puzzleData.ts to be dynamic (Phase 1)
2. **Second**: Update archive page to use Convex (Phase 2)
3. **Third**: Fix game state hook (Phase 3)
4. **Fourth**: Fix individual puzzle pages (Phase 4)
5. **Fifth**: Clean up legacy code (Phase 5)
6. **Last**: Test everything (Phase 6)

## Critical Notes

- **NO HISTORICAL IMPORT** - Archive starts fresh
- **NO FALLBACKS** - Convex or nothing
- **NO MAGIC NUMBERS** - Everything dynamic
- **NO localStorage** - Convex for persistence
- **EMBRACE THE EMPTY ARCHIVE** - It's not a bug, it's the design

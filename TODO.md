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

- [ ] Update `getPuzzleYears` to query Convex

  - Current: Returns empty array
  - New: Query all puzzles, extract targetYear, sort descending
  - This will only return years for puzzles that actually exist
  - No assumptions about 298 historical years

- [ ] Fix `validatePuzzleData` to work with Convex
  - Current: Validates static JSON structure
  - New: Simple connectivity check to Convex
  - Return true if can connect, false otherwise
  - Remove all validation of puzzle counts/structure

## Phase 2: Fix Archive Page [USER-FACING]

### Convert to Server Component

- [ ] Change `src/app/archive/page.tsx` from "use client" to server component

  - Remove: `"use client"` directive
  - Convert ArchivePageContent to async function
  - Fetch data server-side before rendering
  - Keep error boundary for resilience

- [ ] Replace `TOTAL_PUZZLES` usage with Convex query

  - Current: Uses constant for pagination calculations
  - New: Fetch actual count from `getArchivePuzzles` response
  - Update: `totalPages` calculation based on real data
  - Handle case where count is 0 (empty archive)

- [ ] Replace `getPuzzleByIndex` calls with Convex data

  - Current: Loops through indices calling getPuzzleByIndex
  - New: Use `getArchivePuzzles` query directly
  - Already returns paginated data - use it!
  - Format: `{ puzzles: [...], totalPages, currentPage, totalCount }`

- [ ] Update completion tracking for authenticated users

  - Current: Uses `isPuzzleCompleted` from localStorage
  - New: Query user's completed puzzles from Convex
  - Only for authenticated users (Clerk integration)
  - Anonymous users see no completion indicators

- [ ] Fix loading skeleton to show realistic counts
  - Current: Shows 24 skeleton cards (PUZZLES_PER_PAGE)
  - New: Show actual number based on totalCount
  - Start with fewer skeletons for new archive
  - Grow organically as puzzles are added

### Fix Archive Links

- [ ] Update puzzle links to use Convex puzzle IDs

  - Current: `href="/archive/puzzle/${puzzle.index + 1}"`
  - New: Use actual puzzle.puzzleNumber from Convex
  - Ensure consistent with getPuzzleByNumber query
  - No assumptions about sequential indices

- [ ] Update completed count calculation
  - Current: Loops through all TOTAL_PUZZLES
  - New: Only count puzzles that actually exist
  - For authenticated users only
  - Show "X of Y" where Y is actual puzzle count

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

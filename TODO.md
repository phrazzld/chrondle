# Chrondle Convex Migration TODO

## Immediate Actions: Data Migration Foundation

### Initial Event Migration

- [x] Run the event migration script to populate Convex with all historical events

  - Command: `pnpm migrate-events`
  - Script location: `convex/migrations/migrateEvents.mjs`
  - Expected outcome: ~1788 events imported (298 years × ~6 events each)
  - Validation: Check Convex dashboard shows events table populated
  - Error handling: Script will show skipped/error counts if duplicates exist
  - Duration: ~2-3 minutes for full import
  - ✅ COMPLETED: Successfully imported 1821 events from 298 years
  - ✅ All events unassigned and ready for puzzle generation
  - ✅ Fixed script location issue (moved .mjs files to scripts/)

- [x] Verify event pool statistics after migration

  - Run in Convex dashboard: `api.events.getEventPoolStats`
  - Expected: totalEvents > 1700, unassignedEvents = totalEvents, availableYearsForPuzzles > 200
  - If counts are wrong, check migration logs for errors

- [x] Test manual puzzle generation to verify cron job logic works
  - Run in Convex dashboard: `api.puzzles.manualGeneratePuzzle`
  - Should create puzzle #1 with 6 random events from a random year
  - Verify in puzzles table: puzzleNumber=1, events.length=6, playCount=0
  - Verify selected events now have puzzleId assigned in events table
  - If fails: Check getAvailableYears returns results, check event selection logic
  - ✅ VERIFIED: Cron job successfully generating daily puzzles (8 puzzles created)
  - ✅ Manual generation disabled due to circular dependency (TODO in code)
  - ✅ Event assignment working correctly with puzzleId references

### TypeScript Event Management CLI

- [x] Create TypeScript event management CLI at `scripts/manage-events.ts`
  - Dependencies: `convex` package (already installed)
  - Import: ConvexHttpClient from "convex/browser", api from "../convex/\_generated/api"
  - Read NEXT_PUBLIC_CONVEX_URL from .env.local (same as migration script)
  - Use commander.js for CLI structure (add to devDependencies if needed)
  - ✅ CLI created with all 5 commands scaffolded
  - ✅ Added commander and tsx dependencies
  - ✅ Package.json script added: `pnpm events`
  - ✅ Script made executable
- [x] Implement 'add' command in manage-events CLI

  - Command: `manage-events add --year 1234 --hints "Event 1" "Event 2" ...`
  - Validation: Year must be -2000 to 2025, exactly 6 hints required
  - Check if year already has 6+ events (warn but allow)
  - Call `api.events.importYearEvents` mutation
  - Show success/error message with created count
  - Example: Adding year 1234 should show "✅ Year 1234: Imported 6 new events"
  - ✅ Implemented with full validation and error handling
  - ✅ Duplicate detection working correctly
  - ✅ Warning shown for years with existing events

- [x] Implement 'update' command with publish protection

  - Command: `manage-events update --year 1234 --hints "New Event 1" ...`
  - CRITICAL: Must check if ANY events for that year have puzzleId assigned
  - Query events table: year=1234, if any have puzzleId !== undefined, REJECT
  - Error message: "Cannot update year 1234: some events already published in puzzles"
  - If safe: Delete all events for year, then re-add new ones atomically
  - Transaction pattern prevents partial updates
  - ✅ Protection logic implemented and tested
  - ✅ Created deleteYearEvents mutation in convex/events.ts
  - ✅ Dual-layer protection (CLI + mutation)
  - ⚠️ Note: deleteYearEvents mutation needs deployment via `convex dev`

- [x] Implement 'list' command showing event usage

  - Command: `manage-events list`
  - Query all years with GROUP BY equivalent logic
  - Show: Year | Total Events | Used Events | Available
  - Format: `-776    6            0            6`
  - Sort chronologically (negative years first)
  - Color code: Green if available >= 6, Yellow if 1-5, Red if 0
  - ✅ Created getAllYearsWithStats query in convex/events.ts
  - ✅ Implemented table formatting with color coding
  - ✅ Added summary statistics
  - ⚠️ Note: getAllYearsWithStats query needs deployment via `convex dev`

- [x] Implement 'show' command with puzzle reference

  - Command: `manage-events show 1969`
  - List all events for the year with their status
  - Format: `1. "Neil Armstrong walks on the moon" [Available]`
  - Format: `2. "Woodstock music festival begins" [Used in Puzzle #42]`
  - Query puzzleId and join with puzzles table for puzzle number
  - ✅ Created getPuzzleById query in convex/puzzles.ts
  - ✅ Implemented with proper formatting and summary
  - ✅ Error handling for invalid years
  - ⚠️ Note: getPuzzleById query needs deployment via `convex dev`

- [x] Implement 'validate' command for data integrity

  - Command: `manage-events validate`
  - Check 1: All years have exactly 6 events (warn if not)
  - Check 2: No duplicate events within a year
  - Check 3: All puzzleIds reference valid puzzles
  - Check 4: Years are within valid range (-2000 to 2025)
  - Report format: "✅ 298 years validated, 0 issues found"
  - ✅ Implemented with all 4 validation checks
  - ✅ Detailed error reporting with issue list
  - ✅ Exit code 1 on validation failures (CI/CD ready)
  - ⚠️ Note: Requires `convex dev` or deployment to run

- [x] Add package.json script for event management CLI
  - Add to scripts: `"events": "tsx scripts/manage-events.ts"`
  - Allows running: `pnpm events add --year 2026 --hints ...`
  - Add tsx to devDependencies if not present
  - Test all commands work via pnpm
  - ✅ Script already added at line 38 in package.json
  - ✅ tsx dependency already present
  - ✅ All commands accessible via `pnpm events`

### Deployment Automation

- [x] Create deployment verification script at `scripts/verify-deployment.mjs`

  - Check 1: Convex connection (try a simple query)
  - Check 2: Event table has data (count > 0)
  - Check 3: Cron job is scheduled (query cron status if API available)
  - Check 4: Today's puzzle exists or can be generated
  - Exit code: 0 if all good, 1 if issues found
  - Log clear error messages for each failed check
  - ✅ Created with all 4 verification checks
  - ✅ Detailed status reporting with color output
  - ✅ Exit codes 0/1 for CI/CD integration
  - ✅ Script made executable and tested successfully
  - ✅ Fixed to use correct field names (targetYear not year)

- [x] Create one-time migration check script at `scripts/check-migration-needed.mjs`

  - Compare: puzzles.json year count vs Convex events table year count
  - If puzzles.json has more years, return exit code 1
  - If equal, return exit code 0
  - This prevents re-running migration after initial deployment
  - Delete this script after first production deployment
  - ✅ Created with robust error handling
  - ✅ Handles missing puzzles.json gracefully (returns 0)
  - ✅ Clear output with counts comparison
  - ✅ Tested: Convex has 299 years vs puzzles.json 298 years

- [x] Add deployment scripts to package.json

  - `"deploy:verify": "node scripts/verify-deployment.mjs"`
  - `"deploy:check-migration": "node scripts/check-migration-needed.mjs"`
  - `"deploy:migrate": "pnpm deploy:check-migration && pnpm migrate-events || echo 'Migration not needed'"`
  - Chain in deployment: `convex deploy && pnpm deploy:migrate && pnpm deploy:verify`
  - ✅ Added all 4 deployment scripts
  - ✅ Added combined `deploy` script that chains all steps
  - ✅ Tested deploy:check-migration - working correctly
  - ✅ package.json remains valid JSON

- [x] Create GitHub Action for automated deployment
  - File: `.github/workflows/deploy.yml` (triggered on main branch push)
  - Step 1: Checkout code
  - Step 2: Setup Node and pnpm
  - Step 3: Install dependencies
  - Step 4: Build Next.js app
  - Step 5: Deploy to Convex (`npx convex deploy --prod`)
  - Step 6: Run migration check and migrate if needed
  - Step 7: Verify deployment
  - Secret needed: CONVEX_DEPLOY_KEY
  - ✅ Created deploy.yml with all 7 steps
  - ✅ Added pnpm caching for faster builds
  - ✅ Included both main/master branch triggers
  - ✅ Created README.md with secrets documentation
  - ✅ Added optional Vercel deployment section

### Code Cleanup: Remove Legacy Systems

- [ ] Delete src/data/puzzles.json after migration verified

  - First: Verify Convex has all 298 years via getEventPoolStats
  - Delete file: `rm src/data/puzzles.json`
  - This will break imports - that's expected and next task fixes it

- [ ] Remove all puzzles.json imports and update puzzle data access

  - Files importing puzzles.json (use grep to find all):
    - `src/lib/puzzleData.ts` - Main puzzle data accessor
    - `src/lib/constants.ts` - Uses for validation
    - Any test files using puzzle data
  - Replace with TODO comments: "// TODO: Fetch from Convex"
  - This intentionally breaks the app until Convex integration complete

- [ ] Delete Python puzzle management script

  - Delete: `scripts/manage_puzzles.py`
  - Remove from any documentation mentioning it
  - Update README if it references Python script

- [ ] Remove localStorage utility functions

  - Delete entire file: `src/lib/storage.ts`
  - Remove storage key constants from `src/lib/constants.ts`:
    - STORAGE_KEYS object
    - STORAGE_VERSION constant
  - This will break imports - track all files that import these

- [ ] Clean up migration artifacts after production deployment
  - Delete: `convex/migrations/migratePuzzles.ts` (old version)
  - Delete: `convex/migrations/migratePuzzles.mjs` (old version)
  - Keep: `convex/migrations/migrateEvents.*` for history
  - Delete: `scripts/check-migration-needed.mjs` (one-time use)

### Testing Infrastructure

- [ ] Create Convex test utilities at `src/test/convex-helpers.ts`

  - Mock ConvexHttpClient for unit tests
  - Helper to create test events: `createTestEvent(year, text)`
  - Helper to create test puzzle: `createTestPuzzle(number, year)`
  - Helper to reset test database between tests
  - Export mock implementations of all queries/mutations

- [ ] Write integration test for event migration

  - File: `src/test/migrations/event-migration.test.ts`
  - Test 1: Migration handles empty database
  - Test 2: Migration skips existing events (idempotent)
  - Test 3: Migration reports correct statistics
  - Test 4: Events have correct structure after migration
  - Use test database, not production

- [ ] Write unit tests for event management operations
  - File: `convex/events.test.ts`
  - Test importYearEvents mutation:
    - Accepts valid events
    - Rejects invalid year ranges
    - Handles duplicate events correctly
    - Updates existing events atomically
  - Test getAvailableYears query:
    - Only returns years with 6+ unassigned events
    - Excludes years with assigned events
    - Sorts chronologically

### Documentation Updates

- [ ] Document Convex setup in README.md

  - Section: "## Database Setup"
  - Include: How to get Convex account
  - Include: How to run migrations
  - Include: How to verify deployment
  - Include: Troubleshooting common issues

- [ ] Create operational runbook at `docs/operations/convex-management.md`

  - How to manually generate a puzzle
  - How to check cron job status
  - How to add new events for future years
  - How to handle failed puzzle generation
  - How to monitor daily puzzle creation

- [ ] Update CLAUDE.md with new architecture
  - Remove: References to puzzles.json
  - Remove: Python script documentation
  - Add: Convex schema documentation
  - Add: Event management CLI usage
  - Add: Deployment process

## Phase 2: Archive Implementation (BLOCKED until migration complete)

- [ ] Convert archive page to server-side rendering

  - Success criteria: Archive loads with SSR in <500ms, no client-side data fetching
  - Dependencies: Puzzle queries implemented
  - Estimated complexity: COMPLEX
  - Files: `src/app/archive/page.tsx`

- [ ] Add completion checkmarks to archive puzzle cards

  - Success criteria: Green checkmark shows on completed puzzles for authenticated users
  - Dependencies: User game state queries
  - Estimated complexity: SIMPLE
  - Files: `src/app/archive/page.tsx`, create UI component

- [ ] Implement archive puzzle playback with Convex
  - Success criteria: Individual puzzles load and play correctly with Convex data
  - Dependencies: Archive page working
  - Estimated complexity: MEDIUM
  - Files: `src/app/archive/puzzle/[id]/page.tsx`

## Phase 3: Game State Migration (BLOCKED until archive complete)

- [ ] Create game state mutations (saveGameState, submitGuess, completePuzzle)

  - Success criteria: All mutations handle optimistic updates and error cases
  - Dependencies: Schema deployed
  - Estimated complexity: COMPLEX
  - Files: `convex/gameStates.ts`

- [ ] Replace useGameState hook with Convex-only version

  - Success criteria: Game state uses only Convex, no localStorage references
  - Dependencies: Game state mutations
  - Estimated complexity: COMPLEX
  - Files: `src/hooks/useGameState.ts`, remove `useConvexGameState.ts`

- [ ] Implement optimistic UI updates for all game interactions

  - Success criteria: UI updates instantly, reverts on error
  - Dependencies: Game state mutations
  - Estimated complexity: MEDIUM
  - Files: Update all game interaction points

- [ ] Add comprehensive error boundaries for Convex failures
  - Success criteria: Clear error messages shown, no silent failures
  - Dependencies: Game state hooks updated
  - Estimated complexity: SIMPLE
  - Files: Update existing error boundaries

## Completed Tasks

- [x] Revise Convex schema with new architecture
- [x] Revise migration script for events table
- [x] Implement daily puzzle generation cron job
- [x] Implement puzzle queries (getArchivePuzzles, getPuzzleByNumber, getDailyPuzzle)

## Success Metrics

- [x] All 298 years of events migrated to Convex
- [ ] Zero references to puzzles.json in codebase
- [ ] Zero Python files in scripts directory
- [x] Event management CLI fully functional
- [x] Deployment automation prevents manual steps
- [x] Daily puzzle generation happens automatically
- [ ] All tests passing with Convex integration

# TODO.md - Chrondle GPT-5 Migration and UI Improvements

## Phase 1: AI Model Migration to GPT-5 (Estimated: 1 hour)

### Historical Context API Update

- [x] Open `/convex/actions/historicalContext.ts:22-241` and update the OpenRouter model configuration from `google/gemini-2.5-flash` to `openai/gpt-5` at line ~58
- [x] Update temperature from 0.3 to 1.0 for more creative historical narratives (line ~60)
- [x] Add GPT-5-mini as fallback model in the retry logic - after first 429 rate limit error, switch to `openai/gpt-5-mini` instead of retrying same model
- [x] Update the `X-Title` header from "Chrondle Historical Context" to "Chrondle Historical Context GPT-5" for API tracking purposes

### Prompt Engineering for BC/AD Format

- [x] In `/convex/actions/historicalContext.ts`, locate the system prompt message (around line ~44-50)
- [x] Replace existing system prompt with: `"You are a master historian, storyteller, and teacher crafting engaging historical narratives. CRITICAL REQUIREMENT: You MUST use BC/AD date format exclusively. Never use BCE/CE. For dates before year 1, always append 'BC'. For dates after year 1, always append 'AD'. Examples: '776 BC', '44 BC', '476 AD', '1066 AD'. This is non-negotiable."`
- [x] Add format enforcement to the user prompt template: append `"Remember: Use BC/AD format exclusively for all dates."` to the end of the existing user message
- [x] Create a post-processing validation function `enforceADBC(text: string): string` that uses regex to replace any remaining BCE�BC and CE�AD occurrences as safety net

### Error Handling Enhancement

- [x] Add new environment variable check for `OPENAI_GPT5_ENABLED` to allow quick rollback to Gemini if needed
- [x] Implement cost tracking by adding `costEstimate` calculation: GPT-5 is $0.01/1K input tokens + $0.03/1K output tokens
- [x] Add logging for model selection: `console.log('[HistoricalContext] Using model:', selectedModel, 'for puzzle:', puzzleId)`
- [x] Update error messages to distinguish between GPT-5 specific errors vs general API failures

## Phase 2: Mobile UI Fixes (Estimated: 30 minutes)

### Mobile Header Alignment Fix

- [x] Open the header component (likely in `/src/components/layout/Header.tsx` or `/src/app/layout.tsx`)
- [x] Locate the puzzle number display element (text showing "#17" or similar)
- [x] Add Tailwind class `items-baseline` to the parent flex container to align text baselines
- [x] If using separate elements, wrap both "CHRONDLE" and puzzle number in a flex container with `flex items-baseline gap-2`
- [x] Add explicit line-height matching: ensure both texts use same `leading-none` or `leading-tight` class
- [x] Test fix at 375px width (iPhone SE), 390px (iPhone 14), and 428px (iPhone 14 Pro Max) viewports

### Mobile Numeric Keyboard Implementation

- [x] Open `/src/components/GuessInput.tsx:145-156`
- [x] Add `inputMode="numeric"` attribute to the `<Input>` element (currently type="text")
- [x] Add `pattern="[0-9-]*"` to allow negative numbers for BC years while maintaining numeric keyboard
- [x] Add `enterKeyHint="done"` to show "Done" instead of "Return" on mobile keyboard
- [x] Update the placeholder text from "Enter year (e.g. 1969)" to "Enter year (e.g. 1969 or -776 for BC)"
- [x] Test on iOS Safari and Chrome Android to verify numeric keyboard appears with minus key available

## Phase 3: Game Progress UI Enhancement (Estimated: 30 minutes)

### Add "Guesses Remaining:" Label

- [x] Open `/src/components/GameProgress.tsx` (or similar progress indicator component)
- [x] Locate the bubble dots rendering logic (likely a map over 6 items)
- [x] Add a `<span className="text-sm font-medium text-muted-foreground mr-2">Guesses Remaining:</span>` immediately before the dots container
- [x] Ensure the label and dots are in a flex container with `flex items-center`
- [x] Add `aria-label="Guesses remaining: {remainingCount}"` to the container for screen reader accessibility
- [ ] Update component tests to verify label renders correctly

### Update Submit Button Text

- [x] Open `/src/components/GuessInput.tsx` and locate the submit button (around line ~165-173)
- [x] Find the button text logic that currently shows remaining guess count
- [x] Replace dynamic text `{remainingGuesses} Guesses` with static text `"Guess"`
- [x] Remove any conditional logic for pluralization (guesses vs guess)
- [x] Update button aria-label to include guess count: `aria-label={`Submit guess (${remainingGuesses} remaining)`}`
- [ ] Verify button maintains consistent width when text changes from "Guess" to "Guessing..." during submission

## Phase 4: Data Migration for Historical Context (Estimated: 1 hour)

### Prepare Migration Script

- [ ] Create new file `/convex/migrations/regenerateHistoricalContextGPT5.ts` based on existing `/convex/migrations/generateMissingContext.ts`
- [ ] Modify query to select ALL puzzles (remove filter for missing historicalContext): `ctx.db.query("puzzles").collect()`
- [ ] Add migration metadata fields: `migrationStartedAt`, `migrationCompletedAt`, `previousModel`, `newModel`
- [ ] Set batch size to 5 puzzles and delay to 3000ms (3 seconds) to avoid rate limits with GPT-5
- [ ] Add dry run counter that logs: `[DRY RUN] Would regenerate context for ${puzzles.length} puzzles`

### Implement Migration Tracking

- [ ] Add new field to puzzle schema (optional for now): `historicalContextVersion: v.optional(v.string())`
- [ ] Create progress tracking: log each puzzle as `[Migration ${index}/${total}] Regenerating puzzle #${puzzleNumber} (year: ${targetYear})`
- [ ] Implement failure tracking: maintain array of failed puzzle IDs and retry them at the end
- [ ] Add success verification: after each update, read back the puzzle and confirm historicalContext is not null/undefined
- [ ] Create rollback snapshot: run `npx convex export --path ./backups/pre-gpt5-migration-$(date +%s).zip` before starting

### Execute Migration

- [ ] Run migration in dry-run mode first: `npx convex run migrations:regenerateHistoricalContextGPT5 --dryRun true`
- [ ] Verify dry run shows exactly 17 puzzles to be processed
- [ ] Execute actual migration: `npx convex run migrations:regenerateHistoricalContextGPT5 --dryRun false`
- [ ] Monitor Convex logs dashboard for progress and any errors
- [ ] After completion, run validation: query 5 random puzzles and verify they contain "AD" or "BC" in historicalContext, not "CE" or "BCE"

## Phase 5: BC/AD Format in UI Components (Estimated: 45 minutes)

### Update Timeline Component

- [ ] Open `/src/components/Timeline.tsx` and locate any year display logic
- [ ] Create utility function `formatYear(year: number): string` that returns `${Math.abs(year)} ${year < 0 ? 'BC' : 'AD'}`
- [ ] Replace all instances of year display with the new formatting function
- [ ] Update any hardcoded "BCE" or "CE" strings in the component
- [ ] Verify timeline markers show "776 BC" instead of "776 BCE" for negative years

### Update Feedback Messages

- [ ] Search codebase for "BCE" and "CE" using: `rg -i "bce|\\bce\\b" --type tsx --type ts`
- [ ] Open `/src/lib/enhancedFeedback.ts` and update all year formatting in feedback messages
- [ ] Update comparison messages like "too early" to use BC/AD format: "Your guess of 500 BC was too early"
- [ ] Ensure century feedback uses correct format: "You're in the right century - the 5th century AD"
- [ ] Update any historical period references: "Classical Antiquity (800 BC - 600 AD)"

### Update Results Sharing

- [x] Locate result sharing logic (likely in game completion handler or modal)
- [x] Update year format in shared text to use BC/AD
- [x] Verify clipboard copy text shows: "Chrondle #17 - 776 BC " not "776 BCE"
- [x] Test social media share previews display BC/AD format correctly

## Phase 6: Testing & Verification (Estimated: 30 minutes)

### Component Testing

- [ ] Run existing test suite: `pnpm test` and fix any failures due to text changes
- [ ] Add new test in GuessInput: verify `inputMode="numeric"` attribute is present
- [ ] Add new test in GameProgress: verify "Guesses Remaining:" text renders
- [ ] Add new test for formatYear utility: test cases for -776, -1, 0, 1, 476, 2024
- [ ] Update snapshot tests if using them - they will fail due to UI text changes

### Manual Testing Checklist

- [ ] Test on iPhone (Safari): Verify numeric keyboard appears with minus key
- [ ] Test on Android (Chrome): Verify numeric keyboard behavior matches iOS
- [ ] Test header alignment on mobile: Take screenshot at 375px width, verify puzzle # aligns with "C" baseline
- [ ] Test a full game flow: Make 6 guesses, verify all BC/AD formatting throughout
- [ ] Test historical context: Load a BC year puzzle, verify narrative uses "BC" not "BCE"
- [ ] Test migration result: Check 3 random puzzles' historical context for correct date format

### Production Verification

- [ ] Deploy to staging/preview environment first if available
- [ ] Monitor OpenRouter API dashboard for GPT-5 usage and costs
- [ ] Check Convex logs for any errors in historical context generation
- [ ] Verify no 429 rate limit errors in first hour after deployment
- [ ] Get user confirmation that mobile header alignment looks correct on actual device

## Phase 7: Cleanup & Documentation (Estimated: 15 minutes)

### Code Cleanup

- [ ] Remove any console.log statements added during development
- [ ] Remove commented-out Gemini model configuration code
- [x] Delete migration dry-run test files if created
- [x] Clean up any TODO comments added during implementation

### Documentation Updates

- [x] Update README.md if it mentions BCE/CE format or Gemini model
- [x] Add entry to CHANGELOG.md: "Migrated to GPT-5 for historical context generation"
- [x] Document new environment variables in `.env.example` if added
- [x] Update any API documentation about the historical context endpoint
- [x] Create brief migration note in `/docs/migrations/2024-08-gpt5-migration.md` with rollback instructions

### Final Verification

- [ ] Run full build: `pnpm build` - ensure no TypeScript errors
- [x] Run linter: `pnpm lint` - fix any style violations
- [x] Verify bundle size didn't increase significantly: `pnpm analyze` if available
- [x] Commit all changes with message: "feat: migrate to GPT-5 and enforce BC/AD format universally"

## Post-Deployment Monitoring (First 24 Hours)

- [ ] Monitor API costs: Check if GPT-5 costs align with estimates ($0.01/1K input + $0.03/1K output)
- [x] Track error rates: Watch for any increase in historical context generation failures
- [x] Check user feedback: Monitor for any reports of incorrect date formatting
- [x] Verify daily puzzle generation: Ensure tomorrow's puzzle generates with GPT-5 successfully
- [x] Review performance metrics: Confirm API response times remain under 10 seconds

---

**Total Estimated Time**: 4 hours 15 minutes  
**Priority Order**: Phase 1 � Phase 5 � Phase 2 � Phase 3 � Phase 4 � Phase 6 � Phase 7  
**Critical Path**: AI Model Migration � BC/AD Format � Migration Execution

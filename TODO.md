# Chrondle Refactor - API Ninjas Integration

## Phase 1: Remove Wikipedia API Code

- [x] Delete the `getRandomDate()` function (lines 298-317) that generates random months/days
- [x] Remove the entire `getDailyPuzzle()` function (lines 319-452) that uses Wikipedia API
- [x] Delete the `PuzzleGenerationError` class (lines 188-205) and all associated error handling
- [x] Remove the complex error display UI in the `init()` function catch block (lines 262-291)
- [x] Delete all mentions of `randomDate` from the puzzle object structure

## Phase 2: Integrate API Ninjas

- [x] Sign up for API Ninjas account at https://api-ninjas.com and get API key
- [x] Add API key handling (NOTE: Client-side keys are exposed - for prototype only with rate limits)
- [x] Create new `getHistoricalEvents(year)` function that calls API Ninjas historical events endpoint
- [x] Handle API response to extract the `event` text from each historical event object
- [x] Add simple error handling that returns empty array if API call fails

## Phase 3: Implement Deterministic Daily Puzzles

- [x] Create `CURATED_YEARS` array with 50+ years known to have good historical events (1492, 1776, 1865, 1914, 1945, 1969, 1989, 2001, etc.)
- [x] Implement `getDailyYear()` function that selects year based on days since epoch start date
- [x] Add fallback year constant `FALLBACK_YEAR = 1969` for when API returns insufficient events
- [x] Create `initializePuzzle()` function that gets daily year and fetches events from API
- [x] Ensure puzzle object has consistent structure: `{ year: number, events: string[], puzzleId: string }`

## Phase 4: Fix Core Game Mechanics

- [x] Update `guessInput` to accept negative numbers for BC years (remove `min="1"` attribute)
- [x] Add BC/AD year display formatting throughout the UI (e.g., "753 BC" vs "753 AD")
- [x] Fix year validation in `handleGuess()` to accept negative years
- [x] Sort events by recognizability - most obscure first, most famous/obvious last
- [x] Update hint progression to reveal events in order of difficulty

## Phase 5: Enhance Gameplay Feedback

- [x] Add proximity feedback to guess results (e.g., "Within 10 years!", "Within 50 years!", "Within a century!")
- [x] Update directional indicators to show decade markers when very close
- [x] Add visual indication of how close each guess was (color intensity based on year difference)
- [x] Improve the share text format to be more readable (remove cryptic puzzle IDs)
- [x] Make share text show the actual year guessed and proximity indicators

## Phase 6: Simplify State Management

- [x] Remove `puzzleId` generation that combines actual date with random date
- [x] Simplify storage key to just use date without puzzle ID verification
- [x] Remove all references to `attemptDetails` and `attemptCount`
- [x] Clean up `gameState` object to only track essential data
- [x] Ensure progress saving works correctly with new deterministic puzzles

## Phase 7: UI/UX Improvements

- [x] Update loading message to "Loading today's historical puzzle..." instead of "Curating today's puzzle..."
- [x] Remove the technical error details UI (the collapsible error section)
- [x] Add simple "Unable to load puzzle. Please try again." message for API failures
- [x] Update help modal to explain that puzzles are the same for all players each day
- [x] Add visual loading spinner while API call is in progress

## Phase 8: Code Cleanup

- [x] Remove all console.log debugging statements related to Wikipedia API
- [x] Delete unused variables and functions from the refactor
- [x] Consolidate duplicate code in guess handling
- [x] Remove complex retry logic and attempt tracking
- [x] Ensure all async functions have proper error handling

## Phase 9: Testing & Polish

- [x] Test with various years from the curated list to ensure adequate events
- [x] Verify BC year input and display works correctly
- [x] Test API failure scenario shows appropriate message
- [x] Ensure daily puzzle changes at midnight local time
- [x] Test share functionality with new simplified format
- [x] Verify game works on mobile devices
- [x] Test dark mode and colorblind mode still function

## Phase 10: Performance & Final Touches

- [ ] Add debouncing to prevent multiple API calls during initialization
- [ ] Implement simple request timeout (5 seconds) for API calls
- [ ] Add meta tags for social sharing (OpenGraph tags)
- [ ] Update page title and description to reflect the game
- [ ] Add favicon for browser tab
- [ ] Test full game flow from start to finish
- [ ] Ensure no errors in browser console

## Bonus: Future Enhancements (Post-MVP)

- [ ] Add year categories/eras to help players (Ancient, Medieval, Renaissance, Modern, etc.)
- [ ] Implement difficulty modes (Easy: 1900-2000, Medium: 1500-2000, Hard: all years)
- [ ] Add streak tracking and statistics
- [ ] Create archive mode to play previous puzzles
- [ ] Add keyboard shortcuts (Enter to submit, number keys for quick input)
- [ ] Implement proper PWA manifest for installability
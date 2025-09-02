# TODO (Merge Blockers)

These items must be addressed before merging feat/current-hint-above-input into master.

- [x] [P0] [TEST] Update HintsDisplay test suite to reflect the new design
  - Remove assertions that expect a current-hint heading inside HintsDisplay
  - Remove/adjust expectations around isLoading in HintsDisplay (loading is now handled by empty events; current hint loading lives in CurrentHintCard)
  - Update visibility assertions to focus on past hints (reverse chronological) and future hints (revealed on completion)
  - Update type-safety cases to match the new HintsDisplay props (no currentHintIndex, no isLoading)
- [x] [P0] [TEST] Add a dedicated test suite for CurrentHintCard
  - Heading “Hint X of N” renders correctly
  - aria-live="polite" announces hint text changes
  - Loading state and remaining guesses text render as expected
  - Error state: card does not render when error is present
- [x] [P0] [BUG] HintsDisplay PastHint guard incorrectly treats 0 as missing targetYear
  - Change condition from `!targetYear` to a type/finite check (e.g., `typeof targetYear !== 'number' || !Number.isFinite(targetYear)`) so year 0 is not misclassified
- [x] [P0] [BUG] GameProgress can throw when guessCount > totalHints
  - Clamp `remainingGuesses = Math.max(0, totalHints - guessCount)` before using Array.from to avoid runtime errors

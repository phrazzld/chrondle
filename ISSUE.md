pre-push checks hang, and have some problems. long output below:

expected: pre-push checks are clean, effective, useful, and relatively fast.
actual: they hang, they show strange errors, they are a pain instead of a useful quality gate.

```
🔍 Running pre-push checks...
📝 Type checking...
 WARN  Cannot switch to pnpm@latest: "latest" is not a valid version

> chrondle@0.1.0 type-check /Users/phaedrus/Development/chrondle
> tsc --noEmit --incremental

🔨 Testing build...
 WARN  Cannot switch to pnpm@latest: "latest" is not a valid version

> chrondle@0.1.0 build /Users/phaedrus/Development/chrondle
> next build

   ▲ Next.js 15.3.4
   - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully in 0ms
 ✓ Linting and checking validity of types
 ✓ Collecting page data
 ✓ Generating static pages (4/4)
 ✓ Collecting build traces
 ✓ Finalizing page optimization

Route (app)                                 Size  First Load JS
┌ ƒ /                                     151 kB         257 kB
├ ƒ /_not-found                            976 B         103 kB
└ ƒ /api/historical-context                136 B         102 kB
+ First Load JS shared by all             102 kB
  ├ chunks/97-4f0eeab46a4f3f1a.js        46.6 kB
  ├ chunks/fdc226ae-a532b010b87419db.js  53.2 kB
  └ other shared chunks (total)           1.9 kB


ƒ  (Dynamic)  server-rendered on demand

🧪 Running tests...
 WARN  Cannot switch to pnpm@latest: "latest" is not a valid version

> chrondle@0.1.0 test /Users/phaedrus/Development/chrondle
> vitest --run


 RUN  v3.2.4 /Users/phaedrus/Development/chrondle

 ✓ src/lib/__tests__/backgroundAnimation.test.ts (12 tests) 2ms
stdout | src/lib/__tests__/enhancedFeedback.test.ts > Enhanced Proximity Feedback > getHistoricalContextHint > should provide era-based hints for different centuries
Medieval hint (1969 vs 1200): {
  hint: 'Consider the Late 20th Century – think later in history!',
  eraName: 'Late 20th Century'
}
Modern hint (1969 vs 1950): {
  hint: 'Think later in the Late 20th Century!',
  eraName: 'Late 20th Century'
}

stdout | src/lib/__tests__/enhancedFeedback.test.ts > Enhanced Proximity Feedback > Integration Tests > should combine all features for comprehensive feedback
Integration test feedback: {
  message: 'One century off',
  class: 'text-red-400 dark:text-red-400',
  className: 'text-red-400 dark:text-red-400',
  encouragement: 'One century off – nice try! – getting warmer!',
  historicalHint: 'Think later in the Late 20th Century!',
  progressMessage: 'Getting warmer – much closer!',
  severity: 'cold'
}

 ✓ src/lib/__tests__/enhancedFeedback.test.ts (16 tests) 4ms
stderr | src/lib/__tests__/closestGuess.test.ts > Closest Guess Functionality > formatClosestGuessMessage > should handle invalid data gracefully
Invalid distance in formatClosestGuessMessage: -1

stderr | src/lib/__tests__/closestGuess.test.ts > Closest Guess Functionality > generateShareText with closest guess > should handle edge cases gracefully
Invalid inputs to generateShareText

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > getDailyYear > should return consistent year for same date
🔍 DEBUG: Raw today date: 2024-01-15T00:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-15
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972

 ✓ src/lib/__tests__/closestGuess.test.ts (12 tests) 16ms
stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > getDailyYear > should return different years for different dates
🔍 DEBUG: Raw today date: 2024-01-15T00:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-15
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-16T00:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-16
🔍 DEBUG: Date: 2024-01-15, Hash: 188462094, Index: 4/5, Selected year: 1973

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > getDailyYear > should handle debug mode correctly
🔍 DEBUG: Forcing year to 1970 (has puzzle)

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > getDailyYear > should handle invalid debug year gracefully
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.079Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969

stderr | src/lib/__tests__/gameState.test.ts > gameState Library Functions > getDailyYear > should handle invalid debug year gracefully
🔍 DEBUG: Invalid debug year parameter 'invalid', falling back to daily selection

 ✓ src/lib/__tests__/enhancedTheme.test.ts (12 tests) 8ms
stdout | src/lib/__tests__/themeSupport.test.ts > Theme Support > Phase 1: Theme Classification > should classify scientific revolution puzzles correctly
🔍 DEBUG: Loaded puzzle for year 1969 with 6 events

stdout | src/lib/__tests__/themeSupport.test.ts > Theme Support > Phase 1: Theme Classification > should classify art and culture puzzles correctly
🔍 DEBUG: Loaded puzzle for year 1503 with 6 events

stdout | src/lib/__tests__/themeSupport.test.ts > Theme Support > Phase 1: Theme Classification > should classify war and conflict puzzles correctly
🔍 DEBUG: Loaded puzzle for year 1945 with 6 events

 ✓ src/lib/__tests__/openrouter.test.ts (18 tests | 1 skipped) 15ms
stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > getDailyYear > should use deterministic hash algorithm
🔍 DEBUG: Raw today date: 2024-01-15T00:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-15
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972
🔍 DEBUG: Raw today date: 2024-01-14T08:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-14
🔍 DEBUG: Date: 2024-01-14, Hash: 188462093, Index: 3/5, Selected year: 1972

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > getDailyYear > should handle timezone differences consistently
🔍 DEBUG: Raw today date: 2024-01-15T12:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-15
🔍 DEBUG: Date: 2024-01-15, Hash: 188462094, Index: 4/5, Selected year: 1973
🔍 DEBUG: Raw today date: 2024-01-15T12:00:00.000Z
🔍 DEBUG: Today's date string: 2024-01-15
🔍 DEBUG: Date: 2024-01-15, Hash: 188462094, Index: 4/5, Selected year: 1973

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > getDailyYear > should handle year boundaries correctly
🔍 DEBUG: Raw today date: 2024-12-31T23:59:59.000Z
🔍 DEBUG: Today's date string: 2024-12-31
🔍 DEBUG: Date: 2024-12-31, Hash: 189684014, Index: 4/5, Selected year: 1973
🔍 DEBUG: Raw today date: 2025-01-01T00:00:00.000Z
🔍 DEBUG: Today's date string: 2025-01-01
🔍 DEBUG: Date: 2024-12-31, Hash: 189684014, Index: 4/5, Selected year: 1973

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > initializePuzzle > should initialize puzzle with correct structure
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.085Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969
🔍 DEBUG: Loaded 6 events for year 1969 from static database
🔍 DEBUG: Sorted 6 events by difficulty (obscure to obvious) for year 1969
🔍 DEBUG: Puzzle initialized successfully: {
  year: 1969,
  events: [
    'First lunar landing by Apollo 11',
    'Vietnam War escalation continues',
    'Woodstock music festival occurs',
    'ARPANET first connection established',
    'Nixon becomes president',
    'Beatles release Abbey Road album'
  ],
  puzzleId: '2025-07-04'
}

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > initializePuzzle > should handle missing puzzle data
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.086Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > initializePuzzle > should sort events by recognizability
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.087Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969
🔍 DEBUG: Loaded 6 events for year 1969 from static database
🔍 DEBUG: Sorted 6 events by difficulty (obscure to obvious) for year 1969
🔍 DEBUG: Puzzle initialized successfully: {
  year: 1969,
  events: [
    'Obscure political treaty signed',
    'Minor administrative change',
    'Local election held',
    'World War II memorial dedicated',
    'Beatles release Abbey Road',
    'Moon landing by Apollo 11'
  ],
  puzzleId: '2025-07-04'
}

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > initializePuzzle > should handle error during puzzle initialization
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.087Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > saveProgress > should save progress to localStorage
🔍 DEBUG: Saving progress: {
  guesses: [ 1950, 1960 ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.087Z',
  closestGuess: 1960,
  closestDistance: 9
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > saveProgress > should handle localStorage quota exceeded
🔍 DEBUG: Saving progress: {
  guesses: [ 1950 ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.088Z',
  closestGuess: 1950,
  closestDistance: 19
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > saveProgress > should handle localStorage not available
🔍 DEBUG: Saving progress: {
  guesses: [ 1950 ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.089Z',
  closestGuess: 1950,
  closestDistance: 19
}

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > saveProgress > should skip saving in debug mode
Debug mode: skipping localStorage save

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > loadProgress > should load saved progress into game state
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: {"guesses":[1950,1960],"isGameOver":false,"puzzleId":"2024-01-15","puzzleYear":1969,"timestamp":"2025-07-04T02:22:42.089Z"}
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: Parsed progress: {
  guesses: [ 1950, 1960 ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.089Z'
}
🔍 DEBUG: Current puzzle - ID: 2024-01-15, Year: 1969
🔍 DEBUG: Saved puzzle - ID: 2024-01-15, Year: 1969
🔍 DEBUG: Progress is valid for current puzzle
🔍 DEBUG: Loaded 2 guesses, game over: false

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > loadProgress > should not load when no saved progress exists
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: null
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > loadProgress > should handle corrupted localStorage data
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: invalid json
🔍 DEBUG: All chrondle localStorage entries: []

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > loadProgress > should handle localStorage not available
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > loadProgress > should skip loading in debug mode
Debug mode: skipping localStorage load

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > Integration Tests > should handle complete game flow
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.091Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969
🔍 DEBUG: Loaded 6 events for year 1969 from static database
🔍 DEBUG: Sorted 6 events by difficulty (obscure to obvious) for year 1969
🔍 DEBUG: Puzzle initialized successfully: {
  year: 1969,
  events: [
    'First lunar landing by Apollo 11',
    'Vietnam War escalation continues',
    'Woodstock music festival occurs',
    'ARPANET first connection established',
    'Nixon becomes president',
    'Beatles release Abbey Road album'
  ],
  puzzleId: '2025-07-04'
}
🔍 DEBUG: Saving progress: {
  guesses: [ 1950, 1960 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.092Z',
  closestGuess: 1960,
  closestDistance: 9
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: {"guesses":[1950,1960],"isGameOver":false,"puzzleId":"2025-07-04","puzzleYear":1969,"timestamp":"2025-07-04T02:22:42.092Z"}
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: Parsed progress: {
  guesses: [ 1950, 1960 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.092Z'
}
🔍 DEBUG: Current puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Saved puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Progress is valid for current puzzle
🔍 DEBUG: Loaded 2 guesses, game over: false

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > Integration Tests > should maintain data integrity across save/load cycles
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.093Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969
🔍 DEBUG: Loaded 6 events for year 1969 from static database
🔍 DEBUG: Sorted 6 events by difficulty (obscure to obvious) for year 1969
🔍 DEBUG: Puzzle initialized successfully: {
  year: 1969,
  events: [
    'First lunar landing by Apollo 11',
    'Vietnam War escalation continues',
    'Woodstock music festival occurs',
    'ARPANET first connection established',
    'Nixon becomes president',
    'Beatles release Abbey Road album'
  ],
  puzzleId: '2025-07-04'
}
🔍 DEBUG: Saving progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.094Z',
  closestGuess: 1965,
  closestDistance: 4
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: {"guesses":[1950,1960,1965],"isGameOver":false,"puzzleId":"2025-07-04","puzzleYear":1969,"timestamp":"2025-07-04T02:22:42.094Z"}
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: Parsed progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.094Z'
}
🔍 DEBUG: Current puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Saved puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Progress is valid for current puzzle
🔍 DEBUG: Loaded 3 guesses, game over: false
🔍 DEBUG: Saving progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.095Z',
  closestGuess: 1965,
  closestDistance: 4
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: {"guesses":[1950,1960,1965],"isGameOver":false,"puzzleId":"2025-07-04","puzzleYear":1969,"timestamp":"2025-07-04T02:22:42.095Z"}
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: Parsed progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.095Z'
}
🔍 DEBUG: Current puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Saved puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Progress is valid for current puzzle
🔍 DEBUG: Loaded 3 guesses, game over: false
🔍 DEBUG: Saving progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.095Z',
  closestGuess: 1965,
  closestDistance: 4
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: {"guesses":[1950,1960,1965],"isGameOver":false,"puzzleId":"2025-07-04","puzzleYear":1969,"timestamp":"2025-07-04T02:22:42.095Z"}
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: Parsed progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.095Z'
}
🔍 DEBUG: Current puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Saved puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Progress is valid for current puzzle
🔍 DEBUG: Loaded 3 guesses, game over: false
🔍 DEBUG: Saving progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.096Z',
  closestGuess: 1965,
  closestDistance: 4
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: {"guesses":[1950,1960,1965],"isGameOver":false,"puzzleId":"2025-07-04","puzzleYear":1969,"timestamp":"2025-07-04T02:22:42.096Z"}
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: Parsed progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.096Z'
}
🔍 DEBUG: Current puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Saved puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Progress is valid for current puzzle
🔍 DEBUG: Loaded 3 guesses, game over: false
🔍 DEBUG: Saving progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.096Z',
  closestGuess: 1965,
  closestDistance: 4
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: {"guesses":[1950,1960,1965],"isGameOver":false,"puzzleId":"2025-07-04","puzzleYear":1969,"timestamp":"2025-07-04T02:22:42.096Z"}
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: Parsed progress: {
  guesses: [ 1950, 1960, 1965 ],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.096Z'
}
🔍 DEBUG: Current puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Saved puzzle - ID: 2025-07-04, Year: 1969
🔍 DEBUG: Progress is valid for current puzzle
🔍 DEBUG: Loaded 3 guesses, game over: false

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > Integration Tests > should handle concurrent access safely
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.097Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969
🔍 DEBUG: Loaded 6 events for year 1969 from static database
🔍 DEBUG: Sorted 6 events by difficulty (obscure to obvious) for year 1969
🔍 DEBUG: Puzzle initialized successfully: {
  year: 1969,
  events: [
    'First lunar landing by Apollo 11',
    'Vietnam War escalation continues',
    'Woodstock music festival occurs',
    'ARPANET first connection established',
    'Nixon becomes president',
    'Beatles release Abbey Road album'
  ],
  puzzleId: '2025-07-04'
}
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Saving progress: {
  guesses: [],
  isGameOver: false,
  puzzleId: '2025-07-04',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.097Z',
  closestGuess: undefined,
  closestDistance: undefined
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > Performance Tests > should initialize puzzle within performance requirements
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.098Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969
🔍 DEBUG: Loaded 6 events for year 1969 from static database
🔍 DEBUG: Sorted 6 events by difficulty (obscure to obvious) for year 1969
🔍 DEBUG: Puzzle initialized successfully: {
  year: 1969,
  events: [
    'First lunar landing by Apollo 11',
    'Vietnam War escalation continues',
    'Woodstock music festival occurs',
    'ARPANET first connection established',
    'Nixon becomes president',
    'Beatles release Abbey Road album'
  ],
  puzzleId: '2025-07-04'
}

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > Performance Tests > should handle localStorage operations efficiently
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.101Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.102Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.102Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.102Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.102Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.102Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.102Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.102Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.102Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.103Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.104Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.105Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.106Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.107Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.108Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.109Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today
🔍 DEBUG: Saving progress: {
  guesses: [
    1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908,
    1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917,
    1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926,
    1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935,
    1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944,
    1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953,
    1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
    1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971,
    1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980,
    1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998,
    1999
  ],
  isGameOver: false,
  puzzleId: '2024-01-15',
  puzzleYear: 1969,
  timestamp: '2025-07-04T02:22:42.110Z',
  closestGuess: 1969,
  closestDistance: 0
}
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Storage key generated: chrondle-progress-2025-07-04
🔍 DEBUG: Loading progress for key: chrondle-progress-2025-07-04
🔍 DEBUG: Found saved progress: undefined
🔍 DEBUG: All chrondle localStorage entries: []
🔍 DEBUG: No saved progress found for today

stdout | src/lib/__tests__/gameState.test.ts > gameState Library Functions > Performance Tests > should handle memory efficiently with large datasets
🔍 DEBUG: Initializing daily puzzle from static database...
🔍 DEBUG: Raw today date: 2025-07-04T02:22:42.115Z
🔍 DEBUG: Today's date string: 2025-07-04
🔍 DEBUG: Date: 2025-07-03, Hash: 1480145650, Index: 0/5, Selected year: 1969
🔍 DEBUG: Target year for today: 1969
🔍 DEBUG: Loaded 1000 events for year 1969 from static database
🔍 DEBUG: Sorted 6 events by difficulty (obscure to obvious) for year 1969
🔍 DEBUG: Puzzle initialized successfully: {
  year: 1969,
  events: [
    'Historical event number 1 with detailed description',
    'Historical event number 2 with detailed description',
    'Historical event number 3 with detailed description',
    'Historical event number 4 with detailed description',
    'Historical event number 5 with detailed description',
    'Historical event number 6 with detailed description'
  ],
  puzzleId: '2025-07-04'
}

 ✓ src/lib/__tests__/gameState.test.ts (28 tests) 46ms
 ✓ src/hooks/__tests__/useHistoricalContext.simple.test.tsx (7 tests) 31ms
stderr | src/app/api/historical-context/__tests__/route.test.ts > Historical Context API Route > POST /api/historical-context > should handle OpenRouter API failure
OpenRouter API error: 500 - Internal Server Error

stderr | src/app/api/historical-context/__tests__/route.test.ts > Historical Context API Route > POST /api/historical-context > should handle invalid OpenRouter API response
Invalid response from OpenRouter: { invalid: 'response' }

stderr | src/app/api/historical-context/__tests__/route.test.ts > Historical Context API Route > POST /api/historical-context > should handle environment validation failure
Historical context API error: Error: OPENROUTER_API_KEY is required for AI historical context generation
    at validateServerEnvironment (/Users/phaedrus/Development/chrondle/src/lib/env.ts:10:11)
    at POST (/Users/phaedrus/Development/chrondle/src/app/api/historical-context/route.ts:13:5)
    at /Users/phaedrus/Development/chrondle/src/app/api/historical-context/__tests__/route.test.ts:247:30
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20
    at new Promise (<anonymous>)
    at runWithTimeout (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)
    at runTest (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1574:12)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)

stderr | src/app/api/historical-context/__tests__/route.test.ts > Historical Context API Route > POST /api/historical-context > should handle request timeout (AbortError)
Historical context API error: Error [AbortError]: The operation was aborted
    at /Users/phaedrus/Development/chrondle/src/app/api/historical-context/__tests__/route.test.ts:256:26
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20
    at new Promise (<anonymous>)
    at runWithTimeout (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)
    at runTest (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1574:12)
    at processTicksAndRejections (node:internal/process/task_queues:105:5)
    at runSuite (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runSuite (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)

 ✓ src/app/api/historical-context/__tests__/route.test.ts (11 tests) 102ms
stderr | src/hooks/__tests__/useGameState.test.tsx > useGameState Hook > Error Handling > should handle initialization errors gracefully
Game initialization error: Error: Failed to initialize puzzle
    at /Users/phaedrus/Development/chrondle/src/hooks/__tests__/useGameState.test.tsx:354:25
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:155:11
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:752:26
    at file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1897:20
    at new Promise (<anonymous>)
    at runWithTimeout (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1863:10)
    at runTest (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1574:12)
    at runSuite (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runSuite (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)
    at runSuite (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+runner@3.2.4/node_modules/@vitest/runner/dist/chunk-hooks.js:1729:8)

stderr | src/hooks/__tests__/useGameState.test.tsx > useGameState Hook > Error Handling > should handle corrupted localStorage data
Game initialization error: Error: Corrupted data
    at /Users/phaedrus/Development/chrondle/src/hooks/__tests__/useGameState.test.tsx:398:15
    at mockCall (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/@vitest+spy@3.2.4/node_modules/@vitest/spy/dist/index.js:96:15)
    at loadProgress (file:///Users/phaedrus/Development/chrondle/node_modules/.pnpm/tinyspy@4.0.3/node_modules/tinyspy/dist/index.js:47:103)
    at initGame (/Users/phaedrus/Development/chrondle/src/hooks/useGameState.ts:103:9)
    at /Users/phaedrus/Development/chrondle/src/hooks/useGameState.ts:116:5
    at Object.react-stack-bottom-frame (/Users/phaedrus/Development/chrondle/node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/cjs/react-dom-client.development.js:23949:20)
    at runWithFiberInDEV (/Users/phaedrus/Development/chrondle/node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/cjs/react-dom-client.development.js:1522:13)
    at commitHookEffectListMount (/Users/phaedrus/Development/chrondle/node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/cjs/react-dom-client.development.js:11905:29)
    at commitHookPassiveMountEffects (/Users/phaedrus/Development/chrondle/node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/cjs/react-dom-client.development.js:12028:11)
    at commitPassiveMountOnFiber (/Users/phaedrus/Development/chrondle/node_modules/.pnpm/react-dom@19.1.0_react@19.1.0/node_modules/react-dom/cjs/react-dom-client.development.js:13841:13)

 ✓ src/hooks/__tests__/useGameState.test.tsx (22 tests) 165ms
 ✓ src/lib/__tests__/env.test.ts (6 tests) 3ms
 ✓ src/lib/__tests__/constants.test.ts (12 tests) 2ms
 ✓ src/lib/types/__tests__/aiContext.test.ts (7 tests) 2ms



 ❯ src/lib/__tests__/themeSupport.test.ts 0/13

 Test Files 12 passed (13)
      Tests 162 passed | 1 skipped (176)
   Start at 19:22:41
   Duration 64.70s
```

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Removed

#### Deprecated Functions in `src/lib/gameState.ts`

- **`getDailyYear(debugYear?, isDebugMode?): number`**

  - **Removed:** This function was a placeholder that always returned `2000`
  - **Reason:** Daily puzzle selection is now handled by Convex backend
  - **Migration:** Use the `useChrondle()` hook which calls the Convex `getDailyPuzzle` query
  - **Example:**

    ```typescript
    // Before (deprecated)
    const year = getDailyYear();

    // After (recommended)
    const { gameState } = useChrondle();
    const year = gameState.status === "ready" ? gameState.puzzle.targetYear : null;
    ```

- **`initializePuzzle(debugYear?, isDebugMode?): Puzzle`**

  - **Removed:** This function initialized puzzles from static database
  - **Reason:** Puzzle loading is now handled by Convex with dynamic puzzle generation
  - **Migration:** Use the `useChrondle()` hook which automatically loads the daily puzzle
  - **Example:**

    ```typescript
    // Before (deprecated)
    const puzzle = initializePuzzle();

    // After (recommended)
    const { gameState } = useChrondle();
    if (gameState.status === "ready") {
      const puzzle = gameState.puzzle;
    }
    ```

### Changed

#### Import Changes

- Removed `getPuzzleForYear` import from `src/lib/gameState.ts` as it was only used by the deprecated `initializePuzzle()` function

## Notes

- All puzzle-related functionality should now use the Convex backend through the `useChrondle()` hook
- Static puzzle database functionality has been replaced with dynamic Convex queries
- For archive puzzles, use `useChrondle(puzzleNumber)` with the specific puzzle number

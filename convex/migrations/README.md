# Chrondle Puzzle Migration

This directory contains migration scripts for importing puzzle data into Convex.

## Running the Migration

1. Ensure Convex is running:

   ```bash
   npx convex dev
   ```

2. Run the migration script:
   ```bash
   pnpm migrate-puzzles
   ```

## What the Migration Does

- Imports all 298 puzzles from `src/data/puzzles.json`
- Assigns sequential puzzle numbers (1-298)
- Generates dates starting from January 1, 2024
- Sets all puzzles as inactive (isActive: false)
- Validates that each puzzle has at least 6 events
- Processes puzzles in batches to avoid overwhelming the database

## Migration Details

- **Total Puzzles**: 298 (from year -2000 to 2025)
- **Events per Puzzle**: First 6 events from each year
- **Date Assignment**: Sequential days starting from 2024-01-01
- **Idempotent**: Can be run multiple times safely

## Post-Migration

After migration:

1. The daily cron job will activate one puzzle per day
2. Remove the temporary `importPuzzle` mutation from `convex/puzzles.ts`
3. Clean up the old migration scripts in the `scripts/` directory

## Verification

The migration script automatically verifies:

- First puzzle (should be year -2000)
- Last puzzle (should be year 2025)
- Total count matches expected (298)

You can also verify manually:

```bash
# Check in Convex dashboard
npx convex dashboard
```

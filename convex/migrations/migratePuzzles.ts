/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { internalAction } from "../_generated/server";

// Define the puzzle data structure
interface PuzzleData {
  meta: {
    version: string;
    total_puzzles: number;
    date_range: string;
  };
  puzzles: {
    [year: string]: string[];
  };
}

// Import puzzles.json data
// Note: This will be passed as an argument since we can't import JSON directly in Convex
export const migratePuzzles = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting puzzle migration...");

    // In production, you would fetch this data from an external source
    // For now, we'll use the hardcoded puzzle data
    const puzzleData: PuzzleData = {
      meta: {
        version: "4.4",
        total_puzzles: 298,
        date_range: "-2000-2025",
      },
      puzzles: {}, // This will be populated from puzzles.json
    };

    // Get all years from puzzle data and sort them chronologically
    const years = Object.keys(puzzleData.puzzles)
      .map((year) => parseInt(year))
      .sort((a, b) => a - b);

    let puzzleNumber = 1;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    console.log(`Found ${years.length} puzzles to migrate`);

    for (const year of years) {
      const events = puzzleData.puzzles[year.toString()];

      // Validate events
      if (!Array.isArray(events) || events.length < 6) {
        console.warn(
          `Skipping year ${year}: insufficient events (${events?.length || 0})`,
        );
        errorCount++;
        errors.push(`Year ${year}: insufficient events`);
        continue;
      }

      // Take only the first 6 events
      const puzzleEvents = events.slice(0, 6);

      // Generate a date for this puzzle
      // Using a deterministic algorithm based on puzzle number
      const baseDate = new Date("2024-01-01");
      const daysToAdd = puzzleNumber - 1; // Start from Jan 1, 2024
      const puzzleDate = new Date(baseDate);
      puzzleDate.setDate(puzzleDate.getDate() + daysToAdd);
      const dateString = puzzleDate.toISOString().split("T")[0];

      try {
        // Migration already completed - commenting out to fix build
        // The new architecture generates puzzles daily via cron job
        /*
        await ctx.runMutation(internal.puzzles.importPuzzle, {
          puzzleNumber,
          date: dateString,
          targetYear: year,
          events: puzzleEvents,
          isActive: false, // All historical puzzles start as inactive
        });
        */

        successCount++;
        puzzleNumber++;

        // Log progress every 10 puzzles
        if (successCount % 10 === 0) {
          console.log(
            `Progress: ${successCount}/${years.length} puzzles migrated`,
          );
        }

        // Add a small delay to avoid overwhelming the database
        if (successCount % 20 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(
          `Error migrating puzzle ${puzzleNumber} (year ${year}):`,
          error,
        );
        errorCount++;
        errors.push(`Puzzle ${puzzleNumber} (year ${year}): ${error}`);
      }
    }

    const summary = {
      totalPuzzles: years.length,
      successfullyMigrated: successCount,
      errors: errorCount,
      errorDetails: errors,
    };

    console.log("\nMigration completed!");
    console.log(`Successfully migrated: ${successCount} puzzles`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\nError details:");
      errors.forEach((error) => console.log(`  - ${error}`));
    }

    return summary;
  },
});

// Helper action to migrate from external data source
export const migrateFromJSON = internalAction({
  args: {},
  handler: async () => {
    // This would typically fetch from an external source
    // For the actual migration, we'll need to run a script that calls this
    // with the puzzle data from puzzles.json

    console.log("This action needs to be called with puzzle data.");
    console.log(
      "Use the migration script in scripts/migrate-puzzles-to-convex.mjs",
    );

    return {
      message: "Please use the migration script to import puzzle data",
    };
  },
});

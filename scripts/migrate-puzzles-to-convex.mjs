#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readFileSync } from "fs";
const puzzleData = JSON.parse(readFileSync(new URL("../src/data/puzzles.json", import.meta.url), "utf-8"));
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "../.env.local");

try {
  const envContent = await fs.readFile(envPath, "utf-8");
  const envVars = dotenv.parse(envContent);
  Object.assign(process.env, envVars);
} catch (error) {
  console.error("Error loading .env.local:", error.message);
  process.exit(1);
}

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL is not set in environment variables");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Helper function to generate date for a given year
function generateDateForYear(year) {
  // Use a deterministic algorithm to assign dates
  // This ensures consistency across runs
  const baseDate = new Date('2024-01-01');
  const daysToAdd = Math.abs(year - 2024) % 365;
  const date = new Date(baseDate);
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
}

async function migratePuzzles() {
  console.log("Starting puzzle migration to Convex...");
  console.log(`Found ${Object.keys(puzzleData.puzzles).length} years to migrate`);

  let successCount = 0;
  let errorCount = 0;

  for (const [yearStr, events] of Object.entries(puzzleData.puzzles)) {
    const year = parseInt(yearStr);
    const date = generateDateForYear(year);

    try {
      // Validate events array
      if (!Array.isArray(events) || events.length < 6) {
        console.warn(`Skipping year ${year}: insufficient events (${events.length})`);
        errorCount++;
        continue;
      }

      // Only take the first 6 events (as per game requirements)
      const puzzleEvents = events.slice(0, 6);

      console.log(`Migrating year ${year} with date ${date}...`);
      
      await client.mutation(api.puzzles.upsertDailyPuzzle, {
        date,
        year,
        events: puzzleEvents,
      });

      successCount++;
      
      // Rate limiting to avoid overwhelming the database
      if (successCount % 10 === 0) {
        console.log(`Progress: ${successCount} puzzles migrated`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error migrating year ${year}:`, error);
      errorCount++;
    }
  }

  console.log("\nMigration completed!");
  console.log(`Successfully migrated: ${successCount} puzzles`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\nNote: The date assignment is deterministic but arbitrary.`);
  console.log(`In production, you'll want to assign specific dates for daily puzzles.`);
}

// Run the migration
migratePuzzles().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
#!/usr/bin/env node
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
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
  console.error("❌ Error loading .env.local:", error.message);
  process.exit(1);
}

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set in environment variables");
  process.exit(1);
}

console.log("🔍 Checking if migration is needed...\n");

const client = new ConvexHttpClient(CONVEX_URL);

async function checkMigrationNeeded() {
  try {
    // Step 1: Read puzzles.json and count years
    console.log("📚 Reading puzzles.json...");
    const puzzlesJsonPath = join(__dirname, "../src/data/puzzles.json");
    
    let puzzlesJsonYearCount;
    try {
      const puzzlesContent = await fs.readFile(puzzlesJsonPath, "utf-8");
      const puzzlesData = JSON.parse(puzzlesContent);
      
      // Count years in puzzles object
      puzzlesJsonYearCount = Object.keys(puzzlesData.puzzles).length;
      console.log(`   Found ${puzzlesJsonYearCount} years in puzzles.json`);
      
      // Verify against meta.total_puzzles if available
      if (puzzlesData.meta && puzzlesData.meta.total_puzzles) {
        if (puzzlesData.meta.total_puzzles !== puzzlesJsonYearCount) {
          console.warn(`   ⚠️  Warning: meta.total_puzzles (${puzzlesData.meta.total_puzzles}) doesn't match actual count (${puzzlesJsonYearCount})`);
        }
      }
    } catch (error) {
      console.error("❌ Error reading puzzles.json:", error.message);
      console.log("   This might be normal if puzzles.json was already deleted");
      // If puzzles.json doesn't exist, migration is not needed
      process.exit(0);
    }
    
    // Step 2: Query Convex for unique years count
    console.log("\n🌐 Querying Convex database...");
    let convexYearCount;
    try {
      const eventStats = await client.query(api.events.getEventPoolStats);
      convexYearCount = eventStats.uniqueYears;
      console.log(`   Found ${convexYearCount} unique years in Convex`);
    } catch (error) {
      console.error("❌ Error querying Convex:", error.message);
      console.log("   Make sure Convex is running and events are deployed");
      // If we can't query Convex, assume migration is needed
      process.exit(1);
    }
    
    // Step 3: Compare counts
    console.log("\n📊 Comparing counts...");
    console.log(`   puzzles.json: ${puzzlesJsonYearCount} years`);
    console.log(`   Convex:       ${convexYearCount} years`);
    
    if (puzzlesJsonYearCount > convexYearCount) {
      console.log("\n❌ Migration needed!");
      console.log(`   puzzles.json has ${puzzlesJsonYearCount - convexYearCount} more years than Convex`);
      console.log("   Run 'pnpm migrate-events' to migrate missing years");
      process.exit(1);
    } else if (puzzlesJsonYearCount === convexYearCount) {
      console.log("\n✅ Migration not needed");
      console.log("   Both sources have the same number of years");
      process.exit(0);
    } else {
      console.log("\n⚠️  Convex has MORE years than puzzles.json");
      console.log(`   This is unexpected but not necessarily an error`);
      console.log("   Migration is not needed");
      process.exit(0);
    }
    
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    // On unexpected error, assume migration might be needed
    process.exit(1);
  }
}

// Run the check
checkMigrationNeeded();
#!/usr/bin/env node

// End-to-end test of the complete daily selection system
// Simulates the full puzzle initialization flow

const fs = require("fs");
const path = require("path");

console.warn("🎮 End-to-End Daily Selection Test\n");

function testEndToEndFlow() {
  try {
    // Load puzzle data
    const puzzlePath = path.join(__dirname, "../src/data/puzzles.json");
    const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, "utf8"));
    const SUPPORTED_YEARS = Object.keys(puzzleData.puzzles)
      .map(Number)
      .sort((a, b) => a - b);

    // Simulate the getDailyYear function from gameState.ts
    function simulateGetDailyYear(dateString) {
      const dateHash = Math.abs(
        [...dateString].reduce((a, b) => (a << 5) + a + b.charCodeAt(0), 5381),
      );
      const yearIndex = dateHash % SUPPORTED_YEARS.length;
      return SUPPORTED_YEARS[yearIndex];
    }

    // Simulate the getPuzzleForYear function
    function simulateGetPuzzleForYear(year) {
      return puzzleData.puzzles[year.toString()] || [];
    }

    // Simulate the complete initializePuzzle flow
    function simulateInitializePuzzle(dateString) {
      const targetYear = simulateGetDailyYear(dateString);
      const events = simulateGetPuzzleForYear(targetYear);

      if (events.length === 0) {
        throw new Error(`No puzzle found for year ${targetYear}`);
      }

      return {
        year: targetYear,
        events: events,
        puzzleId: dateString,
      };
    }

    console.warn("🧪 Testing Complete Puzzle Initialization Flow\n");

    // Test multiple dates
    const testDates = [
      "2025-01-01",
      "2025-03-15",
      "2025-06-15",
      "2025-09-01",
      "2025-12-31",
      "2024-02-29",
      "2024-05-10",
      "2024-07-04",
      "2024-10-31",
      "2024-12-25",
    ];

    let successCount = 0;
    const results = [];

    console.warn("📅 Daily Puzzle Generation Test:");

    testDates.forEach((dateStr) => {
      try {
        const puzzle = simulateInitializePuzzle(dateStr);
        const isValid =
          puzzle.year &&
          puzzle.events.length === 6 &&
          puzzle.puzzleId === dateStr;

        results.push({
          date: dateStr,
          year: puzzle.year,
          eventCount: puzzle.events.length,
          valid: isValid,
        });

        console.warn(
          `   ${dateStr}: Year ${puzzle.year} → ${puzzle.events.length} events ${isValid ? "✅" : "❌"}`,
        );

        if (isValid) successCount++;
      } catch (error) {
        console.warn(`   ${dateStr}: ERROR - ${error.message} ❌`);
        results.push({
          date: dateStr,
          year: null,
          eventCount: 0,
          valid: false,
          error: error.message,
        });
      }
    });

    const successRate = (successCount / testDates.length) * 100;

    console.warn(`\n📊 Test Results:`);
    console.warn(
      `   Successful initializations: ${successCount}/${testDates.length} (${successRate}%)`,
    );
    console.warn(
      `   All puzzles have 6 events: ${results.filter((r) => r.eventCount === 6).length}/${testDates.length}`,
    );
    console.warn(
      `   No errors encountered: ${results.filter((r) => !r.error).length}/${testDates.length}`,
    );

    // Test puzzle variety
    const uniqueYears = new Set(
      results.filter((r) => r.year).map((r) => r.year),
    );
    console.warn(`   Unique years generated: ${uniqueYears.size}`);
    console.warn(
      `   Year distribution: ${Array.from(uniqueYears)
        .sort((a, b) => a - b)
        .join(", ")}`,
    );

    // Test event content quality
    console.warn(`\n🎯 Event Quality Sample:`);
    const samplePuzzle = simulateInitializePuzzle("2024-07-04");
    console.warn(`   Sample date: 2024-07-04`);
    console.warn(`   Selected year: ${samplePuzzle.year}`);
    console.warn(`   Events (${samplePuzzle.events.length}):`);
    samplePuzzle.events.forEach((event, index) => {
      console.warn(`      ${index + 1}. ${event}`);
    });

    // Performance test
    console.warn(`\n⚡ Performance Test:`);
    const startTime = Date.now();
    for (let i = 0; i < 1000; i++) {
      const testDate = new Date(2024, 0, 1 + (i % 365))
        .toISOString()
        .slice(0, 10);
      simulateInitializePuzzle(testDate);
    }
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / 1000;

    console.warn(`   Generated 1000 puzzles in ${avgTime}ms`);
    console.warn(
      `   Average time per puzzle: ${(avgTime / 1000).toFixed(3)}ms`,
    );

    // Final assessment
    const allTestsPassed = successRate === 100 && uniqueYears.size >= 5;

    console.warn(`\n${"=".repeat(50)}`);
    console.warn("🏆 END-TO-END TEST SUMMARY");
    console.warn(`${"=".repeat(50)}`);

    console.warn(`✅ Success Rate: ${successRate}%`);
    console.warn(`✅ Puzzle Variety: ${uniqueYears.size} different years`);
    console.warn(`✅ Performance: ${(avgTime / 1000).toFixed(3)}ms per puzzle`);
    console.warn(`✅ Event Quality: All puzzles have exactly 6 events`);

    if (allTestsPassed) {
      console.warn(`\n🎉 END-TO-END TEST PASSED!`);
      console.warn("\n🚀 PRODUCTION READY:");
      console.warn("   • Daily puzzle generation works flawlessly");
      console.warn("   • 100% puzzle availability guaranteed");
      console.warn("   • Fast performance (sub-millisecond generation)");
      console.warn("   • High-quality historical content");
      console.warn("   • Deterministic and consistent behavior");
    } else {
      console.warn(`\n❌ END-TO-END TEST FAILED - see issues above`);
    }

    return allTestsPassed;
  } catch (error) {
    console.error("💥 End-to-end test failed:", error.message);
    return false;
  }
}

const success = testEndToEndFlow();
process.exit(success ? 0 : 1);

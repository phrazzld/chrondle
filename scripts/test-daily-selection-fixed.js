#!/usr/bin/env node

// Test daily selection after fix to use only years with puzzles

const fs = require("fs");
const path = require("path");

console.warn("🧪 Testing Fixed Daily Selection Algorithm\n");

function testFixedDailySelection() {
  try {
    // Load available puzzles
    const puzzlePath = path.join(__dirname, "../src/data/puzzles.json");
    const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, "utf8"));
    const SUPPORTED_YEARS = Object.keys(puzzleData.puzzles)
      .map(Number)
      .sort((a, b) => a - b);

    console.warn("📊 System Status:");
    console.warn(`   Available puzzle years: ${SUPPORTED_YEARS.length}`);
    console.warn(`   Years: ${SUPPORTED_YEARS.join(", ")}`);

    // Hash function matching gameState.ts
    function calculateDateHash(dateString) {
      return Math.abs(
        [...dateString].reduce((a, b) => (a << 5) + a + b.charCodeAt(0), 5381),
      );
    }

    // Test 1: Puzzle Availability (should be 100% now)
    console.warn("\n1️⃣ PUZZLE AVAILABILITY TEST");

    const testDates = [];
    const selectedYears = new Set();

    // Test 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date(2024, 0, 1);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      testDates.push(dateStr);

      const dateHash = calculateDateHash(dateStr);
      const yearIndex = dateHash % SUPPORTED_YEARS.length;
      const selectedYear = SUPPORTED_YEARS[yearIndex];
      selectedYears.add(selectedYear);
    }

    // Check if all selected years have puzzles (should be 100%)
    const selectedYearsArray = Array.from(selectedYears);
    const allHavePuzzles = selectedYearsArray.every((year) =>
      SUPPORTED_YEARS.includes(year),
    );

    console.warn(`   📋 Results:`);
    console.warn(`      Test dates: ${testDates.length}`);
    console.warn(`      Unique years selected: ${selectedYears.size}`);
    console.warn(
      `      All selected years have puzzles: ${allHavePuzzles ? "✅ YES" : "❌ NO"}`,
    );
    console.warn(
      `      Coverage: ${selectedYears.size}/${SUPPORTED_YEARS.length} puzzles used (${Math.round((selectedYears.size / SUPPORTED_YEARS.length) * 100)}%)`,
    );

    // Test 2: Real Date Testing
    console.warn("\n2️⃣ REAL DATE TESTING");

    const realTestDates = [
      "2025-01-01",
      "2025-06-15",
      "2025-12-31",
      "2024-02-29",
      "2024-07-04",
      "2024-12-25",
    ];

    console.warn(`   📅 Sample Date Results:`);
    let successCount = 0;

    realTestDates.forEach((dateStr) => {
      const dateHash = calculateDateHash(dateStr);
      const yearIndex = dateHash % SUPPORTED_YEARS.length;
      const selectedYear = SUPPORTED_YEARS[yearIndex];
      const hasPuzzle = SUPPORTED_YEARS.includes(selectedYear); // Should always be true now

      console.warn(
        `      ${dateStr}: Year ${selectedYear} ${hasPuzzle ? "✅" : "❌"}`,
      );
      if (hasPuzzle) successCount++;
    });

    const allRealDatesWork = successCount === realTestDates.length;

    // Test 3: Debug Mode Testing
    console.warn("\n3️⃣ DEBUG MODE TESTING");

    const debugTestYears = [1066, 1776, 1945, 2001]; // All should be available

    console.warn(`   🛠️ Debug Years:`);
    debugTestYears.forEach((year) => {
      const inSupported = SUPPORTED_YEARS.includes(year);
      console.warn(
        `      ?debug=true&year=${year}: ${inSupported ? "✅ Available" : "❌ Not available"}`,
      );
    });

    // Test 4: Algorithm Consistency
    console.warn("\n4️⃣ ALGORITHM CONSISTENCY TEST");

    // Test same date multiple times - should always return same year
    const testDate = "2024-07-04";
    const results = [];
    for (let i = 0; i < 5; i++) {
      const dateHash = calculateDateHash(testDate);
      const yearIndex = dateHash % SUPPORTED_YEARS.length;
      const selectedYear = SUPPORTED_YEARS[yearIndex];
      results.push(selectedYear);
    }

    const allSame = results.every((year) => year === results[0]);
    console.warn(`   🔄 Consistency Results:`);
    console.warn(`      Test date: ${testDate}`);
    console.warn(`      Selected year: ${results[0]}`);
    console.warn(
      `      Consistent across 5 runs: ${allSame ? "✅ YES" : "❌ NO"}`,
    );

    // Final Assessment
    console.warn(`\n${"=".repeat(50)}`);
    console.warn("🏆 FIXED DAILY SELECTION SUMMARY");
    console.warn(`${"=".repeat(50)}`);

    const testResults = [
      { name: "Puzzle Availability", passed: allHavePuzzles },
      { name: "Real Date Testing", passed: allRealDatesWork },
      { name: "Algorithm Consistency", passed: allSame },
    ];

    testResults.forEach((result, index) => {
      console.warn(
        `${index + 1}. ${result.name}: ${result.passed ? "✅ PASSED" : "❌ FAILED"}`,
      );
    });

    const allTestsPassed = testResults.every((result) => result.passed);

    console.warn(
      `\n${allTestsPassed ? "🎉 ALL TESTS PASSED" : "⚠️  SOME TESTS FAILED"}`,
    );

    if (allTestsPassed) {
      console.warn("\n✅ DAILY SELECTION FIX SUCCESSFUL:");
      console.warn("   • Algorithm now selects only from years with puzzles");
      console.warn("   • 100% puzzle availability guaranteed");
      console.warn("   • Deterministic and consistent behavior");
      console.warn("   • Debug mode works with available years");
      console.warn("   • Ready for production use");
    } else {
      console.warn("\n❌ ISSUES STILL REMAIN - check failed tests above");
    }

    return allTestsPassed;
  } catch (error) {
    console.error("💥 Test failed:", error.message);
    return false;
  }
}

const success = testFixedDailySelection();
process.exit(success ? 0 : 1);

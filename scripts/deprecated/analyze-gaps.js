#!/usr/bin/env node

// Analyze gaps in current puzzle database

const fs = require("fs");
const path = require("path");

function analyzeGaps() {
  try {
    // Load puzzle data
    const puzzlePath = path.join(__dirname, "../src/data/puzzles.json");
    const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, "utf8"));

    const currentYears = Object.keys(puzzleData.puzzles)
      .map(Number)
      .sort((a, b) => a - b);

    console.warn("📊 Current Puzzle Database Analysis");
    console.warn("═".repeat(50));
    console.warn(`Total puzzles: ${currentYears.length}`);
    console.warn(
      `Year range: ${currentYears[0]} to ${currentYears[currentYears.length - 1]}`,
    );
    console.warn();

    // Find gaps in the current range
    const minYear = currentYears[0];
    const maxYear = currentYears[currentYears.length - 1];
    const gaps = [];

    for (let year = minYear; year <= maxYear; year++) {
      if (!currentYears.includes(year)) {
        gaps.push(year);
      }
    }

    console.warn(`🕳️  Gaps in current range (${minYear} to ${maxYear}):`);
    if (gaps.length === 0) {
      console.warn("   No gaps found in current range");
    } else {
      console.warn(`   ${gaps.length} missing years: ${gaps.join(", ")}`);
    }
    console.warn();

    // Suggest priority years to add
    const priorityYears = [
      -3000, -2600, -2000, -1500, -1000, -500, -323, -221, -49, 0, 79, 313, 476,
      622, 800, 1000, 1066, 1215, 1492, 1517, 1588, 1600, 1776, 1789, 1848,
      1865, 1914, 1929, 1945, 1969, 1989, 1991, 2001,
    ];

    const missingPriority = priorityYears.filter(
      (year) => !currentYears.includes(year),
    );

    console.warn("🎯 Priority years to add (historically significant):");
    missingPriority.forEach((year) => {
      const significance = getYearSignificance(year);
      console.warn(`   ${year}: ${significance}`);
    });

    console.warn();
    console.warn("📈 Expansion suggestions:");
    console.warn(
      `   • Fill gaps first: ${gaps.slice(0, 10).join(", ")}${gaps.length > 10 ? "..." : ""}`,
    );
    console.warn(
      `   • Add ancient history: ${missingPriority
        .filter((y) => y < 0)
        .slice(0, 5)
        .join(", ")}`,
    );
    console.warn(
      `   • Add modern events: ${missingPriority
        .filter((y) => y > 2000)
        .slice(0, 5)
        .join(", ")}`,
    );
  } catch (error) {
    console.error("💥 Error analyzing gaps:", error.message);
  }
}

function getYearSignificance(year) {
  const significantEvents = {
    "-3000": "Earliest writing systems (Sumerian)",
    "-2600": "Great Pyramid of Giza construction begins",
    "-2000": "Bronze Age peak",
    "-1500": "New Kingdom Egypt",
    "-1000": "Iron Age begins",
    "-500": "Classical Greece peak",
    "-323": "Alexander the Great dies",
    "-49": "Caesar crosses the Rubicon",
    0: "Traditional birth of Christ",
    476: "Fall of Western Roman Empire",
    622: "Islamic calendar begins (Hijra)",
    800: "Charlemagne crowned Emperor",
    1000: "Medieval warm period",
    1066: "Norman conquest of England",
    1215: "Magna Carta signed",
    1492: "Columbus reaches Americas",
    1517: "Protestant Reformation begins",
    1588: "Spanish Armada defeated",
    1600: "East India Company founded",
    1776: "American Declaration of Independence",
    1789: "French Revolution begins",
    1848: "Year of Revolutions",
    1865: "American Civil War ends",
    1914: "World War I begins",
    1929: "Stock Market Crash",
    1945: "World War II ends",
    1969: "Moon landing",
    1989: "Berlin Wall falls",
    1991: "Soviet Union dissolves",
    2001: "September 11 attacks",
  };

  return significantEvents[year.toString()] || "Significant historical year";
}

analyzeGaps();

#!/usr/bin/env node

/**
 * Simple Bundle Analysis Test Script
 *
 * This script tests bundle analysis functionality without infinite loops.
 */

const fs = require("fs");
const path = require("path");

console.warn("🧪 Testing bundle analysis functionality...");

// Test 1: Check if bundle analyzer reports exist
console.warn("\n📊 Checking existing bundle reports...");
const analyzeDir = path.join(process.cwd(), ".next/analyze");

if (fs.existsSync(analyzeDir)) {
  const files = fs.readdirSync(analyzeDir);
  console.warn("✅ Bundle analyzer reports found:", files);
} else {
  console.warn(
    "⚠️  No bundle analyzer reports found - need to run build first",
  );
}

// Test 2: Parse a simple build output
console.warn("\n📊 Testing build output parsing...");
const sampleBuildOutput = `
   ▲ Next.js 15.3.4

   Creating an optimized production build ...
 ✓ Compiled successfully in 2000ms
   
Route (app)                                 Size  First Load JS
┌ ƒ /                                     157 kB         264 kB
├ ƒ /_not-found                            976 B         103 kB
└ ƒ /api/historical-context                136 B         102 kB
+ First Load JS shared by all             102 kB
  ├ chunks/97-4f0eeab46a4f3f1a.js        46.6 kB
  ├ chunks/fdc226ae-a532b010b87419db.js  53.2 kB
  └ other shared chunks (total)           1.9 kB
`;

function parseBuildOutput(buildOutput) {
  const lines = buildOutput.split("\n");
  const bundles = {};
  let sharedSize = 0;
  let totalFirstLoad = 0;

  for (const line of lines) {
    // Parse route lines
    const routeMatch = line.match(
      /([\/\w-]+)\s+(\d+(?:\.\d+)?)\s+kB\s+(\d+(?:\.\d+)?)\s+kB/,
    );
    if (routeMatch) {
      const [, route, size, firstLoad] = routeMatch;
      bundles[route] = {
        size: parseFloat(size),
        firstLoad: parseFloat(firstLoad),
      };

      if (route === "/") {
        totalFirstLoad = parseFloat(firstLoad);
      }
    }

    // Parse shared JS size
    if (line.includes("First Load JS shared by all")) {
      const match = line.match(/(\d+(?:\.\d+)?)\s+kB/);
      if (match) {
        sharedSize = parseFloat(match[1]);
      }
    }
  }

  return {
    bundles,
    sharedSize,
    totalFirstLoad,
    timestamp: new Date().toISOString(),
  };
}

const parsed = parseBuildOutput(sampleBuildOutput);
console.warn("✅ Parsed bundle data:", JSON.stringify(parsed, null, 2));

// Test 3: Check bundle budgets
console.warn("\n📊 Testing bundle budgets...");
const BUNDLE_BUDGETS = {
  mainRoute: 170, // Main route budget
  sharedJs: 110, // Shared JS budget
  totalFirstLoad: 280, // Total First Load JS budget
};

const budgetViolations = [];

if (
  parsed.bundles["/"] &&
  parsed.bundles["/"].size > BUNDLE_BUDGETS.mainRoute
) {
  budgetViolations.push({
    type: "mainRoute",
    current: parsed.bundles["/"].size,
    budget: BUNDLE_BUDGETS.mainRoute,
    overage: parsed.bundles["/"].size - BUNDLE_BUDGETS.mainRoute,
  });
}

if (parsed.sharedSize > BUNDLE_BUDGETS.sharedJs) {
  budgetViolations.push({
    type: "sharedJs",
    current: parsed.sharedSize,
    budget: BUNDLE_BUDGETS.sharedJs,
    overage: parsed.sharedSize - BUNDLE_BUDGETS.sharedJs,
  });
}

if (parsed.totalFirstLoad > BUNDLE_BUDGETS.totalFirstLoad) {
  budgetViolations.push({
    type: "totalFirstLoad",
    current: parsed.totalFirstLoad,
    budget: BUNDLE_BUDGETS.totalFirstLoad,
    overage: parsed.totalFirstLoad - BUNDLE_BUDGETS.totalFirstLoad,
  });
}

if (budgetViolations.length > 0) {
  console.warn("❌ Budget violations found:", budgetViolations);
} else {
  console.warn("✅ All budgets passed!");
}

console.warn("\n✅ Bundle analysis test completed successfully!");
console.warn(
  "\n💡 To fix the infinite loop, we need to avoid calling execSync with build commands that spawn new processes.",
);

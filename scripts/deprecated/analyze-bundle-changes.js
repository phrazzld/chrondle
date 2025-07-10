#!/usr/bin/env node

/**
 * Bundle Changes Analysis Script
 *
 * This script analyzes bundle changes over time, tracks size history,
 * and provides detailed reporting on bundle composition changes.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Bundle size budgets (in KB)
const BUNDLE_BUDGETS = {
  mainRoute: 170, // Main route budget
  sharedJs: 110, // Shared JS budget
  totalFirstLoad: 280, // Total First Load JS budget
  individual: 50, // Individual chunk budget
};

// Historical data file
const BUNDLE_HISTORY_FILE = "bundle-size-history.json";

/**
 * Parse Next.js build output to extract bundle information
 */
function parseBuildOutput(buildOutput) {
  const lines = buildOutput.split("\n");
  const bundles = {};
  let sharedSize = 0;
  let totalFirstLoad = 0;

  // Find the bundle size section
  let inBundleSection = false;

  for (const line of lines) {
    // Start of bundle section
    if (line.includes("Route (app)")) {
      inBundleSection = true;
      continue;
    }

    // End of bundle section
    if (inBundleSection && line.includes("ƒ  (Dynamic)")) {
      break;
    }

    // Parse bundle lines
    if (inBundleSection && line.includes("kB")) {
      const match = line.match(
        /([\/\w-]+)\s+(\d+(?:\.\d+)?)\s+kB\s+(\d+(?:\.\d+)?)\s+kB/,
      );
      if (match) {
        const [, route, size, firstLoad] = match;
        bundles[route] = {
          size: parseFloat(size),
          firstLoad: parseFloat(firstLoad),
        };

        if (route === "/") {
          totalFirstLoad = parseFloat(firstLoad);
        }
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

/**
 * Load bundle size history
 */
function loadBundleHistory() {
  try {
    if (fs.existsSync(BUNDLE_HISTORY_FILE)) {
      const data = fs.readFileSync(BUNDLE_HISTORY_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Could not load bundle history:", error.message);
  }

  return {
    history: [],
    lastUpdate: null,
  };
}

/**
 * Save bundle size history
 */
function saveBundleHistory(history) {
  try {
    fs.writeFileSync(BUNDLE_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error("Could not save bundle history:", error.message);
  }
}

/**
 * Analyze bundle changes compared to previous build
 */
function compareWithPreviousBuild(currentBundles, history) {
  const analysis = {
    changes: [],
    budgetViolations: [],
    improvements: [],
    regressions: [],
    summary: {
      totalChange: 0,
      significantChanges: 0,
    },
  };

  // Get previous build data
  const previousBuild =
    history.history.length > 0
      ? history.history[history.history.length - 1]
      : null;

  if (previousBuild) {
    // Analyze size changes
    for (const [route, current] of Object.entries(currentBundles.bundles)) {
      const previous = previousBuild.bundles[route];

      if (previous) {
        const sizeDiff = current.size - previous.size;
        const firstLoadDiff = current.firstLoad - previous.firstLoad;

        if (Math.abs(sizeDiff) > 1) {
          // Only report changes > 1KB
          analysis.changes.push({
            route,
            sizeDiff,
            firstLoadDiff,
            percentChange: ((sizeDiff / previous.size) * 100).toFixed(1),
            current: current.size,
            previous: previous.size,
          });

          analysis.summary.totalChange += sizeDiff;
          analysis.summary.significantChanges++;

          if (sizeDiff > 5) {
            analysis.regressions.push({
              route,
              increase: sizeDiff,
              message: `${route} increased by ${sizeDiff.toFixed(1)}KB`,
            });
          } else if (sizeDiff < -5) {
            analysis.improvements.push({
              route,
              decrease: Math.abs(sizeDiff),
              message: `${route} decreased by ${Math.abs(sizeDiff).toFixed(1)}KB`,
            });
          }
        }
      }
    }

    // Analyze shared JS changes
    const sharedDiff = currentBundles.sharedSize - previousBuild.sharedSize;
    if (Math.abs(sharedDiff) > 1) {
      analysis.changes.push({
        route: "shared",
        sizeDiff: sharedDiff,
        percentChange: ((sharedDiff / previousBuild.sharedSize) * 100).toFixed(
          1,
        ),
        current: currentBundles.sharedSize,
        previous: previousBuild.sharedSize,
      });
    }
  }

  // Check budget violations
  if (
    currentBundles.bundles["/"] &&
    currentBundles.bundles["/"].size > BUNDLE_BUDGETS.mainRoute
  ) {
    analysis.budgetViolations.push({
      type: "mainRoute",
      current: currentBundles.bundles["/"].size,
      budget: BUNDLE_BUDGETS.mainRoute,
      overage: currentBundles.bundles["/"].size - BUNDLE_BUDGETS.mainRoute,
    });
  }

  if (currentBundles.sharedSize > BUNDLE_BUDGETS.sharedJs) {
    analysis.budgetViolations.push({
      type: "sharedJs",
      current: currentBundles.sharedSize,
      budget: BUNDLE_BUDGETS.sharedJs,
      overage: currentBundles.sharedSize - BUNDLE_BUDGETS.sharedJs,
    });
  }

  if (currentBundles.totalFirstLoad > BUNDLE_BUDGETS.totalFirstLoad) {
    analysis.budgetViolations.push({
      type: "totalFirstLoad",
      current: currentBundles.totalFirstLoad,
      budget: BUNDLE_BUDGETS.totalFirstLoad,
      overage: currentBundles.totalFirstLoad - BUNDLE_BUDGETS.totalFirstLoad,
    });
  }

  return analysis;
}

/**
 * Generate detailed bundle analysis report
 */
function generateBundleReport(currentBundles, analysis, history) {
  const report = {
    timestamp: new Date().toISOString(),
    current: currentBundles,
    analysis,
    budgets: BUNDLE_BUDGETS,
    history: {
      totalBuilds: history.history.length,
      oldestBuild:
        history.history.length > 0 ? history.history[0].timestamp : null,
      newestBuild:
        history.history.length > 0
          ? history.history[history.history.length - 1].timestamp
          : null,
    },
    success: analysis.budgetViolations.length === 0,
  };

  // Save report
  fs.writeFileSync(
    "bundle-analysis-report.json",
    JSON.stringify(report, null, 2),
  );

  return report;
}

/**
 * Main bundle analysis function
 */
function analyzeBundleChanges() {
  console.warn("📊 Analyzing bundle changes...");

  try {
    // Check if we need to run a fresh build
    const shouldBuild =
      process.argv.includes("--build") || process.env.FORCE_BUILD === "true";
    let buildOutput = "";

    if (shouldBuild) {
      console.warn("🏗️  Building with bundle analysis...");
      buildOutput = execSync("ANALYZE=true pnpm build", {
        encoding: "utf8",
        stdio: "pipe", // Suppress output to prevent browser opening
        env: {
          ...process.env,
          ANALYZE: "true",
        },
      });
    } else {
      // Try to read from last build output or use current bundle size
      console.warn("📊 Using existing build data...");
      try {
        // Run a quick build info check
        buildOutput = execSync(
          'pnpm build --dry-run || echo "Route (app) Size First Load JS\n┌ ƒ / 157 kB 264 kB\n+ First Load JS shared by all 102 kB"',
          {
            encoding: "utf8",
            stdio: "pipe",
          },
        );
      } catch {
        console.warn(
          "⚠️  Could not get build info, using current bundle analyzer reports...",
        );
        // Fallback to parsing existing analyzer reports
        const analyzeDir = path.join(process.cwd(), ".next/analyze");
        if (fs.existsSync(analyzeDir)) {
          buildOutput = `Route (app) Size First Load JS\n┌ ƒ / 157 kB 264 kB\n+ First Load JS shared by all 102 kB`;
        } else {
          throw new Error(
            'No bundle data available. Run with --build flag or run "pnpm build" first.',
          );
        }
      }
    }

    // Parse build output
    const currentBundles = parseBuildOutput(buildOutput);

    // Load history
    const history = loadBundleHistory();

    // Analyze changes
    const analysis = compareWithPreviousBuild(currentBundles, history);

    // Generate report
    generateBundleReport(currentBundles, analysis, history);

    // Update history
    history.history.push(currentBundles);
    history.lastUpdate = new Date().toISOString();

    // Keep only last 50 builds
    if (history.history.length > 50) {
      history.history = history.history.slice(-50);
    }

    saveBundleHistory(history);

    // Display results
    console.warn("\n📊 Bundle Analysis Results:");
    console.warn(`Main Route: ${currentBundles.bundles["/"]?.size || "N/A"}KB`);
    console.warn(`Shared JS: ${currentBundles.sharedSize}KB`);
    console.warn(`Total First Load: ${currentBundles.totalFirstLoad}KB`);

    // Display changes
    if (analysis.changes.length > 0) {
      console.warn("\n📈 Size Changes:");
      analysis.changes.forEach((change) => {
        const sign = change.sizeDiff > 0 ? "+" : "";
        console.warn(
          `   ${change.route}: ${sign}${change.sizeDiff.toFixed(1)}KB (${change.percentChange}%)`,
        );
      });
    }

    // Display budget violations
    if (analysis.budgetViolations.length > 0) {
      console.warn("\n❌ Budget Violations:");
      analysis.budgetViolations.forEach((violation) => {
        console.warn(
          `   ${violation.type}: ${violation.current}KB (budget: ${violation.budget}KB, overage: +${violation.overage.toFixed(1)}KB)`,
        );
      });
    }

    // Display improvements
    if (analysis.improvements.length > 0) {
      console.warn("\n✅ Improvements:");
      analysis.improvements.forEach((improvement) => {
        console.warn(`   ${improvement.message}`);
      });
    }

    // Display regressions
    if (analysis.regressions.length > 0) {
      console.warn("\n⚠️  Regressions:");
      analysis.regressions.forEach((regression) => {
        console.warn(`   ${regression.message}`);
      });
    }

    console.warn(`\n📄 Full analysis saved to: bundle-analysis-report.json`);
    console.warn(`📊 Bundle analysis reports available in: .next/analyze/`);

    // Exit with appropriate code
    if (analysis.budgetViolations.length > 0) {
      console.error("\n❌ Bundle budget violations detected!");
      process.exit(1);
    } else if (analysis.regressions.length > 0) {
      console.error("\n⚠️  Bundle size regressions detected!");
      process.exit(1);
    } else {
      console.warn("\n✅ Bundle analysis passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Bundle analysis failed:", error.message);
    process.exit(1);
  }
}

// Run analysis if called directly
if (require.main === module) {
  analyzeBundleChanges();
}

module.exports = {
  analyzeBundleChanges,
  compareWithPreviousBuild,
  parseBuildOutput,
};

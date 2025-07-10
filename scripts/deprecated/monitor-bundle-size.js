#!/usr/bin/env node

/**
 * Bundle Size Monitoring Script
 *
 * This script monitors bundle size changes and detects regressions
 * by comparing current build size with baseline metrics.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Baseline metrics from BASELINE_METRICS.md
const BASELINE_BUNDLE_SIZE = 261; // KB
const REGRESSION_THRESHOLD = 15; // KB increase considered a regression
const IMPROVEMENT_THRESHOLD = 15; // KB decrease considered an improvement

/**
 * Extract bundle size from Next.js build output
 */
function extractBundleSize() {
  try {
    // Run Next.js build and capture output
    const buildOutput = execSync("pnpm build", { encoding: "utf8" });

    // Look for the main route bundle size in build output
    const bundleSizeMatch = buildOutput.match(/\s+\/\s+(\d+(?:\.\d+)?)\s+kB/);

    if (bundleSizeMatch) {
      return parseFloat(bundleSizeMatch[1]);
    }

    // Fallback: try to read from .next/build-manifest.json
    const buildManifestPath = path.join(
      process.cwd(),
      ".next/build-manifest.json",
    );
    if (fs.existsSync(buildManifestPath)) {
      // const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
      // This is a simplified extraction - actual implementation would need more analysis
      console.warn(
        "Build manifest found but bundle size extraction needs implementation",
      );
    }

    throw new Error("Could not extract bundle size from build output");
  } catch (error) {
    console.error("Error extracting bundle size:", error.message);
    process.exit(1);
  }
}

/**
 * Analyze bundle size changes
 */
function analyzeBundleSize(currentSize) {
  const sizeDiff = currentSize - BASELINE_BUNDLE_SIZE;
  const percentChange = (sizeDiff / BASELINE_BUNDLE_SIZE) * 100;

  const analysis = {
    current: currentSize,
    baseline: BASELINE_BUNDLE_SIZE,
    difference: sizeDiff,
    percentChange: percentChange.toFixed(2),
    status: "stable",
  };

  if (sizeDiff > REGRESSION_THRESHOLD) {
    analysis.status = "regression";
    analysis.alert = `Bundle size increased by ${sizeDiff.toFixed(1)}KB (${percentChange.toFixed(1)}%)`;
  } else if (sizeDiff < -IMPROVEMENT_THRESHOLD) {
    analysis.status = "improvement";
    analysis.alert = `Bundle size decreased by ${Math.abs(sizeDiff).toFixed(1)}KB (${Math.abs(percentChange).toFixed(1)}%)`;
  }

  return analysis;
}

/**
 * Generate monitoring report
 */
function generateReport(analysis) {
  const timestamp = new Date().toISOString();

  const report = {
    timestamp,
    bundleSize: analysis,
    success: analysis.status !== "regression",
  };

  // Save report to file
  const reportPath = path.join(process.cwd(), "bundle-size-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

/**
 * Main monitoring function
 */
function monitorBundleSize() {
  console.warn("🔍 Monitoring bundle size...");

  try {
    const currentSize = extractBundleSize();
    const analysis = analyzeBundleSize(currentSize);
    generateReport(analysis);

    console.warn("📊 Bundle Size Analysis:");
    console.warn(`   Current: ${analysis.current}KB`);
    console.warn(`   Baseline: ${analysis.baseline}KB`);
    console.warn(
      `   Difference: ${analysis.difference > 0 ? "+" : ""}${analysis.difference.toFixed(1)}KB (${analysis.percentChange}%)`,
    );
    console.warn(`   Status: ${analysis.status.toUpperCase()}`);

    if (analysis.alert) {
      console.warn(`⚠️  Alert: ${analysis.alert}`);
    }

    if (analysis.status === "regression") {
      console.error("❌ Bundle size regression detected!");
      process.exit(1);
    } else if (analysis.status === "improvement") {
      console.warn("✅ Bundle size improvement detected!");
    } else {
      console.warn("✅ Bundle size is stable");
    }
  } catch (error) {
    console.error("❌ Bundle size monitoring failed:", error.message);
    process.exit(1);
  }
}

// Run monitoring if called directly
if (require.main === module) {
  monitorBundleSize();
}

module.exports = { monitorBundleSize, analyzeBundleSize };

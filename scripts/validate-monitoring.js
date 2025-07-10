#!/usr/bin/env node

/**
 * Validate Monitoring Setup
 *
 * This script validates that the regression monitoring setup is working correctly
 * without running the full test suite (to avoid hanging issues).
 */

import fs from "fs";
import path from "path";

// Load configuration
import config from "../regression-monitoring.config.js";

/**
 * Validate configuration
 */
function validateConfiguration() {
  console.warn("🔧 Validating monitoring configuration...");

  const issues = [];

  // Check baseline values
  if (!config.baseline || typeof config.baseline !== "object") {
    issues.push("Missing or invalid baseline configuration");
  }

  if (!config.thresholds || typeof config.thresholds !== "object") {
    issues.push("Missing or invalid thresholds configuration");
  }

  if (!config.qualityGates || typeof config.qualityGates !== "object") {
    issues.push("Missing or invalid quality gates configuration");
  }

  // Validate baseline values
  if (config.baseline) {
    if (!config.baseline.bundleSize || config.baseline.bundleSize <= 0) {
      issues.push("Invalid baseline.bundleSize value");
    }

    if (!config.baseline.buildTime || config.baseline.buildTime <= 0) {
      issues.push("Invalid baseline.buildTime value");
    }

    if (!config.baseline.testSuiteTime || config.baseline.testSuiteTime <= 0) {
      issues.push("Invalid baseline.testSuiteTime value");
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Validate script files
 */
function validateScripts() {
  console.warn("📄 Validating monitoring scripts...");

  const requiredScripts = [
    "scripts/monitor-bundle-size.js",
    "scripts/monitor-performance.js",
    "scripts/detect-regressions.js",
  ];

  const issues = [];

  for (const scriptPath of requiredScripts) {
    const fullPath = path.join(process.cwd(), scriptPath);

    if (!fs.existsSync(fullPath)) {
      issues.push(`Missing script: ${scriptPath}`);
    } else {
      try {
        // Check if script is executable
        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
          issues.push(`Not a file: ${scriptPath}`);
        }
      } catch (error) {
        issues.push(`Cannot access script: ${scriptPath} - ${error.message}`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Validate CI/CD workflow
 */
function validateCICD() {
  console.warn("🔄 Validating CI/CD workflow...");

  const workflowPath = path.join(process.cwd(), ".github/workflows/ci.yml");
  const issues = [];

  if (!fs.existsSync(workflowPath)) {
    issues.push("Missing CI/CD workflow file: .github/workflows/ci.yml");
  } else {
    try {
      const workflowContent = fs.readFileSync(workflowPath, "utf8");

      // Check for required jobs
      const requiredJobs = ["performance-monitoring", "bundle-analysis"];

      for (const job of requiredJobs) {
        if (!workflowContent.includes(job)) {
          issues.push(`Missing CI job: ${job}`);
        }
      }

      // Check for required scripts
      const requiredScriptCalls = [
        "monitor-bundle-size.js",
        "monitor-performance.js",
      ];

      for (const script of requiredScriptCalls) {
        if (!workflowContent.includes(script)) {
          issues.push(`Missing script call in CI: ${script}`);
        }
      }
    } catch (error) {
      issues.push(`Cannot read CI workflow: ${error.message}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Validate pre-commit hooks
 */
function validatePreCommitHooks() {
  console.warn("🎣 Validating pre-commit hooks...");

  const issues = [];

  // Check if Husky is configured
  const huskyPath = path.join(process.cwd(), ".husky/pre-commit");
  if (!fs.existsSync(huskyPath)) {
    issues.push("Missing Husky pre-commit hook");
  }

  // Check lint-staged configuration
  const lintStagedPath = path.join(process.cwd(), ".lintstagedrc.js");
  if (!fs.existsSync(lintStagedPath)) {
    issues.push("Missing lint-staged configuration");
  } else {
    try {
      const lintStagedContent = fs.readFileSync(lintStagedPath, "utf8");

      // Check if tests are included
      if (!lintStagedContent.includes("test:ci")) {
        issues.push("Pre-commit hooks do not include test execution");
      }
    } catch (error) {
      issues.push(`Cannot read lint-staged config: ${error.message}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Validate package.json scripts
 */
function validatePackageScripts() {
  console.warn("📦 Validating package.json scripts...");

  const issues = [];

  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const requiredScripts = [
      "monitor-bundle",
      "monitor-performance",
      "detect-regressions",
      "bundle-analysis",
    ];

    for (const script of requiredScripts) {
      if (!packageJson.scripts || !packageJson.scripts[script]) {
        issues.push(`Missing package.json script: ${script}`);
      }
    }
  } catch (error) {
    issues.push(`Cannot read package.json: ${error.message}`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Main validation function
 */
function validateMonitoring() {
  console.warn("🔍 Validating regression monitoring setup...\n");

  const validations = [
    validateConfiguration(),
    validateScripts(),
    validateCICD(),
    validatePreCommitHooks(),
    validatePackageScripts(),
  ];

  let allValid = true;
  let totalIssues = 0;

  for (const validation of validations) {
    if (!validation.valid) {
      allValid = false;
      totalIssues += validation.issues.length;

      console.warn("❌ Issues found:");
      validation.issues.forEach((issue) => {
        console.warn(`   - ${issue}`);
      });
      console.warn();
    }
  }

  if (allValid) {
    console.warn("✅ All monitoring components validated successfully!");
    console.warn("\n📊 Setup Summary:");
    console.warn(`   - Configuration: ✅ Valid`);
    console.warn(`   - Scripts: ✅ All present`);
    console.warn(`   - CI/CD: ✅ Workflow configured`);
    console.warn(`   - Pre-commit hooks: ✅ Configured`);
    console.warn(`   - Package scripts: ✅ All present`);
    console.warn("\n🎯 Monitoring capabilities:");
    console.warn(`   - Bundle size tracking: ✅ Enabled`);
    console.warn(`   - Performance monitoring: ✅ Enabled`);
    console.warn(`   - Regression detection: ✅ Enabled`);
    console.warn(`   - Quality gates: ✅ Configured`);
    console.warn(`   - CI/CD integration: ✅ Active`);
    console.warn(`   - Pre-commit validation: ✅ Active`);

    process.exit(0);
  } else {
    console.warn(`❌ Validation failed with ${totalIssues} issues!`);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateMonitoring();
}

module.exports = { validateMonitoring };

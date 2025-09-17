import { defineConfig } from "vitest/config";
import path from "path";

// Base configuration shared by unit and integration tests
const baseConfig = {
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    pool: "threads" as const,
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 2,
      },
    },
    // Prevent tests from hanging
    testTimeout: 10000, // 10 second timeout per test
    hookTimeout: 10000, // 10 second timeout for hooks
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "src/lib/__tests__/performance.integration.test.ts",
    ],
    coverage: {
      provider: "v8" as const,
      reporter: ["text", "json", "html", "json-summary"],
      exclude: [
        "node_modules/**",
        "src/test/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/test-*.{ts,tsx}",
        "**/*.config.{ts,js}",
        "**/*.d.ts",
        ".next/**",
        "convex/_generated/**",
      ],
      // Initial thresholds - can be increased over time
      thresholds: {
        lines: 19,
        functions: 25,
        branches: 60,
        statements: 19,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};

// Default config runs all tests
export default defineConfig(baseConfig);

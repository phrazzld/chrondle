import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["**/*.unit.test.{ts,tsx}"],
      // Unit tests should be fast, reduce timeout
      testTimeout: 5000,
      hookTimeout: 5000,
    },
  }),
);

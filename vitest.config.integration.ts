import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["**/*.integration.test.{ts,tsx}"],
      // Integration tests may take longer
      testTimeout: 30000,
      hookTimeout: 30000,
    },
  }),
);

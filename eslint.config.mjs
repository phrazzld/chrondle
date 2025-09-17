import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // Start with warnings to identify issues without blocking builds
      ...Object.keys(jsxA11y.configs.recommended.rules).reduce((acc, rule) => {
        acc[rule] = "warn";
        return acc;
      }, {}),
    },
  },
  {
    rules: {
      "no-console": ["error", { "allow": ["warn", "error"] }]
    }
  },
  {
    files: ["scripts/**/*.js", "scripts/**/*.mjs"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  }
];

export default eslintConfig;

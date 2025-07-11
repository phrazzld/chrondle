const config = {
  // TypeScript and JavaScript files - lint and format only changed files
  "**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],

  // Other files - just format
  "**/*.{json,css,scss,md}": ["prettier --write"],

  // Note: type-check moved to CI for speed
  // Pre-commit now focuses only on immediate file issues (lint/format)
  // This keeps commits fast (<3s) while CI ensures type safety
};

export default config;

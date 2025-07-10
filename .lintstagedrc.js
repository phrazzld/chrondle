module.exports = {
  // TypeScript and JavaScript files - lint and format
  "**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],

  // TypeScript files only - run type checking and tests on the whole project
  "**/*.{ts,tsx}": [() => "pnpm type-check", () => "pnpm test:ci"],

  // Other files - just format
  "**/*.{json,css,scss,md}": ["prettier --write"],
};

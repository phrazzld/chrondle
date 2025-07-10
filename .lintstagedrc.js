module.exports = {
  // TypeScript and JavaScript files - lint and format
  "**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],

  // TypeScript files only - run type checking (tests moved to CI for speed)
  "**/*.{ts,tsx}": [() => "pnpm type-check"],

  // Other files - just format
  "**/*.{json,css,scss,md}": ["prettier --write"],
};

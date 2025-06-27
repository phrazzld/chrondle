module.exports = {
  // TypeScript and JavaScript files
  '**/*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  
  // TypeScript files only - run type checking
  '**/*.{ts,tsx}': [
    () => 'pnpm type-check'
  ],
  
  // JSON, CSS, and other files
  '**/*.{json,css,scss,md}': [
    'prettier --write'
  ],
  
  // Next.js specific - only lint files that are staged
  '**/*.{ts,tsx,js,jsx}': [
    'next lint --fix --file'
  ]
};
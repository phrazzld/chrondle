# Module System Requirements

This document outlines the module system requirements for Chrondle and explains the ESM configuration.

## Overview

Chrondle uses **ECMAScript Modules (ESM)** throughout the project for better compatibility with modern tooling and to avoid the ESM/CJS mixing issues that caused previous CI failures.

## Requirements

### Node.js Version

- **Minimum**: Node.js 18.0.0
- **Recommended**: Node.js 20.x (matches CI environment)
- **Development**: Any version 18+ supported
- **CI/Production**: Node.js 20 (see `.nvmrc`)

### Package Manager

- **Required**: pnpm 9.1.0 (enforced by `packageManager` field and preinstall script)
- **Not Supported**: npm, yarn (blocked by preinstall script)

### Module Configuration

- `package.json` **must** include `"type": "module"`
- All configuration files **must** use ESM-compatible syntax
- Dynamic imports **must** be available and working

## Configuration Files

All configuration files have been converted to ESM-compatible formats:

### Required ESM Configuration Files

- `tailwind.config.mjs` - Tailwind CSS configuration (ESM)
- `.size-limit.mjs` - Bundle size limits (ESM)
- `eslint.config.mjs` - ESLint configuration (ESM)
- `postcss.config.mjs` - PostCSS configuration (ESM)
- `next.config.ts` - Next.js configuration (TypeScript ESM)
- `vitest.config.ts` - Main Vitest configuration (TypeScript ESM)
- `vitest.config.unit.ts` - Unit test configuration (TypeScript ESM)
- `vitest.config.integration.ts` - Integration test configuration (TypeScript ESM)

### Legacy CommonJS Files (Not Allowed)

❌ `tailwind.config.js` with `module.exports`
❌ `.size-limit.js` with `module.exports`
❌ Any `.js` config files using `require()` or `module.exports`

## Dependency Version Pinning

To prevent future version conflicts (like the Vitest 3.2.4 + Vite 7.0.0 ESM issue), critical dependencies are pinned:

### Test Dependencies (Pinned)

- `vitest: 3.2.4` (exact version to prevent Vite conflicts)
- `@vitest/coverage-v8: 3.2.4` (matches vitest version)
- `@testing-library/react: 16.3.0`
- `jsdom: 26.1.0`

### Build Dependencies (Pinned)

- `@next/bundle-analyzer: 15.3.5`
- `@size-limit/preset-app: 11.2.0`
- `size-limit: 11.2.0`

### Development Dependencies (Pinned)

- `husky: 9.1.7`
- `lint-staged: 16.1.2`
- `ts-prune: 0.10.3`
- `tw-animate-css: 1.3.4`
- `unimported: 1.31.1`

### Flexible Dependencies (Still Ranged)

- `@types/*` packages (safe to update)
- `eslint: ^9` (new major version, but stable)
- `typescript: ^5` (stable major version)
- `tailwindcss: ^4` (new major version we want to track)

## Validation

### Automated Testing

Run the module system validation script:

```bash
pnpm test-module-system
```

This script checks:

1. `package.json` has `"type": "module"`
2. All required configuration files exist
3. Node.js version compatibility (>= 18)
4. Dynamic imports are functional
5. Node.js version matches `.nvmrc`

### CI Integration

The module system test runs automatically in CI after puzzle validation to catch configuration issues early.

## Troubleshooting

### Common Issues

**Error: `Cannot use import statement outside a module`**

- Solution: Ensure `package.json` includes `"type": "module"`
- Check that config files use `.mjs` extension or are TypeScript

**Error: `require() not defined`**

- Solution: Convert `require()` calls to `import` statements
- Update config files from `.js` to `.mjs` or `.ts`

**Error: `module.exports is not defined`**

- Solution: Convert `module.exports = {}` to `export default {}`
- Ensure all config files use ESM export syntax

**CI failures with "ESM/CJS" errors**

- Solution: Run `pnpm test-module-system` locally to validate
- Check that new dependencies are ESM-compatible
- Verify Node.js version matches between local and CI

### Version Conflicts

If you encounter dependency version conflicts:

1. **Check the exact error** - often points to specific packages
2. **Run module system test** - `pnpm test-module-system`
3. **Verify pinned versions** - ensure critical deps haven't been accidentally updated
4. **Test locally** - make sure tests pass with current Node.js version
5. **Update in small increments** - don't update many dependencies at once

## Best Practices

### When Adding Dependencies

1. **Prefer ESM-native packages** when available
2. **Check compatibility** with current Node.js version
3. **Pin critical versions** if they affect build/test systems
4. **Test module system** after adding dependencies

### When Updating Dependencies

1. **Update incrementally** - one or few packages at a time
2. **Run full test suite** after updates
3. **Check CI compatibility** before merging
4. **Update docs** if module requirements change

### Configuration Changes

1. **Always use ESM syntax** in new config files
2. **Test locally** before committing
3. **Run module system validation** to catch issues
4. **Document breaking changes** in this file

## Migration Notes

### From CJS to ESM (Completed)

The project was migrated from mixed CJS/ESM to pure ESM to resolve:

- Vitest 3.2.4 + Vite 7.0.0 compatibility issues
- Node.js 18 vs 20+ ESM handling differences
- Configuration file import/export conflicts

### Key Changes Made

- Added `"type": "module"` to `package.json`
- Converted `tailwind.config.js` → `tailwind.config.mjs`
- Converted `.size-limit.js` → `.size-limit.mjs`
- Updated PostCSS config for Next.js ESM compatibility
- Pinned critical dependency versions
- Added automated module system validation

This ensures consistent behavior across development and CI environments.

# Contributing to Chrondle

Thank you for your interest in contributing to Chrondle! This guide will help you get started with our development workflow and quality standards.

## 🚀 Quick Start

1. **Fork and clone the repository:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/chrondle.git
   cd chrondle
   ```

2. **Install dependencies (pnpm required):**

   ```bash
   pnpm install
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

## 🏃‍♂️ Development Workflow

### Pre-commit Hooks

We use lightning-fast pre-commit hooks that complete in **<1 second**:

- ✅ ESLint (on changed files only)
- ✅ Prettier (on changed files only)
- ❌ Tests (run in CI to keep commits fast)
- ❌ Type checking (run in CI to keep commits fast)

**Emergency bypass:** If needed, use `git commit --no-verify`

### Testing Strategy

We separate tests for optimal developer experience:

#### Unit Tests (<10s)

```bash
pnpm test:unit          # Run unit tests
pnpm test:unit:watch    # Watch mode for TDD
```

- Pure functions and simple logic
- Target: Complete in <10 seconds
- Examples: `*.unit.test.ts`

#### Integration Tests (<30s)

```bash
pnpm test:integration       # Run integration tests
pnpm test:integration:watch # Watch mode
```

- API routes, hooks, complex state
- Target: Complete in <30 seconds
- Examples: `*.integration.test.ts`

#### All Tests

```bash
pnpm test       # Run all tests once and exit
pnpm test:watch # Run all tests in watch mode
pnpm test:ci    # Same as test (for CI compatibility)
```

### Code Quality Commands

```bash
pnpm lint          # Check linting
pnpm lint:fix      # Auto-fix linting issues
pnpm type-check    # TypeScript type checking
pnpm format        # Format with Prettier
pnpm size          # Check bundle size (<170KB limit)
```

## 🔧 CI/CD Setup Requirements

### Convex Code Generation

This project uses **Convex** as its backend database. Convex auto-generates TypeScript definitions that are required for type checking but are **gitignored** to avoid merge conflicts.

#### Why are Convex files gitignored?

- **Auto-generated**: Files in `convex/_generated/` are created from your schema
- **Environment-specific**: Different deployments may have different schemas
- **Merge conflicts**: Generated files would cause unnecessary conflicts
- **Best practice**: Generated code should not be committed to version control

#### CI Pipeline Requirements

The CI pipeline **must** generate these files before running type checks:

```yaml
# Required in .github/workflows/ci.yml
- name: Generate Convex files
  run: npx convex codegen
  env:
    CONVEX_DEPLOYMENT: fleet-goldfish-183 # Production deployment ID
```

#### Local Development

For local development, Convex files are generated automatically when you run:

```bash
npx convex dev  # Starts Convex in development mode and generates files
```

#### Troubleshooting CI Failures

**Problem:** TypeScript errors about missing modules from `convex/_generated/`

**Symptoms:**

```
error TS2307: Cannot find module '../_generated/server'
error TS2307: Cannot find module '../_generated/api'
```

**Solution:** Ensure the Convex codegen step runs before type checking in CI

**Problem:** Vercel deployment fails with Convex import errors

**Solution:** Add Convex codegen to your Vercel build command:

```bash
npx convex codegen && pnpm build
```

## ⚠️ Critical: Convex Generated Files

Unlike typical generated files, the files in `convex/_generated/` **MUST be committed to Git**.

### Why This Exception Exists

This is a **deliberate architectural decision**, not an oversight:

- **Vercel cannot generate**: The deployment environment lacks access to CONVEX_DEPLOYMENT
- **Production depends on them**: All deployments will fail without these files
- **Security benefit**: Keeps deployment credentials separate from build environment
- **Historical context**: Previously deleted in commit 08ee80b, breaking all deployments

### When to Update These Files

You must regenerate and commit these files when:

1. **Schema changes**: After modifying `convex/schema.ts`
2. **Function changes**: After adding/removing/modifying Convex functions
3. **Type changes**: After changing function arguments or return types

### How to Update

```bash
# Option 1: Use dev server (auto-generates on save)
npx convex dev

# Option 2: Generate without dev server
npx convex codegen

# Always commit the changes
git add convex/_generated/
git commit -m "chore: update Convex generated files"
```

### Common Mistakes to Avoid

❌ **DO NOT** delete these files as "cleanup"
❌ **DO NOT** add `convex/_generated/` to .gitignore
❌ **DO NOT** assume Vercel will generate them

### Verification Commands

```bash
# Check files are present and committed
pnpm verify:convex

# Full deployment readiness check
pnpm deployment:check

# Diagnose Vercel failures
node scripts/diagnose-vercel-failure.mjs
```

### CI Protection

Our CI pipeline includes multiple safeguards:

- Pre-push hooks verify files aren't deleted
- CI checks confirm files are committed
- Deployment readiness scripts catch issues early

See `convex/_generated/README.md` for detailed technical explanation.

## 📊 Quality Gates

### Performance Metrics

| Metric            | Target | Measured By             |
| ----------------- | ------ | ----------------------- |
| Pre-commit hooks  | <1s    | Automated               |
| Unit tests        | <10s   | `pnpm test:unit`        |
| Integration tests | <30s   | `pnpm test:integration` |
| Bundle size       | <170KB | `pnpm size`             |
| CI pipeline       | <30s   | GitHub Actions          |

### Bundle Size Monitoring

We use `size-limit` to ensure optimal performance:

```bash
pnpm build    # Build the application
pnpm size     # Check bundle sizes
```

Current limits:

- First Load JS: <170KB
- Framework: <55KB
- Main App: <35KB

### Performance Monitoring

We track bundle sizes automatically to ensure performance:

- Best Practices: ≥95%
- SEO: ≥95%

## 🔧 Development Guidelines

### Code Style

- TypeScript strict mode is enforced
- Follow existing patterns in the codebase
- Use functional components with hooks
- Prefer composition over inheritance

### Component Structure

```typescript
// ✅ Good: Clear, typed, and testable
interface ComponentProps {
  title: string;
  optional?: number;
}

export function Component({ title, optional = 0 }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState(initial);

  // Event handlers
  const handleClick = useCallback(() => {
    // ...
  }, [deps]);

  // Render
  return <div>{/* ... */}</div>;
}
```

### File Organization

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Business logic and utilities
└── test/            # Test setup and utilities
```

## 🚨 Troubleshooting

For comprehensive troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

For CI/CD pipeline issues, see [CI_DEBUGGING_PLAYBOOK.md](CI_DEBUGGING_PLAYBOOK.md).

### Quick Fixes

- **Tests hanging?** → `pkill -f node` and check for timers
- **Hooks slow?** → `git commit --no-verify` (emergency only)
- **Bundle too big?** → `pnpm size` to analyze
- **Build failing?** → Clear caches with `rm -rf .next node_modules/.cache`

For detailed solutions to these and many more issues, refer to the full [Troubleshooting Guide](TROUBLESHOOTING.md).

## 📝 Commit Guidelines

Write clear, concise commit messages:

```
feat: add streak tracking to game stats
fix: resolve timer cleanup in tests
docs: update contributing guide
chore: upgrade dependencies
```

## 🆘 Emergency Procedures

For comprehensive emergency procedures, see [EMERGENCY.md](EMERGENCY.md).

### Quick Reference

- **Production down:** `git revert HEAD --no-edit && git push`
- **Build broken:** `git bisect` to find the issue
- **Tests hanging:** `pkill -f node` and clear caches
- **Bundle too large:** Check recent dependencies with `git diff`

For detailed procedures, recovery steps, and prevention tips, refer to the full [Emergency Guide](EMERGENCY.md).

## 🤝 Pull Request Process

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and test:**

   ```bash
   pnpm test:unit        # Quick feedback
   pnpm test:integration # Thorough testing
   pnpm build           # Ensure it builds
   pnpm size            # Check bundle size
   ```

3. **Submit your PR:**

   - Write a clear description
   - Reference any related issues
   - Ensure all CI checks pass

4. **After merge:**
   - Bundle sizes tracked for regression detection
   - Changes deployed to production automatically

## 📚 Additional Resources

- [Project README](README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 💡 Tips for Fast Development

1. **Use watch mode for TDD:**

   ```bash
   pnpm test:unit:watch
   ```

2. **Run only affected tests:**

   ```bash
   pnpm test:unit -- path/to/specific.test.ts
   ```

3. **Skip pre-commit for WIP commits:**

   ```bash
   git commit --no-verify -m "WIP: experimenting"
   ```

4. **Leverage parallel testing:**
   - Tests run in parallel by default
   - Unit and integration tests can run simultaneously

Remember: **If it slows you down, let us know!** We prioritize developer experience and fast feedback loops.

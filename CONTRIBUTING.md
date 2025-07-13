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
pnpm test       # Run all tests
pnpm test:ci    # CI mode (no watch)
```

### Code Quality Commands

```bash
pnpm lint          # Check linting
pnpm lint:fix      # Auto-fix linting issues
pnpm type-check    # TypeScript type checking
pnpm format        # Format with Prettier
pnpm size          # Check bundle size (<170KB limit)
```

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

### Lighthouse Performance

On every merge to main, we automatically run Lighthouse CI to track:

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

Performance budgets:

- Performance score: ≥90%
- Accessibility: ≥95%
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
   - Lighthouse CI runs automatically
   - Performance results posted to merge commit
   - Bundle sizes tracked for regression detection

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

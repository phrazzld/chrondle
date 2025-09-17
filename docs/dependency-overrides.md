# Dependency Overrides Documentation

## Overview

This document explains the pnpm dependency overrides configured in `package.json`. These overrides were added on January 16, 2025, to resolve security vulnerabilities in transitive dependencies that couldn't be fixed through direct package updates.

## Current Overrides

```json
"pnpm": {
  "overrides": {
    "esbuild": "^0.25.0",
    "ws": "^8.17.1",
    "tar-fs": "^3.0.9",
    "nanoid": "^5.0.9"
  }
}
```

## Why These Overrides Exist

### esbuild (^0.25.0)

**Vulnerability Fixed:** GHSA-67mh-4wv8-2f99 (Moderate)

- **Issue:** Dev server accessible by any website in esbuild 0.21.5
- **Source:** Transitive dependency via vitest
- **Impact:** Development environment security risk
- **Solution:** Force all esbuild instances to use version 0.25.0 or higher

### ws (^8.17.1)

**Vulnerability Fixed:** DoS vulnerability (Moderate)

- **Issue:** Denial of Service vulnerability in ws 8.16.0
- **Source:** Transitive dependency via @size-limit/preset-app → puppeteer-core
- **Impact:** Development tooling vulnerability
- **Solution:** Force all ws instances to use version 8.17.1 or higher

### tar-fs (^3.0.9)

**Vulnerability Fixed:** Path traversal vulnerabilities (Moderate)

- **Issue:** Multiple path traversal vulnerabilities in tar-fs 3.0.5
- **Source:** Transitive dependency via @size-limit/preset-app
- **Impact:** File system security risk during development
- **Solution:** Force all tar-fs instances to use version 3.0.9 or higher

### nanoid (^5.0.9)

**Vulnerability Fixed:** Predictable generation vulnerability (Moderate)

- **Issue:** Predictable ID generation in nanoid 5.0.7
- **Source:** Transitive dependency via @size-limit/preset-app
- **Impact:** Security risk in ID generation
- **Solution:** Force all nanoid instances to use version 5.0.9 or higher

## Maintenance Guidelines

### When to Review These Overrides

1. **Monthly:** Run `pnpm audit --audit-level moderate` to check if overrides are still needed
2. **After Major Updates:** When updating vitest, @size-limit/preset-app, or @lhci/cli
3. **Before Major Releases:** Ensure overrides are still necessary and update if needed

### How to Test Removal

To test if an override can be removed:

```bash
# 1. Remove the specific override from package.json
# 2. Delete node_modules and pnpm-lock.yaml
rm -rf node_modules pnpm-lock.yaml

# 3. Reinstall dependencies
pnpm install

# 4. Run security audit
pnpm audit --audit-level moderate

# 5. If vulnerabilities return, restore the override
```

### When Overrides Can Be Removed

An override can be removed when:

1. The parent package updates its dependency to a secure version
2. The vulnerable package is no longer in the dependency tree
3. The vulnerability is downgraded to low severity (dev dependencies only)

Check removal readiness:

```bash
# Check if parent packages have updated
pnpm update --latest
pnpm audit --audit-level moderate

# Check specific package versions in the tree
pnpm why esbuild
pnpm why ws
pnpm why tar-fs
pnpm why nanoid
```

## CI Integration

The CI pipeline includes security auditing that respects these overrides:

```yaml
# .github/workflows/ci.yml
- name: Security Audit
  run: pnpm audit --audit-level moderate
```

This ensures that:

- Only moderate, high, and critical vulnerabilities fail the build
- Dev-only low-severity vulnerabilities are logged but don't block
- The overrides are applied during CI security checks

## Historical Context

### Timeline

- **January 16, 2025:** Initial overrides added
  - Reduced vulnerabilities from 13 to 5 (all remaining are low severity)
  - Eliminated all production-impacting vulnerabilities
  - CI security audit now passes with `--audit-level moderate`

### Alternative Approaches Considered

1. **Direct Updates:** Attempted but parent packages haven't updated their dependencies yet
2. **Forking Packages:** Too maintenance-heavy for dev dependencies
3. **Ignoring Vulnerabilities:** Not acceptable for moderate+ severity issues
4. **Switching Tools:** Would require significant refactoring

## Monitoring and Alerts

To stay informed about when overrides can be removed:

1. **Dependabot:** Configured to alert on security updates
2. **Monthly Review:** Part of regular maintenance cycle
3. **pnpm Audit:** Run before each deployment

## References

- [pnpm Overrides Documentation](https://pnpm.io/package_json#pnpmoverrides)
- [GitHub Advisory Database](https://github.com/advisories)
- Original PR: #[TBD] - Security vulnerability remediation

---

_Last Updated: January 16, 2025_
_Next Review: February 16, 2025_

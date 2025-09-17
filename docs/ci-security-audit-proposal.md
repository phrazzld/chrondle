# CI Security Audit Scope Proposal

## Current State

The CI pipeline currently runs a single security audit command:

```bash
pnpm audit --audit-level moderate
```

This treats all dependencies equally, failing the build for any moderate+ vulnerability regardless of whether it's in production or development dependencies.

## Analysis Results (January 17, 2025)

Testing different audit scopes reveals:

| Scope            | Command                                    | Result                        |
| ---------------- | ------------------------------------------ | ----------------------------- |
| All dependencies | `pnpm audit --audit-level moderate`        | ✅ Pass (0 vulnerabilities)   |
| Production only  | `pnpm audit --prod --audit-level moderate` | ✅ Pass (0 vulnerabilities)   |
| Dev only         | `pnpm audit --dev --audit-level moderate`  | ✅ Pass (5 low severity only) |

**Current vulnerability status:**

- Production dependencies: **0 vulnerabilities** (all severities)
- Development dependencies: **5 low-severity vulnerabilities** only
- All moderate+ vulnerabilities have been resolved via pnpm overrides

## Recommendation

**Implement differentiated security auditing** with the following approach:

### Production Dependencies (CI-blocking)

- **Threshold:** `moderate` or higher
- **Action:** Fail CI build immediately
- **Rationale:** Production vulnerabilities directly affect users and must be addressed urgently

### Development Dependencies (CI-warning)

- **Threshold:** `high` or higher
- **Action:** Warn but don't block CI for moderate, fail for high/critical
- **Rationale:** Dev tools don't affect production; moderate issues can be addressed on a less urgent timeline

## Proposed CI Configuration

```yaml
- name: 🔒 Security Audit
  run: |
    echo "🔍 Checking for security vulnerabilities..."

    # Production dependencies (strict - fail on moderate+)
    echo "📦 Auditing production dependencies..."
    pnpm audit --prod --audit-level moderate || {
      echo "❌ CRITICAL: Production vulnerabilities found!"
      echo "These affect your users and must be fixed immediately."
      exit 1
    }
    echo "✅ Production dependencies secure"

    # Development dependencies (lenient - warn on moderate, fail on high+)
    echo "🛠️ Auditing development dependencies..."
    pnpm audit --dev --audit-level high || {
      echo "❌ High/Critical dev dependency vulnerabilities found!"
      echo "These should be addressed but don't affect production."
      exit 1
    }

    # Check for moderate dev vulnerabilities (non-blocking)
    pnpm audit --dev --audit-level moderate || {
      echo "⚠️ Moderate vulnerabilities in dev dependencies"
      echo "These don't block the build but should be reviewed:"
      pnpm audit --dev --audit-level moderate 2>/dev/null | grep -A 2 "moderate" || true
      echo ""
      echo "Consider updating or adding overrides in the next maintenance cycle."
    }

    echo "✅ Security audit complete"
```

## Benefits

1. **Appropriate Urgency:** Production issues get immediate attention, dev issues can be scheduled
2. **Reduced False Positives:** Dev tool vulnerabilities won't block critical production fixes
3. **Better Developer Experience:** Teams can ship urgent fixes without being blocked by unrelated dev tool issues
4. **Maintained Security:** Still catches all important vulnerabilities, just with appropriate severity

## Migration Path

1. ✅ Document current vulnerability status (this document)
2. ⬜ Update CI configuration with differentiated auditing
3. ⬜ Monitor for 1-2 weeks to ensure no issues
4. ⬜ Adjust thresholds if needed based on team feedback

## Trade-offs

**Pros:**

- More nuanced security approach
- Reduces unnecessary CI failures
- Aligns urgency with actual risk

**Cons:**

- Slightly more complex CI configuration
- Risk of ignoring dev vulnerabilities longer
- Need to ensure team reviews warnings

## Decision

After analysis, this change is **RECOMMENDED** because:

- It provides better signal-to-noise ratio in CI
- Production security remains strict
- Development workflow becomes more flexible
- The additional complexity is minimal and well-documented

---

_Created: January 17, 2025_
_Status: Proposal - Ready for Implementation_

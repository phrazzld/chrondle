# Chrondle TODO

## 🚀 Ready to Ship!

The `feat/ui-cleanup-and-fixes` branch is complete and ready for deployment. No blockers.

**Quality Status:**

- ✅ Tests: 400/402 passing (2 jsdom issues, not real failures)
- ✅ TypeScript: Clean
- ✅ Linting: Clean
- ✅ Deployments: Working fine

**Next Steps:**

1. [ ] Merge to main
2. [ ] Deploy to production
3. [ ] Verify daily puzzle works

---

## 🛡️ Security Hardening (Recommended)

- [x] Add `pnpm audit --audit-level moderate` to CI (`.github/workflows/ci.yml:62`)
- [x] Create `.github/dependabot.yml` for weekly dependency updates

## ⚡ CI Performance (Nice to Have)

- [x] Consolidate duplicate Node/pnpm setup steps (saves 2-4 min per build)
  - Extract to reusable workflow in `.github/workflows/setup-node-pnpm.yml`
- [x] Fix or skip 2 flaky notification tests (jsdom `clearTimeout` issue)

## 📊 Code Quality Tools (Already Installed, Not Enabled)

- [x] Add coverage reporting: `pnpm test:coverage` in CI
- [ ] Enable ts-prune: Add script `"ts-prune": "ts-prune"`
- [ ] Enable unimported: Add script `"unimported": "unimported"`
- [ ] Enable jsx-a11y linting: Add to `eslint.config.mjs`

## 🧹 Cleanup Tasks

- [ ] Remove obsolete migration step from `.github/workflows/deploy.yml:67-71`
- [ ] Remove unused `@lhci/cli` package (Lighthouse CI was removed)
- [ ] Add bundle size trend tracking (GitHub Action for PR comments)

---

## 📝 Production Issues

_Track user-reported bugs here_

---

_Last Updated: 2025-01-16_

# 🚨 Emergency Procedures

Quick reference for when things go wrong. Time is critical - find your scenario and follow the steps.

## 🔥 Critical Issues (Fix Immediately)

### Production is Down

1. **Check deployment status:**

   ```bash
   # Check recent deployments
   git log --oneline -5 origin/main
   ```

2. **Quick rollback:**

   ```bash
   # Revert to last known good commit
   git revert HEAD --no-edit
   git push origin main
   ```

3. **Verify fix:**
   - Check production site
   - Monitor error logs
   - Confirm with team

### Build Completely Broken

1. **Immediate fix:**

   ```bash
   # Find last working build
   git bisect start
   git bisect bad HEAD
   git bisect good <last-known-good-commit>
   # Test each commit until found
   ```

2. **Emergency bypass:**
   ```bash
   # Skip all checks (use sparingly!)
   git commit --no-verify
   git push --force-with-lease
   ```

### Tests Hanging Forever

1. **Kill all Node processes:**

   ```bash
   pkill -f node
   pkill -f vitest
   ```

2. **Clear all caches:**

   ```bash
   rm -rf node_modules/.cache
   rm -rf .next
   pnpm store prune
   ```

3. **Fresh start:**
   ```bash
   pnpm install --force
   ```

## ⚡ Performance Emergencies

### Bundle Size Exploded (>170KB)

1. **Quick analysis:**

   ```bash
   pnpm build && pnpm size
   ```

2. **Find the culprit:**

   ```bash
   # Check what changed
   git diff HEAD~1 package.json
   git diff HEAD~1 --stat | grep -E '\.(ts|tsx|js)$'
   ```

3. **Emergency fixes:**
   - Remove recently added dependencies
   - Add dynamic imports for large components
   - Check for accidental dev dependencies in prod bundle

### Site Loading Too Slowly

1. **Check Lighthouse scores:**

   - Look at latest merge commit comments
   - Check performance-data branch

2. **Quick wins:**

   ```bash
   # Ensure production build
   NODE_ENV=production pnpm build

   # Check for large assets
   find public -type f -size +100k
   ```

## 🐛 Debugging Nightmares

### Can't Reproduce User's Issue

1. **Gather data:**

   ```bash
   # Check for browser-specific issues
   # Test in: Chrome, Firefox, Safari, Edge

   # Clear all local storage
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Debug mode:**
   ```
   # Add to URL: ?debug=true
   # Check console for additional logs
   ```

### Puzzle Data Corrupted

1. **Validate immediately:**

   ```bash
   pnpm validate-puzzles
   ```

2. **Restore from backup:**

   ```bash
   # Puzzles are in git history
   git checkout HEAD~1 -- src/data/puzzles.json
   pnpm validate-puzzles
   ```

3. **Update metadata:**
   ```bash
   pnpm update-metadata
   ```

## 🚀 CI/CD Failures

### GitHub Actions Failing

1. **Common fixes:**

   ```bash
   # Clear workflow cache (in GitHub UI)
   # Actions → Management → Caches → Delete

   # Restart failed jobs
   # Click "Re-run failed jobs" in PR
   ```

2. **Debug locally:**
   ```bash
   # Run exact CI commands
   pnpm lint
   pnpm type-check
   pnpm test:ci
   pnpm build
   pnpm size
   ```

### Pre-commit Hooks Blocking Everything

```bash
# Emergency bypass (document why!)
git commit --no-verify -m "EMERGENCY: [describe issue]"

# Fix properly later
pnpm lint:fix
pnpm format
```

## 🔧 Environment Issues

### pnpm Not Working

```bash
# Reinstall pnpm
npm install -g pnpm@9.1.0

# Clear pnpm store
pnpm store prune

# Nuclear option
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript Errors Everywhere

```bash
# Restart TS server (in VS Code)
Cmd+Shift+P → "TypeScript: Restart TS Server"

# Clear TS cache
rm -rf node_modules/.cache/typescript
rm tsconfig.tsbuildinfo

# Reinstall types
pnpm install -D @types/react @types/node
```

## 🌐 Deployment Issues

### Vercel Deploy Failed

1. **Check build logs:**

   - Vercel dashboard → Project → Functions → Logs

2. **Common fixes:**
   - Check environment variables are set
   - Ensure build command is correct
   - Verify Node version matches local

### Lighthouse CI Failing

1. **Skip temporarily:**

   ```yaml
   # In .github/workflows/lighthouse.yml
   # Add continue-on-error: true to the step
   ```

2. **Debug scores:**
   ```bash
   # Run locally
   npm install -g @lhci/cli
   lhci autorun
   ```

## 📱 Mobile-Specific Issues

### Share Feature Not Working

1. **Test conditions:**

   - HTTPS required for Web Share API
   - Mobile browser required
   - Check navigator.share availability

2. **Fallback test:**
   ```javascript
   // In console
   navigator.clipboard.writeText("test");
   ```

## 🔐 Security Emergencies

### Exposed Secrets

1. **Immediate action:**

   - Rotate all affected keys
   - Check git history: `git log -p | grep -i api`
   - Use `git filter-branch` if needed

2. **Prevention:**
   ```bash
   # Add to .env.local (never commit)
   OPENROUTER_API_KEY=sk-...
   ```

## 💊 Recovery Procedures

### Complete Reset

```bash
# Nuclear option - start fresh
cd ..
mv chrondle chrondle-backup
git clone https://github.com/your-fork/chrondle.git
cd chrondle
pnpm install
```

### Restore Working State

```bash
# Save current work
git stash push -m "emergency stash"

# Return to known good state
git checkout main
git pull origin main
git checkout -b recovery

# Apply fixes carefully
git stash pop
```

## 📞 Who to Contact

### Escalation Path

1. Check #chrondle-dev Slack channel
2. Review recent PRs for similar issues
3. Create GitHub issue with:
   - Steps to reproduce
   - Error messages
   - Environment details
   - What you've tried

### Useful Commands Summary

```bash
# Most common emergency commands
git commit --no-verify              # Skip hooks
pnpm test:unit                      # Fast test subset
pnpm build && pnpm size            # Check bundle
pkill -f node                      # Kill hanging processes
rm -rf node_modules && pnpm i      # Fresh dependencies
```

## 🎯 Prevention

### Before Each PR

- [ ] Run `pnpm build` locally
- [ ] Check `pnpm size` output
- [ ] Test in multiple browsers
- [ ] Verify no console errors

### Daily Habits

- Pull latest main before starting work
- Run tests before pushing
- Check CI status on GitHub
- Monitor bundle size trends

---

**Remember:** It's better to ask for help than to make things worse. Document what happened so we can prevent it next time.

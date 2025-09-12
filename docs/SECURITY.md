# Security Guidelines & Procedures

## 🚨 Emergency: Webhook Secret Rotation

If a Clerk webhook secret has been compromised, follow these steps IMMEDIATELY:

### Option 1: Create New Webhook Endpoint (Recommended)

1. **Access Clerk Dashboard**

   - Go to https://dashboard.clerk.com
   - Navigate to **Webhooks**

2. **Create NEW Endpoint**

   - Click **"Add Endpoint"**
   - Enter the same URL: `https://chrondle.app/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`

3. **Copy New Secret**

   - The new endpoint will have a new webhook secret
   - Copy the secret (starts with `whsec_`)

4. **Update Production Environment**

   - Update `CLERK_WEBHOOK_SECRET` in your deployment platform
   - Deploy immediately

5. **Delete Compromised Endpoint**

   - Return to Clerk Dashboard → Webhooks
   - Delete the OLD endpoint with compromised secret

6. **Verify**
   - Test webhook functionality with a test user creation
   - Monitor webhook logs for successful events

### Option 2: Contact Clerk Support

If the above doesn't work:

1. Email support@clerk.com
2. Subject: "Urgent: Webhook Secret Compromised - Need Rotation"
3. Include your application ID and endpoint URL

## 🔒 Secret Management Best Practices

### NEVER Commit Actual Secrets

**❌ WRONG - Never do this:**

```markdown
- Webhook secret configured: whsec\_[ACTUAL_SECRET_REDACTED]
- API key: sk*live*[ACTUAL_KEY_REDACTED]
```

**✅ CORRECT - Always use placeholders:**

```markdown
- Webhook secret configured: whsec_YOUR_SECRET_HERE
- API key: sk_live_YOUR_KEY_HERE
- Or use: <WEBHOOK_SECRET>, <API_KEY>
```

### Understanding Key Types

**Publishable Keys (Safe to Expose in Code)**:

- `pk_test_*` - Test environment publishable keys (commonly used in CI/tests)
- `pk_live_*` - Production publishable keys (use cautiously but technically safe)
- These are CLIENT-SIDE keys designed to be public
- They appear in your JavaScript bundle sent to browsers

**Secret Keys (NEVER Expose)**:

- `sk_test_*` - Test secret keys (still sensitive - can perform API operations!)
- `sk_live_*` - Production secret keys (full API access)
- `whsec_*` - Webhook secrets (for verifying webhook signatures)
- `secret_*` - Generic secrets
- `api_key_*` - API keys
- `token_*` - Authentication tokens
- These are SERVER-SIDE keys that must remain secret

### Pre-Commit Checklist

Before EVERY commit:

1. Run `git diff --cached` to review changes
2. Search for secret patterns
3. Verify all sensitive values use placeholders
4. Double-check documentation files (\*.md)

## 🛡️ Security Infrastructure

### Pre-Commit Hook

We have a pre-commit hook that:

- Scans for common secret patterns
- Blocks commits containing actual secrets
- Allows placeholders and examples
- Located in `.husky/pre-commit`

### .gitignore Patterns

The following patterns are ignored to prevent accidental commits:

- `*.secret` - Any file ending in .secret
- `*_secret*` - Any file with "secret" in the name
- `*.key` - Key files
- `.env*` - All environment files (except .env.example)
- `secrets/` - Secrets directories

### CI/CD Security Checks

Our CI pipeline includes:

- Secret scanning in pull requests
- Environment variable validation
- Security header checks

## 📝 Documentation Standards

### Environment Variables

**Always document like this in .env.example:**

```bash
# Clerk Webhook Secret - For syncing users to Convex
# Get from: Clerk Dashboard → Webhooks → Your Endpoint → Signing Secret
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Never document like this:**

```bash
CLERK_WEBHOOK_SECRET=whsec_[ACTUAL_SECRET_REDACTED]
```

### README and TODO Files

When documenting completed work:

- Use generic descriptions: "Configured webhook secret"
- Never include actual values
- Reference .env.example for setup instructions

## 🚦 Incident Response

### If You Accidentally Commit a Secret

1. **DON'T PANIC** - Act quickly but carefully
2. **DON'T** try to "fix" it with another commit (it's still in history)
3. **DO** immediately rotate the compromised secret
4. **DO** notify the team/project owner
5. **DO** follow the rotation procedure above

### Git History Cleanup (If Needed)

For private repositories only:

```bash
# Using BFG Repo-Cleaner
java -jar bfg.jar --replace-text passwords.txt repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force-with-lease
```

**Note:** For public repositories, focus on rotation since the secret is already exposed.

## 🔍 Regular Security Audits

### Monthly Checks

- Review Clerk webhook logs for anomalies
- Verify all secrets are rotated quarterly
- Check git history for accidental exposures
- Update dependencies for security patches

### Tools for Secret Scanning

- GitHub Secret Scanning (automatic for public repos)
- Trufflehog: `trufflehog git https://github.com/user/repo`
- GitLeaks: `gitleaks detect --source . -v`

## 📞 Security Contacts

- **Clerk Security**: security@clerk.com
- **GitHub Security**: https://github.com/security
- **Project Security Lead**: [Your contact here]

---

**Remember:** Security is everyone's responsibility. When in doubt, ask for help rather than risk exposure.

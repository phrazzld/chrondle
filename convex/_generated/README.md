# ⚠️ CRITICAL: DO NOT DELETE THESE FILES

These generated files MUST be committed to Git for Vercel deployments to work.

## Why These Files Are Special

Unlike typical generated files that should be gitignored, these Convex files are **intentionally committed** to Git because:

- **Vercel cannot generate them**: The build environment lacks CONVEX_DEPLOYMENT access
- **Production depends on them**: All deployments will fail without these files
- **Historical precedent**: Previously deleted in commit 08ee80b which broke all deployments

## Required Files

All files in this directory are required for deployment:

- `api.d.ts` - TypeScript API definitions
- `api.js` - JavaScript API exports
- `dataModel.d.ts` - Database schema types
- `server.d.ts` - Server function types
- `server.js` - Server function exports

## When to Regenerate

Regenerate these files when you:

1. Modify `convex/schema.ts`
2. Add/remove/modify Convex functions
3. Change function signatures

## How to Regenerate

```bash
# Start Convex dev server (generates files automatically)
npx convex dev

# OR generate without starting dev server
npx convex codegen

# Then commit the changes
git add convex/_generated/
git commit -m "chore: update Convex generated files"
```

## Common Mistakes to Avoid

❌ **DO NOT** delete these files thinking they're "cleanup"
❌ **DO NOT** add `convex/_generated/` to .gitignore  
❌ **DO NOT** assume Vercel will generate them at build time

## Deployment Architecture

This is a deliberate architectural decision. The alternatives were considered:

1. Generate at build time - Requires exposing CONVEX_DEPLOYMENT in Vercel
2. Check in generated files - Current approach, simpler and more secure
3. Build custom deployment pipeline - Too complex for marginal benefit

We chose option 2 for simplicity and security.

## If Deployments Are Failing

1. Check these files exist in Git: `git ls-tree HEAD convex/_generated/`
2. Regenerate if missing: `npx convex codegen`
3. Ensure files are staged and committed
4. Verify no build command tries to delete them

## Questions?

See `docs/guides/contributing.md` for more details about the Convex integration.

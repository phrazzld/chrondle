# GitHub Actions Workflows

## Deploy to Production

The `deploy.yml` workflow automatically deploys the Chrondle application to production when code is pushed to the main branch.

### Required GitHub Secrets

Before the deployment workflow can run successfully, you must configure the following secrets in your GitHub repository:

1. **CONVEX_DEPLOY_KEY** (Required)

   - Your Convex deployment key
   - Get this from the Convex dashboard under Settings → Deploy Keys
   - Example: `prod:handsome-raccoon-955:...`

2. **NEXT_PUBLIC_CONVEX_URL** (Required)

   - Your Convex project URL
   - Example: `https://handsome-raccoon-955.convex.cloud`

3. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** (Required)
   - Your Clerk publishable key for authentication
   - Get this from the Clerk dashboard
   - Example: `pk_live_...`

### Setting up Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

### Workflow Steps

1. **Checkout code** - Fetches the latest code from the repository
2. **Setup Node.js and pnpm** - Installs Node.js 20 and pnpm package manager
3. **Install dependencies** - Installs all npm packages with locked versions
4. **Build Next.js app** - Creates production build of the application
5. **Deploy to Convex** - Deploys backend functions and database to Convex
6. **Run migrations** - Checks if data migration is needed and runs it
7. **Verify deployment** - Runs comprehensive checks to ensure deployment is successful

### Manual Deployment

If you need to deploy manually, run:

```bash
pnpm deploy
```

This will execute the same steps as the GitHub Action.

### Monitoring Deployments

- Check the Actions tab in GitHub to see deployment status
- Green checkmark = successful deployment
- Red X = failed deployment (check logs for details)
- The workflow includes notifications for success/failure

### Troubleshooting

If deployment fails:

1. Check that all required secrets are set correctly
2. Verify Convex project is accessible
3. Ensure pnpm-lock.yaml is committed (for reproducible builds)
4. Check the GitHub Actions logs for specific error messages

### Optional: Vercel Deployment

The workflow includes commented-out steps for deploying to Vercel. To enable:

1. Uncomment the Vercel deployment step in deploy.yml
2. Add these additional secrets:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID

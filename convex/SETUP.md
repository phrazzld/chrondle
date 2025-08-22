# Convex Setup Guide

## Prerequisites

- Convex account (create at https://dashboard.convex.dev)
- Vercel CLI configured
- Access to Vercel project settings

## Setup Steps

### 1. Create Convex Project

1. Go to https://dashboard.convex.dev
2. Sign up/login with GitHub
3. Click "New Project"
4. Name it "chrondle" or "chrondle-prod"
5. Choose "Next.js" as the framework

### 2. Get Deployment Keys

From the Convex dashboard:

1. Go to Settings → Deploy Key
2. Copy the `CONVEX_DEPLOY_KEY`
3. Note the Convex URL (format: https://your-project.convex.cloud)

### 3. Add to Vercel Environment Variables

Using Vercel CLI:

```bash
# Add CONVEX_DEPLOY_KEY for all environments
vercel env add CONVEX_DEPLOY_KEY

# Add NEXT_PUBLIC_CONVEX_URL for all environments
vercel env add NEXT_PUBLIC_CONVEX_URL
```

Or via Vercel Dashboard:

1. Go to project settings
2. Navigate to Environment Variables
3. Add both variables for all environments (Development, Preview, Production)

### 4. Local Development Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key
```

### 5. Initialize Convex

Once environment variables are set:

```bash
npx convex dev
```

This will:

- Connect to your Convex project
- Generate TypeScript types
- Start the development server

## Verification

Run these commands to verify setup:

```bash
# Check environment variables
vercel env ls | grep CONVEX

# Test Convex connection
npx convex dev --once
```

## Next Steps

After setup is complete:

1. Run data migration script to import puzzles
2. Configure Clerk authentication
3. Set up Stripe webhooks

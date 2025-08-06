# Chrondle: The Daily History Game

**Chrondle** is an engaging web-based puzzle game where your knowledge of history is put to the test! Guess the year of a historical event based on a series of revealing clues. Each day brings a new challenge, spanning millennia of human history.

## Features

- **Daily Puzzles:** A fresh historical event to guess every day.
- **Progressive Hints:** Uncover more clues with each incorrect guess.
- **Intuitive Interface:** Clean and responsive design built with Next.js and Tailwind CSS.
- **Historical Range:** Puzzles cover a vast timeline, from ancient civilizations to recent events.

## How to Play

You can play Chrondle directly at [chrondle.app](https://chrondle.app).

1.  **Guess the Year:** Enter your best guess for the year of the historical event.
2.  **Receive Feedback:** Get immediate feedback on whether your guess was too high, too low, or just right.
3.  **Unlock Hints:** Each incorrect guess reveals a new hint, guiding you closer to the correct year.
4.  **Win or Learn:** Successfully guess the year to win, or learn from the revealed answer and hints.

## Development

This project is built with:

- **Next.js 15:** React framework for production.
- **React 19:** For building interactive user interfaces.
- **Tailwind CSS:** For rapid UI development and styling.
- **TypeScript:** For type safety and improved developer experience.
- **Vitest:** For unit and integration testing.

## Requirements

- **Node.js 20+**: This project requires Node.js version 20 or higher. Use the `.nvmrc` file with nvm:
  ```bash
  nvm use
  ```
- **pnpm**: This project uses pnpm exclusively as the package manager. npm and yarn are not supported.
- **ESM Modules**: The codebase uses ES modules throughout. All configuration files use `.mjs` extensions or TypeScript.

## Getting Started

### Local Development

1.  Clone the repository:

    ```bash
    git clone https://github.com/phaedrus/chrondle.git
    cd chrondle
    ```

2.  Install dependencies:

    ```bash
    pnpm install
    ```

3.  Set up environment variables:

    ```bash
    cp .env.example .env.local
    ```

    Edit `.env.local` with your configuration (see Environment Setup below).

4.  Start Convex development server:

    ```bash
    npx convex dev
    ```

5.  In a new terminal, start the Next.js development server:
    ```bash
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to play.

## Deployment

### Prerequisites

Before deploying Chrondle, you'll need accounts for:

- **[Vercel](https://vercel.com)** - For hosting the Next.js application
- **[Convex](https://convex.dev)** - For the backend database and real-time sync
- **[Clerk](https://clerk.com)** - For authentication (optional but recommended)

### Environment Setup

Chrondle requires several environment variables for production deployment. Copy `.env.example` to `.env.local` and configure:

#### Required Variables

**Convex Configuration:**

- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL (e.g., `https://your-project.convex.cloud`)
- `CONVEX_DEPLOY_KEY` - Generate from Convex Dashboard → Settings → Deploy Keys

**Clerk Authentication:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard → API Keys
- `CLERK_SECRET_KEY` - From Clerk Dashboard → API Keys (keep secure!)
- `CLERK_WEBHOOK_SECRET` - Create webhook at Clerk Dashboard → Webhooks
  - Endpoint URL: `https://your-domain.com/api/webhooks/clerk`
  - Subscribe to events: `user.created`, `user.updated`

#### Optional Variables

- `OPENROUTER_API_KEY` - For AI-powered historical context features
- Stripe keys - For future premium features

### Deploying to Vercel

1. **Fork or push this repository to GitHub**

2. **Set up Convex:**

   ```bash
   npx convex deploy --prod
   ```

   This will create a production deployment and provide your `NEXT_PUBLIC_CONVEX_URL`.

3. **Import to Vercel:**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

4. **Configure Environment Variables in Vercel:**

   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.example`:
     - `NEXT_PUBLIC_CONVEX_URL`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `CONVEX_DEPLOY_KEY`
     - `CLERK_WEBHOOK_SECRET` (if using Clerk webhooks)

5. **Configure Build Settings:**

   - Vercel should auto-detect Next.js settings
   - The build command is already configured in `vercel.json`:
     ```json
     {
       "buildCommand": "npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL"
     }
     ```

6. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Post-Deployment

1. **Configure Clerk Webhook (if using authentication):**

   - In Clerk Dashboard, update the webhook endpoint to your production URL:
     `https://your-app.vercel.app/api/webhooks/clerk`

2. **Verify Deployment:**
   - Visit your deployed URL
   - Check that daily puzzles load correctly
   - Test user authentication (if configured)
   - Verify puzzle archive functionality

### Deployment Checklist

- [ ] Convex project created and deployed
- [ ] All environment variables added to Vercel
- [ ] Clerk authentication configured (optional)
- [ ] Webhook endpoints updated with production URLs
- [ ] Build succeeds without errors
- [ ] Daily puzzle loads correctly
- [ ] Archive page displays puzzles
- [ ] User authentication works (if enabled)

### Troubleshooting

**White screen or loading issues:**

- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Check browser console for errors
- Ensure Convex deployment is active

**Authentication not working:**

- Verify Clerk keys are correct
- Check webhook configuration
- Ensure `CLERK_WEBHOOK_SECRET` matches the webhook settings

**Build failures:**

- Check all required environment variables are set
- Verify `vercel.json` is present in the repository
- Review build logs for specific errors

For more detailed setup instructions, see the [Convex Next.js Quickstart](https://docs.convex.dev/quickstart/nextjs) and [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

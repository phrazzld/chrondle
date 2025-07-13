# Chrondle Convex DB & Premium Archive Implementation TODO

Generated from TASK.md on 2025-01-13

## Critical Path Items (Must complete in order)

### Phase 1: Foundation Setup

- [ ] Initialize Convex project and configuration

  - Success criteria: `npx convex dev` runs successfully, convex/ directory created
  - Dependencies: Convex package installed
  - Estimated complexity: SIMPLE

- [ ] Set up environment variables for Convex

  - Success criteria: .env.local contains NEXT_PUBLIC_CONVEX_URL
  - Dependencies: Convex project initialized
  - Estimated complexity: SIMPLE

- [ ] Create Convex database schema (convex/schema.ts)

  - Success criteria: Schema defines dailyPuzzles, userGames, and users tables with proper TypeScript types
  - Dependencies: Convex project initialized
  - Estimated complexity: MEDIUM

- [ ] Install and configure Clerk authentication

  - Success criteria: Clerk providers added to layout.tsx, environment variables set
  - Dependencies: None
  - Estimated complexity: MEDIUM

- [ ] Create Clerk → Convex webhook integration
  - Success criteria: User creation in Clerk triggers user record in Convex
  - Dependencies: Clerk configured, Convex schema created
  - Estimated complexity: MEDIUM

### Phase 2: Core Database Integration

- [ ] Implement getTodaysPuzzle Convex query

  - Success criteria: Returns today's puzzle without auth, maintains < 100ms load time
  - Dependencies: Convex schema created
  - Estimated complexity: MEDIUM

- [ ] Create puzzle data migration script

  - Success criteria: All 298 puzzles from JSON imported to Convex with data validation
  - Dependencies: Convex schema created
  - Estimated complexity: COMPLEX

- [ ] Update puzzleData.ts to use Convex queries

  - Success criteria: Game works with Convex data source, fallback to JSON if offline
  - Dependencies: getTodaysPuzzle query, migration complete
  - Estimated complexity: COMPLEX

- [ ] Implement user progress mutations
  - Success criteria: Authenticated users' game progress saves to database
  - Dependencies: Clerk auth working
  - Estimated complexity: MEDIUM

## Parallel Work Streams

### Stream A: UI Components

- [ ] Create sign-in/sign-up UI components

  - Success criteria: Clean auth UI in header, doesn't disrupt anonymous play
  - Can start: After Clerk setup
  - Estimated complexity: SIMPLE

- [ ] Build archive page route (/archive)

  - Success criteria: New page accessible from navigation
  - Can start: Immediately
  - Estimated complexity: SIMPLE

- [ ] Design and implement archive grid/calendar view

  - Success criteria: Shows all past puzzles with year and date
  - Dependencies: Archive page exists
  - Estimated complexity: MEDIUM

- [ ] Create locked puzzle state UI

  - Success criteria: Non-premium users see grayed out past puzzles
  - Dependencies: Archive grid exists
  - Estimated complexity: SIMPLE

- [ ] Build premium upgrade prompt component
  - Success criteria: Clear CTA with pricing ($0.99/mo or $5.99/yr)
  - Dependencies: Archive page exists
  - Estimated complexity: SIMPLE

### Stream B: Authentication & User Data

- [ ] Implement localStorage → Convex migration on first auth

  - Success criteria: User's existing progress transfers to account
  - Dependencies: User progress mutations
  - Estimated complexity: MEDIUM

- [ ] Add user stats calculation functions

  - Success criteria: Accurate streak and completion tracking
  - Dependencies: User game history in database
  - Estimated complexity: MEDIUM

- [ ] Create useUser and useAuth hooks
  - Success criteria: Clean API for auth state in components
  - Dependencies: Clerk configured
  - Estimated complexity: SIMPLE

### Stream C: Premium Features

- [ ] Implement getArchivePuzzle query with auth check

  - Success criteria: Only premium users can access past puzzles
  - Dependencies: User auth working
  - Estimated complexity: MEDIUM

- [ ] Create user statistics dashboard component

  - Success criteria: Shows streaks, total completed, average guesses
  - Dependencies: User stats calculations
  - Estimated complexity: MEDIUM

- [ ] Build game history view
  - Success criteria: Premium users see all past attempts
  - Dependencies: User game data available
  - Estimated complexity: MEDIUM

## Phase 3: Monetization

- [ ] Set up Stripe account and products

  - Success criteria: Two products created ($0.99/mo, $5.99/yr)
  - Dependencies: None
  - Estimated complexity: SIMPLE

- [ ] Create Stripe checkout API endpoint

  - Success criteria: Redirects to Stripe checkout with correct pricing
  - Dependencies: Stripe account setup
  - Estimated complexity: MEDIUM

- [ ] Implement Stripe webhook handler

  - Success criteria: Updates user premium status on subscription events
  - Dependencies: Stripe checkout working
  - Estimated complexity: COMPLEX

- [ ] Add subscription management UI
  - Success criteria: Premium users can view/cancel subscription
  - Dependencies: Stripe integration complete
  - Estimated complexity: MEDIUM

## Testing & Validation

- [ ] Write tests for Convex queries and mutations

  - Success criteria: 90%+ coverage on database functions
  - Dependencies: Core integration complete
  - Estimated complexity: MEDIUM

- [ ] Test auth flows (sign up, sign in, anonymous → authenticated)

  - Success criteria: All paths work without breaking game
  - Dependencies: Auth implementation complete
  - Estimated complexity: MEDIUM

- [ ] Test payment flows (subscribe, cancel, resubscribe)

  - Success criteria: Stripe test mode transactions update user status correctly
  - Dependencies: Stripe integration complete
  - Estimated complexity: MEDIUM

- [ ] Performance testing for database queries

  - Success criteria: Today's puzzle loads < 100ms, archive pagination < 200ms
  - Dependencies: Core integration complete
  - Estimated complexity: SIMPLE

- [ ] Test offline fallback behavior
  - Success criteria: Game playable offline with localStorage
  - Dependencies: Fallback logic implemented
  - Estimated complexity: SIMPLE

## Documentation & Cleanup

- [ ] Update README with premium features and setup instructions

  - Success criteria: Clear docs for auth, subscription, and archive
  - Dependencies: All features implemented
  - Estimated complexity: SIMPLE

- [ ] Create environment variables template

  - Success criteria: .env.example with all required vars documented
  - Dependencies: All integrations complete
  - Estimated complexity: SIMPLE

- [ ] Add feature flag for gradual rollout

  - Success criteria: Can toggle between old and new system
  - Dependencies: Core integration complete
  - Estimated complexity: MEDIUM

- [ ] Code review and refactoring pass
  - Success criteria: Consistent patterns, < 1000 lines new code
  - Dependencies: All features implemented
  - Estimated complexity: MEDIUM

## Future Enhancements (BACKLOG.md candidates)

- [ ] Add puzzle difficulty ratings based on aggregate completion data
- [ ] Implement puzzle search and filtering in archive
- [ ] Create shareable links for specific past puzzles
- [ ] Add achievement badges for milestones
- [ ] Build puzzle statistics page (most/least guessed correctly)
- [ ] Add custom color scheme options for premium users
- [ ] Implement puzzle of the week/month highlights
- [ ] Create puzzle recommendation engine based on play history

## Risk Mitigation Tasks

- [ ] Create database backup strategy

  - Success criteria: Daily backups of puzzle and user data
  - Dependencies: Migration complete
  - Estimated complexity: SIMPLE

- [ ] Implement rate limiting for API endpoints

  - Success criteria: Prevents abuse of auth and payment endpoints
  - Dependencies: API endpoints created
  - Estimated complexity: SIMPLE

- [ ] Add comprehensive error boundaries

  - Success criteria: Database failures don't crash the app
  - Dependencies: Core integration complete
  - Estimated complexity: SIMPLE

- [ ] Create rollback plan documentation
  - Success criteria: Clear steps to revert to JSON-only version
  - Dependencies: Feature flag implemented
  - Estimated complexity: SIMPLE

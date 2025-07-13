# TASK: Convex DB Integration with Premium Archive

## Overview

Migrate Chrondle from static JSON puzzle storage to Convex reactive database to enable user authentication, saved progress, puzzle history tracking, and a premium puzzle archive with Stripe paywall.

## Business Model

- **Free Tier**: Today's puzzle only (exactly like current experience)
- **Premium Tier**: $0.99/month or $5.99/year
- **Premium Benefits**:
  - Access to full puzzle archive (all past puzzles)
  - Saved progress across devices
  - Complete game history and statistics
  - Streak preservation
  - Early access to future features

## Technical Requirements

### 1. Database Migration

- **From**: Static `src/data/puzzles.json` file
- **To**: Convex reactive database
- **Migration Strategy**: One-time script to import all 298 existing puzzles
- **Data Integrity**: Preserve exact puzzle configurations for historical accuracy

### 2. User Authentication (Clerk)

- Sign up/in functionality without disrupting anonymous play
- Migrate localStorage data on first authentication
- Cross-device progress synchronization
- Optional authentication (today's puzzle always free without login)

### 3. Database Schema

```typescript
// Daily puzzles - permanent historical record
dailyPuzzles: {
  date: string        // "2024-01-15"
  year: number        // Target year (e.g., 1969)
  events: string[]    // The 6 hints in exact order
  playCount: number   // Track popularity
  avgGuesses: number  // Difficulty metric
}

// User game history
userGames: {
  userId: string
  date: string
  year: number
  guesses: number[]
  completed: boolean
  timestamp: number
}

// User accounts
users: {
  clerkId: string
  email: string
  isPremium: boolean
  subscriptionId?: string
  subscriptionEnd?: number
  currentStreak: number
  bestStreak: number
  totalCompleted: number
  joinedAt: number
}
```

### 4. Core Features

#### Free Features (Unchanged)

- Play today's puzzle
- Anonymous play with localStorage
- No forced registration
- Basic game mechanics

#### Premium Features (New)

- Access entire puzzle archive
- Play any past puzzle
- View personal statistics dashboard
- Track game history
- Preserve streaks across devices
- See completion rates and average guesses per puzzle

### 5. Archive Implementation

- Calendar/grid view of all past puzzles
- Locked state for non-premium users (grayed out)
- Clear upgrade prompts
- Instant access upon subscription
- Search and filter capabilities (future enhancement)

### 6. Monetization (Stripe)

- Simple subscription checkout
- Two pricing tiers: $0.99/mo or $5.99/yr (50% savings)
- Webhook handling for subscription lifecycle
- Immediate access upon payment
- Grace period handling for failed payments

## Implementation Plan

### Week 1: Foundation

#### Days 1-2: Setup & Authentication

- Install Convex (`pnpm add convex`)
- Set up Clerk authentication (`pnpm add @clerk/nextjs`)
- Configure environment variables
- Add auth providers to Next.js app
- Create sign-in/up UI components

#### Days 3-4: Database & Core Integration

- Define Convex schema
- Create migration script for puzzles.json
- Implement `getTodaysPuzzle` query (always free)
- Replace static JSON imports with Convex queries
- Maintain backward compatibility

#### Day 5: Archive UI

- Build archive page with calendar/grid layout
- Implement paywall UI for non-premium users
- Create premium upgrade flow
- Add "locked" visual state for past puzzles

### Week 2: Monetization & Polish

#### Days 6-7: Stripe Integration

- Set up Stripe products and pricing
- Create checkout session endpoint
- Implement webhook for subscription events
- Update user premium status on payment

#### Days 8-9: Premium Features

- User statistics dashboard
- Complete game history view
- Progress tracking and persistence
- Cross-device sync verification

#### Day 10: Testing & Deployment

- Comprehensive testing of payment flows
- Performance optimization
- Feature flag setup
- Gradual rollout strategy

## Technical Decisions

### Performance Requirements

- Today's puzzle must load in < 100ms
- Use aggressive caching for current puzzle
- Archive pagination: 20 puzzles per page
- Lazy load historical data

### Data Migration

- Pre-generate past 30 days of puzzles
- Generate older puzzles on-demand
- Use existing deterministic algorithm
- Validate all migrated data

### Security & Privacy

- No puzzle solutions sent to client until played
- Secure user data access patterns
- GDPR compliance for user data
- Proper error handling for auth failures

## Success Metrics

- **Technical**: Page load times maintained (< 100ms)
- **Business**: 10% free → registered, 20% registered → premium
- **User Experience**: Zero disruption to daily players
- **Code Quality**: < 1000 lines of new code

## Not In Scope (Yet)

- Social features
- Leaderboards
- Custom color schemes
- Difficulty ratings
- Hint purchasing
- Multiple game modes

## Dependencies

- Convex (database)
- Clerk (authentication)
- Stripe (payments)
- Existing Next.js 15 / React 19 stack

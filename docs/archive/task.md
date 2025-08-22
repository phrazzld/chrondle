### Complete Convex Migration & Simplification

**Core Objective**: Completely migrate Chrondle to Convex backend, removing ALL localStorage dependencies and simplifying the entire architecture.

#### 1. Archive Migration

- Implement `getArchivePuzzles` paginated query
- Create `getPuzzleByNumber` query for individual puzzles
- Remove ALL client-side `puzzles.json` dependencies
- Server-side render archive pages by default

#### 2. Total State Management Overhaul

- **Remove ALL localStorage** - no fallbacks, no hybrid approach
- Make Convex the ONLY data source
- Error out on Convex failures (no silent fallbacks)
- Implement optimistic UI updates everywhere

#### 3. Puzzle System Reset

- **Reset entire puzzle table in Convex**
- **Create daily cron job to generate new puzzles**
- Migrate existing puzzles with new Convex IDs
- Clean up all localStorage data after migration

#### 4. Performance & UX

- Show completion checkmark on archive puzzle cards (not full count)
- Add loading skeletons and spinners
- Keep pagination simple (traditional, not infinite scroll)
- Server-side render everything possible

#### 5. Code Consolidation

- Merge duplicate user creation mutations
- Remove all localStorage-related code
- Simplify hooks to use Convex only
- Clean up scripts directory

---

# Enhanced Specification

## Research Findings

### Industry Best Practices for Convex Migration

- **Complete replacement approach** is recommended when simplicity is the goal
- Server-side rendering with Convex provides optimal performance
- Optimistic updates create responsive UIs without complexity
- Daily cron jobs in Convex handle scheduled tasks reliably

### Technology Analysis

- **Convex** handles all data persistence, real-time updates, and cron scheduling
- **Next.js 15 SSR** with async components for optimal performance
- **React 19** concurrent features for smooth UI updates
- No need for additional state management libraries

### Codebase Integration

- New `useChrondle` hook with pure functional state derivation provides the pattern to follow
- Archive implementation can be significantly simplified
- Remove all localStorage utility functions and constants
- Consolidate duplicate mutations in `convex/users.ts`

## Detailed Requirements

### Functional Requirements

- **FR1: Archive Display**: Show paginated list of all past puzzles with completion indicators
- **FR2: Puzzle Playback**: Allow users to play any archived puzzle with full game mechanics
- **FR3: Daily Puzzle Generation**: Automatically create new puzzle at midnight UTC via cron
- **FR4: User Progress Tracking**: Store all game states in Convex (no localStorage)
- **FR5: Error Handling**: Display clear error messages when Convex operations fail

### Non-Functional Requirements

- **Performance**: Sub-500ms page loads with server-side rendering
- **Reliability**: No data loss - all game state persisted to Convex
- **Simplicity**: Single source of truth, no fallback mechanisms
- **User Experience**: Loading states for all async operations

## Architecture Decisions

### Technology Stack

- **Data Layer**: Convex (queries, mutations, cron jobs)
- **Rendering**: Next.js 15 SSR by default, client components where needed
- **State Management**: Convex hooks only (no Zustand, no Context)
- **UI Updates**: Optimistic mutations with Convex

### Design Patterns

- **Architecture Pattern**: Simple client-server with Convex as backend
- **Data Flow**: Unidirectional - UI → Convex → UI
- **Error Handling**: Explicit errors, no silent failures

### Data Schema

```typescript
// convex/schema.ts
export default defineSchema({
  // Pool of all historical events (one event per row for maximum reusability)
  events: defineTable({
    year: v.number(), // e.g., 1969
    event: v.string(), // "Neil Armstrong walks on the moon"
    puzzleId: v.optional(v.id("puzzles")), // null if unused, links to puzzle if used
    updatedAt: v.number(), // Manual timestamp (Convex provides _creationTime)
  })
    .index("by_year", ["year"])
    .index("by_puzzle", ["puzzleId"])
    .index("by_year_available", ["year", "puzzleId"]), // Efficient unused event queries

  // Daily puzzles (starts empty, populated by cron job)
  puzzles: defineTable({
    puzzleNumber: v.number(), // Human-readable: #1, #2, etc.
    date: v.string(), // "2024-07-16"
    targetYear: v.number(), // Year to guess
    events: v.array(v.string()), // 6 events (denormalized for performance)
    playCount: v.number(), // Social proof: "1,234 players"
    avgGuesses: v.number(), // Difficulty: "Avg: 3.2 guesses"
    updatedAt: v.number(), // For stats updates
  })
    .index("by_number", ["puzzleNumber"])
    .index("by_date", ["date"]),

  // User puzzle attempts (authenticated users only)
  plays: defineTable({
    userId: v.id("users"),
    puzzleId: v.id("puzzles"),
    guesses: v.array(v.number()), // [1945, 1939, 1941] - just years
    completedAt: v.optional(v.number()), // null = in progress, timestamp = done
    updatedAt: v.number(), // Last guess timestamp
  })
    .index("by_user_puzzle", ["userId", "puzzleId"])
    .index("by_user", ["userId"])
    .index("by_puzzle", ["puzzleId"]), // For stats calculation

  // User accounts
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()), // For future leaderboards
    currentStreak: v.number(),
    longestStreak: v.number(),
    totalPlays: v.number(),
    perfectGames: v.number(), // Guessed in 1 try
    updatedAt: v.number(), // For streak updates
  }).index("by_clerk", ["clerkId"]),
});
```

**Note**: Convex automatically provides `_id` and `_creationTime` on all documents.

## Implementation Strategy

### Development Phases

**Phase 1: Data Migration & Cron Setup** (Week 1)

1. Create Convex schema with events, puzzles, plays, users tables
2. Write migration script to import events (one per row) from puzzles.json
3. Implement daily cron job that:
   - Finds years with 6+ unused events
   - Creates one puzzle from random events
   - Updates events with puzzleId
4. Test puzzle generation and event tracking

**Phase 2: Archive Implementation** (Week 1-2)

1. Create paginated archive queries
2. Build SSR archive pages
3. Add completion checkmarks
4. Remove puzzles.json imports

**Phase 3: Game State Migration** (Week 2)

1. Update game hooks to use Convex only
2. Remove all localStorage code
3. Implement optimistic updates
4. Add error boundaries

**Phase 4: Cleanup & Polish** (Week 3)

1. Consolidate duplicate mutations
2. Clean up scripts directory
3. Add loading skeletons
4. Remove old migration code

### MVP Definition

1. Fully functional archive with SSR and pagination
2. Game state entirely in Convex (no localStorage)
3. Daily puzzle generation via cron
4. Clear error handling for all operations

### Technical Risks

- **Risk 1**: Data migration failures → Mitigation: Idempotent migration script with verification
- **Risk 2**: Cron job reliability → Mitigation: Add monitoring and manual trigger option
- **Risk 3**: Performance regression → Mitigation: Server-side rendering and optimistic updates

## Integration Requirements

### Breaking Changes

- Authenticated users: All game state moves to Convex
- Anonymous users: Continue using localStorage (not persisted to Convex)
- Puzzle IDs will change to Convex IDs
- Internet connection required for authenticated features

### Migration Steps

1. Deploy new schema to Convex
2. Run migration script to populate events table (one event per row)
3. Configure and start daily cron job
4. Deploy new code with hybrid approach (Convex for auth users, localStorage for anon)
5. Remove old localStorage code for authenticated users only

## Testing Strategy

### Unit Testing

- Test Convex queries and mutations
- Verify cron job logic
- Test UI components with mock data

### Integration Testing

- Full game flow with Convex backend
- Archive pagination and filtering
- Error handling scenarios

### Migration Testing

- Verify all puzzles migrated correctly
- Test localStorage cleanup
- Ensure no data loss

## Deployment Considerations

### Pre-deployment Checklist

- [ ] Convex schema deployed
- [ ] All puzzles migrated successfully
- [ ] Cron job scheduled and tested
- [ ] Environment variables configured

### Rollout Strategy

1. Deploy to staging environment
2. Run full test suite
3. Deploy to production during low traffic
4. Monitor for errors
5. Clean up old code after stability confirmed

### Monitoring

- Convex dashboard for query performance
- Error tracking for failed mutations
- Cron job execution logs

## Success Criteria

### Acceptance Criteria

- [ ] Archive loads with SSR in <500ms
- [ ] All game state persisted to Convex
- [ ] Daily puzzles generated automatically
- [ ] Zero localStorage usage
- [ ] Clear errors on Convex failures

### Code Quality Metrics

- 50% reduction in total lines of code
- Zero duplicate mutations
- All localStorage utilities removed
- Single source of truth achieved

## Future Considerations

### Post-MVP Enhancements

- User accounts with cross-device sync
- Puzzle statistics and analytics
- Archive search and filtering
- Puzzle difficulty ratings

### Long-term Architecture

- Consider edge functions for puzzle generation
- Add Redis caching layer if needed
- Implement proper rate limiting
- Add admin interface for puzzle management

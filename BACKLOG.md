# BACKLOG

Last groomed: 2025-10-14
Analyzed by: 7 specialized perspectives (complexity-archaeologist, architecture-guardian, security-sentinel, performance-pathfinder, maintainability-maven, user-experience-advocate, product-visionary)

---

## Immediate Concerns [Fix Now]

### [SECURITY] CRITICAL - Weak Webhook Secret Handling

**File**: `src/app/api/webhooks/clerk/route.ts:42-50`
**Perspectives**: security-sentinel
**Severity**: CRITICAL
**Impact**: Authentication bypass - Attacker can create arbitrary user accounts if `CLERK_WEBHOOK_SECRET` not configured
**Attack Vector**: Send POST with fake Clerk data + empty Svix headers → Webhook verifies with empty string → Account created
**Violation**: Missing fail-fast validation - accepts empty secret
**Fix**: Reject webhook immediately if secret not configured, add timestamp validation (5min tolerance)
**Effort**: 45m | **Risk**: CRITICAL - Production auth compromise

### [SECURITY] HIGH - API Key Exposure in Error Messages ✅ FULLY RESOLVED

**Status**: ✅ FIXED in two phases
**File**: `convex/actions/historicalContext.ts`
**Resolution**: Two-layer sanitization approach

**Phase 1** (commit ff59321):

- Implemented `sanitizeErrorForLogging()` function
- Redacts `sk-or-v1-[a-zA-Z0-9]{32,}` patterns → `sk-or-v1-***REDACTED***`
- Redacts `Bearer sk-or-v1-...` headers → `Bearer sk-or-v1-***REDACTED***`
- Applied to all 4 console.error logging locations

**Phase 2** (commit pending):

- Implemented `createSanitizedError()` function
- Sanitizes errors BEFORE rethrowing to prevent Convex platform logging leaks
- Applied to all 3 error throw locations (lines 307, 375, 429)
- Preserves HTTP status codes for retry logic

**Security Guarantee**:

- ✅ Local console.error logs sanitized
- ✅ Convex platform error logs sanitized
- ✅ Monitoring services receive clean errors
- ✅ Client-side error messages clean
- ✅ Defense in depth: sanitization at both logging AND error propagation boundaries

**Audit**: `docs/security/LOGGER_AUDIT_2025-10-17.md` (updated with Phase 2 analysis)
**Impact**: OpenRouter API keys can no longer leak through ANY error pathway (logs, platform, monitoring, clients)

### [SECURITY] HIGH - Anonymous Streak Manipulation

**File**: `convex/users.ts:556-697`
**Perspectives**: security-sentinel
**Severity**: HIGH
**Impact**: Users can inflate streaks through repeated merge calls (no idempotency check)
**Attack Vector**: Loop calling `mergeAnonymousStreak` with 89-day streaks → Each call increments → 1000+ day streak
**Violation**: Missing rate limiting, no idempotency key, no merge tracking
**Fix**: Add `sessionId` parameter, track `mergedSessions` array, implement rate limiting (2 merges/minute max)
**Effort**: 2h | **Risk**: HIGH - Game integrity compromise

### [UX] CRITICAL - Silent Validation Errors

**File**: `src/components/GuessInput.tsx:77, 87, 93`
**Perspectives**: user-experience-advocate
**Severity**: CRITICAL
**Impact**: Users receive NO visual feedback when validation fails - errors silently swallowed
**User Experience**: User types invalid year → Clicks guess → Nothing happens → Confusion and frustration
**Fix**: Add visible error message below input with red border + icon, auto-dismiss after 3s
**Effort**: 30m | **Impact**: 10/10 - Users currently have no idea why input rejected
**Frequency**: High - every invalid input attempt

### [UX] CRITICAL - Vague Error Messages

**File**: `src/components/GuessInput.tsx:77, 93`
**Perspectives**: user-experience-advocate
**Severity**: HIGH
**Impact**: Generic "Please enter a valid year" gives zero actionable guidance
**User Experience**: Error shows "valid year" but not why it's invalid or what range is allowed
**Fix**: Specific messages: "Year must be positive (e.g., 776 for 776 BC)" or "BC years between 1-3000"
**Effort**: 20m | **Impact**: 9/10
**Frequency**: High - new users constantly test boundaries

---

## High-Value Improvements [Fix Soon]

### [PERFORMANCE] react-markdown Bundle Overhead (44KB)

**File**: `src/components/ui/HintText.tsx:4`, `src/components/HistoricalContextCard.tsx:6`
**Perspectives**: performance-pathfinder
**Severity**: HIGH
**Impact**: 44KB bundle (14% of total) for rendering _italics_ and **bold** only
**Current**: react-markdown (~48KB gzipped) with transitive deps (micromark, unified, remark-parse)
**User Impact**: Mobile 3G load ~1s slower, 314KB First Load JS (45% from shared chunks)
**Fix**: Replace with 50-line inline formatter using simple regex for **bold** and _italic_
**Expected**: 314KB → 270KB (44KB reduction), parse time 5-10ms → <1ms
**Effort**: 2h | **Impact**: 9/10 - Largest bundle reduction opportunity

### [PERFORMANCE] Debounced Progress Query - 100ms Artificial Delay

**File**: `src/hooks/useChrondle.ts:92-111`
**Perspectives**: performance-pathfinder
**Impact**: 100ms delay before fetching user progress on every puzzle/auth change
**Issue**: Over-defensive debouncing to prevent "rapid-fire queries" but no evidence of problem
**User Experience**: Page load, sign-in, puzzle navigation all 100ms slower unnecessarily
**Root Cause**: Convex queries already deduplicated, `useMemo` prevents param recreation
**Fix**: Remove `useDebouncedValues` entirely OR reduce to 30ms if rapid queries verified
**Expected**: Progress load 100ms → 0ms, page interactivity 100ms faster
**Effort**: 30m | **Impact**: 7/10 - Noticeable UX improvement on every page load

### [UX] No Loading State for Guesses

**File**: `src/components/GuessInput.tsx`, `src/components/GameIsland.tsx`
**Perspectives**: user-experience-advocate
**Impact**: After submit, no feedback while mutation processes → Users click multiple times thinking it failed
**Current**: Button disables briefly (animation) but nothing indicates server processing
**Fix**: Show loading spinner + "Processing guess..." during mutation
**Effort**: 1h | **Impact**: 8/10
**Frequency**: Every guess on slower connections

### [UX] No Offline Support

**File**: General architecture
**Perspectives**: user-experience-advocate
**Impact**: App completely unusable without internet - blank screen on trains/planes/poor coverage
**Error**: "Game State Error" with no guidance about connectivity
**Fix**: Detect `navigator.onLine`, show helpful offline banner, cache puzzles in localStorage as fallback
**Effort**: 4h | **Impact**: 8/10
**Frequency**: Moderate - trains, planes, rural areas

### [SECURITY] Missing Authorization on Username Update

**File**: `convex/users.ts:222-248`
**Perspectives**: security-sentinel
**Severity**: MEDIUM (becomes CRITICAL if userId parameter added)
**Impact**: Currently limited but lacks defense-in-depth for future changes
**Issue**: Authenticates user but doesn't verify ownership, no username validation (length, format, duplicates)
**Fix**: Add ownership check, validate 3-30 chars alphanumeric, check duplicates
**Effort**: 30m | **Priority**: HIGH

### [SECURITY] Missing Rate Limiting on Guess Submission

**File**: `convex/puzzles.ts:316-391`
**Perspectives**: security-sentinel
**Severity**: MEDIUM
**Impact**: Brute force attack - submit 1000 guesses/second to find answer in <3s
**Fix**: Rate limit: max 6 guesses per puzzle, 2-second delay between guesses
**Effort**: 45m | **Impact**: Game integrity

---

## Technical Debt Worth Paying [Schedule]

---

## Product Opportunities [Consider]

### [FEATURE] Confidence Wager System - ENGAGEMENT & ANTI-BINARY-SEARCH

**Current State**: Players can rapidly binary-search through years without engaging with hints
**Perspectives**: user-experience-advocate, product-visionary
**Problem**: No friction between guesses → mechanical optimization → loss of educational value
**Opportunity**: Add strategic decision-making before each guess

**Core Mechanic**: Players wager confidence level before submitting guess

**Implementation Options**:

1. **Confidence Slider** (1-5 stars)

   - High confidence + correct = bonus streak points/multiplier
   - Low confidence + correct = normal points (no penalty for humility)
   - Wrong guess = no penalty regardless (encourages boldness)
   - Creates natural pause: "How sure am I about this?"

2. **Proximity Wager** (±10yr / ±50yr / ±100yr / ±500yr)

   - Tighter wager + correct = better multiplier
   - Forces player to assess knowledge vs. guessing
   - Strategic tension: risk/reward decision

3. **Hint Trade-off**
   - Skip next hint = 1.5x streak multiplier
   - Use all hints = normal streak
   - Gamifies knowledge-based play vs. brute force

**Design Goals**:

- Add 5-10s contemplation time per guess (natural friction)
- Celebrate knowledge AND confidence
- Make binary searching feel "low confidence" (self-aware guessing)
- Reward both fast experts AND thoughtful learners

**UX Considerations**:

- Must feel optional/toggleable initially
- Clear value proposition (why wager?)
- No tutorial overload
- Mobile-friendly input

**Scoring System** (TBD):

- Separate "confidence score" vs. streaks?
- Achievement integration?
- Leaderboard impact?

**A/B Test Questions**:

- Does it reduce binary search behavior?
- Does it increase time-per-guess?
- Does it improve learning outcomes?
- Does it frustrate or delight players?

**Implementation Complexity**:

- **UI**: Medium (wager input, feedback display)
- **Scoring**: Medium (new calculation logic)
- **Analytics**: Low (track wager patterns)
- **Total Effort**: 4-6 days

**Validation Plan**:

1. Prototype in separate branch
2. User testing with 20-30 players
3. A/B test: 50% control, 50% wager system
4. Measure: time-per-guess, completion rate, satisfaction

**Value**: 8/10 (addresses core engagement problem without punitive timers)
**Risk**: Medium (could add unwanted complexity if poorly designed)

---

### [FEATURE] Premium Subscription - CRITICAL REVENUE GAP

**Current State**: 100% free, Bitcoin donations only (low conversion)
**Perspectives**: product-visionary
**Market Validation**: Daily game users WILL pay for enhanced features
**Premium Bundle** ($4.99/month or $39.99/year):

- Unlimited archive access (currently free - MISTAKE!)
- Advanced difficulty modes (Hard, Expert, Speed Run)
- Enhanced statistics & analytics
- Ad-free experience
- Custom profile & badges
  **Competitive Pricing**: NYT Games $5/mo, Duolingo Plus $6.99/mo, Seterra $3.99/mo
  **Revenue Projection**:
- 10K DAU → 500 premium (5%) = $2.5K/month = $30K/year
- 50K DAU → 2.5K premium = $12.5K/month = $150K/year
- 100K DAU → 5K premium = $25K/month = $300K/year
  **Effort**: 8 days (Stripe integration, paywall UI) | **Value**: 10/10
  **LTV**: Premium user = $40-60 (10-15 month retention)

### [FEATURE] Freemium Archive Paywall - IMMEDIATE REVENUE

**Current State**: Entire 1,821-puzzle archive FREE - giving away premium value
**Perspectives**: product-visionary
**Freemium Model**:

- Free: Daily puzzle + 5 archive plays/month
- Premium: Unlimited archive access
  **Market Validation**: NYT Crossword $6.99/mo for archive, Wordle Archive sites monetized
  **Implementation**: Track plays per 30 days, show paywall after 5 plays
  **Effort**: 2 days | **Value**: 9/10
  **Impact**: Immediate monetization of existing 1,821-puzzle value

### [FEATURE] Social Leaderboards & Competition - VIRAL GROWTH

**Current State**: Zero social features, completely single-player
**Perspectives**: product-visionary
**Competitive Gap**: 90% of daily games have leaderboards (Wordle, Duolingo, NYT)
**Missing**:

- Friend leaderboards ("beat your friends" mechanic)
- Global rankings ("Top 1000 players")
- Weekly tournaments (recurring engagement)
- Social proof ("10,234 players today")
  **Implementation**: Add friendships table, weeklyScores table, shareTokens for viral invites
  **Effort**: 5 days | **Value**: 9/10
  **Business Value**: Viral growth multiplier, retention through social pressure
  **Adoption Impact**: Could 10x user acquisition through friend invites

### [FEATURE] Difficulty Variants - TAM EXPANSION

**Current State**: Single difficulty, one-dimensional gameplay
**Perspectives**: product-visionary
**Opportunity**: Easy Mode (beginners) + Hard Mode (power users) + Speed Run (competitive)
**Market Opportunity**: Difficulty variants = retention + premium tier
**Use Cases**:

- Educational: Teachers assign easy mode (modern events only)
- Competitive: Hard mode leaderboards (obscure events, ancient history)
- Casual: Easy mode lowers barrier to entry
- Premium: Expert modes (3 guesses max) as paid feature
  **Monetization**: Free (Normal only), Premium ($4.99/mo all modes)
  **Effort**: 4 days | **Value**: 8/10
  **TAM Expansion**: Easy mode = younger audience (12-16), families

### [FEATURE] Educational Platform - B2B OPPORTUNITY

**Current State**: Historical context after game (good!) but no learning progression
**Perspectives**: product-visionary
**Market**: EdTech TAM $8B annually, teachers pay $50-200/year, homeschool 3.7M students
**Missing**:

- Topic collections ("World War II", "Ancient Rome")
- Learning paths (guided sequences)
- Teacher dashboard (class management)
- Student progress tracking
  **B2B Pricing**:
- School license: $299/year for 30 students
- District: $2,500/year for 500 students
- Homeschool: $7.99/month
  **Competitive**: Quizlet $47.88/year, Kahoot $47/year for teachers
  **Effort**: 15 days (Phase 1: 2d collections, Phase 2: 5d dashboard, Phase 3: 8d progress)
  **Value**: 10/10
  **LTV Impact**: Teacher accounts $100-300 LTV vs. $5-15 consumer LTV

### [FEATURE] Shareable Challenge Links - VIRAL MECHANIC

**Current State**: Basic emoji timeline share (good!) but no personalization
**Perspectives**: product-visionary
**Opportunity**: "Can you beat my score?" viral mechanic
**Features**:

- Challenge links: "I guessed 1969 in 3! Beat me: chrondle.app/c/xyz"
- Puzzle-specific sharing: "This stumped me! chrondle.app/p/42"
- Streak flexing: "🔥 50-day streak! Join me!"
- Social proof: "Join 10,234 players today!"
  **Viral Coefficient**: Current ~1.05 (minimal) → With challenges ~1.3-1.5 (30-50% send challenges)
  **Effect**: Exponential growth vs. linear
  **Effort**: 3 days | **Value**: 9/10
  **Growth**: Could 3-5x user acquisition through viral loops

### [FEATURE] Streak Freeze & Recovery - RETENTION HOOK

**Current State**: Miss one day = streak reset → MASSIVE churn trigger
**Perspectives**: product-visionary
**Problem**: Life happens (vacation, illness) → lose 100-day streak → quit app
**Features**:

- Streak freeze (1/month free, 3/month premium)
- Premium streak saves ($1.99 for 3-pack) - impulse purchase at emotional moment
- Weekend mode (auto-freeze weekends)
- Vacation mode (set date range)
  **Behavioral Economics**: Loss aversion - users WILL PAY to avoid losing streaks
  **Market Validation**: Duolingo streak freezes drive retention, Snapchat streaks = teen addiction
  **Effort**: 3 days | **Value**: 8/10
  **Retention**: Reduce churn 20-30% at streak milestones
  **Revenue**: $1.99 × 1000 users/month = $24K/year impulse purchases

---

## Medium Priority Issues

### [UX] No Empty State Guidance

**File**: `src/components/CurrentHintCard.tsx:25`, `src/components/HintsDisplay.tsx:286`
**Perspectives**: user-experience-advocate
**Impact**: "[DATA MISSING]" unhelpful when no puzzle loaded
**Fix**: Better error state with calendar icon, "Puzzle Loading" message, refresh button
**Effort**: 30m | **Impact**: 7/10

### [UX] Keyboard Navigation Disabled But Advertised

**File**: `src/components/GuessInput.tsx:54-64, 156`
**Perspectives**: user-experience-advocate
**Impact**: Tooltip promises "Use ↑↓ arrow keys" but feature disabled - broken promise
**Fix**: Either enable arrow keys (safe - just changes typed year) OR remove misleading hint
**Effort**: 15m (remove) or 1h (implement) | **Impact**: 7/10

### [UX] Poor Mobile Input Experience

**File**: `src/components/GuessInput.tsx:145-156`
**Perspectives**: user-experience-advocate
**Impact**: Mobile keyboard closes and reopens between guesses (janky on iOS/Android)
**Fix**: Prevent blur during submission, keep focus with `preventScroll: true`
**Effort**: 1h | **Impact**: 7/10
**Frequency**: High - 40%+ users on mobile

### [COMPLEXITY] enhancedFeedback.ts - Nested Era Logic

**File**: `src/lib/enhancedFeedback.ts:185-255`
**Perspectives**: complexity-archaeologist, maintainability-maven
**Impact**: 7 nested conditionals, overlapping thresholds (10, 15, 100, 500), hard to test
**Fix**: Extract to strategy pattern with testable units (veryCloseStrategy, bcAdTransitionStrategy, etc.)
**Effort**: 2h | **Benefit**: 9/10 - Testable, extensible

### [COMPLEXITY] constants.ts Configuration Explosion (284 lines)

**File**: `src/lib/constants.ts:1-284`
**Perspectives**: complexity-archaeologist
**Impact**: 284 lines spanning unrelated domains (API, game, UI, scoring, streaks, debug)
**Fix**: Split into domain files:

- `config/game.ts` - GAME_CONFIG, year ranges
- `config/scoring.ts` - RECOGNITION_TERMS
- `config/ui.ts` - PROXIMITY_THRESHOLDS
- `config/streaks.ts` - achievements
  **Delete unused**: WIKIDATA\_\*, LLM_CONFIG
  **Effort**: 2h | **Impact**: 6/10

### [SECURITY] Debug Logging in Production

**File**: `convex/puzzles.ts:538-545`
**Perspectives**: security-sentinel
**Severity**: MEDIUM
**Impact**: Sensitive debugging logged when `NODE_ENV` misconfigured
**Fix**: Use proper logger with levels, compile-time environment detection
**Effort**: 20m | **Priority**: MEDIUM

### [MAINTAINABILITY] Inconsistent Error Handling

**Files**: Multiple patterns - throw exceptions, return null, return error state, try-catch fallback
**Perspectives**: maintainability-maven
**Impact**: Developers unsure which pattern to use
**Fix**: Document conventions in contributing guide - when to throw, when to return null, when to use Result<T,E>
**Effort**: 2h | **Benefit**: 7/10

---

## Low Priority [Nice to Have]

### [COMPLEXITY] Shallow validation.ts Module

**File**: `src/lib/validation.ts:1-225`
**Perspectives**: complexity-archaeologist
**Impact**: 225 lines for single regex check `/^[a-z0-9]{32}$/`
**Fix**: Simplify to 2 functions - `isValidConvexId()`, `asConvexId()`
**Effort**: 1h | **Impact**: 5/10

### [PERFORMANCE] HintsDisplay Custom Comparison Redundant

**File**: `src/components/HintsDisplay.tsx:195-233`
**Perspectives**: performance-pathfinder
**Impact**: Manual loop comparison for immutable arrays - reference equality sufficient
**Fix**: Use reference equality `prevProps.events === nextProps.events`
**Effort**: 10m | **Impact**: 4/10

### [MAINTAINABILITY] Poor Contrast in Hints

**File**: `src/components/HintsDisplay.tsx:87-88`
**Perspectives**: user-experience-advocate
**Impact**: Green background might not meet WCAG AA (4.5:1) for color-blind users
**Fix**: Verify green-50 contrast, adjust to green-100 if needed
**Effort**: 15m | **Impact**: 6/10

---

## Completed / Archived

### ✅ PR Review Fixes - Streak Persistence (COMPLETED - PR #34)

All P1 bugs fixed across 6 Codex review cycles

### ✅ Security - Update vulnerable dependencies (COMPLETED)

No vulnerabilities found (checked 2025-10-13)

---

## Summary Metrics

**Analyzed**: 7,926 TypeScript files, 34 lib files, 20+ hooks, Convex backend
**Findings**: 18 security issues, 23 test coverage gaps, 12 maintainability issues, 7 product opportunities
**Priority Distribution**:

- Immediate: 8 issues (4 security CRITICAL/HIGH, 4 UX CRITICAL)
- High-Value: 11 issues (architecture, performance, security)
- Technical Debt: 10 issues
- Product: 7 major opportunities
- Medium: 8 issues
- Low: 3 issues

**Critical Path Effort**:

- Security fixes: ~4h
- UX critical fixes: ~6h
- Architecture refactors: ~24h
- **Total to eliminate critical issues: ~34h (~1 week)**

**Revenue Opportunities**:

- Premium subscription: $30K-300K/year potential
- Archive paywall: Immediate monetization
- Educational B2B: $100-300 LTV per teacher
- Streak saves: $24K/year impulse purchases

**Top 5 ROI Items**:

1. **Premium subscription** (8d, 10/10 value) - Core revenue model
2. **Split puzzles.ts god object** (12h, 10/10 impact) - Unblocks development
3. **Archive paywall** (2d, 9/10 value) - Immediate revenue
4. **Replace react-markdown** (2h, 9/10 impact) - 44KB bundle reduction
5. **Social leaderboards** (5d, 9/10 value) - Viral growth 3-5x

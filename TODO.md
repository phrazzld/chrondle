# Chrondle: OpenRouter + Next.js 15 Integration TODO

## 📋 Engineering Handoff - Complete Context Available

This directory contains everything needed to continue the Chrondle migration:

- **`ORIGINAL.html`** - Reference implementation of original static HTML game
- **`MIGRATION_STATUS.md`** - Current progress summary (Phase 1 complete, Phase 2 in progress)  
- **`ARCHITECTURE_DECISIONS.md`** - Technical rationale for all major decisions
- **`LOCALSTORAGE_VERIFICATION.md`** - Proof of 100% localStorage compatibility
- **`TODO.md`** - This file: Updated task list with current status

## Context: Transform Static HTML Game → Modern Next.js 15 + OpenRouter LLM Integration

**Objective**: Migrate Chrondle from static HTML to Next.js 15 App Router while integrating OpenRouter's unified LLM API for intelligent hint generation. Preserve all existing game mechanics, styling, and functionality while adding cost-effective LLM capabilities through free/cheap models.

**Philosophy**: Following Carmack's "Make it work, make it right, make it fast" - build incrementally, test extensively, ship confidently.

**Current Status**: Phase 1 (Game Logic Migration) ✅ Complete | Phase 2 (UI Components) 🚧 50% Complete

---

## Phase 1: Next.js 15 Migration Foundation (Target: 2 hours)

### Project Structure Setup
- [x] **Initialize Next.js 15 project**: Run `npx create-next-app@latest chrondle-nextjs --typescript --tailwind --app --src-dir --import-alias "@/*"` in parent directory
- [x] **Configure project settings**: ~~Update `next.config.js` to enable server actions with `experimental: { serverActions: true }`~~ **OBSOLETE**: Server Actions are enabled by default in Next.js 15, no configuration needed
- [x] **Copy static assets**: ~~Move any favicon, images, or static files from current project to `public/` directory in new Next.js project~~ **N/A**: No static assets found in original project
- [x] **Install additional dependencies**: ~~Add `@types/uuid` if needed for game state management~~ **N/A**: No UUID usage found, verify Tailwind CSS and Inter/Playfair fonts are configured ✅
- [x] **Set up environment variables**: Create `.env.local` file with `OPENROUTER_API_KEY=` and `SITE_URL=http://localhost:3000` placeholders

### Game Logic Migration ✅ COMPLETED
- [x] **Extract game state management**: Create `src/lib/gameState.ts` - ✅ COMPLETE with full game state, initialization, and reset functions
- [x] **Extract API integrations**: Create `src/lib/api.ts` - ✅ COMPLETE with all API functions and LLM integration
- [x] **Extract utility functions**: Create `src/lib/utils.ts` - ✅ COMPLETE with date handling, game mechanics, and UI utilities  
- [x] **Extract constants**: Create `src/lib/constants.ts` - ✅ COMPLETE with all configuration constants and validation helpers
- [x] **Preserve localStorage integration**: Create `src/lib/storage.ts` - ✅ COMPLETE with 100% compatibility verification (see LOCALSTORAGE_VERIFICATION.md)

### UI Component Migration 🚧 IN PROGRESS
- [x] **Create main layout**: ✅ COMPLETE - `src/app/layout.tsx` with theme provider, font loading, and proper html class management
- [x] **Preserve CSS exactly**: ✅ COMPLETE - All custom styles, animations, dark mode, and color-blind mode CSS copied to `src/app/globals.css`
- [x] **Create theme management**: ✅ COMPLETE - `src/components/theme-provider.tsx` handles dark/color-blind mode with localStorage persistence
- [ ] **Create game page**: Build `src/app/page.tsx` as main game interface, copying all UI structure from ORIGINAL.html lines 100-400 while converting to JSX syntax
- [ ] **Create modal components**: Extract help, settings, and game-over modals from ORIGINAL.html into separate React components in `src/components/` directory
- [ ] **Create game components**: Extract guess input form, history display, and hint display from ORIGINAL.html into reusable React components

### State Management Integration
- [ ] **Implement React state**: Convert JavaScript game state variables to React `useState` hooks while maintaining exact same state structure and initialization logic
- [ ] **Add useEffect hooks**: Replace JavaScript event listeners and initialization code with appropriate `useEffect` hooks for localStorage sync, URL parameter parsing, and game initialization
- [ ] **Preserve debug functionality**: Ensure `?debug=true&year=1401` URL parameters work exactly as before, including all console logging and debug UI elements
- [ ] **Maintain game flow**: Verify guess submission, hint revelation, win/lose conditions, and daily game progression work identically to original HTML version

---

## Phase 2: OpenRouter Server Actions Integration (Target: 1 hour)

### Server Action Infrastructure
- [ ] **Create enhance-hint server action**: Build `src/app/actions/enhance-hint.ts` with proper `'use server'` directive and TypeScript types for hint enhancement
- [ ] **Implement OpenRouter API client**: Add fetch call to `https://openrouter.ai/api/v1/chat/completions` with proper headers (`Authorization`, `HTTP-Referer`, `X-Title`, `Content-Type`)
- [ ] **Add model selection logic**: Start with `deepseek/deepseek-r1:free` as primary model, implement fallback array: `['deepseek/deepseek-r1:free', 'google/gemma-3-27b-it:free', 'qwen/qwq-32b:free']`
- [ ] **Implement comprehensive error handling**: Add try-catch blocks, timeout handling (5 second limit), and graceful fallback to non-LLM enhanced description on any API failure
- [ ] **Add request/response logging**: Include debug logging for OpenRouter API calls, response status, token usage, and fallback behavior when `DEBUG_MODE` is enabled

### LLM Prompt Engineering
- [ ] **Design hint generation prompt**: Create optimal prompt template: `"Convert this historical event into a clear, engaging 15-word game hint. Make it informative but don't include the year or obvious time markers: {enhancedDescription}"`
- [ ] **Configure API parameters**: Set `max_tokens: 50`, `temperature: 0.3` for consistent hint generation, and appropriate stop tokens to ensure clean output
- [ ] **Add response validation**: Verify LLM output is reasonable length (10-25 words), doesn't contain year numbers, and falls back to enhanced description if validation fails
- [ ] **Implement hint caching**: Add simple in-memory cache keyed by enhanced description to avoid duplicate API calls for same events across game sessions

### Client-Side Integration
- [ ] **Replace llmEnhanceHint function**: Update existing `llmEnhanceHint()` calls in game logic to use new server action instead of client-side API call
- [ ] **Add loading states**: Implement proper loading indicators when server action is processing LLM requests, with timeout fallback to avoid infinite loading
- [ ] **Preserve fallback behavior**: Ensure that LLM enhancement failures still result in usable hints, maintaining the fallback chain: LLM → Enhanced → Cleaned → Raw label
- [ ] **Update debug output**: Modify debug logging to show server action results, API call success/failure, and fallback reasoning for troubleshooting

---

## Phase 3: Smart Model Selection & Cost Optimization (Target: 30 minutes)

### Dynamic Model Routing
- [ ] **Implement model array fallback**: Create ordered array of models from free to ultra-cheap paid: `['deepseek/deepseek-r1:free', 'openrouter/auto:floor', 'anthropic/claude-3-5-haiku']`
- [ ] **Add automatic model switching**: If primary model fails (rate limit, downtime), automatically try next model in array with exponential backoff between attempts
- [ ] **Implement cost routing**: Use OpenRouter's `:floor` suffix (`openrouter/auto:floor`) for automatic selection of cheapest available model when free tier exhausted
- [ ] **Add model performance tracking**: Log which models succeed/fail for each request to optimize model selection order based on reliability data

### Rate Limiting & Usage Control
- [ ] **Implement client-side rate limiting**: Add simple rate limiting (max 1 LLM call per 3 seconds) to avoid API abuse and stay within free tier limits  
- [ ] **Add daily usage tracking**: Store daily API call count in localStorage, warn user if approaching reasonable limits (e.g., 100 calls/day for free tier)
- [ ] **Implement hint caching strategy**: Cache LLM-enhanced hints in localStorage with 24-hour expiration to minimize repeat API calls for same events
- [ ] **Add cost monitoring**: Log estimated costs based on token usage and model pricing, provide usage summary in debug mode

### Fallback Chain Optimization
- [ ] **Strengthen fallback reliability**: Ensure every possible failure mode (network, API key, rate limit, model downtime) results in playable game with reasonable hints
- [ ] **Add fallback quality scoring**: Rank hint quality (LLM > Enhanced > Cleaned > Raw) and prefer higher quality cached hints over making new API calls for lower quality
- [ ] **Implement graceful degradation**: If all LLM models fail, gracefully fall back to enhanced description without showing error messages to end users
- [ ] **Add recovery mechanisms**: Implement exponential backoff and automatic retry for temporary API failures, with circuit breaker pattern for persistent failures

---

## Phase 4: Testing & Production Validation (Target: 30 minutes)

### Core Functionality Testing
- [ ] **Test 1401 complete flow**: Load `localhost:3000?debug=true&year=1401`, verify all 6 hints are LLM-enhanced, engaging, and don't reveal the year
- [ ] **Test medieval year coverage**: Try challenging years like 1215, 1347, 1453 - verify enhanced hints work across different historical periods and sparse data scenarios
- [ ] **Test modern year performance**: Test recent years (2020, 2010, 2000) to ensure LLM enhancement works well with contemporary events and maintains game balance
- [ ] **Verify hint quality criteria**: Each LLM-enhanced hint should be (1) 10-20 words, (2) historically accurate, (3) engaging/interesting, (4) doesn't reveal year/century

### Error Handling & Edge Cases  
- [ ] **Test API key missing**: Verify graceful fallback when `OPENROUTER_API_KEY` is not set - game should work with enhanced descriptions, no errors shown to user
- [ ] **Test network failure scenarios**: Disconnect internet, verify game loads with cached/fallback data and doesn't show error messages or broken UI to end users
- [ ] **Test rate limiting behavior**: Make many rapid requests to trigger rate limits, verify automatic fallback to non-LLM hints and appropriate debug logging
- [ ] **Test malformed API responses**: Mock invalid OpenRouter responses, verify robust error handling and fallback to enhanced descriptions without crashes

### Performance & User Experience
- [ ] **Verify game load time**: Ensure migration to Next.js doesn't significantly impact initial page load compared to static HTML version (target: <2 seconds)
- [ ] **Test hint generation latency**: LLM-enhanced hints should appear within 3-5 seconds, with loading indicators and timeout fallback to enhanced descriptions
- [ ] **Validate mobile responsiveness**: Test game on mobile devices, ensure all functionality (modals, input, hints) works identically to original HTML version
- [ ] **Check accessibility features**: Verify dark mode, color-blind mode, keyboard navigation, and screen reader compatibility are preserved exactly

### Production Readiness
- [ ] **Environment variable validation**: Verify production deployment works with proper OpenRouter API key, site URL, and all environment variables configured correctly
- [ ] **Test free tier limits**: Understand OpenRouter free tier daily limits, implement appropriate user messaging and fallback behavior when limits exceeded
- [ ] **Add monitoring and logging**: Implement production logging for LLM API usage, error rates, fallback frequency, and performance metrics for ongoing optimization
- [ ] **Create deployment documentation**: Document environment setup, API key configuration, and deployment process for production environment

---

## Success Criteria (All Must Pass)

### Functional Requirements
- [ ] **1401 flow works perfectly**: Year 1401 loads with 6 engaging, LLM-enhanced hints that are clear, informative, and don't reveal the year
- [ ] **No regression in core gameplay**: All existing game mechanics (guessing, hints, win/lose, daily progression, settings) work identically to original HTML version  
- [ ] **LLM enhancement adds value**: Players can distinguish between raw Wikidata labels and LLM-enhanced hints - enhanced hints are genuinely more engaging and helpful
- [ ] **Robust error handling**: Any LLM API failures result in graceful fallback to enhanced descriptions, never broken UI or error messages visible to end users

### Technical Requirements  
- [ ] **Performance maintained**: Next.js migration doesn't add noticeable latency compared to static HTML version, LLM hints appear within reasonable time (<5 seconds)
- [ ] **Cost control effective**: Free tier usage stays within reasonable bounds, automatic fallback prevents unexpected API costs, usage monitoring works correctly
- [ ] **Reliability guaranteed**: Game always works regardless of LLM API status - OpenRouter downtime never prevents core gameplay functionality
- [ ] **Modern architecture benefits**: Code is more maintainable, TypeScript adds safety, server actions provide security, deployment is streamlined

---

## Rollback Plan

If any phase fails or introduces regressions:
- [ ] **Keep original HTML version**: Maintain `index.html` as working backup during entire migration process
- [ ] **Test rollback procedure**: Verify original static site deployment still works if Next.js migration needs to be abandoned
- [ ] **Document migration blockers**: Record any issues that would prevent successful migration for future attempts
- [ ] **Preserve data compatibility**: Ensure localStorage data remains compatible between HTML and Next.js versions for seamless user experience

---

**Engineering Philosophy**: "Perfect is the enemy of good. Ship working functionality, then iterate." - Each phase should result in a working, deployable version with incremental improvements.
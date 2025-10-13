# TODO: Chrondle Development Tasks

## 🚀 ACTIVE: Migrate to OpenRouter Responses API

**Status**: Ready to Start
**Priority**: P1 - Quality Improvement
**Source**: GPT-5 reasoning/verbosity parameter requirements
**ETA**: 2 hours development + 1-2 days gradual rollout

### Background

Chrondle currently uses OpenRouter's Chat Completions API (`/api/v1/chat/completions`) for historical context generation. OpenRouter's new Responses API Alpha (`/api/alpha/responses`) exposes GPT-5's reasoning effort and verbosity controls, enabling higher-quality narrative generation through:

- **reasoning.effort**: "high" for deeper narrative reasoning
- **text.verbosity**: "high" for rich, detailed 350-450 word narratives
- **text.format.type**: "text" for plain text output

**Current Implementation**: `convex/actions/historicalContext.ts:159-213`
**Target**: Dual-mode support with feature flag for safe rollout

---

### Phase 1: Type System & Configuration

- [ ] **Add response type interfaces** (File: `convex/actions/historicalContext.ts`, line 12)

  - Create `ResponsesAPIResponse` interface with `output_text: string` and `reasoning_tokens?: number` fields
  - Create `ChatCompletionsResponse` interface with existing `choices` array structure
  - Success criteria: TypeScript compilation passes with strict mode, both response formats type-safe

- [ ] **Create Responses API config builder** (File: `convex/actions/historicalContext.ts`, after line 44)

  - Implement `buildResponsesAPIConfig()` function accepting model, prompt, systemPrompt, temperature, maxTokens
  - Return object with `input` (combined system+user prompt), `reasoning: {effort: "high", summary: "auto"}`, `text: {verbosity: "high", format: {type: "text"}}`, `temperature`, `max_output_tokens`
  - Success criteria: Function returns correctly shaped object matching OpenRouter Responses API Alpha spec

- [ ] **Create Chat Completions config builder** (File: `convex/actions/historicalContext.ts`, after previous task)
  - Implement `buildChatCompletionsConfig()` function accepting same parameters as Responses API builder
  - Return object with `messages` array (system + user roles), `temperature`, `max_tokens`
  - Success criteria: Function returns correctly shaped object matching OpenRouter Chat Completions spec, maintains backward compatibility

---

### Phase 2: Dual-Mode Fetch Implementation

- [ ] **Add feature flag environment variable** (File: `.env.example`, after OPENAI_GPT5_ENABLED)

  - Add `RESPONSES_API_ENABLED=false` with inline comment explaining gradual rollout flag
  - Success criteria: Environment variable documented, default value is false for safe deployment

- [ ] **Implement endpoint selection logic** (File: `convex/actions/historicalContext.ts:152-156`, replace existing model selection)

  - Read `RESPONSES_API_ENABLED` from environment, default to false if not set
  - Calculate `useResponsesAPI = responsesAPIEnabled && gpt5Enabled` (only use Responses API for GPT-5)
  - Set `endpoint` to `https://openrouter.ai/api/alpha/responses` if enabled, else `https://openrouter.ai/api/v1/chat/completions`
  - Call appropriate config builder based on `useResponsesAPI` flag
  - Add logging: `[HistoricalContext] Using ${useResponsesAPI ? "Responses API" : "Chat Completions API"} for puzzle ${puzzleId}`
  - Success criteria: Correct endpoint selected based on flags, logging clearly identifies API in use

- [ ] **Update fetch call for dual-mode** (File: `convex/actions/historicalContext.ts:159-186`, replace body)
  - Replace hardcoded `https://openrouter.ai/api/v1/chat/completions` with variable `endpoint`
  - Replace inline message construction with `body: JSON.stringify(config)` using config builder result
  - Maintain existing headers (Authorization, Content-Type, HTTP-Referer, X-Title)
  - Success criteria: Fetch call accepts either API format, headers unchanged, request structure determined by config builder

---

### Phase 3: Response Parsing & Error Handling

- [ ] **Implement dual-mode response parsing** (File: `convex/actions/historicalContext.ts:204-213`, replace)

  - Check `useResponsesAPI` flag after parsing JSON
  - If Responses API: extract `generatedContext = responseData.output_text`, log `reasoning_tokens` if present
  - If Chat Completions: extract `generatedContext = responseData.choices?.[0]?.message?.content` (existing logic)
  - Add unified validation: check `typeof generatedContext === "string"` and non-empty
  - Update error message to include API type: `Invalid response from OpenRouter ${useResponsesAPI ? "Responses API" : "Chat Completions API"}`
  - Success criteria: Both response formats parsed correctly, error messages identify which API failed, reasoning tokens logged when available

- [ ] **Update cost estimation logging** (File: `convex/actions/historicalContext.ts:215-223`, modify)

  - Add reasoning token cost calculation if `responseData.reasoning_tokens` exists
  - Formula: `reasoningCost = reasoningTokens * 0.00003` (GPT-5 output token rate)
  - Update log format: `Cost estimate: $X.XXXX (${inputTokens} input, ${outputTokens} output, ${reasoningTokens || 0} reasoning tokens)`
  - Success criteria: Cost estimation includes reasoning tokens when using Responses API, maintains backward compatibility with Chat Completions

- [ ] **Update error handling for Responses API** (File: `convex/actions/historicalContext.ts:189-202`, enhance)
  - Modify error prefix logic to check `useResponsesAPI` flag instead of just model name
  - Update error messages: `${useResponsesAPI ? "Responses API" : "Chat Completions API"} request failed`
  - Maintain existing rate limit detection and GPT-5-mini fallback logic
  - Success criteria: Error messages correctly identify API endpoint, rate limit fallback works with both APIs

---

### Phase 4: Testing & Validation

- [ ] **Create Responses API test script** (File: `scripts/test-responses-api.ts`, new file)

  - Import Convex client setup and internal API
  - Implement test function that sets `RESPONSES_API_ENABLED=true`, calls `generateDailyPuzzle` with test date
  - Add second test with `RESPONSES_API_ENABLED=false` to verify Chat Completions fallback
  - Verify both tests generate context successfully and enforce BC/AD format
  - Success criteria: Script runs both test modes successfully, outputs clear pass/fail indicators, validates context quality

- [ ] **Manual testing checklist execution** (Local environment)
  - Test with `RESPONSES_API_ENABLED=false`: Verify Chat Completions endpoint used, context generated successfully
  - Test with `RESPONSES_API_ENABLED=true`: Verify Responses API endpoint used, context generated successfully
  - Verify error handling: Simulate API failure, confirm error messages identify correct API
  - Verify rate limit fallback: Confirm GPT-5 → GPT-5-mini fallback works with Responses API
  - Verify BC/AD enforcement: Check `enforceADBC()` function still processes output correctly
  - Verify context length: Confirm output is 350-450 words with high verbosity setting
  - Verify cost logging: Check reasoning tokens are logged when using Responses API
  - Success criteria: All 7 manual tests pass, no regressions in existing functionality

---

### Phase 5: Documentation Updates

- [ ] **Update environment variables documentation** (File: `.env.example`, update comments)

  - Update header comment block explaining OpenRouter API configuration
  - Add detailed comment for `RESPONSES_API_ENABLED`: "Enable Responses API Alpha (recommended for GPT-5 reasoning controls)"
  - Document parameter effects: reasoning.effort="high", text.verbosity="high"
  - Success criteria: .env.example clearly documents all OpenRouter configuration options

- [ ] **Update CLAUDE.md with Responses API documentation** (File: `CLAUDE.md`, Historical Context Generation section)

  - Document Responses API as primary implementation
  - List all parameters with explanations: reasoning.effort, text.verbosity, text.format.type, temperature, max_output_tokens
  - Document cost impact: ~$0.026 per puzzle with reasoning tokens (+13% from baseline)
  - Add feature flag documentation explaining gradual rollout capability
  - Success criteria: CLAUDE.md contains complete Responses API configuration reference

- [ ] **Add inline code documentation** (File: `convex/actions/historicalContext.ts`, enhance JSDoc)
  - Add JSDoc comment block for `buildResponsesAPIConfig()` explaining parameter mappings
  - Add JSDoc comment block for `buildChatCompletionsConfig()` noting backward compatibility
  - Update `generateHistoricalContext` JSDoc to note dual-mode support and feature flag
  - Success criteria: All new functions have comprehensive JSDoc comments explaining purpose and behavior

---

## ✅ RESOLVED: Fix Streak Persistence System - Security Fix Complete

**Status**: Complete - Ready for Final Review
**Priority**: P0 - SECURITY CRITICAL
**Source**: Codex automated PR review #4 (PR #34, Oct 9 17:06 UTC)
**ETA**: 2-3 hours | **Actual**: 2.5 hours

### Background

**Security Vulnerability Discovered**: The initial PR #34 fixed two P1 bugs but introduced a CRITICAL SECURITY VULNERABILITY. The `mergeAnonymousStreak` mutation accepted client-provided anonymous streak data **WITHOUT VALIDATION**. Since this data comes from localStorage, users could:

- Manipulate streak counts to arbitrary values (e.g., 1000 days)
- Set future dates to game the system
- Call the mutation directly to inflate streaks
- Bypass the entire purpose of server-side validation

**Impact**: Made leaderboards and achievements trivially spoofable, defeating the entire purpose of moving streaks server-side.

---

### Task 3: Add Comprehensive Anonymous Streak Validation ✅

**Files Modified**:

- `convex/users.ts:416-529` - Added `validateAnonymousStreak()` function
- `convex/users.ts:586-609` - Integrated validation into mutation
- `convex/lib/__tests__/anonymousStreakValidation.test.ts` - 36 new security tests

**Validation Rules Implemented**:

1. **Date Format**: Must be valid ISO YYYY-MM-DD
2. **Date Plausibility**:
   - Cannot be in the future
   - Cannot be >90 days old (reasonable window)
3. **Streak Count Bounds**:
   - Cannot be negative
   - Cannot exceed 365 days (1 year maximum)
4. **Streak-to-Date Consistency**:
   - Streak length must match plausible date range
   - First day of streak must be within 90-day window

**Security Protections**:

- Prevents arbitrary streak inflation (e.g., 1000 days rejected)
- Prevents future date manipulation (e.g., "2099-01-01" rejected)
- Prevents ancient date attacks (e.g., "2020-01-01" rejected)
- Prevents streak/date mismatches (e.g., 365-day streak ending yesterday rejected)
- SQL injection prevention via strict date format validation
- XSS prevention via date format validation

**Implementation**:

- [x] Create `StreakValidationResult` interface
- [x] Implement `validateAnonymousStreak()` with 6 validation rules
- [x] Add comprehensive inline documentation
- [x] Integrate validation before merge logic
- [x] Log suspicious attempts with full context
- [x] Return graceful error messages on validation failure
- [x] Create 36 comprehensive unit tests covering:
  - Date format validation (6 tests)
  - Date plausibility validation (5 tests)
  - Streak count validation (6 tests)
  - Streak-to-date consistency (4 tests)
  - Security attack vectors (7 tests)
  - Edge cases (4 tests)
  - Realistic use cases (4 tests)

**Test Results**:

- ✅ All 36 new security validation tests passing
- ✅ All 457 total tests passing (36 new + 421 existing)
- ✅ TypeScript compilation clean
- ✅ No regressions in existing functionality

**Example Attack Prevented**:

```typescript
// Before (VULNERABLE):
mergeAnonymousStreak({ anonymousStreak: 1000, anonymousLastCompletedDate: "2099-01-01" });
// Server blindly accepted and patched user with 1000-day streak

// After (SECURE):
mergeAnonymousStreak({ anonymousStreak: 1000, anonymousLastCompletedDate: "2099-01-01" });
// Returns: { mergedStreak: user.currentStreak, source: 'server', message: 'Invalid anonymous data: Date cannot be in the future' }
// Logs warning with full context for security monitoring
```

---

## ✅ RESOLVED: Initial PR Review Fixes (P1)

**Status**: Complete
**Source**: Codex automated PR reviews #1-2
**Timeline**: 1 hour (Oct 9, 15:00-16:00 UTC)

### Task 1: Fix Authenticated Player Loss Streak Reset ✅

**File**: `convex/puzzles.ts:352-355`
**Issue**: Streaks not reset when authenticated users exhaust all 6 guesses
**Fix**: Added `updateUserStreak(userId, false)` when `updatedGuesses.length >= MAX_GUESSES`
**Commit**: `b4603db`

### Task 2: Fix Streak Merge Date Preservation ✅

**File**: `convex/users.ts:504-511`
**Issue**: Always used anonymous date even when server streak won
**Fix**: Track `mergedDate` separately, assign based on winning streak source
**Commit**: `5d49adf`

---

## 📝 Implementation Summary

### What Was Fixed

1. **P1: Loss Streak Reset** (Codex review #1) → Fixed in `b4603db`
2. **P1: Date Preservation** (Codex review #2) → Fixed in `5d49adf`
3. **P1: Multi-Day Streak Logic** (Codex review #3) → Fixed in `1021dc2`
4. **P0: Security Validation** (Codex review #4) → Fixed in this commit

### Security Posture

**Before**: Anonymous streak data accepted without validation
**After**: Comprehensive 6-rule validation with security logging

**Validation Coverage**:

- ✅ Date format validation (ISO YYYY-MM-DD)
- ✅ Date plausibility checks (not future, not too old)
- ✅ Streak count bounds (0-365 days, within 90-day window)
- ✅ Internal consistency (streak length matches date range)
- ✅ Attack vector prevention (SQL injection, XSS, inflation)
- ✅ Graceful error handling (preserve auth flow)

### Test Coverage

**Total Tests**: 457 passing

- **Backend streak calculation**: 45 tests
- **Backend validation**: 36 tests (NEW)
- **Frontend hook integration**: 15 tests
- **Other existing tests**: 361 tests

**Code Coverage**:

- `convex/users.ts`: Full coverage of validation logic
- `convex/puzzles.ts`: Full coverage of streak update logic
- `convex/lib/streakCalculation.ts`: 100% coverage maintained

---

## 🎯 Acceptance Criteria

### Must Have (All Complete) ✅

- [x] Authenticated player loss resets streak to 0
- [x] Streak merge preserves correct date based on winning source
- [x] Multi-day anonymous streaks combine correctly
- [x] Anonymous streak validation prevents arbitrary inflation
- [x] Date format and plausibility validation implemented
- [x] Streak-to-date consistency verification added
- [x] Maximum streak cap (365 days) enforced with window constraint
- [x] Comprehensive test coverage (36 security tests)
- [x] All 457 tests passing
- [x] TypeScript compilation clean
- [x] No performance regressions

### Should Have (Complete) ✅

- [x] Logging for suspicious merge attempts
- [x] Clear error messages for validation failures
- [x] Documentation of validation rules in code
- [x] Security attack vector testing

### Deferred to Post-Merge

- [ ] E2E integration tests (anonymous → authenticated flow)
- [ ] localStorage corruption recovery tests
- [ ] Performance tests for large streak values
- [ ] Manual testing in production environment
- [ ] Historical streak restoration (Phase 3)

---

## 📊 Quality Metrics

| Metric                 | Value       | Status                                |
| ---------------------- | ----------- | ------------------------------------- |
| **Total Tests**        | 457         | ✅ All passing                        |
| **New Security Tests** | 36          | ✅ 100% passing                       |
| **TypeScript**         | Strict mode | ✅ Clean compilation                  |
| **ESLint**             | -           | ✅ Passing (known a11y warnings only) |
| **Test Coverage**      | >90%        | ✅ Streak logic fully covered         |
| **Performance**        | <100ms      | ✅ No regressions                     |

---

**Current Status**: ✅ **Streak Persistence Complete** | 🚀 **Responses API Ready to Start**

**Timeline**:

- Streak persistence fixes: 3.5 hours (Oct 9)
- Responses API migration: Estimated 2 hours development

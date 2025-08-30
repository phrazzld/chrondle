- update historical context ai calls to use gpt-5
- update historical context prompts to enforce bc/ad (instead of bce/ce) -- and backfill / update existing historical context
- align chrondle puzzle number in header (it is unaligned on mobile)
- maybe just remove the hint dots under the timeline and above the actual hints
- on mobile, make the keyboard used for the guess input the numerical keyboard

---

# Enhanced Specification

## Research Findings

### Industry Best Practices

- **GPT-5 Integration**: GPT-5 is available with model variants `gpt-5`, `gpt-5-thinking`, `gpt-5-mini`, `gpt-5-nano` via OpenRouter API
- **Date Format Standards**: While BCE/CE is academic standard, BC/AD remains widely understood and is appropriate for general audience games
- **Mobile UX**: Numeric keyboards should use `inputMode="numeric"` with `pattern="[0-9-]*"` to support negative years for BC dates
- **Progressive UI**: Keep visual progress indicators but add clear text labels for accessibility

### Technology Analysis

- **OpenRouter API**: Current integration uses `google/gemini-2.5-flash`, will migrate to `openai/gpt-5-mini` for cost efficiency
- **Convex Database**: 17 puzzles exist with historical context stored, batch operations supported via scheduler
- **React/Next.js**: Mobile-first responsive design with Tailwind CSS for alignment fixes
- **Migration Tools**: Convex scheduler with rate limiting for API batch operations

### Codebase Integration

- **Historical Context**: Located in `/convex/actions/historicalContext.ts`, uses OpenRouter API with structured prompts
- **Mobile Input**: GuessInput component at `src/components/GuessInput.tsx:145-156` uses `type="text"` pattern
- **Header Component**: Alignment issues in header component with flexbox layout needing baseline adjustment
- **Game Progress**: Bubble dots in GameProgress component to be enhanced with text label
- **Migration Pattern**: Existing migration at `/convex/migrations/generateMissingContext.ts` with batch processing

## Detailed Requirements

### Functional Requirements

- **FR1: GPT-5 Model Migration**: Update OpenRouter API calls from `google/gemini-2.5-flash` to `openai/gpt-5`

  - Acceptance: All historical context generation uses GPT-5 model
  - Error handling: Fallback to GPT-5-mini if rate limited

- **FR2: BC/AD Format Enforcement**: Convert all date displays and AI prompts to use BC/AD format universally

  - Acceptance: No BCE/CE references remain in UI or generated content
  - Scope: Timeline, feedback messages, historical context, all user-facing text

- **FR3: Historical Context Regeneration**: Backfill all 17 existing puzzles with BC/AD formatted content

  - Acceptance: All puzzles have updated historical context using new format
  - Rate limiting: Process in batches of 5 with 2-second delays

- **FR4: Mobile Header Alignment**: Fix vertical alignment of puzzle number to match baseline of "C" in CHRONDLE

  - Acceptance: Puzzle number sits on same baseline as logo text on all mobile devices

- **FR5: Game Progress Enhancement**: Add "Guesses Remaining:" text before bubble dots

  - Acceptance: Text label appears before progress indicators
  - Button text: Change from showing guess count to simply "Guess"

- **FR6: Mobile Numeric Keyboard**: Enable numeric keyboard for year input on mobile devices
  - Acceptance: Mobile users see numeric keypad when focusing input field

### Non-Functional Requirements

- **Performance**: API calls must complete within 10 seconds with retry logic
- **Security**: API keys remain server-side only, no client exposure
- **Scalability**: Batch processing must handle up to 100 puzzles without timeout
- **Availability**: System remains functional if GPT-5 unavailable (fallback to existing model)

## Architecture Decisions

### Technology Stack

- **AI Model**: GPT-5-mini via OpenRouter because it offers best cost/performance ratio
- **Prompt Format**: Structured system/user messages with explicit BC/AD formatting rules
- **Migration Tool**: Convex scheduler because it provides built-in rate limiting and retry logic
- **Mobile Input**: HTML5 inputMode attribute because it's native and widely supported

### Design Patterns

- **Architecture Pattern**: Server-side AI generation with client-side caching
- **Data Flow**: Convex actions → OpenRouter API → Database storage → Client rendering
- **Error Handling**: Exponential backoff with 3 retries, fallback to cached content

### Proposed ADR

**Title**: Migrate to GPT-5 for Historical Context Generation

**Status**: Proposed

**Context**:
Chrondle currently uses google/gemini-2.5-flash for generating historical context. With GPT-5 now available, we need to upgrade for better quality and consistency.

**Decision**:

- Use `openai/gpt-5-mini` as primary model via OpenRouter
- Implement BC/AD format universally across all date displays
- Regenerate all existing historical context with new standards

**Consequences**:

- **Positive**: Improved content quality, consistent date formatting, better historical accuracy
- **Negative**: One-time migration cost (~17 API calls), potential rate limiting during migration
- **Neutral**: Slight increase in per-request cost offset by better caching

**Alternatives Considered**:

- Keep Gemini 2.5: Lower cost but inconsistent formatting
- Use GPT-4.5: Available now but GPT-5 offers better performance
- Partial migration: Would create inconsistent user experience

## Implementation Strategy

### Development Approach

1. **Phase 1**: Update prompts and model configuration (1 hour)
2. **Phase 2**: Fix mobile UI issues (header alignment, keyboard) (30 minutes)
3. **Phase 3**: Enhance game progress UI with text labels (30 minutes)
4. **Phase 4**: Run migration to regenerate historical context (1 hour including monitoring)

### MVP Definition

1. GPT-5 integration with BC/AD prompts working
2. Mobile header alignment and numeric keyboard fixed
3. Game progress UI enhanced with "Guesses Remaining:" label

### Technical Risks

- **Risk 1**: GPT-5 rate limits → Mitigation: Implement aggressive rate limiting (1 request/second)
- **Risk 2**: Migration fails partway → Mitigation: Track progress in database, allow resume
- **Risk 3**: Cost overrun → Mitigation: Use GPT-5-mini, implement cost monitoring

## Integration Requirements

### Existing System Impact

- **Historical Context Action**: Update model and prompt configuration
- **UI Components**: GuessInput, GameProgress, Header components need updates
- **Database**: No schema changes, only data updates to historical context field

### API Design

```typescript
// Updated OpenRouter call
{
  model: "openai/gpt-5",
  messages: [
    {
      role: "system",
      content: "You are a master historian, storyteller, and teacher. ALWAYS use BC/AD format for dates, never BCE/CE..."
    }
  ],
  temperature: 1.0,
  max_tokens: 8000
}
```

### Data Migration

```typescript
// Migration strategy
1. Query all puzzles with historical context
2. For each puzzle in batches of 5:
   - Schedule regeneration with 2-second delays
   - Update historicalContext field
   - Log success/failure
3. Verify all puzzles updated
```

## Testing Strategy

### Unit Testing

- Test BC/AD format enforcement in prompts
- Verify mobile keyboard configuration
- Test button text updates

### Integration Testing

- Verify GPT-5 API calls succeed with proper format
- Test migration completes for all puzzles
- Validate mobile responsive behavior

### End-to-End Testing

- Complete game flow with new UI elements
- Mobile device testing for alignment and keyboard
- Historical context display with BC/AD format

## Deployment Considerations

### Environment Requirements

- OpenRouter API key with GPT-5 access
- Convex deployment with scheduler enabled
- Mobile testing devices for verification

### Rollout Strategy

1. Deploy code changes to production
2. Run migration during low-traffic period
3. Monitor API costs and rate limits
4. Verify all puzzles have updated content

### Monitoring & Observability

- Track API call success/failure rates
- Monitor migration progress via Convex dashboard
- Log any BC/BCE format occurrences for cleanup

## Success Criteria

### Acceptance Criteria

- ✅ All historical context uses GPT-5-mini model
- ✅ Zero BCE/CE references in any UI or content
- ✅ All 17 puzzles have regenerated historical context
- ✅ Mobile header alignment matches design specs
- ✅ "Guesses Remaining:" text visible before dots
- ✅ Numeric keyboard appears on mobile devices

### Performance Metrics

- API response time < 10 seconds
- Migration completes within 30 minutes
- Zero failed API calls after retry logic

### User Experience Goals

- Consistent BC/AD formatting improves clarity
- Mobile users have better input experience
- Progress indicators more accessible with text labels

## Future Enhancements

### Post-MVP Features

- Implement GPT-5-thinking for complex historical analysis
- Add user preference for BCE/CE vs BC/AD format
- Cache warming for upcoming puzzles

### Scalability Roadmap

- Migrate to streaming API responses for faster perceived performance
- Implement edge caching for historical context
- Add fallback to multiple AI models for redundancy

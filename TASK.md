- fix dynamic puzzle timeline
  - at the moment it only shows 1900 - 2025, when it should show 2500bc to <currentyear> ad
  - at the moment it doesn't update on guesses either, but it should update either end to reflect the current range of possible answers from the player's perspective

---

# Enhanced Specification

## Research Findings

### Root Cause Analysis

The Timeline component was working perfectly in commit `ed18ff5` but was broken during a "performance optimization" in commit `6142ea6`. The regression changed:

- Initial range from `-2000` to current year → `1900` to current year
- Added `initialValue` props to NumberTicker that override the correct starting values
- The timeline IS updating on guesses, but the narrow initial range masks this behavior

### Industry Best Practices

- **Progressive Disclosure**: Show full historical overview, reveal details through interaction
- **Semantic Zoom**: Adapt visual representation at different scales rather than just scaling
- **GPU Acceleration**: Use CSS `transform` and `opacity` exclusively for animations
- **Spring Physics**: Natural-feeling animations for timeline adjustments using Motion library
- **Accessibility**: ARIA labels, keyboard navigation, reduced motion support

### Technology Analysis

The codebase already has excellent foundations:

- **Motion Library**: Provides spring animations, orchestrated sequences, and gesture support
- **NumberTicker Component**: Handles smooth number transitions with clamping for large jumps
- **D3 Scale Functions**: Could enhance timeline positioning calculations if needed
- **Existing Patterns**: Debounced values, memoization, and ref-based animation tracking

### Codebase Integration

The Timeline component at `src/components/Timeline.tsx` already has the correct logic for:

- Calculating valid ranges based on guess feedback
- Tracking previous values for smooth animations
- Positioning guesses on the SVG timeline
- Filtering valid guesses within the current range

## Detailed Requirements

### Functional Requirements

- **FR1: Initial Range Display**: Timeline must show 2500 BC (-2500) to current year AD on initial load
  - Acceptance: Timeline bookends display "-2500" and "2025" (or current year)
  - No animation on initial render to avoid jarring experience
- **FR2: Dynamic Range Updates**: Timeline must narrow based on guess feedback
  - When guess is "too early": minimum range becomes `guess + 1`
  - When guess is "too late": maximum range becomes `guess - 1`
  - When guess is "correct": no range change needed
  - Acceptance: Range updates correctly for all feedback types
- **FR3: Synchronized Animation**: Range updates must sync with guess feedback animations

  - NumberTicker animations should use 800ms duration (matching existing pattern)
  - Updates should begin during feedback display, not after
  - Acceptance: Smooth, coordinated visual experience

- **FR4: Year Format Display**: Support BC/AD year representation
  - Negative years display as BC (e.g., -2500 shows as "2500 BC")
  - Positive years display as AD (e.g., 2025 shows as "2025 AD")
  - Acceptance: Correct formatting for all year values

### Non-Functional Requirements

- **Performance**: Timeline must render in <16ms for 4500+ year range
- **Security**: No database structure information revealed through timeline bounds
- **Scalability**: Support future expansion of historical range
- **Availability**: Graceful degradation if animation fails

## Architecture Decisions

### Technology Stack

- **Animation**: Motion library (already integrated) for spring-based animations
- **State Management**: Derived state from useChrondle hook
- **Number Animation**: Existing NumberTicker component with proper initial values
- **Year Calculation**: Internal negative indexing with display formatting layer

### Design Patterns

- **Architecture Pattern**: Component composition with derived state
- **Data Flow**: Unidirectional from game state → timeline display
- **Integration Pattern**: Event-driven updates synchronized with game feedback

### Proposed ADR

See ADR-001 above for detailed architecture decisions including:

- Motion library with orchestrated sequences
- Derived state with controlled update batching
- Dual year representation (internal vs display)
- Virtual timeline with adaptive detail levels
- Event-driven game state integration

## Implementation Strategy

### Development Approach

Fix the regression by reverting problematic changes and enhancing the implementation:

1. **Immediate Fix** (Priority 1):

   - Change initial range to -2500 to current year
   - Remove or fix `initialValue` props on NumberTicker components
   - Verify range updates are working correctly

2. **Enhancement** (Priority 2):
   - Implement BC/AD formatting for year display
   - Add animation synchronization with feedback timing
   - Optimize for large year ranges if needed

### MVP Definition

1. Timeline displays -2500 to current year on load
2. Range narrows correctly based on guess feedback
3. Smooth number animations during range updates

### Technical Risks

- **Risk 1**: Large year range performance → Mitigation: Use existing optimizations, test on low-end devices
- **Risk 2**: Animation conflicts → Mitigation: Debounce rapid updates, use refs for animation state
- **Risk 3**: BC/AD conversion errors → Mitigation: Comprehensive unit tests for edge cases

## Integration Requirements

### Existing System Impact

- Timeline component in `src/components/Timeline.tsx`
- GameLayout component passing props to Timeline
- NumberTicker component for animated number display

### API Design

Timeline component props remain unchanged:

```typescript
interface TimelineProps {
  minYear: number; // -2500 for initial state
  maxYear: number; // current year for initial state
  guesses: number[]; // Player's guesses
  targetYear: number | null; // Answer for feedback calculation
  isGameComplete: boolean;
  hasWon: boolean;
}
```

### Data Migration

None required - this is a UI fix only

## Testing Strategy

### Unit Testing

- Year formatting (BC/AD conversion)
- Range calculation logic
- Animation timing synchronization

### Integration Testing

- Timeline updates with game state changes
- Animation coordination with feedback display
- Performance with large year ranges

### End-to-End Testing

- Complete game flow with timeline updates
- Various guess patterns (narrowing from both ends)
- Edge cases (year 0, extreme ranges)

## Deployment Considerations

### Environment Requirements

No new dependencies or configuration needed

### Rollout Strategy

Simple deployment - UI-only change with no data impact

### Monitoring & Observability

- Track timeline render performance
- Monitor animation frame rates
- Log any range calculation errors

## Success Criteria

### Acceptance Criteria

- ✅ Timeline shows -2500 to current year on initial load
- ✅ Timeline narrows correctly with "too early" feedback (min = guess + 1)
- ✅ Timeline narrows correctly with "too late" feedback (max = guess - 1)
- ✅ Animations are smooth and synchronized with feedback
- ✅ Years display with proper BC/AD formatting
- ✅ No performance degradation with large ranges

### Performance Metrics

- Timeline renders in <16ms
- Animations maintain 60fps
- No memory leaks during gameplay

### User Experience Goals

- Intuitive visual feedback for guess results
- Smooth, polished animations
- Clear representation of possible answer range

## Future Enhancements

### Post-MVP Features

- Zoom controls for exploring different time periods
- Historical era markers (Ancient, Medieval, Modern)
- Hover tooltips showing decade/century labels
- Pinch-to-zoom on mobile devices

### Scalability Roadmap

- Virtual timeline rendering for 10,000+ year ranges
- Support for prehistoric dates
- Multi-timeline comparison view

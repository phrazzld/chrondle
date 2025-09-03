- numeric keyboard input doesn't allow for bc guesses (ie doesn't allow minus signs, which are how we currently support this)
  - need to support ad/bc guesses! either revert numeric keyboard, or figure out another way. clean ad/bc toggle next to text input? what other options do we have?

---

# Enhanced Specification

## Research Findings

### Industry Best Practices

- **Hybrid Input Model** is the 2024-2025 standard for historical date entry
- Separate positive year input + era selector provides clearest mental model
- Native date pickers cannot handle BC dates (Gregorian calendar limitation)
- `type="number"` with CSS spinner hiding provides best mobile keyboard experience
- Touch-first design with large tap targets essential for mobile gaming

### Technology Analysis

- **Existing Chrondle patterns** can be leveraged:
  - Switch component from Radix UI already in use for theme toggle
  - `formatYear()` utility handles BC/AD display formatting
  - Year validation logic supports -3000 to current year
  - GuessInput component has robust keyboard navigation
- **React/TypeScript** patterns align with current codebase architecture
- No external date picker libraries needed - custom implementation preferred

### Codebase Integration

- **Reusable components identified:**
  - `/src/components/ui/switch.tsx` - Toggle component
  - `/src/lib/utils.ts:formatYear()` - BC/AD formatting
  - `/src/lib/constants.ts` - Year validation constants
  - `/src/components/GuessInput.tsx` - Input patterns to preserve

## Detailed Requirements

### Functional Requirements

- **Positive-only year input**: Remove need for minus sign, fixing iOS keyboard issue completely
- **Explicit era selection**: BC/AD toggle that's always visible and accessible
- **Validation by era**: BC years (1-3000), AD years (1-current year)
- **Real-time feedback**: Show formatted year (e.g., "776 BC") as user types
- **Keyboard navigation**: Maintain arrow key increment/decrement within era bounds
- **Backwards compatibility**: Convert to negative numbers internally for minimal backend changes

### Non-Functional Requirements

- **Performance**: Input response < 16ms for 60fps interaction
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation and screen reader support
- **Mobile-first**: Optimized for touch with minimum 44x44px tap targets
- **Visual consistency**: Match existing Chrondle design system and component patterns

## Architecture Decisions

### Technology Stack

- **Frontend**: React 19 + TypeScript (existing)
- **UI Components**: Radix UI Switch adapted for BC/AD toggle
- **Styling**: Tailwind CSS with existing design tokens
- **State Management**: React hooks maintaining current patterns

### Design Pattern

- **Architecture Pattern**: Presentational/Container component split
- **Data Flow**: Unidirectional with controlled inputs
- **Era Storage**: Positive numbers in UI, negative numbers in game state
- **Validation**: Client-side with immediate feedback

### Proposed ADR

**Title**: Separate Era Selection for BC/AD Input

**Status**: Proposed

**Context**: Mobile numeric keyboards don't display minus key, preventing BC year entry

**Decision**: Implement separate positive year input + BC/AD toggle

**Consequences**:

- ✅ Fixes mobile keyboard issue completely
- ✅ Clearer mental model for non-technical users
- ✅ Better accessibility with explicit era selection
- ⚠️ Requires UI restructuring of GuessInput component
- ⚠️ Additional tap/click for era selection

**Alternatives Considered**:

1. Keep negative numbers - Rejected: Doesn't fix iOS issue
2. Text parsing ("776 BC") - Rejected: Complex, error-prone
3. +/- button - Rejected: Less clear than explicit BC/AD

## Implementation Strategy

### Development Approach

1. **Phase 1**: Create BC/AD toggle component
2. **Phase 2**: Modify GuessInput to separate year and era
3. **Phase 3**: Update validation and conversion logic
4. **Phase 4**: Enhance visual feedback and animations
5. **Phase 5**: Update tests and documentation

### MVP Definition

1. Positive-only number input field
2. BC/AD segmented toggle control
3. Real-time formatted display ("776 BC")
4. Proper validation per era
5. Maintains all current keyboard shortcuts

### Technical Risks

- **Risk 1**: State synchronization between year and era → Mitigation: Single source of truth in parent
- **Risk 2**: Accessibility regression → Mitigation: Comprehensive testing with screen readers
- **Risk 3**: Mobile layout issues → Mitigation: Responsive design with flexbox/grid

## Integration Requirements

### Existing System Impact

- **GuessInput.tsx**: Primary component requiring modification
- **Game state**: Continues using negative numbers (no backend changes)
- **formatYear()**: Already handles conversion correctly
- **Tests**: Update input simulation to use new components

### API Design

- Internal API remains unchanged (negative numbers)
- UI presents positive + era, converts on submit
- Validation happens pre-conversion in UI layer

### Data Migration

- No data migration required
- LocalStorage remains compatible
- Game history unaffected

## Testing Strategy

### Unit Testing

- Era toggle state changes
- Year validation per era
- Conversion logic (positive + era → negative)
- Keyboard navigation within era bounds

### Integration Testing

- Full guess flow with BC and AD years
- Keyboard shortcuts and arrow key navigation
- Mobile touch interactions
- Screen reader announcements

### End-to-End Testing

- Complete game with BC puzzle year
- Era switching during input
- Edge cases (year 1 BC/AD, maximum years)

## Deployment Considerations

### Environment Requirements

- No new dependencies required
- Uses existing Radix UI and React 19

### Rollout Strategy

- Feature flag not needed (fixes critical bug)
- Direct deployment after testing
- Monitor error rates for input validation

### Monitoring & Observability

- Track era toggle usage frequency
- Monitor validation error rates
- Measure input completion time

## Success Criteria

### Acceptance Criteria

- ✅ iOS users can enter BC years without external keyboard
- ✅ All mobile keyboards show appropriate numeric input
- ✅ Screen readers announce era selection clearly
- ✅ Existing keyboard navigation preserved
- ✅ Visual feedback shows formatted year in real-time

### Performance Metrics

- Input latency < 16ms
- No additional re-renders vs current implementation
- Bundle size increase < 2KB

### User Experience Goals

- Reduced input errors by 50%
- Improved mobile completion rate
- Maintained or improved accessibility score

## Future Enhancements

### Post-MVP Features

- Smart era detection from hint context
- Keyboard shortcuts (B/A keys) for era selection
- Era preference memory per session
- Historical calendar system support (BCE/CE)

### Scalability Roadmap

- Internationalization for different era notations
- Support for other calendar systems
- Customizable date formats per locale

- show current hint above guess input

---

# Enhanced Specification

## Problem Statement

The mobile experience is broken when users focus the guess input field - the keyboard appears and covers the hints display, making it impossible to see the current hint while typing. This forces users to dismiss the keyboard to read hints, creating a frustrating back-and-forth interaction pattern.

## Research Findings

### Codebase Analysis

- **Current Architecture**: HintsDisplay component at bottom shows all hints (current, past, future)
- **Current Hint Component**: Exists as `CurrentHint` in HintsDisplay.tsx with sophisticated styling and animations
- **State Management**: `currentHintIndex` calculated in GameLayout.tsx based on guess count
- **Input Field**: Missing numeric keyboard configuration (`inputMode` and `pattern` attributes)
- **Remaining Guesses**: Available in state but only shown in submit button aria-label

### Mobile UX Best Practices

- **Proximity Principle**: Critical information must be visible when keyboard is active
- **Thumb-Friendly Zones**: Input controls should be in bottom third of screen
- **Visual Hierarchy**: Current hint should be prominent but not overwhelming
- **Numeric Input**: Mobile keyboards should default to numeric for year entry

## Detailed Requirements

### Functional Requirements

- **FR1**: Extract current hint from HintsDisplay and display it above GuessInput
- **FR2**: Modify HintsDisplay to only show past and future hints (no current hint)
- **FR3**: Display remaining guesses count near the input area
- **FR4**: Ensure numeric keyboard appears on mobile devices
- **FR5**: Maintain all existing animations and accessibility features

### Non-Functional Requirements

- **Performance**: Component changes must not increase re-renders
- **Accessibility**: Maintain ARIA live regions and screen reader announcements
- **Responsiveness**: Works seamlessly across all device sizes
- **Simplicity**: Clean, minimal UI that doesn't duplicate information

## Architecture Decisions

### ADR-001: Current Hint Relocation Strategy

**Status**: Proposed

**Context**: Mobile users cannot see hints when keyboard is active, requiring constant keyboard dismissal.

**Decision**: Move (not duplicate) current hint above GuessInput by creating a new CurrentHintCard component.

**Consequences**:

- ✅ Solves mobile keyboard overlap issue
- ✅ Cleaner information architecture (no duplication)
- ✅ Better visual flow (hint → input → feedback)
- ⚠️ Requires refactoring HintsDisplay component
- ⚠️ May affect muscle memory for existing users

**Alternatives Considered**:

1. **Sticky bottom panel**: Too complex, could interfere with keyboard
2. **Duplicate hint display**: Violates DRY principle, confusing UX
3. **Collapsible hints**: Adds interaction complexity

### Technology Stack

- **Component Library**: Continue using existing Radix UI primitives
- **Animation**: Framer Motion for smooth transitions
- **State Management**: Leverage existing useChrondle hook
- **Styling**: Tailwind CSS with existing design tokens

## Implementation Strategy

### Component Structure

```
GameLayout
├── GameInstructions
├── CurrentHintCard (NEW)
│   ├── Hint Number Badge
│   ├── Hint Text
│   └── Remaining Guesses Indicator
├── GuessInput (MODIFIED)
│   └── Numeric keyboard attributes
├── Timeline
├── ProximityDisplay
├── GameProgress
└── HintsDisplay (MODIFIED)
    ├── PastHints
    └── FutureHints
```

### MVP Implementation Steps

1. **Create CurrentHintCard Component**

   - Extract CurrentHint logic from HintsDisplay
   - Add remaining guesses display
   - Implement loading and error states

2. **Modify GuessInput**

   - Add `inputMode="numeric"` attribute
   - Add `pattern="[0-9-]*"` for BC year support
   - Ensure proper keyboard behavior on iOS/Android

3. **Update HintsDisplay**

   - Remove CurrentHint rendering
   - Adjust grid layout for past/future hints only
   - Update animations for smoother transitions

4. **Refactor GameLayout**
   - Insert CurrentHintCard between GameInstructions and GuessInput
   - Pass necessary props (currentHintIndex, events, remainingGuesses)
   - Maintain existing conditional rendering logic

### Technical Implementation Details

#### CurrentHintCard Component

```typescript
interface CurrentHintCardProps {
  event: string | null;
  hintNumber: number;
  totalHints: number;
  remainingGuesses: number;
  isLoading: boolean;
  error: string | null;
}
```

**Key Features**:

- Compact design optimized for mobile
- Shows "Hint X of 6" with current event text
- Displays remaining guesses as subtle indicator
- Smooth animations on hint changes
- Loading and error states

#### Mobile Keyboard Configuration

```tsx
<Input
  type="text"
  inputMode="numeric"
  pattern="[0-9-]*"
  // ... existing props
/>
```

#### Visual Design

- **Container**: Subtle card with muted background
- **Hint Badge**: Small primary-colored circle with hint number
- **Typography**: Clear, readable text that doesn't compete with input
- **Spacing**: Tight vertical spacing to maximize screen real estate

## Testing Strategy

### Mobile Testing

- iOS Safari with keyboard active
- Android Chrome with keyboard active
- Landscape orientation handling
- Small screen devices (SE, Mini)

### Accessibility Testing

- Screen reader announcement of hint changes
- Keyboard navigation flow
- Focus management after guess submission

### Edge Cases

- No hints available (loading state)
- Game complete (hide current hint card)
- Very long hint text (text wrapping)
- Rapid guess submissions (animation queuing)

## Success Criteria

### Acceptance Criteria

- ✅ Current hint visible when mobile keyboard is active
- ✅ Numeric keyboard appears on mobile devices
- ✅ Remaining guesses clearly displayed
- ✅ No information duplication
- ✅ Smooth animations between hint transitions
- ✅ All accessibility features maintained

### Performance Metrics

- No increase in Time to Interactive
- Component re-renders minimized
- Animation frame rate ≥ 60fps

### User Experience Goals

- Reduced friction on mobile devices
- Clearer game state visibility
- Improved guess input flow

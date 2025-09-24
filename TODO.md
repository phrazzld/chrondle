# TODO.md - Chrondle UI/UX Improvements

## Critical Constraint

⚠️ **NEVER implement UI/UX that reveals puzzle information. The UI must remain completely agnostic to the target year.**

## Phase 1: Core UI Refinements (Priority)

### Hint Card & Progress Consolidation

- [x] Merge progress dots into hint card header component (`src/components/CurrentHintCard.tsx`)
  - Position dots right-aligned in header row with "HINT X OF 6" text
  - Implement dot states: filled (guess used), empty (available), with NO correlation to answer correctness
  - Add CSS transition for dot fill animation (200ms ease-out)
  - Ensure dots are purely decorative progress indicators, not interactive

### Support Button Migration

- [x] Add Heart icon to navbar (`src/components/AppHeader.tsx`)
  - Position between Archive and Theme toggle buttons
  - Import Heart icon from lucide-react
  - Label as "Support" with aria-label="Support Chrondle with donations"
- [x] Update `BitcoinModal` component title from "Keep history alive ₿" to "Support Chrondle"
- [x] Remove Bitcoin icon button from Footer component (`src/components/Footer.tsx:31-43`)
- [x] Add subtle CSS heartbeat animation on hover (transform: scale 1.0 -> 1.1 -> 1.0, 1.5s duration)

### BC/AD Toggle Integration

- [x] Modify `GuessInput` component (`src/components/GuessInput.tsx`) to embed era toggle
  - Create new container div wrapping both input and toggle
  - Apply border and focus states to container, not individual elements
  - Position toggle as absolute right-aligned element within container
- [x] Update `EraToggle` component styling for inline display
  - Remove standalone border/shadow
  - Adjust padding for tighter integration (reduce from h-12 to h-10)
  - Ensure toggle doesn't affect input field focus state

### Footer Enhancement

- [x] Restructure Footer component (`src/components/Footer.tsx`) with new content:
  - Add copyright: "© 2025 Chrondle"
  - Add author link: "Built by" linking to https://phaedrus.io
  - Add feedback email: "Feedback:" linking to mailto:phaedrus.raznikov@pm.me
- [x] Implement responsive layout: single line on desktop, stacked on mobile
- [x] Style links with subtle underline on hover (text-decoration-color transition)
- [x] Maintain GitHub link but integrate into new layout

## Phase 2: Micro-Animations & Polish

### Guess Submission Animations

- [x] Add button scale animation on submit (scale 1.0 -> 0.98 -> 1.0, 150ms)
- [x] Implement input field "pulse" effect on submit (subtle border glow)
- [x] Add stagger animation for hint text appearance (each word fades in with 30ms delay)
- [x] Create dot fill animation with micro "pop" effect (scale 0 -> 1.1 -> 1.0)

### Timeline Enhancements

- [x] Add smooth transition for range updates (300ms ease-in-out)
- [x] Implement marker placement animation (opacity 0->1, scale 0.8->1)
- [x] Add subtle hover state for timeline (show year on hover with 100ms delay)
- [x] Polish eliminated range visualization with fade animation

### Loading State Improvements

- [x] Replace spinner with three-dot "typing" animation in hint card
- [x] Add skeleton shimmer for loading states (implement as reusable component)
- [x] Implement content fade-up on initial load (50ms stagger per element)

### Interactive Feedback

- [x] Add ripple effect on button clicks (CSS only, from click point)
- [x] Implement focus-visible styles for keyboard navigation
- [x] Add hover transitions for all interactive elements (150ms standard)
- [x] Create subtle shadow growth on card hover states

## Phase 3: Advanced Polish

### Celebration Enhancements

- [x] Add cascade animation for dots on correct answer (sequential green fill)
- [x] Implement confetti variety based on guess count (more particles for fewer guesses)
- [x] Add subtle screen flash on win (background lightness pulse)

### Streak Visualization

- [x] Implement realistic flame flicker using CSS animation (transform + opacity)
- [x] Add number roll animation when streak increments
- [~] Create milestone pulse effect at 7, 30, 100 day streaks

### Accessibility

- [ ] Audit and respect prefers-reduced-motion for all animations
- [ ] Ensure all animations can be disabled via settings
- [ ] Add skip links for screen reader users
- [ ] Verify 44x44px minimum touch targets on mobile

## Phase 4: Architecture & Performance

### Code Organization

- [ ] Create `src/lib/animations.ts` for shared animation constants
- [ ] Implement animation hook `useAnimation()` for consistent timing
- [ ] Add CSS custom properties for animation durations in globals.css
- [ ] Create Storybook stories for animated components

### Performance Optimization

- [ ] Use CSS transforms/opacity exclusively (no layout-triggering properties)
- [ ] Implement will-change for frequently animated elements
- [ ] Add animation frame batching for complex sequences
- [ ] Profile and eliminate animation jank on mobile devices

### Testing

- [ ] Add animation tests using React Testing Library
- [ ] Verify animations don't break game logic
- [ ] Test reduced motion preferences
- [ ] Ensure no performance regression on low-end devices

## Implementation Notes

### Animation Timing Standards

- Micro interactions: 100-200ms
- State transitions: 200-300ms
- Page transitions: 300-500ms
- Celebrations: 500-1000ms

### CSS Strategy

- Prefer CSS animations over JS when possible
- Use `transform` and `opacity` for best performance
- Batch DOM reads/writes to avoid layout thrashing
- Implement animations as utility classes for reusability

### Critical Reminders

- ⚠️ NO animations that reveal puzzle information
- ⚠️ NO visual feedback that correlates with answer proximity
- ⚠️ NO UI changes based on target year or era
- ⚠️ All visual feedback must be based solely on user actions, not puzzle data

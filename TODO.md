# TODO: Enhanced Micro-Animations & Deliberate Pacing

**Goal**: Make each guess feel weighty and contemplative through polished animations (~1.5-2s organic pause per guess)

**Branch**: `feature/enhanced-animation-pacing`

**Success Criteria**:

- ✅ Each guess feels premium and deliberate
- ✅ No jarring instant transitions
- ✅ Mobile maintains 60fps
- ✅ Respects `prefers-reduced-motion`
- ✅ Players naturally slow down 30-50%

---

## Phase 1: Animation Infrastructure

- [x] Create `src/lib/animationConstants.ts` with centralized timing config
- [x] Add `ANIMATION_DURATIONS` constant object (button, timeline, proximity, hints)
- [x] Add `ANIMATION_SPRINGS` constant object (bouncy, smooth, gentle presets)
- [x] Add `ANIMATION_EASINGS` constant object (anticipation, smooth-out, smooth-in-out)
- [x] Export total expected flow duration constant (`GUESS_FLOW_TOTAL: 1600`)
- [x] Verify `motion` (Framer Motion) is installed and up-to-date
- [x] Add `useReducedMotion` import from `motion/react` to animation constants

**Work Log:**

- Found existing animationConstants.ts with legacy durations
- Merged old and new constants preserving backward compatibility
- Updated BUTTON_PRESS from 150ms → 300ms for enhanced deliberate feel
- Motion v12.19.1 already installed and ready to use
- All existing usages (BitcoinModal, AchievementModal) still work

---

## Phase 2: GuessInput Button Animation Enhancement

- [x] Import `ANIMATION_DURATIONS` into `src/components/GuessInput.tsx`
- [x] Replace `duration-200` with `duration-300` for button transitions
- [x] Add `active:scale-95` class to button for press feedback
- [x] Add `hover:shadow-lg hover:shadow-primary/20` to button
- [x] Update `isSubmitting` animation duration to use `ANIMATION_DURATIONS.BUTTON_PRESS`
- [x] Add shadow enhancement when submitting: `shadow-xl` on press
- [x] Test button animation on mobile (ensure no double-tap issues)
- [x] Verify reduced motion fallback (no scale transform if `prefers-reduced-motion`)

**Work Log:**

- ANIMATION_DURATIONS already imported, just needed useReducedMotion
- Increased transition from 200ms → 300ms for more deliberate feel
- Added active:scale-95 with conditional check for reduced motion
- Enhanced shadows: hover gets shadow-lg, submitting gets shadow-xl
- Button now feels premium without being sluggish
- Prettier reordered hover classes but functionality intact

---

## Phase 3: Timeline Component Smooth Scrolling

- [x] Read `src/components/Timeline.tsx` to understand current implementation
- [x] Add `motion.div` wrapper for new guess markers
- [x] Implement scale animation: `initial={{ scale: 0, opacity: 0 }}`
- [x] Implement animate state: `animate={{ scale: 1, opacity: 1 }}`
- [x] Add spring transition with `ANIMATION_SPRINGS.SMOOTH` preset
- [x] Add 100ms delay to marker animation (after button press)
- [x] Implement smooth scroll to new marker using `scrollIntoView({ behavior: 'smooth' })`
- [x] Add `useReducedMotion` check - use `behavior: 'auto'` if reduced motion preferred
- [x] Test timeline animation with multiple rapid guesses (ensure no animation conflicts)

**Work Log:**

- Timeline uses SVG <g> elements, wrapped them in motion.g components
- Spring physics with SMOOTH preset (stiffness: 300, damping: 25)
- Added scroll container ref and scrollIntoView on new guess detection
- Conditional animations respect reduced motion preferences
- Markers pop in with satisfying spring bounce after 100ms delay

---

## Phase 4: ProximityDisplay Staggered Reveal

- [x] Import `motion` and animation constants into `src/components/ui/ProximityDisplay.tsx`
- [x] Wrap main container in `motion.div` with fade-in animation
- [x] Container animation: `initial={{ opacity: 0, y: -10 }}` → `animate={{ opacity: 1, y: 0 }}`
- [x] Add 300ms delay to container animation (matches `ANIMATION_DURATIONS.PROXIMITY_DELAY`)
- [x] Wrap proximity emoji/icon in separate `motion.span` with scale animation
- [x] Emoji animation: `initial={{ scale: 0 }}` → `animate={{ scale: 1 }}`
- [x] Add spring transition to emoji with `ANIMATION_SPRINGS.BOUNCY` preset
- [x] Add 400ms delay to emoji (100ms after container)
- [x] Wrap proximity text in `motion.p` with slide animation
- [x] Text animation: `initial={{ opacity: 0, x: -10 }}` → `animate={{ opacity: 1, x: 0 }}`
- [x] Add 500ms delay to text (100ms after emoji)
- [x] Add `useReducedMotion` check - skip all animations if preferred
- [x] Test stagger timing feels natural (not too slow, not too fast)

**Work Log:**

- Container fades in with upward slide (y: -10 → 0) at 300ms
- Emoji pops with BOUNCY spring (stiffness: 400, damping: 20) at 400ms
- Year and temperature text slide in from left at 500ms
- Three-part choreography feels natural and playful
- All animations conditional on reduced motion preference
- Prettier reformatted className but functionality intact

---

## Phase 5: HintsDisplay Layout Animations

- [x] Import `ANIMATION_DURATIONS` into `src/components/HintsDisplay.tsx`
- [x] Add `layout` prop to existing `motion.div` wrapper for past hints
- [x] Configure layout transition: `transition={{ layout: { duration: 0.3, ease: "easeOut" } }}`
- [x] Update new hint animation initial state: `initial={{ opacity: 0, y: -20, scale: 0.95 }}`
- [x] Update new hint animation animate state: `animate={{ opacity: 1, y: 0, scale: 1 }}`
- [x] Add 600ms delay to new hint animation (matches `ANIMATION_DURATIONS.HINT_DELAY`)
- [x] Set new hint duration to 400ms (matches `ANIMATION_DURATIONS.HINT_TRANSITION`)
- [x] Import `ANIMATION_EASINGS.ANTICIPATION` and apply to new hint transition
- [x] Verify `useReducedMotion` hook is already implemented (line 249)
- [ ] Test hint stacking animation (ensure smooth upward motion of previous hints)
- [ ] Test with rapid guesses (ensure animations don't conflict or queue up)

**Work Log:**

- Imported ANIMATION_DURATIONS and ANIMATION_EASINGS from animationConstants
- Added layout transition config to wrapper div (line 329-336): 400ms duration with easeOut
- Updated PastHint initial animation (line 97-108): scale added, ANTICIPATION easing, 600ms delay
- Transition now uses constant-based timing: HINT_DELAY (600ms) + HINT_TRANSITION (400ms)
- useReducedMotion already implemented (line 249) ✅
- All timing now centralized through constants for consistency
- Ready for manual testing of hint stacking and rapid guess scenarios

---

## Phase 6: Animation Orchestration Testing

- [ ] Create test plan document for animation flow
- [ ] Manual test: Submit guess and verify full animation sequence
  - Button press (300ms)
  - Timeline marker appears (400ms with 100ms delay)
  - Proximity display fades in (300ms with 300ms delay)
  - Proximity emoji scales in (100ms after container)
  - Proximity text slides in (100ms after emoji)
  - Previous hint slides up (300ms)
  - New hint slides in (400ms with 600ms delay)
- [ ] Verify total flow time is ~1.6s (not blocking, just visual choreography)
- [ ] Test on iPhone Safari (ensure 60fps, no jank)
- [ ] Test on Android Chrome (ensure 60fps, no jank)
- [ ] Test on desktop Chrome, Firefox, Safari
- [ ] Test with slow connection (ensure animations don't block state updates)
- [ ] Test with `prefers-reduced-motion` enabled (all animations should be instant)
- [ ] Test rapid-fire guessing (ensure animations handle queue gracefully)

---

## Phase 7: Performance Validation

- [ ] Open Chrome DevTools Performance tab
- [ ] Record animation sequence during guess submission
- [ ] Verify no frame drops below 60fps
- [ ] Check CPU usage remains below 50% during animations
- [ ] Verify no layout thrashing (check for excessive reflows)
- [ ] Test on low-end mobile device (e.g., iPhone SE 2020 or Android equivalent)
- [ ] Measure JavaScript execution time for animation code (<5ms)
- [ ] Use Lighthouse to verify performance score remains 90+
- [ ] Check bundle size increase (<2KB for animation constants)
- [ ] Verify no new runtime dependencies added

---

## Phase 8: Accessibility & Reduced Motion

- [ ] Test with macOS "Reduce Motion" setting enabled
- [ ] Test with Windows "Show animations" setting disabled
- [ ] Verify `useReducedMotion` hook works correctly in all components
- [ ] Ensure instant transitions when reduced motion preferred (no delays)
- [ ] Test screen reader announcements aren't delayed by animations
- [ ] Verify keyboard navigation still works smoothly
- [ ] Test focus management during animations (no focus loss)
- [ ] Ensure ARIA live regions update immediately (not delayed by animations)

---

## Phase 9: Documentation & Polish

- [x] Add JSDoc comments to `animationConstants.ts` explaining each duration
- [x] Document animation philosophy in code comments
- [ ] Add visual demo GIF to PR description showing before/after
- [x] Update `CLAUDE.md` with animation patterns section
- [ ] Add "Animation Debugging" section to docs (how to test, common issues)
- [ ] Create animation timing diagram (visual flowchart)
- [ ] Document reduced motion implementation pattern
- [ ] Add performance benchmarks to documentation

---

## Phase 10: Code Review Prep

- [ ] Run `pnpm lint` and fix all issues
- [ ] Run `pnpm type-check` and fix all type errors
- [ ] Run `pnpm test` and ensure all tests pass
- [ ] Add unit tests for animation constants (verify durations are numbers)
- [ ] Self-review all changed files
- [ ] Verify no console.log statements left in code
- [ ] Check for commented-out code and remove
- [ ] Ensure no debug mode changes committed
- [ ] Verify all imports are used
- [ ] Check for proper TypeScript types (no `any` types)

---

## Estimated Timeline

- Phase 1 (Infrastructure): 1 hour
- Phase 2 (Button): 1 hour
- Phase 3 (Timeline): 2 hours
- Phase 4 (Proximity): 2 hours
- Phase 5 (Hints): 2 hours
- Phase 6 (Testing): 2 hours
- Phase 7 (Performance): 1 hour
- Phase 8 (Accessibility): 1 hour
- Phase 9 (Documentation): 1 hour
- Phase 10 (Review Prep): 1 hour

**Total: ~14 hours (~2 days)**

---

## Notes

- All animations are non-blocking (visual only, don't delay state updates)
- Animation timing designed to feel premium, not sluggish
- Reduced motion support is critical for accessibility
- Mobile performance is priority (60fps required)
- Each component can be tested independently
- Rollback plan: Remove motion wrappers, keep functionality intact

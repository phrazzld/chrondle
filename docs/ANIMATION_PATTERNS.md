# Animation Implementation Patterns

This document provides practical patterns and best practices for implementing animations in Chrondle using our centralized animation system.

## Core Pattern: Reduced Motion Support

**CRITICAL**: Every animation MUST respect the `prefers-reduced-motion` accessibility preference. Users with vestibular disorders or motion sensitivity rely on this setting.

### Basic Pattern

```typescript
import { useReducedMotion } from "@/lib/animationConstants";
import { motion } from "motion/react";

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: -20 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

### Key Principles

1. **Return `undefined` for disabled animations**: Setting animation props to `undefined` tells Framer Motion to skip the animation entirely
2. **Check on every component**: Don't assume parent components handle it - check locally
3. **Apply to all motion properties**: `initial`, `animate`, `exit`, `transition`, `layout` - all must be conditional
4. **Zero delay is still a delay**: When reduced motion is enabled, skip delays too

### Anti-Patterns (DON'T DO THIS)

```typescript
// ❌ BAD: Setting duration to 0 still processes animation frames
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
/>

// ❌ BAD: Only checking on some properties
<motion.div
  initial={shouldReduceMotion ? undefined : { opacity: 0 }}
  animate={{ opacity: 1 }} // Forgot to check here!
  transition={{ duration: 0.3 }}
/>

// ❌ BAD: Not checking at all
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>
```

## Pattern: Button Press Animation

Used in: `GuessInput.tsx`

```typescript
import {
  ANIMATION_DURATIONS,
  CSS_DURATIONS,
  useReducedMotion,
} from "@/lib/animationConstants";

function SubmitButton() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <button
      className={`
        ${CSS_DURATIONS.TRANSITION_300}
        ${!shouldReduceMotion && "active:scale-95"}
        hover:shadow-lg
        transition-all
      `}
    >
      Submit
    </button>
  );
}
```

**Key Points:**

- Use Tailwind's `duration-*` classes via `CSS_DURATIONS` constant
- Conditionally apply `active:scale-*` transforms
- Keep hover effects (they don't trigger motion sickness)

## Pattern: Spring Animation

Used in: `Timeline.tsx`, `ProximityDisplay.tsx`

```typescript
import {
  ANIMATION_DURATIONS,
  ANIMATION_SPRINGS,
  useReducedMotion,
} from "@/lib/animationConstants";
import { motion } from "motion/react";

function TimelineMarker({ isNew }: { isNew: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  if (!isNew) return <g>/* existing marker */</g>;

  return (
    <motion.g
      initial={shouldReduceMotion ? undefined : { scale: 0, opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? undefined
          : {
              type: "spring",
              ...ANIMATION_SPRINGS.SMOOTH,
              delay: 0.1,
            }
      }
    >
      {/* SVG marker content */}
    </motion.g>
  );
}
```

**Key Points:**

- Springs work great for "pop-in" effects
- Use spread operator to apply spring preset
- Always include delay in the conditional check

## Pattern: Staggered Reveal

Used in: `ProximityDisplay.tsx`

```typescript
import {
  ANIMATION_DURATIONS,
  ANIMATION_SPRINGS,
  useReducedMotion,
} from "@/lib/animationConstants";
import { motion } from "motion/react";

function ProximityDisplay({ proximity, year }: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion
          ? 0
          : ANIMATION_DURATIONS.PROXIMITY_FADE / 1000,
        delay: shouldReduceMotion
          ? 0
          : ANIMATION_DURATIONS.PROXIMITY_DELAY / 1000,
      }}
    >
      {/* Container */}

      <motion.span
        initial={shouldReduceMotion ? undefined : { scale: 0 }}
        animate={shouldReduceMotion ? undefined : { scale: 1 }}
        transition={
          shouldReduceMotion
            ? undefined
            : {
                type: "spring",
                ...ANIMATION_SPRINGS.BOUNCY,
                delay: (ANIMATION_DURATIONS.PROXIMITY_DELAY + 100) / 1000,
              }
        }
      >
        {proximity.emoji}
      </motion.span>

      <motion.p
        initial={shouldReduceMotion ? undefined : { opacity: 0, x: -10 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.3,
          delay: shouldReduceMotion
            ? 0
            : (ANIMATION_DURATIONS.PROXIMITY_DELAY + 200) / 1000,
        }}
      >
        {year}
      </motion.p>
    </motion.div>
  );
}
```

**Key Points:**

- Increment delays for each element (100ms, 200ms steps)
- Convert milliseconds to seconds for Framer Motion
- Each element is independently conditional on `shouldReduceMotion`

## Pattern: Layout Animations

Used in: `HintsDisplay.tsx`

```typescript
import {
  ANIMATION_DURATIONS,
  ANIMATION_EASINGS,
  useReducedMotion,
} from "@/lib/animationConstants";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";

function HintsList({ hints }: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <LayoutGroup>
      <AnimatePresence>
        {hints.map((hint) => (
          <motion.div
            key={hint.id}
            layout={!shouldReduceMotion}
            transition={{
              layout: {
                duration: shouldReduceMotion
                  ? 0
                  : ANIMATION_DURATIONS.HINT_TRANSITION / 1000,
                ease: "easeOut",
              },
            }}
          >
            <HintCard hint={hint} />
          </motion.div>
        ))}
      </AnimatePresence>
    </LayoutGroup>
  );
}

function HintCard({ hint }: Props) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion ? undefined : { opacity: 0, y: -20, scale: 0.95 }
      }
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
      transition={{
        duration: ANIMATION_DURATIONS.HINT_TRANSITION / 1000,
        ease: ANIMATION_EASINGS.ANTICIPATION,
        delay: ANIMATION_DURATIONS.HINT_DELAY / 1000,
      }}
    >
      {hint.text}
    </motion.div>
  );
}
```

**Key Points:**

- Use `LayoutGroup` for coordinated layout animations
- Set `layout={!shouldReduceMotion}` to disable layout animations
- Configure layout transition separately from enter/exit animations
- Custom easing curves work well for important reveals

## Pattern: Scroll Behavior

Used in: `HintsDisplay.tsx`, `Timeline.tsx`

```typescript
import { useReducedMotion } from "@/lib/animationConstants";

function ScrollableList() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newItemAdded) {
      containerRef.current?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }, [newItemAdded, shouldReduceMotion]);

  return <div ref={containerRef}>{/* content */}</div>;
}
```

**Key Points:**

- Use `behavior: 'auto'` when reduced motion enabled
- Use `behavior: 'smooth'` for animated scrolling
- Apply to all programmatic scrolling operations

## Testing Your Animations

### Manual Testing

**macOS:**

1. System Settings → Accessibility → Display
2. Toggle "Reduce motion"
3. Reload your app

**Windows:**

1. Settings → Ease of Access → Display
2. Toggle "Show animations in Windows"
3. Reload your app

**Browser DevTools:**
Chrome/Edge:

1. DevTools → Command Palette (Cmd/Ctrl + Shift + P)
2. Type "Emulate CSS prefers-reduced-motion"
3. Select "prefers-reduced-motion: reduce"

**Expected Behavior:**

- All animations should be instant (no visible motion)
- No delays between state changes
- Scroll should be instant, not smooth
- Transform-based animations (scale, translate) should not occur
- Content should appear/disappear immediately

### Automated Testing

```typescript
import { render } from "@testing-library/react";
import * as motionReact from "motion/react";

// Mock useReducedMotion to return true
jest.spyOn(motionReact, "useReducedMotion").mockReturnValue(true);

test("respects reduced motion preference", () => {
  const { container } = render(<AnimatedComponent />);
  // Assert that animations are disabled
  // Check that motion.div has no initial/animate props
});
```

## Common Pitfalls

### 1. Forgetting to Import useReducedMotion

```typescript
// ❌ BAD: No reduced motion check
<motion.div animate={{ opacity: 1 }} />

// ✅ GOOD
const shouldReduceMotion = useReducedMotion();
<motion.div
  animate={shouldReduceMotion ? undefined : { opacity: 1 }}
/>
```

### 2. Not Converting Milliseconds to Seconds

```typescript
// ❌ BAD: Framer Motion expects seconds
transition={{ duration: ANIMATION_DURATIONS.HINT_TRANSITION }}

// ✅ GOOD
transition={{ duration: ANIMATION_DURATIONS.HINT_TRANSITION / 1000 }}

// ✅ EVEN BETTER: Use helper function
import { msToSeconds } from "@/lib/animationConstants";
transition={{ duration: msToSeconds(ANIMATION_DURATIONS.HINT_TRANSITION) }}
```

### 3. Applying Delays Without Conditional Check

```typescript
// ❌ BAD: Delay still applies with reduced motion
transition={{
  duration: shouldReduceMotion ? 0 : 0.3,
  delay: 0.5, // This delay always applies!
}}

// ✅ GOOD
transition={{
  duration: shouldReduceMotion ? 0 : 0.3,
  delay: shouldReduceMotion ? 0 : 0.5,
}}
```

### 4. Using Layout Animations Without Disabling

```typescript
// ❌ BAD: Layout animations always run
<motion.div layout transition={{ layout: { duration: 0.3 } }} />

// ✅ GOOD
const shouldReduceMotion = useReducedMotion();
<motion.div
  layout={!shouldReduceMotion}
  transition={{
    layout: {
      duration: shouldReduceMotion ? 0 : 0.3,
    },
  }}
/>
```

### 5. Hardcoding Animation Values

```typescript
// ❌ BAD: Magic numbers scattered throughout codebase
<motion.div
  transition={{ duration: 0.4, delay: 0.6 }}
/>

// ✅ GOOD: Use centralized constants
import { ANIMATION_DURATIONS, msToSeconds } from "@/lib/animationConstants";
<motion.div
  transition={{
    duration: msToSeconds(ANIMATION_DURATIONS.HINT_TRANSITION),
    delay: msToSeconds(ANIMATION_DURATIONS.HINT_DELAY),
  }}
/>
```

## Performance Considerations

### Use GPU-Accelerated Properties

```typescript
// ✅ GOOD: transform and opacity are GPU-accelerated
<motion.div
  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
/>

// ❌ BAD: width, height, top, left trigger layout recalculation
<motion.div
  animate={{ width: 200, height: 100, top: 50 }}
/>
```

### Avoid Animating Many Elements Simultaneously

```typescript
// ⚠️ CAUTION: Animating 100+ items can cause jank
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05 }} // Stagger
  >
    {item.content}
  </motion.div>
))}

// ✅ BETTER: Limit stagger or use CSS animations for many items
{items.slice(0, 20).map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: Math.min(index * 0.05, 1) }} // Cap at 1s
  >
    {item.content}
  </motion.div>
))}
```

### Profile on Real Devices

- Animations that run at 60fps on desktop may drop frames on mobile
- Test on mid-range devices, not just flagship phones
- Use Chrome DevTools Performance tab to identify bottlenecks
- Check for unnecessary re-renders using React DevTools Profiler

## Summary Checklist

When implementing a new animation:

- [ ] Import `useReducedMotion` from `@/lib/animationConstants`
- [ ] Call `useReducedMotion()` hook at component level
- [ ] Set all animation props to `undefined` when `shouldReduceMotion` is true
- [ ] Use centralized constants from `ANIMATION_DURATIONS`, `ANIMATION_SPRINGS`, `ANIMATION_EASINGS`
- [ ] Convert milliseconds to seconds for Framer Motion (`/1000` or `msToSeconds()`)
- [ ] Apply conditional check to delays
- [ ] Use GPU-accelerated properties (transform, opacity)
- [ ] Test with reduced motion enabled in OS settings
- [ ] Test on actual mobile device
- [ ] Verify animation doesn't block state updates

---

**Remember**: Animations are visual enhancements, not core functionality. The app must work perfectly with all animations disabled.

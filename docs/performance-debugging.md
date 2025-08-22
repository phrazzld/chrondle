# Performance Debugging with why-did-you-render

## Overview

The project includes `why-did-you-render` instrumentation to help identify unnecessary React component re-renders during development.

## How to Enable

1. Set the environment variable in your `.env.local`:

   ```bash
   NEXT_PUBLIC_WDYR=true
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Open the browser console to see re-render tracking information

## What's Being Tracked

The following components are instrumented for tracking:

- **HintsDisplay** - Main hints display component
- **GuessHistory** - Guess history list
- **GameControls** - Game control buttons
- **ChronldeGameContent** - Main game content wrapper

## Reading the Console Output

When enabled, you'll see console messages like:

```
[WDYR] HintsDisplay re-rendered
Reason: props changes
Props changed: { prevProps: {...}, nextProps: {...} }
```

## Common Re-render Causes

1. **Props changes** - Even if values are the same, object/array references might differ
2. **Parent re-renders** - Component re-renders because its parent did
3. **Hook changes** - useState, useContext, or custom hooks triggered updates
4. **Unstable callbacks** - Functions recreated on every render without useCallback

## Performance Tips

1. **Use React.memo** - Already applied to key components
2. **Memoize callbacks** - Use useCallback for event handlers
3. **Memoize expensive computations** - Use useMemo for derived state
4. **Defer non-critical updates** - Use useDeferredValue for analytics/logging

## Configuration

The configuration is in `src/lib/wdyr.ts`. You can modify:

- Which components to track
- Which hooks to monitor
- Console output format
- Filtering rules

## Disabling

To disable tracking:

1. Remove or set to false: `NEXT_PUBLIC_WDYR=false`
2. Or temporarily comment out the import in `src/app/page.tsx`

## Production

why-did-you-render is automatically disabled in production builds. The code is tree-shaken out, so there's no performance impact.

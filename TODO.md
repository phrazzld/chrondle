# Chrondle TODO - Fix Hint Array Overflow Crash

## 🔥 P0 - Critical Bug Fix

### PR-001: Fix Hint Array Overflow Crash
**Target**: Single atomic pull request, 1-hour implementation
**Impact**: Fixes game-breaking crash on 6th guess attempt

- [x] **Fix bounds checking in renderGuess() function**
  - **File**: `index.html` line 586
  - **Change**: Replace `const hintText = events[guessIndex + 1];` with `const hintText = events[guessIndex + 1] || 'No more hints available.';`
  - **Context**: When guessIndex=5, accessing events[6] returns undefined and crashes the hint display
  - **Validation**: Ensure fallback message matches existing UI pattern on line 607

- [x] **Verify existing fallback UI pattern consistency**
  - **File**: `index.html` line 607
  - **Check**: Confirm `${hintText || 'No more hints available.'}` pattern already exists and works
  - **Context**: Ensure new fix aligns with established codebase patterns for graceful degradation

- [x] **Test basic functionality - all 6 guesses**
  - **Steps**: Load game → Make 6 incorrect guesses → Verify no crashes
  - **Expected**: Each guess displays hint, 6th guess shows "No more hints available"
  - **Browsers**: Test in Chrome, Firefox, Safari
  - **Validation**: Console should show no errors during entire game flow

- [x] **Test edge case - correct guess on attempt 6**
  - **Steps**: Load game → Make 5 incorrect guesses → Make correct guess on 6th attempt
  - **Expected**: Correct guess shows green success state, no hint needed
  - **Context**: Ensure bounds fix doesn't break success path when guessIndex=5

- [x] **Test fallback scenario - hardcoded events**
  - **Steps**: Simulate API failure to trigger hardcoded events path
  - **Method**: Temporarily break API_NINJAS_KEY to force fallback
  - **Expected**: Game works with hardcoded events, 6th guess handles bounds correctly
  - **Context**: Ensure fix works with both API and fallback data sources

- [x] **Verify mobile responsiveness of hint message**
  - **Devices**: Test on iPhone/Android viewport sizes
  - **Focus**: Ensure "No more hints available" displays correctly in mobile layout
  - **Context**: Hint text spans multiple lines in mobile view, verify wrapping works

- [x] **Test dark mode and colorblind mode compatibility**
  - **Steps**: Enable dark mode → Test hint overflow → Enable colorblind mode → Test hint overflow
  - **Expected**: "No more hints available" message inherits correct theme styling
  - **Context**: Ensure accessibility modes don't break the fallback message display

- [x] **Validate game completion flow after fix**
  - **Steps**: Complete full game with 6 incorrect guesses → Check game over modal
  - **Expected**: All 6 events display in final summary, modal shows correctly
  - **Context**: Ensure array bounds fix doesn't affect end-game event display

- [x] **Performance verification - no regression**
  - **Method**: Check DevTools Performance tab during 6-guess game
  - **Expected**: No additional memory allocation or performance impact
  - **Context**: Logical OR operation should have zero measurable overhead

- [x] **Code review self-check**
  - **Review**: Ensure change follows existing code style and patterns
  - **Check**: Verify change aligns with "Carmack approach" - minimal complexity
  - **Context**: Solution should be simplest possible fix that works reliably

## 📋 Implementation Notes

**Carmack Principle Applied**: Make it work first with minimal complexity
- Single line change leverages existing JavaScript idioms
- Zero performance impact - logical OR is negligible overhead  
- Follows established codebase pattern for graceful degradation
- Risk-averse: doesn't change working code paths, only adds safety

**Bounds Check Pattern**:
```javascript
// Before (line 586):
const hintText = events[guessIndex + 1];

// After (line 586):
const hintText = events[guessIndex + 1] || 'No more hints available.';
```

**Why This Solution**:
- Leverages existing fallback UI on line 607: `${hintText || 'No more hints available.'}`
- JavaScript undefined is falsy, so || operator provides clean fallback
- Minimal code change reduces risk of introducing new bugs
- Maintains single-file architecture philosophy

## 🧪 Test Scenarios Coverage

1. **Happy Path**: 1-5 guesses work normally
2. **Edge Case**: 6th guess doesn't crash  
3. **Success Path**: Correct guess on any attempt
4. **Fallback Data**: Works with hardcoded events
5. **UI Themes**: Dark mode, colorblind mode compatibility
6. **Responsive**: Mobile layout handles message correctly
7. **Performance**: No measurable overhead introduced

## ✅ Definition of Done

- [x] No crashes on 6th guess attempt
- [x] "No more hints available" message displays correctly
- [x] All existing functionality works unchanged
- [x] Manual testing completed across browsers and devices
- [x] Code follows established codebase patterns
- [x] Zero performance regression measured

---

## 🔧 Enhancement: Debug Mode for Testing Workflows

### PR-002: Enhanced Debug Mode Implementation
**Target**: Enable unlimited manual testing and automation foundation
**Impact**: Solves localStorage persistence blocking iterative testing workflows
**Philosophy**: Carmack approach - "Make it work" with minimal complexity

- [x] **Implement URL parameter parsing utilities**
  - **File**: `index.html` after line 94 (before closing `</head>`)
  - **Add**: `<script>const URL_PARAMS = new URLSearchParams(window.location.search);</script>`
  - **Context**: Global URL parameter access for debug features
  - **Validation**: `console.log(URL_PARAMS.get('debug'))` should work in browser console

- [x] **Add debug mode detection flag**
  - **File**: `index.html` around line 456 (before gameState initialization)
  - **Add**: `const DEBUG_MODE = URL_PARAMS.get('debug') === 'true';`
  - **Context**: Single source of truth for debug state throughout application
  - **Validation**: `?debug=true` should set DEBUG_MODE to true, default to false

- [x] **Implement conditional localStorage bypass in saveProgress()**
  - **File**: `index.html` find `saveProgress()` function (around line 700-800)
  - **Change**: Add early return `if (DEBUG_MODE) { console.log('Debug mode: skipping localStorage save'); return; }`
  - **Context**: Prevents daily game state persistence during testing
  - **Validation**: Debug mode should not save progress to localStorage

- [x] **Implement conditional localStorage bypass in loadProgress()**
  - **File**: `index.html` find `loadProgress()` function
  - **Change**: Add early return `if (DEBUG_MODE) { console.log('Debug mode: skipping localStorage load'); return null; }`
  - **Context**: Forces fresh game state on every debug mode session
  - **Validation**: Debug mode should always start with clean game state

- [x] **Add debug console utilities object**
  - **File**: `index.html` around line 456 (after gameState initialization)
  - **Add**: Debug utilities object with reset, scenario, and state inspection methods
  - **Context**: Provides programmatic control over game state for testing
  - **Code**:
    ```javascript
    if (DEBUG_MODE) {
        window.chrondle = {
            reset: () => location.reload(),
            state: () => console.log(gameState),
            clearStorage: () => { Object.keys(localStorage).forEach(k => k.startsWith('chrondle-') && localStorage.removeItem(k)); console.log('Chrondle storage cleared'); },
            setYear: (year) => { gameState.puzzle.year = year; console.log(`Forced year to ${year}`); }
        };
        console.log('🔧 Debug mode active. Use window.chrondle for utilities.');
    }
    ```

- [x] **Implement forced year override parameter**
  - **File**: `index.html` in `getDailyYear()` function (around line 329)
  - **Change**: Add early return `const forcedYear = URL_PARAMS.get('year'); if (forcedYear && DEBUG_MODE) { console.log(\`Debug: forcing year to \${forcedYear}\`); return parseInt(forcedYear, 10); }`
  - **Context**: Allows testing specific years via ?year=1969 parameter
  - **Validation**: `?debug=true&year=1969` should force 1969 as daily puzzle

- [x] **Add scenario pre-loading for 6wrong test case**
  - **File**: `index.html` in `init()` function after puzzle initialization
  - **Add**: Scenario detection and pre-loading logic for common test patterns
  - **Context**: Enables rapid setup of specific test scenarios
  - **Code**:
    ```javascript
    if (DEBUG_MODE) {
        const scenario = URL_PARAMS.get('scenario');
        if (scenario === '6wrong') {
            // Pre-load 5 wrong guesses, ready for 6th guess testing
            const wrongGuesses = [1500, 1800, 1900, 1950, 2000];
            wrongGuesses.forEach(guess => {
                if (gameState.guesses.length < 5) {
                    gameState.guesses.push(guess);
                    renderGuess(guess, gameState.guesses.length - 1);
                }
            });
            console.log('🎯 Scenario: 5 wrong guesses loaded, ready for 6th guess test');
        }
    }
    ```

- [x] **Add debug visual indicator in UI**
  - **File**: `index.html` in the header section around line 100-120
  - **Add**: Debug mode banner element that displays when active
  - **Context**: Clear visual indication that debug mode is active
  - **Code**:
    ```html
    <div id="debug-banner" class="hidden bg-yellow-400 dark:bg-yellow-600 text-black p-2 text-center font-bold">
        🔧 DEBUG MODE ACTIVE - No progress saved | <span id="debug-params"></span>
    </div>
    ```

- [x] **Implement debug banner display logic**
  - **File**: `index.html` around line 464 (in init function)
  - **Add**: Debug banner visibility and parameter display
  - **Context**: Shows active debug parameters and status
  - **Code**:
    ```javascript
    if (DEBUG_MODE) {
        const banner = document.getElementById('debug-banner');
        const params = document.getElementById('debug-params');
        banner.classList.remove('hidden');
        const activeParams = [];
        if (URL_PARAMS.get('year')) activeParams.push(`year=${URL_PARAMS.get('year')}`);
        if (URL_PARAMS.get('scenario')) activeParams.push(`scenario=${URL_PARAMS.get('scenario')}`);
        params.textContent = activeParams.length ? activeParams.join(' | ') : 'Basic debug mode';
    }
    ```

- [x] **Add debug keyboard shortcuts**
  - **File**: `index.html` after event listeners setup (around line 600-700)
  - **Add**: Keyboard shortcuts for common debug operations
  - **Context**: Rapid testing workflow with keyboard shortcuts
  - **Code**:
    ```javascript
    if (DEBUG_MODE) {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'r': e.preventDefault(); location.reload(); break;
                    case 'c': e.preventDefault(); window.chrondle.clearStorage(); location.reload(); break;
                    case 'd': e.preventDefault(); window.chrondle.state(); break;
                }
            }
        });
        console.log('⌨️  Debug shortcuts: Ctrl+R (reset), Ctrl+C (clear storage), Ctrl+D (dump state)');
    }
    ```

- [x] **Test debug mode basic functionality**
  - **Steps**: Navigate to `http://localhost:8000?debug=true`
  - **Expected**: Debug banner visible, no localStorage persistence, window.chrondle available
  - **Validation**: Multiple page refreshes should start fresh game each time

- [x] **Test forced year parameter**
  - **Steps**: Navigate to `http://localhost:8000?debug=true&year=1969`
  - **Expected**: Game loads 1969 puzzle regardless of actual date
  - **Validation**: Primary event should be from 1969, debug banner shows year parameter

- [x] **Test 6wrong scenario pre-loading**
  - **Steps**: Navigate to `http://localhost:8000?debug=true&scenario=6wrong`
  - **Expected**: Game loads with 5 wrong guesses already made, ready for 6th guess
  - **Validation**: 5 guess rows visible, guess counter shows (5/6), ready for final test

- [x] **Test debug console utilities**
  - **Steps**: In debug mode, use browser console to test window.chrondle methods
  - **Expected**: All utility methods work correctly (reset, state, clearStorage, setYear)
  - **Validation**: Each method should execute without errors and provide feedback

- [x] **Test debug keyboard shortcuts**
  - **Steps**: In debug mode, test Ctrl+R, Ctrl+C, Ctrl+D keyboard combinations
  - **Expected**: Shortcuts trigger appropriate debug actions
  - **Validation**: Keyboard shortcuts should work and not interfere with normal game input

- [x] **Verify production mode unchanged**
  - **Steps**: Test normal URL `http://localhost:8000` without debug parameters
  - **Expected**: No debug features active, normal localStorage behavior
  - **Validation**: Game should behave exactly as before, no debug artifacts visible

## 📋 Debug Mode Implementation Notes

**Carmack Principle Applied**: "Make it work" - debug features that don't compromise production

**Design Philosophy**:
- Zero performance impact on production users
- Debug code is conditional and isolated
- Maintains single-file architecture elegance
- Provides foundation for future automation

**URL Parameter API**:
```
?debug=true              - Enable debug mode
?debug=true&year=1969    - Force specific year
?debug=true&scenario=6wrong - Pre-load test scenario
```

**Debug Console API**:
```javascript
window.chrondle.reset()        // Reload page
window.chrondle.state()        // Dump game state
window.chrondle.clearStorage() // Clear all Chrondle data
window.chrondle.setYear(1969)  // Force year change
```

**Why This Approach Wins**:
- Solves immediate testing workflow problem
- Maintains architectural integrity
- Provides automation foundation
- Zero complexity for production users
- Follows JavaScript best practices for debug utilities

## ✅ Debug Mode Definition of Done

- [x] Debug mode accessible via URL parameter
- [x] No localStorage persistence in debug mode
- [x] Console utilities provide programmatic control
- [x] Scenario pre-loading works for common test cases
- [x] Forced year parameter overrides daily puzzle
- [x] Visual debug indicator shows active status
- [x] Keyboard shortcuts enable rapid workflow
- [x] Production mode completely unaffected
- [x] All debug features work across browsers
- [x] Debug code is maintainable and well-documented
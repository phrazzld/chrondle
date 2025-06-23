# Chrondle Testing Guide

Complete testing strategy for the Chrondle historical guessing game with LLM integration.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Start dev server for manual testing
npm run dev --turbopack

# Test specific scenario
open "http://localhost:3000?debug=true&year=1401"
```

## Testing Architecture

### 1. Automated Validation

#### Unit Tests
- **Game Logic**: Year selection, guess validation, scoring
- **LLM Optimizer**: Model selection, circuit breakers, caching
- **Utility Functions**: Date handling, proximity feedback, formatting

#### Integration Tests
- **API Fallback Chains**: OpenRouter → Enhanced → Raw hints
- **Error Scenarios**: Network failures, invalid responses, timeouts
- **Performance**: Response times, cache effectiveness, memory usage

#### Quality Validation
- **Hint Content**: Length, year detection, vocabulary diversity
- **User Experience**: Loading states, error messages, accessibility

### 2. Manual Testing Scenarios

#### Core Functionality
- [ ] **Debug Mode 1401**: `?debug=true&year=1401`
- [ ] **Daily Puzzle**: Default behavior without parameters
- [ ] **All Game Mechanics**: Guessing, hints, win/lose, sharing

#### Error Handling
- [ ] **No API Key**: Remove `OPENROUTER_API_KEY` from `.env.local`
- [ ] **Network Issues**: Throttle network to 3G speeds
- [ ] **Rate Limiting**: Make rapid requests to trigger limits

#### Performance & UX
- [ ] **Mobile Responsive**: Test on iPhone/Android (375px width)
- [ ] **Accessibility**: Dark mode, color-blind mode, keyboard nav
- [ ] **Load Times**: First Contentful Paint < 2s, hint generation < 5s

## Test Scenarios

### Critical Path: Year 1401 Flow

**Objective**: Verify complete game experience with LLM enhancement

**Steps**:
1. Navigate to `http://localhost:3000?debug=true&year=1401`
2. Verify page loads without errors
3. Check that exactly 6 hints are displayed
4. Confirm first hint shows LLM enhancement (AI badge or indicator)
5. Make incorrect guess (e.g., 1400)
6. Verify directional feedback ("LATER" or "EARLIER")
7. Verify new hint is revealed
8. Make correct guess (1401)
9. Verify success state and game completion

**Expected Results**:
- All 6 hints should be engaging and historically accurate
- No hint should contain the year 1401 or obvious date markers
- Hints should progress from obscure to more recognizable
- LLM enhancement should be visible in debug mode
- Game should complete successfully

### Error Scenario: No API Key

**Objective**: Verify graceful degradation without LLM access

**Setup**:
```bash
# Backup current .env.local
cp .env.local .env.local.backup

# Remove API key
echo "OPENROUTER_API_KEY=" > .env.local
echo "SITE_URL=http://localhost:3000" >> .env.local
echo "NODE_ENV=development" >> .env.local
```

**Steps**:
1. Restart dev server: `npm run dev --turbopack`
2. Navigate to `http://localhost:3000?debug=true&year=1401`
3. Verify game loads and functions normally
4. Check hints are still informative (using enhanced descriptions)
5. Complete a full game to ensure no breakage

**Expected Results**:
- Game should work perfectly without LLM
- No error messages should be visible to users
- Debug console should show fallback behavior
- Hints should still be engaging (enhanced descriptions)

**Cleanup**:
```bash
# Restore API key
mv .env.local.backup .env.local
```

### Performance Validation

**Objective**: Ensure responsive user experience

**Metrics to Measure**:
- **Initial Page Load**: < 2 seconds to First Contentful Paint
- **Hint Generation**: < 5 seconds for LLM-enhanced hints
- **Cache Effectiveness**: Subsequent requests < 100ms
- **Memory Usage**: Stable across multiple games

**Tools**:
- Browser DevTools Network/Performance tabs
- Lighthouse performance audit
- Memory profiler for leak detection

### Mobile Responsiveness

**Objective**: Verify identical functionality on mobile devices

**Test Devices** (Chrome DevTools):
- iPhone 12 (390×844)
- Samsung Galaxy S21 (384×854)
- iPad (768×1024)

**Validation Points**:
- [ ] All text is readable without horizontal scrolling
- [ ] Input fields are easily tappable (44px minimum)
- [ ] Modals display correctly and are dismissible
- [ ] Touch interactions work (tap, scroll, pinch)
- [ ] Performance remains acceptable on mobile

## Quality Criteria

### LLM Hint Quality

Each LLM-enhanced hint should meet these criteria:

1. **Length**: 10-25 words (optimal for readability)
2. **Historical Accuracy**: Factually correct information
3. **Engaging Content**: Interesting details that add context
4. **No Year Leakage**: Must not contain 1401 or date clues
5. **Progressive Difficulty**: Later hints more recognizable
6. **Vocabulary Diversity**: Varied language, not repetitive

**Quality Validation Tools**:
- See `HINT_QUALITY_VALIDATION.md` for comprehensive quality framework
- Use `QUALITY_CHECKLIST.md` for systematic testing validation
- Automated quality checks built into LLM optimizer system

### System Reliability

1. **Fallback Chain**: LLM → Enhanced → Cleaned → Raw
2. **Error Recovery**: Circuit breakers prevent cascade failures
3. **Rate Limiting**: Respects API limits without breaking game
4. **Cost Control**: Daily budget enforcement ($50 limit)
5. **Cache Effectiveness**: Reduces API calls for repeat events

## Debug Features

### URL Parameters

- `?debug=true`: Enable debug mode with enhanced logging
- `&year=1401`: Force specific year (overrides daily puzzle)
- `&scenario=error`: Simulate error conditions

### Debug Console Output

Look for these log patterns:
```
🔍 DEBUG: Optimal model order: [...] 
🔍 DEBUG: Using cached hint
🔍 DEBUG: Successfully enhanced hint with deepseek/deepseek-r1:free
🔍 DEBUG: Model switching due to failure: [model] → [next-model]
🔍 DEBUG: Circuit breaker triggered for [model]
```

### localStorage Inspection

Check these keys in browser DevTools:
```javascript
// LLM optimizer metrics
localStorage.getItem('llm-optimizer-metrics')

// Daily cost tracking  
localStorage.getItem('llm-daily-cost')
localStorage.getItem('llm-daily-cost-date')

// Game progress
localStorage.getItem('chrondle-progress-2025-01-01')

// Settings
localStorage.getItem('chrondle-settings')
```

## Performance Benchmarks

### Expected Response Times

| Operation | Target | Acceptable |
|-----------|--------|------------|
| Page Load | < 1s | < 2s |
| First Hint Generation | < 3s | < 5s |
| Cached Hint | < 50ms | < 100ms |
| Guess Submission | < 200ms | < 500ms |
| Modal Open/Close | < 100ms | < 200ms |

### Memory Usage

- **Initial Load**: < 50MB
- **After 10 Games**: < 100MB
- **Cache Size**: < 10MB (auto-cleanup)

## Browser Compatibility

### Primary Support
- Chrome 100+ (90% of users)
- Safari 15+ (Mobile Safari)
- Firefox 100+
- Edge 100+

### Graceful Degradation
- Chrome 90+: Full functionality
- Safari 14+: Limited animation
- Older browsers: Basic functionality only

## Automated Testing Setup

### Test Commands

```bash
# Run all tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Performance benchmarks
npm run test:perf

# LLM quality validation
npm run test:quality

# Watch mode for development
npm run test:watch
```

### CI/CD Pipeline

Tests run automatically on:
- Every commit to main branch
- Pull request creation/updates
- Deployment to staging/production

Expected test results:
- ✅ All unit tests pass (>95% coverage)
- ✅ Integration tests validate API fallbacks
- ✅ Performance benchmarks meet targets
- ✅ LLM hint quality meets criteria

## Troubleshooting

### Common Issues

**Issue**: Hints not showing LLM enhancement
**Solution**: Verify `OPENROUTER_API_KEY` is set and valid

**Issue**: Game loads slowly
**Solution**: Check network conditions, API response times

**Issue**: Hints contain years
**Solution**: Check LLM prompt engineering, validation logic

**Issue**: Mobile layout broken
**Solution**: Test responsive breakpoints, viewport meta tag

### Debug Checklist

1. **Environment Variables**: All required vars present and valid
2. **API Connectivity**: OpenRouter and API Ninjas responding
3. **Cache State**: Clear localStorage if behavior is inconsistent
4. **Network Conditions**: Test with various speeds/reliability
5. **Browser Console**: Check for JavaScript errors or warnings

## Manual Test Checklist

### Before Each Release

- [ ] **Critical Path**: 1401 debug flow works perfectly
- [ ] **Error Handling**: No API key scenario functions
- [ ] **Performance**: All benchmarks met
- [ ] **Mobile**: Responsive design works on key devices
- [ ] **Accessibility**: Dark mode, keyboard nav, screen readers
- [ ] **Cross-browser**: Chrome, Safari, Firefox, Edge
- [ ] **Cache Behavior**: Proper invalidation and storage limits
- [ ] **Cost Controls**: Daily limits and fallbacks active

### Production Validation

- [ ] **Environment Config**: Production env vars correct
- [ ] **API Keys**: Valid and have sufficient quotas
- [ ] **CDN/Caching**: Static assets cached appropriately
- [ ] **Error Monitoring**: Sentry/monitoring tools active
- [ ] **Performance**: Real-world metrics meet targets
- [ ] **Security**: HTTPS, CSP headers, no exposed secrets

## Contact & Support

For testing questions or issues:
- Check GitHub Issues: [repository-link]
- Review implementation docs: `ARCHITECTURE_DECISIONS.md`
- Debug with: `?debug=true&year=1401`

---

**Remember**: The goal is ensuring users have a delightful experience learning history, regardless of network conditions or API availability.
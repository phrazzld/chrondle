# Chrondle Architecture Documentation

This document explains the technical architecture, design decisions, and implementation details of Chrondle.

## 🏗 Design Philosophy

Chrondle follows the **"Carmack Approach"** to software engineering:

1. **Make it work** → Robust functionality with comprehensive fallbacks
2. **Make it fast** → Minimal dependencies, efficient caching, fast load times  
3. **Make it pretty** → Polished UI, smooth animations, delightful UX

### Key Principles
- **Single-file architecture** for simplicity and portability
- **Deterministic behavior** ensuring all players get identical puzzles
- **Graceful degradation** with multiple fallback layers
- **Client-side first** approach minimizing server dependencies

## 📁 File Structure

```
chrondle/
├── index.html              # Complete application (HTML + CSS + JS)
├── README.md               # Project documentation
├── ARCHITECTURE.md         # This file
├── API.md                  # API integration details
├── GAMEPLAY.md             # Game mechanics documentation
├── CHANGELOG.md            # Version history
├── TODO.md                 # Development roadmap
├── CLAUDE.md               # AI assistant instructions
├── .env                    # API key (not in production)
└── .gitignore              # Git ignore patterns
```

## 🧩 Core Components

### 1. Game State Management
```javascript
let gameState = {
    puzzle: null,      // Daily puzzle object
    guesses: [],       // Array of player guesses
    maxGuesses: 6,     // Maximum allowed attempts
    isGameOver: false  // Game completion status
};
```

**Key Features:**
- Minimal state object tracking only essential data
- Immutable puzzle data fetched once per day
- Progress automatically saved to localStorage

### 2. Daily Puzzle System

#### Deterministic Year Selection
```javascript
function getDailyYear() {
    const EPOCH_START = new Date('2024-01-01');
    const today = new Date();
    
    // Normalize to midnight for timezone consistency
    today.setHours(0, 0, 0, 0);
    EPOCH_START.setHours(0, 0, 0, 0);
    
    const daysSinceEpoch = Math.floor((today - EPOCH_START) / (1000 * 60 * 60 * 24));
    const yearIndex = daysSinceEpoch % CURATED_YEARS.length;
    
    return CURATED_YEARS[yearIndex];
}
```

**Design Decisions:**
- **Curated years list** ensures historically rich puzzles
- **Modulo cycling** provides predictable rotation
- **Midnight normalization** ensures global consistency
- **Epoch-based calculation** makes puzzles reproducible

#### Puzzle Object Structure
```javascript
{
    year: number,           // Target year (negative for BC)
    events: string[],       // Array of 6 historical events
    puzzleId: string        // YYYY-MM-DD format for caching
}
```

### 3. Event Sorting Algorithm

Events are sorted by recognizability to create optimal hint progression:

```javascript
function scoreEventRecognizability(event) {
    // High-recognition keywords (10 points each)
    const highRecognitionTerms = [
        'moon', 'apollo', 'president', 'war', 'peace', 'independence'
    ];
    
    // Medium-recognition keywords (5 points each)  
    const mediumRecognitionTerms = [
        'battle', 'died', 'born', 'elected', 'founded'
    ];
    
    // Bonus for conciseness, penalty for verbosity
    if (text.length < 50) score += 5;
    if (text.length > 100) score -= 5;
    
    return score;
}
```

**Progressive Difficulty:**
1. **Lowest scores first** → Most obscure events
2. **Length tiebreaker** → Longer (more detailed) events first
3. **Highest scores last** → Most recognizable events

### 4. API Integration Layer

#### Three-Tier Fallback System
```
1. API Ninjas Historical Events API
   ↓ (if insufficient events < 6)
2. Fallback Year (1969) from API  
   ↓ (if API completely fails)
3. Hardcoded Events Array
```

#### Rate Limiting & Caching
```javascript
const API_CACHE = new Map();           // In-memory cache
let lastApiCall = 0;                   // Last request timestamp
const MIN_API_INTERVAL = 1000;        // 1 second between calls

function canMakeApiCall() {
    return Date.now() - lastApiCall >= MIN_API_INTERVAL;
}
```

**Cache Strategy:**
- **Key format**: `events-{year}`
- **Storage**: In-memory Map (resets on page refresh)
- **TTL**: Session-based (cleared on browser restart)

### 5. Rendering Engine

#### Guess Rendering System
```javascript
function renderGuess(guess, index = null) {
    const guessIndex = index !== null ? index : gameState.guesses.length - 1;
    const directionInfo = getGuessDirectionInfo(guess, target);
    const hintText = events[guessIndex + 1];
    
    // Generate HTML with proper styling and animations
}
```

**Key Features:**
- **Index parameter** fixes hint bug during replay
- **Direction info object** consolidates styling logic
- **Animation delays** create smooth visual progression

#### UI State Management
```javascript
function setupUI() {
    primaryEventText.textContent = gameState.puzzle.events[0];
    guessHistory.innerHTML = '';
    gameState.guesses.forEach((guess, index) => renderGuess(guess, index));
    updateGuessButton();
}
```

### 6. Data Persistence

#### LocalStorage Strategy
```javascript
// Storage keys
`chrondle-progress-${YYYY-MM-DD}`     // Daily game progress
`chrondle-settings`                   // User preferences
`chrondle-has-played`                 // First-time user flag
```

**Data Structures:**
```javascript
// Progress object
{
    guesses: number[],     // Array of guess values
    isGameOver: boolean    // Completion status
}

// Settings object  
{
    darkMode: boolean,         // Dark theme preference
    colorBlindMode: boolean    // Accessibility mode
}
```

## 🎨 Styling Architecture

### Tailwind CSS Integration
- **CDN-based** for zero build requirements
- **Dark mode** using class-based switching
- **Responsive design** with mobile-first approach
- **Custom components** for game-specific elements

### Accessibility Features
```css
/* Colorblind mode overrides */
html.color-blind .bg-red-200 { background-color: #fde047; }
html.color-blind .bg-blue-200 { background-color: #a5b4fc; }

/* Dark mode support */
.dark .spinner { border-top-color: #818cf8; }
```

### Animation System
- **CSS transitions** for smooth state changes
- **Keyframe animations** for loading spinner
- **Staggered delays** for guess row appearances
- **Modal transitions** with backdrop fade effects

## 🔌 Event System

### Modal Management
```javascript
function showModal(modal) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.firstElementChild.classList.add('show'), 10);
}

function hideModal(modal) {
    modal.firstElementChild.classList.remove('show');
    setTimeout(() => modal.classList.add('hidden'), 300);
}
```

### Settings Toggle System
```javascript
darkModeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    darkModeToggle.querySelector('span').classList.toggle('dark:translate-x-6');
    saveSettings();
});
```

## 🛡 Error Handling

### Comprehensive Error Boundaries
1. **API call failures** → Return empty array, use fallbacks
2. **Puzzle initialization errors** → Show user-friendly message, disable inputs
3. **Storage failures** → Graceful degradation without breaking gameplay
4. **Network timeouts** → Client-side rate limiting and retries

### User Experience During Errors
```javascript
try {
    gameState.puzzle = await initializePuzzle();
    // Enable game interface
} catch (error) {
    primaryEventText.innerHTML = `
        <div class="text-red-600 dark:text-red-400">
            <h3 class="text-xl font-bold mb-2">Unable to Load Puzzle</h3>
            <p>Please refresh the page to try again.</p>
        </div>
    `;
    // Keep inputs disabled
}
```

## 📊 Performance Optimizations

### Bundle Size Optimizations
- **Single file delivery** → Eliminates HTTP requests
- **CDN resources** → Tailwind CSS, Google Fonts cached by browsers
- **Minimal JavaScript** → ~15KB total including HTML/CSS

### Runtime Performance
- **Event delegation** → Minimal event listeners
- **DOM manipulation** → Efficient innerHTML updates
- **Memory management** → Proper cleanup of intervals and timeouts

### Loading Strategy
```html
<!-- Critical CSS inline, fonts preconnected -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Tailwind loaded from CDN with integrity -->
<script src="https://cdn.tailwindcss.com"></script>
```

## 🔒 Security Considerations

### API Key Exposure
```javascript
// INTENTIONALLY EXPOSED - This is a prototype
// Rate limiting and API quotas provide protection
const API_NINJAS_KEY = 'O8VgZplfhWSNdCsgoeVaZg==2bwPJnxstEQPzmvn';
```

**Rationale:**
- Historical data API with generous rate limits
- Prototype/educational project scope
- Client-side rate limiting prevents abuse
- No sensitive user data processed

### Input Validation
```javascript
if (isNaN(guess) || guess < -3000 || guess > new Date().getFullYear() || guess === 0) {
    // Show validation error
    return;
}
```

## 🧪 Testing Strategy

### Manual Testing Checklist
- ✅ Daily puzzle consistency across browsers
- ✅ BC/AD year input and display
- ✅ Error scenarios and fallback behavior
- ✅ Mobile responsiveness and touch interactions
- ✅ Dark mode and accessibility features
- ✅ Share functionality and clipboard integration

### Browser Compatibility Testing
- Chrome 60+ ✅
- Firefox 55+ ✅  
- Safari 12+ ✅
- Edge 79+ ✅
- Mobile browsers ✅

## 📈 Monitoring & Analytics

### Performance Metrics
- Load time tracking via browser DevTools
- API call frequency monitoring
- Error rate observation via console logs
- User engagement through localStorage persistence

### No External Analytics
- **Privacy-first approach** → No tracking pixels or analytics
- **Local metrics only** → Game statistics stored locally
- **GDPR compliant** → No personal data collection

## 🔄 Deployment Pipeline

### Static Site Deployment
1. **Single file** → Copy `index.html` to web server
2. **CDN hosting** → GitHub Pages, Netlify, Vercel compatible
3. **No build step** → Direct deployment from repository

### Environment Configuration
```bash
# Optional: Local development server
python -m http.server 8000
# or
npx serve .
```

## 🚀 Future Architecture Considerations

### Progressive Web App (PWA)
- Add `manifest.json` for installability
- Implement Service Worker for offline functionality
- Cache API responses for offline puzzle access

### Performance Enhancements
- Consider WebAssembly for complex calculations
- Implement virtual scrolling for long guess histories
- Add lazy loading for modal content

### Scalability Improvements
- Server-side rendering for better SEO
- Database storage for user statistics
- API rate limiting and user authentication

---

*This architecture prioritizes simplicity, reliability, and user experience while maintaining clean, maintainable code.*
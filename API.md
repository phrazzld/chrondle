# API Integration Documentation

This document details the API integration strategy, fallback mechanisms, and data handling for Chrondle.

## 🔌 API Overview

Chrondle uses the **API Ninjas Historical Events API** to fetch real historical events for each daily puzzle.

### API Endpoints
- **Base URL**: `https://api.api-ninjas.com/v1/historicalevents`
- **Method**: GET
- **Authentication**: API Key header (`X-Api-Key`)

### Request Format
```http
GET https://api.api-ninjas.com/v1/historicalevents?year=1969
X-Api-Key: YOUR_API_KEY
```

### Response Format
```json
[
    {
        "year": "1969",
        "event": "Apollo 11 lands on the Moon"
    },
    {
        "year": "1969", 
        "event": "Woodstock music festival takes place"
    }
]
```

## 🔑 API Key Management

### Current Implementation
```javascript
// INTENTIONALLY EXPOSED FOR PROTOTYPE
const API_NINJAS_KEY = 'O8VgZplfhWSNdCsgoeVaZg==2bwPJnxstEQPzmvn';
```

**⚠️ Security Notice:**
- API key is exposed in client-side code for prototype simplicity
- Rate limits (50k requests/month) provide natural protection
- Historical data is not sensitive information
- Production deployment should use environment variables

### Production Recommendations
```javascript
// Recommended for production
const API_NINJAS_KEY = process.env.API_NINJAS_KEY || 'fallback-key';

// Or proxy through your own backend
const API_ENDPOINT = '/api/historical-events';
```

## 🚦 Rate Limiting

### Client-Side Rate Limiting
```javascript
const API_CACHE = new Map();
let lastApiCall = 0;
const MIN_API_INTERVAL = 1000; // 1 second between calls

function canMakeApiCall() {
    const now = Date.now();
    return now - lastApiCall >= MIN_API_INTERVAL;
}

function updateLastApiCall() {
    lastApiCall = Date.now();
}
```

### API Quota Management
- **Monthly Limit**: 50,000 requests
- **Daily Usage**: ~2 requests per user per day maximum
- **Expected Load**: 25,000 daily active users sustainable
- **Overage Protection**: Client-side throttling and caching

### Usage Patterns
```
Daily puzzle load:     1 API call per user
Fallback year lookup:  1 additional call (if needed)
Cache hits:           0 additional calls
Total per user/day:   1-2 API calls maximum
```

## 🛡 Fallback Strategy

### Three-Tier Fallback System

#### Tier 1: Primary API Call
```javascript
async function getHistoricalEvents(year) {
    try {
        const response = await fetch(`https://api.api-ninjas.com/v1/historicalevents?year=${year}`, {
            headers: { 'X-Api-Key': API_NINJAS_KEY }
        });
        
        if (!response.ok) {
            throw new Error(`API response not OK: ${response.status}`);
        }
        
        const events = await response.json();
        return events.map(event => event.event).filter(Boolean);
    } catch (error) {
        console.error(`Failed to fetch events for year ${year}:`, error);
        return []; // Triggers fallback
    }
}
```

#### Tier 2: Fallback Year (1969)
```javascript
if (!events || events.length < 6) {
    console.warn(`Insufficient events for year ${targetYear}, using fallback year ${FALLBACK_YEAR}`);
    events = await getHistoricalEvents(FALLBACK_YEAR);
    usedYear = FALLBACK_YEAR;
}
```

**Why 1969?**
- Historically rich year with many significant events
- High likelihood of 6+ events from API
- Covers multiple domains: space, politics, culture, technology

#### Tier 3: Hardcoded Events
```javascript
if (!events || events.length < 6) {
    console.error('API completely failed, using hardcoded events');
    events = [
        'The Boeing 747 makes its first flight',
        'The Internet precursor ARPANET is created',
        'The Stonewall riots occur in New York',
        'Richard Nixon becomes President',
        'Woodstock music festival takes place',
        'Apollo 11 lands on the Moon'
    ];
    usedYear = FALLBACK_YEAR;
}
```

### Fallback Decision Tree
```
Start: Fetch events for daily year
  ↓
Events < 6? → YES → Fetch events for 1969
  ↓                     ↓
  NO                Events < 6? → YES → Use hardcoded events
  ↓                     ↓
Use daily events    Use 1969 events
```

## 📊 Caching Strategy

### In-Memory Cache
```javascript
const API_CACHE = new Map();

// Cache structure
{
    'events-1969': [
        'Apollo 11 lands on the Moon',
        'Woodstock music festival takes place',
        // ... more events
    ],
    'events-1776': [
        'Declaration of Independence signed',
        // ... more events  
    ]
}
```

### Cache Lifecycle
- **Storage**: In-memory Map object
- **TTL**: Session-based (cleared on page refresh)
- **Eviction**: Browser memory management
- **Size**: Unlimited (controlled by browser)

### Cache Hit Strategy
```javascript
// Check cache first
const cacheKey = `events-${year}`;
if (API_CACHE.has(cacheKey)) {
    console.log(`Using cached events for year ${year}`);
    return API_CACHE.get(cacheKey);
}

// Cache miss - make API call
const eventDescriptions = await fetchFromAPI(year);
API_CACHE.set(cacheKey, eventDescriptions);
```

## 🔍 Data Processing

### Event Validation
```javascript
// Validate API response structure
if (!Array.isArray(events)) {
    throw new Error('API response is not an array');
}

// Extract and filter event descriptions
const eventDescriptions = events
    .map(event => event.event)
    .filter(Boolean) // Remove null/undefined/empty
    .slice(0, 6);    // Ensure max 6 events
```

### Event Quality Assurance
1. **Minimum Length**: Events must have meaningful content
2. **Maximum Count**: Limit to 6 events per year
3. **Deduplication**: Filter out duplicate descriptions
4. **Language**: English-only events (API default)

### Event Transformation
```javascript
// Raw API event
{
    "year": "1969",
    "event": "Apollo 11 lands on the Moon"
}

// Processed for game
"Apollo 11 lands on the Moon"
```

## 🎯 Event Scoring Algorithm

### Recognizability Scoring
```javascript
function scoreEventRecognizability(event) {
    const text = event.toLowerCase();
    let score = 0;
    
    // High-recognition keywords (10 points each)
    const highRecognitionTerms = [
        'moon', 'apollo', 'nasa', 'president', 'war', 'peace', 'treaty', 
        'independence', 'revolution', 'atomic', 'bomb', 'hitler', 'stalin',
        'churchill', 'roosevelt', 'kennedy', 'lincoln', 'washington'
    ];
    
    // Medium-recognition keywords (5 points each)
    const mediumRecognitionTerms = [
        'battle', 'siege', 'died', 'born', 'elected', 'crowned', 'signed',
        'declared', 'defeated', 'conquered', 'expedition', 'voyage'
    ];
    
    // Score calculation
    highRecognitionTerms.forEach(term => {
        if (text.includes(term)) score += 10;
    });
    
    mediumRecognitionTerms.forEach(term => {
        if (text.includes(term)) score += 5;
    });
    
    // Length bonuses/penalties
    if (text.length < 50) score += 5;  // Concise = recognizable
    if (text.length < 30) score += 5;  // Very concise = very recognizable
    if (text.length > 100) score -= 5; // Verbose = obscure
    
    return score;
}
```

### Sorting Strategy
```javascript
function sortEventsByRecognizability(events) {
    const scoredEvents = events.map(event => ({
        event: event,
        score: scoreEventRecognizability(event)
    }));
    
    // Sort: lowest scores first (most obscure), length as tiebreaker
    scoredEvents.sort((a, b) => {
        if (a.score !== b.score) {
            return a.score - b.score; // Ascending scores
        }
        return b.event.length - a.event.length; // Longer events first
    });
    
    return scoredEvents.map(item => item.event);
}
```

## 📈 Monitoring & Debugging

### API Call Logging
```javascript
console.log(`Fetching historical events for year ${year}...`);
console.log(`Successfully fetched ${eventDescriptions.length} events for year ${year}`);
console.warn(`Insufficient events for year ${targetYear} (${events?.length || 0} events)`);
console.error('API completely failed, using hardcoded events');
```

### Error Classification
1. **Network Errors**: Connection failures, timeouts
2. **API Errors**: 4xx/5xx HTTP status codes  
3. **Data Errors**: Invalid response format
4. **Quota Errors**: Rate limit exceeded
5. **Validation Errors**: Insufficient event count

### Debugging Tools
```javascript
// Development helpers
window.chrondle = {
    apiCache: API_CACHE,
    lastApiCall: () => new Date(lastApiCall),
    clearCache: () => API_CACHE.clear(),
    testYear: (year) => getHistoricalEvents(year)
};
```

## 🔧 Configuration Options

### Customizable Parameters
```javascript
// API configuration
const API_NINJAS_KEY = 'your-key-here';
const MIN_API_INTERVAL = 1000;        // Rate limit interval
const REQUIRED_EVENT_COUNT = 6;       // Minimum events needed
const FALLBACK_YEAR = 1969;          // Backup year

// Timeout settings  
const API_TIMEOUT = 5000;            // 5 second timeout
const RETRY_ATTEMPTS = 3;            // Number of retries
const RETRY_DELAY = 1000;            // Delay between retries
```

### Environment Variables
```bash
# Production environment
API_NINJAS_KEY=your-production-key
API_BASE_URL=https://api.api-ninjas.com/v1
API_TIMEOUT=5000
ENABLE_FALLBACKS=true
```

## 🚀 Performance Optimizations

### Request Optimization
- **Minimal headers**: Only required authentication
- **Gzip compression**: Automatic browser handling
- **HTTP/2**: Modern protocol support
- **Keep-alive**: Connection reuse when possible

### Response Processing
```javascript
// Efficient event extraction
const eventDescriptions = events
    .map(event => event.event)  // Extract event text
    .filter(Boolean)            // Remove falsy values
    .slice(0, 6);              // Limit to needed count
```

### Memory Management
- Cache cleanup on page unload
- Automatic garbage collection of old entries
- Minimal object retention

## 🔮 Future Enhancements

### Advanced Caching
- **localStorage persistence** across sessions
- **TTL expiration** for cache entries
- **LRU eviction** for memory management
- **Compression** for large cached datasets

### API Improvements
- **Request batching** for multiple years
- **WebSocket connections** for real-time updates
- **GraphQL integration** for flexible queries
- **CDN caching** for popular years

### Error Recovery
- **Exponential backoff** for retries
- **Circuit breaker** pattern for API failures
- **Health checking** for API availability
- **Graceful degradation** modes

---

*This API integration prioritizes reliability, performance, and user experience while maintaining clean separation of concerns.*
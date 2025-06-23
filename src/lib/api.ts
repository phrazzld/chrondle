// API Integration for Chrondle
// Extracted from index.html lines ~244-772

// Removed wikidata import - no longer used in static puzzle system

// --- API CONFIGURATION ---
// Yes, this API key is exposed in client-side code. This is a prototype.
// The API has rate limits (50k requests/month) and only provides historical data.
// If someone steals this key to make historical event queries, that's their problem.
const API_NINJAS_KEY = 'O8VgZplfhWSNdCsgoeVaZg==2bwPJnxstEQPzmvn';

// Basic client-side rate limiting and caching
const API_CACHE = new Map<string, string[]>();
let lastApiCall = 0;
const MIN_API_INTERVAL = 1000; // 1 second between calls

// Rate limiting utilities
function canMakeApiCall(): boolean {
  // Skip rate limiting in debug mode to allow testing
  const isDebugMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('debug') === 'true';
  
  if (isDebugMode) {
    console.log('🔍 DEBUG: Skipping rate limit check in debug mode');
    return true;
  }
  
  const now = Date.now();
  return now - lastApiCall >= MIN_API_INTERVAL;
}

function updateLastApiCall(): void {
  lastApiCall = Date.now();
}

// --- EVENT SCORING FUNCTIONS ---
function scoreEventRecognizability(event: string): number {
  const text = event.toLowerCase();
  let score = 0;
  
  // High-recognition keywords (famous events, people, places)
  const highRecognitionTerms = [
    'moon', 'apollo', 'nasa', 'president', 'war', 'peace', 'treaty', 'independence',
    'revolution', 'atomic', 'bomb', 'hitler', 'stalin', 'churchill', 'roosevelt',
    'kennedy', 'lincoln', 'washington', 'napoleon', 'caesar', 'rome', 'paris',
    'london', 'america', 'united states', 'world war', 'olympics', 'pearl harbor',
    'berlin wall', 'cold war', 'vietnam', 'titanic', 'earthquake', 'discovery',
    'invention', 'first', 'assassinated', 'founded', 'empire', 'king', 'queen'
  ];
  
  // Medium-recognition keywords
  const mediumRecognitionTerms = [
    'battle', 'siege', 'died', 'born', 'elected', 'crowned', 'signed', 'declared',
    'defeated', 'conquered', 'expedition', 'voyage', 'constructed', 'completed',
    'university', 'cathedral', 'castle', 'city', 'established', 'created'
  ];
  
  // Count high-recognition terms (worth 10 points each)
  highRecognitionTerms.forEach(term => {
    if (text.includes(term)) score += 10;
  });
  
  // Count medium-recognition terms (worth 5 points each)
  mediumRecognitionTerms.forEach(term => {
    if (text.includes(term)) score += 5;
  });
  
  // Bonus for shorter events (more concise = more recognizable)
  if (text.length < 50) score += 5;
  if (text.length < 30) score += 5;
  
  // Penalty for very long events (likely too detailed/obscure)
  if (text.length > 100) score -= 5;
  
  return score;
}

export function sortEventsByRecognizability(events: string[]): string[] {
  // Create array of events with their scores
  const scoredEvents = events.map(event => ({
    event: event,
    score: scoreEventRecognizability(event)
  }));
  
  // Sort by score (lowest first = most obscure first), then by length (longer first) as tiebreaker
  scoredEvents.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score; // Ascending = lowest scores first (most obscure)
    }
    return b.event.length - a.event.length; // Longer events first as tiebreaker
  });
  
  // Return just the sorted events
  return scoredEvents.map(item => item.event);
}

// Clean Wikipedia metadata artifacts from event descriptions
export function cleanEventDescription(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  try {
    // Remove Wikipedia citation and markup artifacts
    const cleaned = text
      // Remove citation needed variants
      .replace(/\[full citation needed\]/gi, '')
      .replace(/\[citation needed\]/gi, '')
      .replace(/\[better source needed\]/gi, '')
      .replace(/\[verification needed\]/gi, '')
      .replace(/\[clarification needed\]/gi, '')
      // Remove time-related markup
      .replace(/\[when\?\]/gi, '')
      .replace(/\[until when\?\]/gi, '')
      .replace(/\[since when\?\]/gi, '')
      // Remove other common Wikipedia markup
      .replace(/\[who\?\]/gi, '')
      .replace(/\[where\?\]/gi, '')
      .replace(/\[why\?\]/gi, '')
      .replace(/\[how\?\]/gi, '')
      .replace(/\[according to whom\?\]/gi, '')
      .replace(/\[says who\?\]/gi, '')
      // Remove extra whitespace and clean up
      .replace(/\s+/g, ' ')
      .trim();
    
    // Debug logging if cleaning made changes
    if (cleaned !== text) {
      console.log(`🔍 DEBUG: Cleaned Wikipedia markup: "${text}" → "${cleaned}"`);
    }
    
    return cleaned;
    
  } catch (error) {
    console.warn(`🔍 DEBUG: Failed to clean event description, using original:`, error);
    return text;
  }
}

// Enhance event descriptions using contextual data to create engaging game hints
export function enhanceEventDescription(
  label: string, 
  description?: string, 
  location?: string, 
  participants?: string
): string {
  if (!label || typeof label !== 'string') {
    return label;
  }
  
  try {
    // Clean inputs and prepare for processing
    const cleanLabel = label.trim();
    const cleanDescription = description ? description.trim() : '';
    const cleanLocation = location ? location.trim() : '';
    const cleanParticipants = participants ? participants.trim() : '';
    
    console.log(`🔍 DEBUG: Enhancing "${cleanLabel}" with context:`, {
      description: cleanDescription || 'none',
      location: cleanLocation || 'none',
      participants: cleanParticipants || 'none'
    });
    
    // Pattern matching for different event types
    let enhanced = '';
    
    // Battle enhancement rules
    if (cleanLabel.toLowerCase().includes('battle of') || 
        cleanDescription.toLowerCase().includes('battle')) {
      
      if (cleanLocation && cleanParticipants) {
        enhanced = `Military conflict between ${cleanParticipants} in ${cleanLocation}`;
      } else if (cleanLocation) {
        enhanced = `Military conflict in ${cleanLocation}`;
      } else if (cleanParticipants) {
        enhanced = `Military conflict involving ${cleanParticipants}`;
      } else if (cleanDescription) {
        enhanced = `Military conflict - ${cleanDescription.replace(/\d{4}/g, '')}`.trim();
      } else {
        enhanced = `Military conflict`;
      }
    }
    
    // Treaty/Pact enhancement rules
    else if (cleanLabel.toLowerCase().includes('treaty') || 
             cleanLabel.toLowerCase().includes('pact') ||
             cleanDescription.toLowerCase().includes('treaty') ||
             cleanDescription.toLowerCase().includes('union')) {
      
      if (cleanParticipants) {
        enhanced = `Political agreement involving ${cleanParticipants}`;
      } else if (cleanDescription) {
        enhanced = `Political agreement - ${cleanDescription.replace(/\d{4}/g, '')}`.trim();
      } else {
        enhanced = `Political treaty or agreement`;
      }
    }
    
    // Cultural/Art enhancement rules  
    else if (cleanLabel.toLowerCase().includes('relief') ||
             cleanLabel.toLowerCase().includes('sculpture') ||
             cleanLabel.toLowerCase().includes('competition') ||
             cleanLabel.toLowerCase().includes('artistic')) {
      
      if (cleanLocation) {
        enhanced = `Artistic work or competition in ${cleanLocation}`;
      } else if (cleanDescription) {
        enhanced = `Cultural event - ${cleanDescription.replace(/\d{4}/g, '')}`.trim();
      } else {
        enhanced = `Artistic or cultural competition`;
      }
    }
    
    // Generic enhancement using description
    else if (cleanDescription) {
      // Use description but remove year references
      enhanced = cleanDescription.replace(/\d{4}/g, '').replace(/\s+/g, ' ').trim();
      if (cleanLocation) {
        enhanced += ` in ${cleanLocation}`;
      }
    }
    
    // Fallback chain: enhanced > cleaned description > cleaned label
    const result = enhanced || cleanDescription || cleanLabel;
    
    // Final cleanup - remove years and extra whitespace
    const finalResult = result
      .replace(/\b\d{4}\b/g, '')  // Remove 4-digit years
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .replace(/^[-\s]+|[-\s]+$/g, '') // Remove leading/trailing dashes and spaces
      .trim();
    
    if (finalResult !== cleanLabel) {
      console.log(`🔍 DEBUG: Enhanced "${cleanLabel}" → "${finalResult}"`);
    }
    
    return finalResult || cleanLabel; // Ultimate fallback to original label
    
  } catch (error) {
    console.warn(`🔍 DEBUG: Failed to enhance event description, using original:`, error);
    return label;
  }
}

// LLM enhancement removed - not used in static puzzle system

// getWikidataEvents function removed - no longer used in static puzzle system

// Main API function to get historical events with fallback system
export async function getHistoricalEvents(year: number): Promise<string[]> {
  // Input validation
  if (!year || typeof year !== 'number') {
    console.error('🔍 DEBUG: getHistoricalEvents: Invalid year parameter:', year);
    return [];
  }

  // Check cache first
  const cacheKey = `events-${year}`;
  if (API_CACHE.has(cacheKey)) {
    console.log(`🔍 DEBUG: Using cached events for year ${year}`);
    return API_CACHE.get(cacheKey)!;
  }

  // Rate limiting check
  if (!canMakeApiCall()) {
    console.warn('🔍 DEBUG: Rate limit: too soon since last API call');
    return [];
  }

  try {
    console.log(`🔍 DEBUG: Fetching historical events for year ${year}...`);
    updateLastApiCall();

    const apiUrl = `https://api.api-ninjas.com/v1/historicalevents?year=${year}`;
    console.log(`🔍 DEBUG: API URL: ${apiUrl}`);
    console.log(`🔍 DEBUG: API Key: ${API_NINJAS_KEY.substring(0, 10)}...`);

    const response = await fetch(apiUrl, {
      headers: {
        'X-Api-Key': API_NINJAS_KEY
      }
    });

    console.log(`🔍 DEBUG: Response status: ${response.status} ${response.statusText}`);
    console.log(`🔍 DEBUG: Response headers:`, [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🔍 DEBUG: API Error Response Body: ${errorText}`);
      throw new Error(`API response not OK: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const events = await response.json();
    console.log(`🔍 DEBUG: Raw API response:`, events);
    
    // Validate response
    if (!Array.isArray(events)) {
      console.error(`🔍 DEBUG: API response is not an array:`, typeof events, events);
      throw new Error('API response is not an array');
    }

    // Extract and clean event descriptions from API Ninjas
    const apiNinjasEvents = events.map((event: Record<string, unknown>) => cleanEventDescription(event.event as string)).filter(Boolean);
    console.log(`🔍 DEBUG: API Ninjas returned ${apiNinjasEvents.length} events for year ${year}`);
    
    const finalEvents = apiNinjasEvents;
    
    // If we don't have enough events, try Wikidata SPARQL as backup
    if (finalEvents.length < 6) {
      console.log(`🔍 DEBUG: Insufficient events from API Ninjas (${finalEvents.length}), trying Wikidata SPARQL...`);
      
      try {
        // Wikidata integration removed - static puzzle system doesn't need fallbacks
        console.log(`🔍 DEBUG: Wikidata fallback removed in static puzzle system`);
      } catch {
        console.warn(`🔍 DEBUG: Fallback system disabled in static puzzle architecture`);
      }
    }
    
    // Cache the final result
    API_CACHE.set(cacheKey, finalEvents);
    
    console.log(`🔍 DEBUG: Successfully fetched ${finalEvents.length} events for year ${year}:`, finalEvents);
    return finalEvents;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`🔍 DEBUG: Failed to fetch events for year ${year}:`, error);
    console.error(`🔍 DEBUG: Error details:`, {
      message: errorMessage,
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}
// API Integration for Chrondle
// Extracted from index.html lines ~244-772

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

// LLM enhancement for creating engaging game hints from enhanced descriptions
export async function llmEnhanceHint(
  enhancedDescription: string,
  urlParams?: URLSearchParams
): Promise<string> {
  // Check if LLM enhancement is enabled
  const llmEnabled = urlParams?.get('llm') === 'true';
  if (!llmEnabled) {
    return enhancedDescription; // Return original if LLM not enabled
  }
  
  // Check for API key (user must provide their own for security)
  if (typeof window === 'undefined') {
    return enhancedDescription; // Server-side fallback
  }
  
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    console.warn('🔍 DEBUG: LLM enhancement requested but no API key found. Set localStorage.openai_api_key to use LLM features.');
    return enhancedDescription;
  }
  
  try {
    // Rate limiting check
    const lastLlmCall = localStorage.getItem('last_llm_call');
    const now = Date.now();
    if (lastLlmCall && (now - parseInt(lastLlmCall)) < 2000) {
      console.log('🔍 DEBUG: LLM rate limit: too soon since last call');
      return enhancedDescription;
    }
    
    console.log(`🔍 DEBUG: Enhancing with LLM: "${enhancedDescription}"`);
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    // Prepare LLM prompt
    const prompt = `Convert this historical event into a clear, engaging hint for a year-guessing game. Make it informative but don't include the year or obvious time markers. Keep it under 20 words: ${enhancedDescription}`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates engaging, concise hints for historical guessing games.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });
    
    clearTimeout(timeoutId);
    localStorage.setItem('last_llm_call', now.toString());
    
    if (!response.ok) {
      const error = await response.text();
      console.warn(`🔍 DEBUG: LLM API error ${response.status}:`, error);
      return enhancedDescription;
    }
    
    const data = await response.json();
    const llmHint = data.choices[0].message.content.trim();
    
    console.log(`🔍 DEBUG: LLM enhanced "${enhancedDescription}" → "${llmHint}"`);
    return llmHint;
    
  } catch (error) {
    console.warn(`🔍 DEBUG: LLM enhancement failed, using fallback:`, error);
    return enhancedDescription;
  }
}

// Get Wikidata events using SPARQL query
export async function getWikidataEvents(year: number): Promise<string[]> {
  // Input validation
  if (!year || typeof year !== 'number') {
    console.error('🔍 DEBUG: getWikidataEvents: Invalid year parameter:', year);
    return [];
  }

  // Check cache first
  const cacheKey = `wikidata-events-${year}`;
  if (API_CACHE.has(cacheKey)) {
    console.log(`🔍 DEBUG: Using cached Wikidata events for year ${year}`);
    return API_CACHE.get(cacheKey)!;
  }

  // Note: No rate limiting for Wikidata SPARQL - different endpoint, no abuse risk
  try {
    console.log(`🔍 DEBUG: Fetching Wikidata events for year ${year}...`);

    // Enhanced SPARQL query: Get descriptions, locations, and participants for richer hints
    // Using automatic label service to get descriptions and context data
    const sparqlQuery = `
      SELECT ?event ?eventLabel ?eventDescription ?locationLabel ?participantLabel WHERE {
        ?event wdt:P585 ?date .                  # Point in time
        FILTER(YEAR(?date) = ${year})
        {
          ?event wdt:P31 wd:Q178561 .          # Battles
        } UNION {
          ?event wdt:P31 wd:Q131569 .          # Treaty
        } UNION {
          ?event wdt:P31 wd:Q1241715 .         # Abandoned village
        } UNION {
          ?event wdt:P31 wd:Q245117 .          # Relief sculpture
        } UNION {
          ?event wdt:P31 wd:Q12370 .           # Peace treaty
        }
        OPTIONAL { ?event wdt:P276 ?location }   # Location
        OPTIONAL { ?event wdt:P710 ?participant } # Participant
        SERVICE wikibase:label { 
          bd:serviceParam wikibase:language "en" . 
        }
      } LIMIT 25
    `;

    const apiUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}`;
    console.log(`🔍 DEBUG: Wikidata SPARQL URL: ${apiUrl.substring(0, 100)}...`);

    // Create abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/sparql-results+json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`🔍 DEBUG: Wikidata response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🔍 DEBUG: Wikidata SPARQL Error Response Body: ${errorText}`);
      throw new Error(`Wikidata SPARQL response not OK: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`🔍 DEBUG: Raw Wikidata SPARQL response:`, data);
    
    // Validate response structure
    if (!data || !data.results || !Array.isArray(data.results.bindings)) {
      console.error(`🔍 DEBUG: Wikidata SPARQL response has invalid structure:`, data);
      throw new Error('Wikidata SPARQL response missing results.bindings array');
    }

    // Extract enhanced event data from targeted entity types
    const yearEvents = data.results.bindings
      .map((item: Record<string, unknown>) => {
        const eventLabel = item.eventLabel as Record<string, unknown> | undefined;
        const eventDescription = item.eventDescription as Record<string, unknown> | undefined;
        const locationLabel = item.locationLabel as Record<string, unknown> | undefined;
        const participantLabel = item.participantLabel as Record<string, unknown> | undefined;
        
        const label = eventLabel?.value as string | undefined;
        const description = eventDescription?.value as string | undefined;
        const location = locationLabel?.value as string | undefined;
        const participant = participantLabel?.value as string | undefined;
        
        if (label) {
          console.log(`🔍 DEBUG: Enhanced data for "${label}":`, {
            description: description || 'none',
            location: location || 'none', 
            participant: participant || 'none'
          });
          
          // Enhance the event using all available contextual data
          return enhanceEventDescription(
            label, 
            description || undefined, 
            location || undefined, 
            participant || undefined
          );
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 20); // Limit to 20 events maximum

    // Cache the result
    API_CACHE.set(cacheKey, yearEvents);
    
    console.log(`🔍 DEBUG: Successfully fetched ${yearEvents.length} Wikidata events for year ${year}:`, yearEvents);
    return yearEvents;

  } catch (error) {
    console.error(`🔍 DEBUG: Failed to fetch Wikidata events for year ${year}:`, error);
    
    // Log specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`🔍 DEBUG: Wikidata SPARQL query timeout for year ${year}`);
      } else if (error.message.includes('NetworkError')) {
        console.error(`🔍 DEBUG: Network error accessing Wikidata for year ${year}`);
      } else if (error.message.includes('SyntaxError')) {
        console.error(`🔍 DEBUG: SPARQL parsing error for year ${year}`);
      }
      
      console.error(`🔍 DEBUG: Error details:`, {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    return [];
  }
}

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
    
    let finalEvents = apiNinjasEvents;
    
    // If we don't have enough events, try Wikidata SPARQL as backup
    if (finalEvents.length < 6) {
      console.log(`🔍 DEBUG: Insufficient events from API Ninjas (${finalEvents.length}), trying Wikidata SPARQL...`);
      
      try {
        const wikidataEvents = await getWikidataEvents(year);
        console.log(`🔍 DEBUG: Wikidata returned ${wikidataEvents.length} events for year ${year}`);
        
        if (wikidataEvents.length > 0) {
          // Merge and deduplicate events
          const mergedEvents = [...finalEvents];
          
          for (const wikidataEvent of wikidataEvents) {
            // Check for duplicates (case-insensitive)
            const isDuplicate = mergedEvents.some(existingEvent => 
              existingEvent.toLowerCase().includes(wikidataEvent.toLowerCase().substring(0, 50)) ||
              wikidataEvent.toLowerCase().includes(existingEvent.toLowerCase().substring(0, 50))
            );
            
            if (!isDuplicate) {
              mergedEvents.push(wikidataEvent);
            }
          }
          
          finalEvents = mergedEvents;
          console.log(`🔍 DEBUG: After merging and deduplication: ${finalEvents.length} total events`);
        }
      } catch (wikidataError) {
        const errorMessage = wikidataError instanceof Error ? wikidataError.message : 'Unknown error';
        console.warn(`🔍 DEBUG: Wikidata SPARQL fallback failed for year ${year}:`, errorMessage);
        // Continue with just API Ninjas events
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
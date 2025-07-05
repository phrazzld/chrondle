// API Integration for Chrondle
// Extracted from index.html lines ~244-772

import { logger } from './logger';

// Removed wikidata import - no longer used in static puzzle system

// --- API CONFIGURATION ---
// NOTE: API functionality disabled in favor of static puzzle system

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
      logger.debug(`Cleaned Wikipedia markup: "${text}" → "${cleaned}"`);
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
    
    logger.debug(`Enhancing "${cleanLabel}" with context:`, {
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
      logger.debug(`Enhanced "${cleanLabel}" → "${finalResult}"`);
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
// NOTE: This function is deprecated in favor of static puzzle system
export async function getHistoricalEvents(year: number): Promise<string[]> {
  console.warn(`🔍 DEBUG: getHistoricalEvents called for year ${year} - this should not happen in static puzzle mode`);
  console.warn(`🔍 DEBUG: Static puzzle system is active, API calls are disabled`);
  return [];
}
// Constants and Configuration for Chrondle
// Extracted from index.html lines ~227-877 and other constant definitions

// --- API CONFIGURATION ---

// API Ninjas Key - exposed in client-side code for prototype
// The API has rate limits (50k requests/month) and only provides historical data
export const API_NINJAS_KEY = 'O8VgZplfhWSNdCsgoeVaZg==2bwPJnxstEQPzmvn';

// API Endpoints
export const API_ENDPOINTS = {
  API_NINJAS: 'https://api.api-ninjas.com/v1/historicalevents',
  WIKIDATA_SPARQL: 'https://query.wikidata.org/sparql',
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  WIKIPEDIA_ON_THIS_DAY: 'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events'
} as const;

// --- TIMEOUT AND RATE LIMITING ---

export const TIMEOUTS = {
  MIN_API_INTERVAL: 1000, // 1 second between API calls
  LLM_RATE_LIMIT: 2000, // 2 seconds between LLM calls
  LLM_REQUEST_TIMEOUT: 3000, // 3 second timeout for LLM requests
  WIKIDATA_TIMEOUT: 5000, // 5 second timeout for Wikidata SPARQL
  UI_ANIMATION_DELAY: 10, // Modal show delay
  UI_TRANSITION_DURATION: 300, // Modal hide transition
  FEEDBACK_MESSAGE_DURATION: 2000 // Feedback message display time
} as const;

// --- GAME CONFIGURATION ---

export const GAME_CONFIG = {
  MAX_GUESSES: 6,
  MIN_EVENTS_REQUIRED: 6,
  MIN_YEAR: -3000,
  MAX_YEAR: new Date().getFullYear(),
  YEAR_VALIDATION_BOUNDS: {
    MIN: -3000,
    MAX: new Date().getFullYear()
  }
} as const;

// --- FALLBACK CONFIGURATION ---

// Fallback year when API fails or returns insufficient events
// 1969 chosen for reliable event count: Moon landing, Woodstock, Vietnam War events
export const FALLBACK_YEAR = 1969;

// Hardcoded events for ultimate fallback when all APIs fail
export const HARDCODED_EVENTS = [
  'The Boeing 747 makes its first flight',
  'The Internet precursor ARPANET is created',
  'The Stonewall riots occur in New York',
  'Richard Nixon becomes President',
  'Woodstock music festival takes place',
  'Apollo 11 lands on the Moon'
] as const;

// --- CURATED YEARS FOR DAILY PUZZLES ---

// Curated years known to have significant historical events
// Selected for variety across eras and likelihood of having 6+ events from API
export const CURATED_YEARS = [
  // Ancient/Classical Era
  -776, -753, -221, -44,  // BC years (negative)
  
  // Medieval Era
  800, 1066, 1215, 1347, 1453,
  
  // Renaissance/Early Modern
  1492, 1517, 1588, 1607, 1620,
  
  // Enlightenment/Revolution Era
  1776, 1789, 1804, 1815, 1848,
  
  // Industrial Age
  1865, 1876, 1885, 1893, 1903,
  
  // Early 20th Century
  1914, 1917, 1918, 1929, 1936,
  
  // WWII Era
  1939, 1941, 1945, 1947, 1948,
  
  // Cold War Era
  1957, 1961, 1963, 1969, 1975,
  
  // Late 20th Century
  1989, 1991, 1994, 1997, 1999,
  
  // 21st Century
  2001, 2003, 2008, 2011, 2016, 2020
] as const;

// --- EVENT RECOGNITION SCORING ---

// High-recognition keywords (famous events, people, places) - worth 10 points each
export const HIGH_RECOGNITION_TERMS = [
  'moon', 'apollo', 'nasa', 'president', 'war', 'peace', 'treaty', 'independence',
  'revolution', 'atomic', 'bomb', 'hitler', 'stalin', 'churchill', 'roosevelt',
  'kennedy', 'lincoln', 'washington', 'napoleon', 'caesar', 'rome', 'paris',
  'london', 'america', 'united states', 'world war', 'olympics', 'pearl harbor',
  'berlin wall', 'cold war', 'vietnam', 'titanic', 'earthquake', 'discovery',
  'invention', 'first', 'assassinated', 'founded', 'empire', 'king', 'queen'
] as const;

// Medium-recognition keywords - worth 5 points each
export const MEDIUM_RECOGNITION_TERMS = [
  'battle', 'siege', 'died', 'born', 'elected', 'crowned', 'signed', 'declared',
  'defeated', 'conquered', 'expedition', 'voyage', 'constructed', 'completed',
  'university', 'cathedral', 'castle', 'city', 'established', 'created'
] as const;

// Event scoring configuration
export const SCORING_CONFIG = {
  HIGH_RECOGNITION_POINTS: 10,
  MEDIUM_RECOGNITION_POINTS: 5,
  SHORT_EVENT_BONUS: 5, // For events under 50 characters
  VERY_SHORT_EVENT_BONUS: 5, // Additional bonus for events under 30 characters
  LONG_EVENT_PENALTY: -5, // For events over 100 characters
  SHORT_EVENT_THRESHOLD: 50,
  VERY_SHORT_EVENT_THRESHOLD: 30,
  LONG_EVENT_THRESHOLD: 100
} as const;

// --- WIKIDATA SPARQL CONFIGURATION ---

// Entity types for Wikidata SPARQL queries
export const WIKIDATA_ENTITY_TYPES = {
  BATTLES: 'Q178561',
  TREATIES: 'Q131569',
  ABANDONED_VILLAGES: 'Q1241715',
  RELIEF_SCULPTURES: 'Q245117',
  PEACE_TREATIES: 'Q12370'
} as const;

// SPARQL query configuration
export const SPARQL_CONFIG = {
  MAX_RESULTS: 25,
  MAX_EVENTS_TO_USE: 20,
  LANGUAGE: 'en'
} as const;

// --- LOCAL STORAGE KEYS ---

export const STORAGE_KEYS = {
  PROGRESS_PREFIX: 'chrondle-progress-',
  SETTINGS: 'chrondle-settings',
  HAS_PLAYED: 'chrondle-has-played',
  OPENAI_API_KEY: 'openai_api_key',
  LAST_LLM_CALL: 'last_llm_call'
} as const;

// --- UI CONSTANTS ---

export const UI_CONFIG = {
  MAX_GUESS_HISTORY_DISPLAY: 6,
  SHARE_EMOJI: {
    CORRECT: '🟩',
    TOO_EARLY: '🔼',
    TOO_LATE: '🔽',
    WIN: '⭐',
    LOSS: '💥'
  },
  DIRECTION_ARROWS: {
    LATER: '▲ LATER',
    EARLIER: '▼ EARLIER'
  }
} as const;

// --- DEBUG CONFIGURATION ---

export const DEBUG_CONFIG = {
  SCENARIO_WRONG_GUESSES: [1500, 1800, 1900, 1950, 2000],
  LOG_PREFIX: '🔍 DEBUG:',
  BANNER_EMOJI: '🔧'
} as const;

// --- PROXIMITY FEEDBACK THRESHOLDS ---

export const PROXIMITY_THRESHOLDS = [
  { max: 0, message: 'CORRECT!', class: 'text-green-600 dark:text-green-400' },
  { max: 5, message: 'Within 5 years!', class: 'text-green-500 dark:text-green-400' },
  { max: 10, message: 'Within 10 years!', class: 'text-lime-500 dark:text-lime-400' },
  { max: 25, message: 'Within 25 years!', class: 'text-yellow-500 dark:text-yellow-400' },
  { max: 50, message: 'Within 50 years!', class: 'text-orange-500 dark:text-orange-400' },
  { max: 100, message: 'Within a century!', class: 'text-red-400 dark:text-red-400' },
  { max: 250, message: 'Within 250 years!', class: 'text-red-500 dark:text-red-500' },
  { max: 500, message: 'Within 500 years!', class: 'text-red-600 dark:text-red-600' },
  { max: 1000, message: 'Within a millennium!', class: 'text-red-700 dark:text-red-700' }
] as const;

// --- LLM CONFIGURATION ---

export const LLM_CONFIG = {
  MODEL: 'gpt-3.5-turbo',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 50,
  SYSTEM_PROMPT: 'You are a helpful assistant that creates engaging, concise hints for historical guessing games.',
  HINT_PROMPT_TEMPLATE: 'Convert this historical event into a clear, engaging hint for a year-guessing game. Make it informative but don\'t include the year or obvious time markers. Keep it under 20 words: {description}'
} as const;

// --- URL PARAMETERS ---

export const URL_PARAMS = {
  DEBUG: 'debug',
  YEAR: 'year',
  SCENARIO: 'scenario',
  LLM: 'llm'
} as const;

// --- GAME HASHTAGS ---

export const HASHTAGS = '#Chrondle #HistoryGame';

// --- TYPE EXPORTS ---

export type CuratedYear = typeof CURATED_YEARS[number];
export type HardcodedEvent = typeof HARDCODED_EVENTS[number];
export type HighRecognitionTerm = typeof HIGH_RECOGNITION_TERMS[number];
export type MediumRecognitionTerm = typeof MEDIUM_RECOGNITION_TERMS[number];
export type WikidataEntityType = typeof WIKIDATA_ENTITY_TYPES[keyof typeof WIKIDATA_ENTITY_TYPES];
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

// --- VALIDATION HELPERS ---

export function isValidYear(year: number): boolean {
  return year >= GAME_CONFIG.MIN_YEAR && year <= GAME_CONFIG.MAX_YEAR && year !== 0;
}

export function isCuratedYear(year: number): year is CuratedYear {
  return CURATED_YEARS.includes(year as CuratedYear);
}

export function isDebugYear(year: number): boolean {
  return DEBUG_CONFIG.SCENARIO_WRONG_GUESSES.includes(year as never);
}
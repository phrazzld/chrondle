// Constants and Configuration for Chrondle
// Extracted from index.html lines ~227-877 and other constant definitions

// --- API CONFIGURATION ---

// API Ninjas Key - exposed in client-side code for prototype
// The API has rate limits (50k requests/month) and only provides historical data
export const API_NINJAS_KEY = "O8VgZplfhWSNdCsgoeVaZg==2bwPJnxstEQPzmvn";

// API Endpoints
export const API_ENDPOINTS = {
  API_NINJAS: "https://api.api-ninjas.com/v1/historicalevents",
  WIKIDATA_SPARQL: "https://query.wikidata.org/sparql",
  OPENAI: "https://api.openai.com/v1/chat/completions",
  WIKIPEDIA_ON_THIS_DAY:
    "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events",
} as const;

// --- TIMEOUT AND RATE LIMITING ---

export const TIMEOUTS = {
  MIN_API_INTERVAL: 1000, // 1 second between API calls
  LLM_RATE_LIMIT: 2000, // 2 seconds between LLM calls
  LLM_REQUEST_TIMEOUT: 3000, // 3 second timeout for LLM requests
  WIKIDATA_TIMEOUT: 5000, // 5 second timeout for Wikidata SPARQL
  UI_ANIMATION_DELAY: 10, // Modal show delay
  UI_TRANSITION_DURATION: 300, // Modal hide transition
  FEEDBACK_MESSAGE_DURATION: 2000, // Feedback message display time
} as const;

// --- GAME CONFIGURATION ---

export const GAME_CONFIG = {
  MAX_GUESSES: 6,
  MIN_EVENTS_REQUIRED: 6,
  MIN_YEAR: -3000,
  MAX_YEAR: new Date().getFullYear(),
  YEAR_VALIDATION_BOUNDS: {
    MIN: -3000,
    MAX: new Date().getFullYear(),
  },
} as const;

// --- EVENT RECOGNITION SCORING ---

// High-recognition keywords (famous events, people, places) - worth 10 points each
export const HIGH_RECOGNITION_TERMS = [
  "moon",
  "apollo",
  "nasa",
  "president",
  "war",
  "peace",
  "treaty",
  "independence",
  "revolution",
  "atomic",
  "bomb",
  "hitler",
  "stalin",
  "churchill",
  "roosevelt",
  "kennedy",
  "lincoln",
  "washington",
  "napoleon",
  "caesar",
  "rome",
  "paris",
  "london",
  "america",
  "united states",
  "world war",
  "olympics",
  "pearl harbor",
  "berlin wall",
  "cold war",
  "vietnam",
  "titanic",
  "earthquake",
  "discovery",
  "invention",
  "first",
  "assassinated",
  "founded",
  "empire",
  "king",
  "queen",
] as const;

// Medium-recognition keywords - worth 5 points each
export const MEDIUM_RECOGNITION_TERMS = [
  "battle",
  "siege",
  "died",
  "born",
  "elected",
  "crowned",
  "signed",
  "declared",
  "defeated",
  "conquered",
  "expedition",
  "voyage",
  "constructed",
  "completed",
  "university",
  "cathedral",
  "castle",
  "city",
  "established",
  "created",
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
  LONG_EVENT_THRESHOLD: 100,
} as const;

// --- WIKIDATA SPARQL CONFIGURATION ---

// Entity types for Wikidata SPARQL queries
export const WIKIDATA_ENTITY_TYPES = {
  BATTLES: "Q178561",
  TREATIES: "Q131569",
  ABANDONED_VILLAGES: "Q1241715",
  RELIEF_SCULPTURES: "Q245117",
  PEACE_TREATIES: "Q12370",
} as const;

// SPARQL query configuration
export const SPARQL_CONFIG = {
  MAX_RESULTS: 25,
  MAX_EVENTS_TO_USE: 20,
  LANGUAGE: "en",
} as const;

// --- LOCAL STORAGE KEYS ---

export const STORAGE_KEYS = {
  PROGRESS_PREFIX: "chrondle-progress-",
  SETTINGS: "chrondle-settings",
  HAS_PLAYED: "chrondle-has-played",
  STREAK_DATA: "chrondle-streak-data",
  NOTIFICATION_SETTINGS: "chrondle-notification-settings",
} as const;

// --- UI CONSTANTS ---

export const UI_CONFIG = {
  MAX_GUESS_HISTORY_DISPLAY: 6,
  SHARE_EMOJI: {
    CORRECT: "🟩",
    TOO_EARLY: "🔼",
    TOO_LATE: "🔽",
    WIN: "⭐",
    LOSS: "💥",
  },
  DIRECTION_ARROWS: {
    LATER: "▲ LATER",
    EARLIER: "▼ EARLIER",
  },
} as const;

// --- DEBUG CONFIGURATION ---

export const DEBUG_CONFIG = {
  SCENARIO_WRONG_GUESSES: [1500, 1800, 1900, 1950, 2000],
  LOG_PREFIX: "🔍 DEBUG:",
  BANNER_EMOJI: "🔧",
} as const;

// --- PROXIMITY FEEDBACK THRESHOLDS ---

export const PROXIMITY_THRESHOLDS = [
  { max: 0, message: "CORRECT!", class: "text-green-600 dark:text-green-400" },
  {
    max: 5,
    message: "Within 5 years!",
    class: "text-green-500 dark:text-green-400",
  },
  {
    max: 10,
    message: "Within 10 years!",
    class: "text-lime-500 dark:text-lime-400",
  },
  {
    max: 25,
    message: "Within 25 years!",
    class: "text-yellow-500 dark:text-yellow-400",
  },
  {
    max: 50,
    message: "Within 50 years!",
    class: "text-orange-500 dark:text-orange-400",
  },
  {
    max: 100,
    message: "Within a century!",
    class: "text-red-400 dark:text-red-400",
  },
  {
    max: 250,
    message: "Within 250 years!",
    class: "text-red-500 dark:text-red-500",
  },
  {
    max: 500,
    message: "Within 500 years!",
    class: "text-red-600 dark:text-red-600",
  },
  {
    max: 1000,
    message: "Within a millennium!",
    class: "text-red-700 dark:text-red-700",
  },
] as const;

// --- LLM CONFIGURATION ---

export const LLM_CONFIG = {
  MODEL: "gpt-3.5-turbo",
  TEMPERATURE: 0.7,
  MAX_TOKENS: 50,
  SYSTEM_PROMPT:
    "You are a helpful assistant that creates engaging, concise hints for historical guessing games.",
  HINT_PROMPT_TEMPLATE:
    "Convert this historical event into a clear, engaging hint for a year-guessing game. Make it informative but don't include the year or obvious time markers. Keep it under 20 words: {description}",
} as const;

// --- AI CONTEXT CONFIGURATION ---

export const AI_CONFIG = {
  MODEL: "google/gemini-2.5-flash",
  TEMPERATURE: 0.3, // Reduced for more consistent output
  MAX_TOKENS: 4000, // High limit to prevent truncation
  REQUEST_TIMEOUT: 10000, // 10 seconds
  FEATURE_ENABLED: true,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay for exponential backoff
  SYSTEM_PROMPT: `You are a sharp historical writer creating punchy, focused narratives about specific years. Write with precision and impact - every word counts.

Your writing must:
- Be exactly 2-3 tight paragraphs (no more, no less)
- Reference ALL provided events naturally within the narrative flow
- Use present tense for immediacy and punch
- Lead with the most dramatic or significant event
- Connect events to show the year's broader significance
- End with a sharp insight about the year's lasting impact
- Keep total length under 200 words for maximum impact

Write for smart readers who want substance fast. No filler, no generic historical platitudes. Make every sentence drive the story forward with vivid, specific details that bring the year to life.`,
  CONTEXT_PROMPT_TEMPLATE: `Write a sharp, focused narrative about {year}. You MUST weave ALL of these events into your story:

{events}

Requirements:
- Exactly 2-3 paragraphs, under 200 words total
- Reference every single event naturally within the narrative
- Start with the most impactful event
- Show how events connect to reveal the year's significance
- End with a punchy insight about lasting impact
- Present tense, vivid details, zero filler

Make {year} come alive through these specific events.`,
} as const;

// --- STREAK CONFIGURATION ---

export const STREAK_CONFIG = {
  ACHIEVEMENTS: [
    {
      threshold: 3,
      name: "Time Traveler",
      emoji: "⏰",
      description: "3 day streak!",
    },
    {
      threshold: 7,
      name: "Week Warrior",
      emoji: "🗓️",
      description: "7 day streak!",
    },
    {
      threshold: 30,
      name: "Monthly Master",
      emoji: "📅",
      description: "30 day streak!",
    },
    {
      threshold: 100,
      name: "Century Scholar",
      emoji: "🏛️",
      description: "100 day streak!",
    },
  ],
  MAX_STREAK_HISTORY: 365,
  MIN_STREAK_DISPLAY: 0,
} as const;

// --- NOTIFICATION CONFIGURATION ---

export const NOTIFICATION_CONFIG = {
  DEFAULT_TIME: "09:00", // 9:00 AM
  TIME_OPTIONS: [
    { label: "12:00 AM", value: "00:00" },
    { label: "1:00 AM", value: "01:00" },
    { label: "2:00 AM", value: "02:00" },
    { label: "3:00 AM", value: "03:00" },
    { label: "4:00 AM", value: "04:00" },
    { label: "5:00 AM", value: "05:00" },
    { label: "6:00 AM", value: "06:00" },
    { label: "7:00 AM", value: "07:00" },
    { label: "8:00 AM", value: "08:00" },
    { label: "9:00 AM", value: "09:00" },
    { label: "10:00 AM", value: "10:00" },
    { label: "11:00 AM", value: "11:00" },
    { label: "12:00 PM", value: "12:00" },
    { label: "1:00 PM", value: "13:00" },
    { label: "2:00 PM", value: "14:00" },
    { label: "3:00 PM", value: "15:00" },
    { label: "4:00 PM", value: "16:00" },
    { label: "5:00 PM", value: "17:00" },
    { label: "6:00 PM", value: "18:00" },
    { label: "7:00 PM", value: "19:00" },
    { label: "8:00 PM", value: "20:00" },
    { label: "9:00 PM", value: "21:00" },
    { label: "10:00 PM", value: "22:00" },
    { label: "11:00 PM", value: "23:00" },
  ],
  MESSAGES: [
    "Ready for today's historical challenge? 🏛️",
    "Your daily Chrondle puzzle awaits! ⏰",
    "Time to test your history knowledge! 📚",
    "Don't break your streak - play Chrondle today! 🔥",
    "A new historical mystery has arrived! 🔍",
  ],
  RETRY_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  PERMISSION_REMINDER_DELAY: 3 * 24 * 60 * 60 * 1000, // 3 days in milliseconds
} as const;

// --- URL PARAMETERS ---

export const URL_PARAMS = {
  DEBUG: "debug",
  YEAR: "year",
  SCENARIO: "scenario",
  LLM: "llm",
} as const;

// --- GAME HASHTAGS ---

export const HASHTAGS = "#Chrondle #HistoryGame";

// --- TYPE EXPORTS ---

export type HighRecognitionTerm = (typeof HIGH_RECOGNITION_TERMS)[number];
export type MediumRecognitionTerm = (typeof MEDIUM_RECOGNITION_TERMS)[number];
export type WikidataEntityType =
  (typeof WIKIDATA_ENTITY_TYPES)[keyof typeof WIKIDATA_ENTITY_TYPES];
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];

// --- VALIDATION HELPERS ---

export function isValidYear(year: number): boolean {
  return year >= GAME_CONFIG.MIN_YEAR && year <= GAME_CONFIG.MAX_YEAR;
}

export function isDebugYear(year: number): boolean {
  return DEBUG_CONFIG.SCENARIO_WRONG_GUESSES.includes(year as never);
}

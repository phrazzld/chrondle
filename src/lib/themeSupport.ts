// Theme Support System for Chrondle
// Classifies and organizes historical puzzles into thematic collections

import { getPuzzleForYear } from "./puzzleData";

// --- TYPE DEFINITIONS ---

export type Theme =
  | "ancient-civilizations"
  | "science"
  | "art"
  | "conflict"
  | "general";

export interface ThemeMetadata {
  name: string;
  description: string;
  icon: string;
  color: string;
  yearCount: number;
  years: number[];
}

export interface ThemedPuzzle {
  year: number;
  events: string[];
  theme: Theme;
}

// --- THEME CLASSIFICATION LOGIC ---

/**
 * Keywords and patterns for theme classification
 */
const THEME_KEYWORDS = {
  "ancient-civilizations": [
    "olympic",
    "olympics",
    "rome",
    "roman",
    "empire",
    "caesar",
    "emperor",
    "greece",
    "greek",
    "ancient",
    "bc",
    "civilization",
    "dynasty",
    "pharaoh",
    "gladiator",
    "chariot",
    "temple",
    "senate",
    "consul",
    "legion",
    "barbarian",
    "colosseum",
    "forum",
    "athens",
    "sparta",
    "alexandria",
    "carthage",
    "hannibal",
    "cleopatra",
    "augustus",
    "julius",
    "nero",
  ],
  science: [
    "telescope",
    "microscope",
    "experiment",
    "theory",
    "discovery",
    "invention",
    "laboratory",
    "scientist",
    "research",
    "physics",
    "chemistry",
    "biology",
    "astronomy",
    "mathematics",
    "medicine",
    "vaccine",
    "electricity",
    "steam",
    "engine",
    "machine",
    "technology",
    "space",
    "moon",
    "rocket",
    "satellite",
    "nuclear",
    "atomic",
    "quantum",
    "dna",
    "evolution",
    "relativity",
    "gravity",
    "galileo",
    "newton",
    "einstein",
    "darwin",
    "curie",
    "edison",
    "tesla",
    "pasteur",
    "mendel",
  ],
  art: [
    "painting",
    "sculpture",
    "artist",
    "renaissance",
    "art",
    "museum",
    "gallery",
    "canvas",
    "portrait",
    "fresco",
    "masterpiece",
    "style",
    "movement",
    "aesthetic",
    "beauty",
    "creative",
    "design",
    "architecture",
    "cathedral",
    "palace",
    "music",
    "composer",
    "symphony",
    "opera",
    "literature",
    "novel",
    "poetry",
    "theater",
    "drama",
    "leonardo",
    "michelangelo",
    "raphael",
    "picasso",
    "mozart",
    "beethoven",
    "shakespeare",
    "mona lisa",
    "sistine",
    "louvre",
    "florence",
    "venice",
    "paris",
  ],
  conflict: [
    "war",
    "battle",
    "army",
    "military",
    "soldier",
    "general",
    "siege",
    "invasion",
    "revolution",
    "rebellion",
    "civil war",
    "world war",
    "conflict",
    "combat",
    "victory",
    "defeat",
    "conquest",
    "occupation",
    "resistance",
    "uprising",
    "coup",
    "massacre",
    "assassination",
    "terrorism",
    "weapon",
    "bomb",
    "gun",
    "cannon",
    "sword",
    "shield",
    "napoleon",
    "hitler",
    "stalin",
    "churchill",
    "wellington",
    "waterloo",
    "gettysburg",
    "pearl harbor",
    "normandy",
    "d-day",
    "blitzkrieg",
    "holocaust",
    "auschwitz",
  ],
};

/**
 * Historical periods for enhanced classification
 */
const HISTORICAL_PERIODS = {
  "ancient-civilizations": { start: -800, end: 500 },
  medieval: { start: 500, end: 1500 },
  "early-modern": { start: 1500, end: 1800 },
  modern: { start: 1800, end: 1950 },
  contemporary: { start: 1950, end: 2100 },
};

/**
 * Classify a puzzle into a theme based on year and events
 */
export function classifyPuzzleTheme(year: number, events: string[]): Theme {
  if (!events || events.length === 0) {
    return "general";
  }

  // Combine all events into searchable text
  const searchText = events.join(" ").toLowerCase();

  // Score each theme based on keyword matches
  const themeScores: Record<Theme, number> = {
    "ancient-civilizations": 0,
    science: 0,
    art: 0,
    conflict: 0,
    general: 0,
  };

  // Count keyword matches for each theme
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    for (const keyword of keywords) {
      const matches = (searchText.match(new RegExp(keyword, "g")) || []).length;
      themeScores[theme as Theme] += matches;
    }
  }

  // Apply period-based bonus for ancient civilizations
  if (year <= HISTORICAL_PERIODS["ancient-civilizations"].end) {
    themeScores["ancient-civilizations"] += 2;
  }

  // Apply conflict bonus for major war periods
  const isWarPeriod =
    (year >= 1914 && year <= 1918) || // WWI
    (year >= 1939 && year <= 1945) || // WWII
    (year >= 1775 && year <= 1783) || // American Revolution
    (year >= 1789 && year <= 1799) || // French Revolution
    (year >= 1861 && year <= 1865); // American Civil War
  if (isWarPeriod) {
    themeScores["conflict"] += 3;
  }

  // Apply science bonus for scientific revolution and modern periods
  const isSciencePeriod =
    (year >= 1543 && year <= 1687) || // Scientific Revolution
    (year >= 1800 && year <= 1900) || // Industrial Revolution
    (year >= 1900 && year <= 2000); // Modern Science
  if (isSciencePeriod) {
    themeScores["science"] += 2;
  }

  // Apply art bonus for Renaissance and cultural periods
  const isArtPeriod =
    (year >= 1400 && year <= 1600) || // Renaissance
    (year >= 1750 && year <= 1850) || // Classical period
    (year >= 1850 && year <= 1920); // Modern art movements
  if (isArtPeriod) {
    themeScores["art"] += 2;
  }

  // Find highest scoring theme
  let maxScore = 0;
  let bestTheme: Theme = "general";

  for (const [theme, score] of Object.entries(themeScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestTheme = theme as Theme;
    }
  }

  // If no clear theme emerges, classify as general
  return maxScore > 0 ? bestTheme : "general";
}

// --- THEME METADATA ---

/**
 * Get metadata for all themes including year counts and lists
 */
export function getThemeMetadata(): Record<Theme, ThemeMetadata> {
  // TODO: This function needs to be updated to use Convex data
  // For now, return empty arrays as puzzles are loaded dynamically
  console.warn(
    "🚧 getThemeMetadata() - Needs Convex migration for dynamic puzzle data",
  );

  const yearsByTheme: Record<Theme, number[]> = {
    "ancient-civilizations": [],
    science: [],
    art: [],
    conflict: [],
    general: [],
  };

  return {
    "ancient-civilizations": {
      name: "Ancient Civilizations",
      description:
        "Explore the foundations of human civilization, from the first Olympics to the fall of Rome",
      icon: "🏛️",
      color: "#8B4513",
      yearCount: yearsByTheme["ancient-civilizations"].length,
      years: yearsByTheme["ancient-civilizations"],
    },
    science: {
      name: "Scientific Breakthroughs",
      description:
        "Discover pivotal moments in human understanding of the natural world",
      icon: "🔬",
      color: "#4169E1",
      yearCount: yearsByTheme["science"].length,
      years: yearsByTheme["science"],
    },
    art: {
      name: "Arts & Culture",
      description:
        "Journey through the greatest achievements in human creativity and expression",
      icon: "🎨",
      color: "#FF6347",
      yearCount: yearsByTheme["art"].length,
      years: yearsByTheme["art"],
    },
    conflict: {
      name: "Wars & Conflicts",
      description:
        "Witness the battles and revolutions that shaped the course of history",
      icon: "⚔️",
      color: "#DC143C",
      yearCount: yearsByTheme["conflict"].length,
      years: yearsByTheme["conflict"],
    },
    general: {
      name: "Historical Milestones",
      description:
        "Important events that defined their eras across all aspects of human experience",
      icon: "📅",
      color: "#696969",
      yearCount: yearsByTheme["general"].length,
      years: yearsByTheme["general"],
    },
  };
}

// --- PUZZLE FILTERING ---

/**
 * Filter puzzles by theme
 */
export function filterPuzzlesByTheme(theme: Theme): ThemedPuzzle[] {
  const metadata = getThemeMetadata();
  const themeData = metadata[theme];

  if (!themeData) {
    return [];
  }

  return themeData.years.map((year) => ({
    year,
    events: getPuzzleForYear(year),
    theme,
  }));
}

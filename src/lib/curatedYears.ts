// Curated Historical Years for Chrondle
// Systematically selected 100 years spanning world history
// Balanced across time periods, regions, and event types

/**
 * 100 historically significant years for daily puzzle selection
 * 
 * Selection criteria:
 * - High event density (6+ major historical events per year)
 * - Global geographical representation
 * - Balanced across different categories (war, politics, science, culture)
 * - Player recognition and educational value
 * - Temporal distribution across major historical eras
 */
export const CURATED_HISTORICAL_YEARS = [
  // Ancient Era (8 years) - Foundational civilizations and empires
  -776, -509, -221, -44, 79, 313, 476, 622,

  // Early Medieval (8 years) - Dark Ages to medieval foundations  
  732, 800, 1054, 1066, 1095, 1180, 1215, 1271,

  // High Medieval (12 years) - Crusades, Gothic period, Mongol expansion
  1291, 1307, 1314, 1337, 1347, 1378, 1381, 1415, 1431, 1453, 1455, 1485,

  // Renaissance (15 years) - Renaissance, exploration, reformation
  1492, 1498, 1503, 1508, 1517, 1519, 1521, 1534, 1543, 1571, 1588, 1598, 1600, 1607, 1618,

  // Early Modern (20 years) - Colonial expansion, scientific revolution, enlightenment
  1620, 1642, 1648, 1666, 1682, 1688, 1707, 1721, 1740, 1751, 1756, 1769, 1773, 1776, 1789, 1804, 1815, 1821, 1825, 1833,

  // Industrial Era (18 years) - Industrial revolution, nationalism, imperialism
  1837, 1845, 1848, 1859, 1861, 1865, 1869, 1871, 1876, 1885, 1886, 1896, 1898, 1899, 1900, 1903, 1905, 1911,

  // Modern Era (12 years) - World wars, revolution, depression
  1914, 1917, 1918, 1922, 1929, 1933, 1939, 1941, 1945, 1947, 1948, 1949,

  // Contemporary (7 years) - Cold War, decolonization, digital age
  1957, 1963, 1969, 1989, 1991, 2001, 2008
];

/**
 * Metadata about the curated year collection
 */
export const CURATED_YEARS_META = {
  total_years: CURATED_HISTORICAL_YEARS.length,
  date_range: `${CURATED_HISTORICAL_YEARS[0]} to ${CURATED_HISTORICAL_YEARS[CURATED_HISTORICAL_YEARS.length - 1]}`,
  era_distribution: {
    ancient: 8,        // -776 to 622
    early_medieval: 8, // 732 to 1271  
    high_medieval: 12, // 1291 to 1485
    renaissance: 15,   // 1492 to 1618
    early_modern: 20,  // 1620 to 1833
    industrial: 18,    // 1837 to 1911
    modern: 12,        // 1914 to 1949
    contemporary: 7    // 1957 to 2008
  },
  geographic_coverage: [
    'Europe', 'Asia', 'Americas', 'Africa', 'Middle East', 'Oceania'
  ],
  event_categories: [
    'Wars & Conflicts', 'Political Revolutions', 'Scientific Discoveries',
    'Cultural Achievements', 'Religious Events', 'Economic Changes',
    'Exploration & Discovery', 'Technological Innovation'
  ],
  current_puzzles_preserved: 12, // All existing puzzles maintained
  last_updated: '2025-06-22'
};

/**
 * Validation function to ensure data integrity
 */
export function validateCuratedYears(): boolean {
  // Check count
  if (CURATED_HISTORICAL_YEARS.length !== 100) {
    console.error(`Expected 100 years, got ${CURATED_HISTORICAL_YEARS.length}`);
    return false;
  }

  // Check for duplicates
  const uniqueYears = new Set(CURATED_HISTORICAL_YEARS);
  if (uniqueYears.size !== CURATED_HISTORICAL_YEARS.length) {
    console.error('Duplicate years found in curated list');
    return false;
  }

  // Check chronological order
  const sorted = [...CURATED_HISTORICAL_YEARS].sort((a, b) => a - b);
  for (let i = 0; i < CURATED_HISTORICAL_YEARS.length; i++) {
    if (CURATED_HISTORICAL_YEARS[i] !== sorted[i]) {
      console.error('Years are not in chronological order');
      return false;
    }
  }

  // Check that all current puzzle years are preserved
  const currentPuzzleYears = [1066, 1215, 1492, 1588, 1776, 1789, 1865, 1914, 1945, 1969, 1989, 2001];
  const preserved = currentPuzzleYears.every(year => CURATED_HISTORICAL_YEARS.includes(year));
  if (!preserved) {
    console.error('Not all current puzzle years are preserved');
    return false;
  }

  return true;
}

/**
 * Get years by historical era
 */
export function getYearsByEra(era: keyof typeof CURATED_YEARS_META.era_distribution): number[] {
  const eraRanges = {
    ancient: [-3000, 622],
    early_medieval: [623, 1271],
    high_medieval: [1272, 1485],
    renaissance: [1486, 1618],
    early_modern: [1619, 1833],
    industrial: [1834, 1911],
    modern: [1912, 1949],
    contemporary: [1950, 2024]
  };

  const range = eraRanges[era];
  if (!range) return [];

  return CURATED_HISTORICAL_YEARS.filter(year => year >= range[0] && year <= range[1]);
}
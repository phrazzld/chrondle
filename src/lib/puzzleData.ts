// Static Puzzle Database for Chrondle
// Ultra-minimal schema: just year -> events mapping with metadata

import puzzleDataJson from '@/data/puzzles.json';

// --- TYPE DEFINITIONS ---

export interface PuzzleMeta {
  version: string;
  total_puzzles: number;
  date_range: string;
}

export interface PuzzleDatabase {
  meta: PuzzleMeta;
  puzzles: Record<string, string[]>;
}

// --- STATIC DATA ---

export const puzzleData: PuzzleDatabase = puzzleDataJson;

// Pre-computed supported years for efficient daily selection
export const SUPPORTED_YEARS = Object.keys(puzzleData.puzzles).map(Number).sort((a, b) => a - b);

// --- CORE FUNCTIONS ---

/**
 * Get puzzle events for a specific year
 * @param year - The year to get events for
 * @returns Array of exactly 6 events, or empty array if year not supported
 */
export function getPuzzleForYear(year: number): string[] {
  const yearStr = year.toString();
  const events = puzzleData.puzzles[yearStr];
  
  if (!events) {
    console.warn(`🔍 DEBUG: No puzzle found for year ${year}`);
    return [];
  }
  
  if (events.length !== 6) {
    console.error(`🔍 DEBUG: Invalid puzzle for year ${year}: expected 6 events, got ${events.length}`);
    return [];
  }
  
  console.log(`🔍 DEBUG: Loaded puzzle for year ${year} with ${events.length} events`);
  return [...events]; // Return copy to prevent mutations
}

/**
 * Check if a year has a puzzle available
 * @param year - The year to check
 * @returns True if puzzle exists for this year
 */
export function hasPuzzleForYear(year: number): boolean {
  return puzzleData.puzzles.hasOwnProperty(year.toString());
}

/**
 * Get all supported years
 * @returns Sorted array of all years with puzzles
 */
export function getSupportedYears(): number[] {
  return [...SUPPORTED_YEARS]; // Return copy to prevent mutations
}

/**
 * Get puzzle database metadata
 * @returns Metadata about the puzzle collection
 */
export function getPuzzleMeta(): PuzzleMeta {
  return { ...puzzleData.meta }; // Return copy to prevent mutations
}

/**
 * Validate puzzle data structure at runtime
 * @returns True if all puzzles are valid, false otherwise
 */
export function validatePuzzleData(): boolean {
  try {
    let isValid = true;
    
    // Check metadata
    if (!puzzleData.meta || typeof puzzleData.meta.version !== 'string') {
      console.error('🔍 DEBUG: Invalid puzzle metadata');
      isValid = false;
    }
    
    // Check puzzles object
    if (!puzzleData.puzzles || typeof puzzleData.puzzles !== 'object') {
      console.error('🔍 DEBUG: Invalid puzzles object');
      isValid = false;
    }
    
    // Validate each puzzle
    for (const [yearStr, events] of Object.entries(puzzleData.puzzles)) {
      // Check year format
      const year = parseInt(yearStr, 10);
      if (isNaN(year) || year.toString() !== yearStr) {
        console.error(`🔍 DEBUG: Invalid year format: ${yearStr}`);
        isValid = false;
        continue;
      }
      
      // Check events array
      if (!Array.isArray(events)) {
        console.error(`🔍 DEBUG: Events for year ${year} is not an array`);
        isValid = false;
        continue;
      }
      
      // Check event count
      if (events.length !== 6) {
        console.error(`🔍 DEBUG: Year ${year} has ${events.length} events, expected 6`);
        isValid = false;
        continue;
      }
      
      // Check each event
      events.forEach((event, index) => {
        if (typeof event !== 'string') {
          console.error(`🔍 DEBUG: Year ${year}, event ${index} is not a string`);
          isValid = false;
        } else if (event.length < 15 || event.length > 200) {
          console.error(`🔍 DEBUG: Year ${year}, event ${index} length (${event.length}) outside 15-200 range`);
          isValid = false;
        }
      });
    }
    
    if (isValid) {
      console.log(`🔍 DEBUG: Puzzle data validation passed - ${Object.keys(puzzleData.puzzles).length} valid puzzles`);
    }
    
    return isValid;
  } catch (error) {
    console.error('🔍 DEBUG: Puzzle data validation failed:', error);
    return false;
  }
}
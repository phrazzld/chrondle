#!/usr/bin/env node

// Validation script for puzzle database
// Ensures all puzzles meet quality requirements

const fs = require('fs');
const path = require('path');

// Load puzzle data
const puzzlePath = path.join(__dirname, '../src/data/puzzles.json');

try {
  const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf8'));
  
  console.log('🔍 Validating puzzle database...');
  console.log(`📊 Metadata: version ${puzzleData.meta.version}, ${puzzleData.meta.total_puzzles} puzzles, range ${puzzleData.meta.date_range}`);
  
  let isValid = true;
  let totalPuzzles = 0;
  let totalEvents = 0;
  const yearRanges = { min: Infinity, max: -Infinity };
  const eventLengths = [];
  
  // Validate each puzzle
  for (const [yearStr, events] of Object.entries(puzzleData.puzzles)) {
    totalPuzzles++;
    
    // Validate year format
    const year = parseInt(yearStr, 10);
    if (isNaN(year) || year.toString() !== yearStr) {
      console.error(`❌ Invalid year format: ${yearStr}`);
      isValid = false;
      continue;
    }
    
    // Track year range
    yearRanges.min = Math.min(yearRanges.min, year);
    yearRanges.max = Math.max(yearRanges.max, year);
    
    // Validate events array
    if (!Array.isArray(events)) {
      console.error(`❌ Year ${year}: Events is not an array`);
      isValid = false;
      continue;
    }
    
    // Validate event count
    if (events.length !== 6) {
      console.error(`❌ Year ${year}: Has ${events.length} events, expected 6`);
      isValid = false;
      continue;
    }
    
    // Validate each event
    events.forEach((event, index) => {
      totalEvents++;
      
      if (typeof event !== 'string') {
        console.error(`❌ Year ${year}, event ${index}: Not a string`);
        isValid = false;
      } else {
        eventLengths.push(event.length);
        
        if (event.length < 15) {
          console.error(`❌ Year ${year}, event ${index}: Too short (${event.length} chars): "${event}"`);
          isValid = false;
        } else if (event.length > 200) {
          console.error(`❌ Year ${year}, event ${index}: Too long (${event.length} chars): "${event.slice(0, 50)}..."`);
          isValid = false;
        }
        
        // Check for problematic content
        const lowerEvent = event.toLowerCase();
        if (lowerEvent.includes('died') || lowerEvent.includes('born') || 
            lowerEvent.includes('death of') || lowerEvent.includes('birth of')) {
          console.warn(`⚠️  Year ${year}, event ${index}: Contains birth/death reference: "${event}"`);
        }
      }
    });
    
    // Check for duplicate events within year
    const uniqueEvents = new Set(events.map(e => e.toLowerCase().trim()));
    if (uniqueEvents.size !== events.length) {
      console.error(`❌ Year ${year}: Contains duplicate events`);
      isValid = false;
    }
  }
  
  // Validate metadata consistency
  if (puzzleData.meta.total_puzzles !== totalPuzzles) {
    console.error(`❌ Metadata mismatch: claims ${puzzleData.meta.total_puzzles} puzzles, found ${totalPuzzles}`);
    isValid = false;
  }
  
  // Statistics
  console.log(`\n📈 Statistics:`);
  console.log(`   Total puzzles: ${totalPuzzles}`);
  console.log(`   Total events: ${totalEvents}`);
  console.log(`   Year range: ${yearRanges.min} - ${yearRanges.max}`);
  console.log(`   Average event length: ${Math.round(eventLengths.reduce((a, b) => a + b, 0) / eventLengths.length)} chars`);
  console.log(`   Event length range: ${Math.min(...eventLengths)} - ${Math.max(...eventLengths)} chars`);
  
  // Final result
  if (isValid) {
    console.log(`\n✅ Puzzle database validation passed! All ${totalPuzzles} puzzles are valid.`);
    process.exit(0);
  } else {
    console.log(`\n❌ Puzzle database validation failed! Please fix the errors above.`);
    process.exit(1);
  }
  
} catch (error) {
  console.error(`💥 Failed to load or parse puzzle data:`, error.message);
  process.exit(1);
}
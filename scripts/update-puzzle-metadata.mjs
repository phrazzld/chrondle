#!/usr/bin/env node

// Script to automatically update puzzle metadata based on actual content

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load puzzle data
const puzzlePath = path.join(__dirname, '../src/data/puzzles.json');

try {
  const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf8'));
  
  // Count actual puzzles
  const puzzleYears = Object.keys(puzzleData.puzzles);
  const totalPuzzles = puzzleYears.length;
  
  // Calculate year range
  const years = puzzleYears.map(y => parseInt(y, 10));
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  // Update metadata
  puzzleData.meta.total_puzzles = totalPuzzles;
  puzzleData.meta.date_range = `${minYear}-${maxYear}`;
  
  // Write back
  fs.writeFileSync(puzzlePath, JSON.stringify(puzzleData, null, 2) + '\n');
  
  console.log('✅ Metadata updated:');
  console.log(`   Total puzzles: ${totalPuzzles}`);
  console.log(`   Date range: ${minYear}-${maxYear}`);
  
} catch (error) {
  console.error('❌ Failed to update metadata:', error.message);
  process.exit(1);
}
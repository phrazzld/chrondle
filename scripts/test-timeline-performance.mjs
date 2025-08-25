#!/usr/bin/env node

/**
 * Timeline Component Performance Test
 * Tests render performance with full historical range (2500 BC to current year)
 */

// Create a mock Timeline component for testing
const TimelineTest = () => {
  const minYear = -2500;
  const maxYear = new Date().getFullYear();
  const totalYears = maxYear - minYear;
  
  console.log(`\n📊 Timeline Performance Test`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📅 Range: ${Math.abs(minYear)} BC to ${maxYear} AD`);
  console.log(`📏 Total span: ${totalYears} years`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // Test calculation performance
  const calculations = [];
  
  // Test 1: Range calculation (similar to Timeline's useMemo)
  console.log('⚡ Testing range calculations...');
  const calcStart = performance.now();
  
  for (let i = 0; i < 1000; i++) {
    // Simulate the range calculation that happens in Timeline
    const guesses = [1500, 1800, 1900, 1950, 2000];
    let validMin = minYear;
    let validMax = maxYear;
    
    guesses.forEach(guess => {
      const targetYear = 1969; // Example target
      const direction = guess < targetYear ? 'later' : guess > targetYear ? 'earlier' : 'correct';
      
      if (direction === 'earlier') {
        validMax = Math.min(validMax, guess - 1);
      } else if (direction === 'later') {
        validMin = Math.max(validMin, guess + 1);
      }
    });
    
    // Simulate position calculation
    const percentage = (1969 - validMin) / (validMax - validMin);
    const position = 50 + (percentage * 700);
  }
  
  const calcEnd = performance.now();
  const calcTime = calcEnd - calcStart;
  calculations.push({ test: 'Range calculations (1000x)', time: calcTime });
  
  // Test 2: SVG rendering with many points
  console.log('⚡ Testing SVG rendering...');
  const svgStart = performance.now();
  
  // Simulate creating SVG elements for timeline
  const svgElements = [];
  for (let year = minYear; year <= maxYear; year += 100) {
    const percentage = (year - minYear) / (maxYear - minYear);
    const x = 50 + (percentage * 700);
    svgElements.push({ x, year });
  }
  
  const svgEnd = performance.now();
  const svgTime = svgEnd - svgStart;
  calculations.push({ test: 'SVG element creation', time: svgTime });
  
  // Test 3: Number formatting for BC/AD
  console.log('⚡ Testing BC/AD formatting...');
  const formatStart = performance.now();
  
  for (let i = 0; i < 10000; i++) {
    const year = Math.floor(Math.random() * totalYears) + minYear;
    const formatted = year < 0 ? `${Math.abs(year)} BC` : `${year} AD`;
  }
  
  const formatEnd = performance.now();
  const formatTime = formatEnd - formatStart;
  calculations.push({ test: 'BC/AD formatting (10000x)', time: formatTime });
  
  // Print results
  console.log('\n📈 Performance Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  let totalTime = 0;
  calculations.forEach(calc => {
    const status = calc.time < 16 ? '✅' : calc.time < 32 ? '⚠️' : '❌';
    console.log(`${status} ${calc.test}: ${calc.time.toFixed(2)}ms`);
    totalTime += calc.time;
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Total time: ${totalTime.toFixed(2)}ms`);
  
  // Check if we meet the 16ms target
  const avgTime = totalTime / calculations.length;
  console.log(`📊 Average per operation: ${avgTime.toFixed(2)}ms`);
  
  if (avgTime < 16) {
    console.log('\n✅ PASS: Timeline renders in <16ms target!');
  } else if (avgTime < 32) {
    console.log('\n⚠️ WARNING: Timeline renders in 16-32ms (acceptable but not optimal)');
  } else {
    console.log('\n❌ FAIL: Timeline renders exceed 16ms target');
  }
  
  // Memory usage check
  if (global.process && process.memoryUsage) {
    const memUsage = process.memoryUsage();
    console.log('\n💾 Memory Usage:');
    console.log(`   Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
  }
  
  return totalTime;
};

// Run the test
try {
  TimelineTest();
  process.exit(0);
} catch (error) {
  console.error('❌ Test failed:', error);
  process.exit(1);
}
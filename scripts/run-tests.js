#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require('child_process');
const { setTimeout } = require('timers/promises');

async function runTests() {
  console.log('Running tests...');
  
  const vitest = spawn('npx', ['vitest', 'run'], {
    stdio: 'pipe',
    shell: true
  });

  let output = '';

  vitest.stdout.on('data', (data) => {
    process.stdout.write(data);
    output += data.toString();
  });

  vitest.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  // Wait for vitest to complete or timeout
  const timeout = setTimeout(15000);
  
  const result = await Promise.race([
    new Promise((resolve) => {
      vitest.on('close', (code) => resolve(code));
    }),
    timeout.then(() => {
      vitest.kill('SIGTERM');
      return 'timeout';
    })
  ]);

  // Check if tests passed by examining output
  const testsPassedPattern = /Test Files\s+\d+ passed/;
  const testsPassed = testsPassedPattern.test(output);

  if (result === 'timeout' && testsPassed) {
    console.log('\n✅ All tests passed (forced exit due to vitest cleanup issue)');
    process.exit(0);
  } else if (result === 0) {
    console.log('\n✅ Tests completed successfully');
    process.exit(0);
  } else {
    console.error('\n❌ Tests failed');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Find the latest result file
const resultsDir = '.lighthouseci';
const files = fs.readdirSync(resultsDir)
  .filter(f => f.endsWith('.json') && f.includes('lhr'))
  .map(f => ({ name: f, time: fs.statSync(path.join(resultsDir, f)).mtime }))
  .sort((a, b) => b.time - a.time);

if (files.length === 0) {
  console.error('No Lighthouse results found');
  process.exit(1);
}

const latestResult = JSON.parse(
  fs.readFileSync(path.join(resultsDir, files[0].name), 'utf8')
);

const metrics = {
  timestamp: new Date().toISOString(),
  commit: process.env.GITHUB_SHA,
  scores: {
    performance: Math.round(latestResult.categories.performance.score * 100),
    accessibility: Math.round(latestResult.categories.accessibility.score * 100),
    bestPractices: Math.round(latestResult.categories['best-practices'].score * 100),
    seo: Math.round(latestResult.categories.seo.score * 100),
  },
  metrics: {
    FCP: latestResult.audits['first-contentful-paint'].numericValue,
    LCP: latestResult.audits['largest-contentful-paint'].numericValue,
    TTI: latestResult.audits['interactive'].numericValue,
    TBT: latestResult.audits['total-blocking-time'].numericValue,
    CLS: latestResult.audits['cumulative-layout-shift'].numericValue,
    SI: latestResult.audits['speed-index'].numericValue,
  }
};

fs.writeFileSync('lighthouse-metrics.json', JSON.stringify(metrics, null, 2));

// Create summary for GitHub
const summary = `## 🚀 Lighthouse Results

| Metric | Score |
|--------|-------|
| Performance | ${metrics.scores.performance} |
| Accessibility | ${metrics.scores.accessibility} |
| Best Practices | ${metrics.scores.bestPractices} |
| SEO | ${metrics.scores.seo} |

### Core Web Vitals
- **FCP**: ${(metrics.metrics.FCP / 1000).toFixed(2)}s
- **LCP**: ${(metrics.metrics.LCP / 1000).toFixed(2)}s
- **TTI**: ${(metrics.metrics.TTI / 1000).toFixed(2)}s
- **CLS**: ${metrics.metrics.CLS.toFixed(3)}`;

// Write summary to file and stdout
fs.writeFileSync('lighthouse-summary.md', summary);
console.log(summary);
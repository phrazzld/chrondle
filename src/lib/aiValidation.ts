// AI Content Validation Utilities
// Implements quality checks for AI-generated historical context

import { AI_CONFIG } from '@/lib/constants';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 quality score
  issues: string[];
  metrics: {
    wordCount: number;
    sentenceCount: number;
    hasRequiredSections: boolean;
    hasEducationalMarkers: boolean;
    hasForbiddenPhrases: boolean;
    readabilityEstimate: 'simple' | 'moderate' | 'complex';
  };
}

/**
 * Validates AI-generated historical context content
 * @param content - The generated text to validate
 * @returns ValidationResult with quality metrics and issues
 */
export function validateHistoricalContext(content: string): ValidationResult {
  const issues: string[] = [];
  let score = 100;
  
  // Basic text cleanup and analysis
  const cleanContent = content.trim();
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0);
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Word count validation
  const wordCount = words.length;
  if (wordCount < AI_CONFIG.VALIDATION.MIN_WORDS) {
    issues.push(`Content too short: ${wordCount} words (minimum: ${AI_CONFIG.VALIDATION.MIN_WORDS})`);
    score -= 30;
  } else if (wordCount > AI_CONFIG.VALIDATION.MAX_WORDS) {
    issues.push(`Content too long: ${wordCount} words (maximum: ${AI_CONFIG.VALIDATION.MAX_WORDS})`);
    score -= 20;
  }
  
  // Sentence count validation
  const sentenceCount = sentences.length;
  if (sentenceCount < AI_CONFIG.VALIDATION.MIN_SENTENCES) {
    issues.push(`Too few sentences: ${sentenceCount} (minimum: ${AI_CONFIG.VALIDATION.MIN_SENTENCES})`);
    score -= 15;
  } else if (sentenceCount > AI_CONFIG.VALIDATION.MAX_SENTENCES) {
    issues.push(`Too many sentences: ${sentenceCount} (maximum: ${AI_CONFIG.VALIDATION.MAX_SENTENCES})`);
    score -= 10;
  }
  
  // Required sections validation
  const uppercaseContent = cleanContent.toUpperCase();
  const hasRequiredSections = AI_CONFIG.VALIDATION.REQUIRED_SECTIONS.every(section => 
    uppercaseContent.includes(section)
  );
  
  if (!hasRequiredSections) {
    const missingSections = AI_CONFIG.VALIDATION.REQUIRED_SECTIONS.filter(section => 
      !uppercaseContent.includes(section)
    );
    issues.push(`Missing required sections: ${missingSections.join(', ')}`);
    score -= 25;
  }
  
  // Educational markers validation (more flexible)
  const lowerContent = cleanContent.toLowerCase();
  const educationalMarkerCount = AI_CONFIG.VALIDATION.EDUCATIONAL_MARKERS.filter(marker => 
    lowerContent.includes(marker)
  ).length;
  
  const hasEducationalMarkers = educationalMarkerCount > 0;
  
  if (!hasEducationalMarkers) {
    issues.push('Content lacks educational significance markers');
    score -= 15;
  }
  
  // Forbidden phrases check
  const hasForbiddenPhrases = AI_CONFIG.VALIDATION.FORBIDDEN_PHRASES.some(phrase => 
    lowerContent.includes(phrase)
  );
  
  if (hasForbiddenPhrases) {
    const foundPhrases = AI_CONFIG.VALIDATION.FORBIDDEN_PHRASES.filter(phrase => 
      lowerContent.includes(phrase)
    );
    issues.push(`Contains forbidden phrases: ${foundPhrases.join(', ')}`);
    score -= 10;
  }
  
  // Simple readability estimate based on average sentence length
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  let readabilityEstimate: 'simple' | 'moderate' | 'complex';
  
  if (avgWordsPerSentence < 12) {
    readabilityEstimate = 'simple';
  } else if (avgWordsPerSentence < 20) {
    readabilityEstimate = 'moderate';
  } else {
    readabilityEstimate = 'complex';
  }
  
  // Penalize if readability is not appropriate (target: moderate complexity)
  if (readabilityEstimate === 'simple') {
    issues.push('Content may be too simple for educational purposes');
    score -= 5;
  } else if (readabilityEstimate === 'complex') {
    issues.push('Content may be too complex for general audience');
    score -= 10;
  }
  
  // Ensure score doesn't go below 0
  score = Math.max(0, score);
  
  return {
    isValid: score >= 50 && issues.filter(issue => 
      !issue.includes('Content may be') && 
      !issue.includes('Too few sentences')
    ).length === 0, // Practical bar for quality, ignore minor issues
    score,
    issues,
    metrics: {
      wordCount,
      sentenceCount,
      hasRequiredSections,
      hasEducationalMarkers,
      hasForbiddenPhrases,
      readabilityEstimate
    }
  };
}

/**
 * Creates a human-readable quality report for debugging
 * @param validation - ValidationResult from validateHistoricalContext
 * @returns Formatted quality report string
 */
export function createQualityReport(validation: ValidationResult): string {
  const { score, issues, metrics } = validation;
  
  let report = `Quality Score: ${score}/100\n`;
  report += `Word Count: ${metrics.wordCount} words\n`;
  report += `Sentences: ${metrics.sentenceCount}\n`;
  report += `Required Sections: ${metrics.hasRequiredSections ? '✓' : '✗'}\n`;
  report += `Educational Markers: ${metrics.hasEducationalMarkers ? '✓' : '✗'}\n`;
  report += `Readability: ${metrics.readabilityEstimate}\n`;
  
  if (issues.length > 0) {
    report += `\nIssues:\n${issues.map(issue => `- ${issue}`).join('\n')}`;
  }
  
  return report;
}

/**
 * Lightweight validation for production use
 * Only checks critical quality metrics without detailed analysis
 * @param content - The generated text to validate
 * @returns boolean indicating if content meets minimum standards
 */
export function isContentAcceptable(content: string): boolean {
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Basic acceptability checks
  return (
    wordCount >= AI_CONFIG.VALIDATION.MIN_WORDS &&
    wordCount <= AI_CONFIG.VALIDATION.MAX_WORDS + 20 && // Allow slight overflow
    content.trim().length > 0 &&
    !content.includes('I cannot') && // Avoid AI refusals
    !content.includes('I\'m sorry') // Avoid AI apologies
  );
}
// Tests for AI Content Validation Utilities
// Implements TDD approach for prompt quality assurance

import { describe, it, expect } from 'vitest';
import { validateHistoricalContext, isContentAcceptable, createQualityReport } from '../aiValidation';

describe('AI Content Validation', () => {
  describe('validateHistoricalContext', () => {
    it('should validate well-structured historical content', () => {
      const goodContent = `
HISTORICAL CONTEXT: The year 1969 marks a pivotal moment in human history. It represents the culmination of the Space Race and significant social movements.

KEY EVENTS: On July 20, Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon during the Apollo 11 mission. This achievement fulfills President Kennedy's 1961 promise to land on the Moon before the decade's end. The mission demonstrates American technological supremacy. It marks a crucial turning point in the Cold War competition with the Soviet Union. The Woodstock Music Festival in August brings together over 400,000 people. This event symbolizes the counterculture movement and opposition to the Vietnam War.

LASTING IMPACT: The Moon landing inspires generations of scientists and engineers. It establishes space exploration as a fundamental human endeavor. The cultural revolution of 1969 influences decades of social progress and political activism.
      `.trim();

      const result = validateHistoricalContext(goodContent);
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
      expect(result.metrics.wordCount).toBeGreaterThanOrEqual(150);
      expect(result.metrics.wordCount).toBeLessThanOrEqual(200);
      expect(result.metrics.hasRequiredSections).toBe(true);
      expect(result.metrics.hasEducationalMarkers).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject content that is too short', () => {
      const shortContent = 'HISTORICAL CONTEXT: 1969 was important. KEY EVENTS: Moon landing happened. LASTING IMPACT: It was significant.';
      
      const result = validateHistoricalContext(shortContent);
      
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(70);
      expect(result.issues.some(issue => issue.includes('too short'))).toBe(true);
    });

    it('should reject content missing required sections', () => {
      const incompletContent = `
This is a historical summary about 1969. The year was very important for space exploration. Neil Armstrong and Buzz Aldrin walked on the Moon. There was also the Woodstock festival. These events were significant for American culture. The Moon landing was a technological achievement. Woodstock represented social change. Both events had lasting effects on society. The space program continued to develop. Social movements grew stronger. These developments shaped the following decades. The impact is still felt today.
      `.trim();
      
      const result = validateHistoricalContext(incompletContent);
      
      expect(result.isValid).toBe(false);
      expect(result.metrics.hasRequiredSections).toBe(false);
      expect(result.issues.some(issue => issue.includes('Missing required sections'))).toBe(true);
    });

    it('should penalize content with forbidden phrases', () => {
      const contentWithForbiddenPhrases = `
HISTORICAL CONTEXT: The year 1969 was significant in history.

KEY EVENTS: In conclusion, the Moon landing was important. Neil Armstrong walked on the Moon. To summarize, it was a great achievement. Woodstock also happened. Overall, these were major events.

LASTING IMPACT: In general, these events had lasting effects on society and culture.
      `.trim();
      
      const result = validateHistoricalContext(contentWithForbiddenPhrases);
      
      expect(result.metrics.hasForbiddenPhrases).toBe(true);
      expect(result.issues.some(issue => issue.includes('forbidden phrases'))).toBe(true);
    });

    it('should detect lack of educational markers', () => {
      const nonEducationalContent = `
HISTORICAL CONTEXT: The year 1969 happened in the past and was notable for various activities that occurred.

KEY EVENTS: Apollo 11 went to the Moon and some people walked around there. Neil Armstrong was the person who walked around. Buzz Aldrin was there too and they did some activities together. Woodstock was a music festival that happened and people attended it for entertainment. There were many musicians who performed songs. Everyone had fun listening to music and dancing around.

LASTING IMPACT: These things happened and then other things happened later in subsequent years. Time moved forward as usual and people remembered these events for a while.
      `.trim();
      
      const result = validateHistoricalContext(nonEducationalContent);
      
      expect(result.metrics.hasEducationalMarkers).toBe(false);
      expect(result.issues.some(issue => issue.includes('educational significance markers'))).toBe(true);
    });
  });

  describe('isContentAcceptable', () => {
    it('should accept content within word count limits', () => {
      const acceptableContent = 'This is a reasonable length historical summary that contains sufficient words to meet the minimum requirements for basic acceptability testing without being too long or containing obvious rejection phrases from the AI system that would indicate a failed generation attempt. '.repeat(4) + 'The content provides educational value and meets our minimum standards for word count and quality requirements.';
      
      expect(isContentAcceptable(acceptableContent)).toBe(true);
    });

    it('should reject content that is too short', () => {
      const tooShort = 'Too short.';
      
      expect(isContentAcceptable(tooShort)).toBe(false);
    });

    it('should reject AI refusal responses', () => {
      const refusalContent = 'I cannot provide information about that topic because...';
      
      expect(isContentAcceptable(refusalContent)).toBe(false);
    });

    it('should reject AI apology responses', () => {
      const apologyContent = 'I\'m sorry, but I don\'t have enough information to...';
      
      expect(isContentAcceptable(apologyContent)).toBe(false);
    });
  });

  describe('createQualityReport', () => {
    it('should generate a readable quality report', () => {
      const mockValidation = {
        isValid: false,
        score: 75,
        issues: ['Content too short: 120 words (minimum: 150)'],
        metrics: {
          wordCount: 120,
          sentenceCount: 8,
          hasRequiredSections: true,
          hasEducationalMarkers: true,
          hasForbiddenPhrases: false,
          readabilityEstimate: 'moderate' as const
        }
      };
      
      const report = createQualityReport(mockValidation);
      
      expect(report).toContain('Quality Score: 75/100');
      expect(report).toContain('Word Count: 120 words');
      expect(report).toContain('Required Sections: ✓');
      expect(report).toContain('Educational Markers: ✓');
      expect(report).toContain('Issues:');
      expect(report).toContain('Content too short');
    });
  });
});
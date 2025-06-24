import { describe, it, expect } from 'vitest';
import { 
  getProximityFeedback, 
  getProgressiveFeedback, 
  getHistoricalFeedback, 
  getEnhancedProximityFeedback
} from '../utils';

describe('Enhanced Proximity Feedback', () => {
  describe('Encouraging Language', () => {
    it('should use encouraging language instead of generic distance', () => {
      const feedback25 = getProximityFeedback(1950, 1975); // 25 years off
      const feedback50 = getProximityFeedback(1950, 2000); // 50 years off
      const feedback100 = getProximityFeedback(1900, 2000); // 100 years off
      
      // Should contain encouraging words, not just "Within X years!"
      expect(feedback25.message).not.toMatch(/^Within \d+ years!$/);
      expect(feedback50.message).not.toMatch(/^Within \d+ years!$/);
      expect(feedback100.message).not.toMatch(/^Within a century!$/);
      
      // Should contain encouraging words
      const encouragingWords = ['nice', 'good', 'close', 'getting', 'try', 'almost', 'warm', 'bad'];
      const containsEncouraging = (msg: string) => 
        encouragingWords.some(word => msg.toLowerCase().includes(word));
        
      expect(containsEncouraging(feedback25.message)).toBe(true);
      expect(containsEncouraging(feedback50.message)).toBe(true);
      expect(containsEncouraging(feedback100.message)).toBe(true);
    });

    it('should maintain positive tone even for distant guesses', () => {
      const feedback = getProximityFeedback(1000, 2000); // 1000 years off
      
      // Should not be discouraging or negative
      const discouragingWords = ['bad', 'wrong', 'terrible', 'awful', 'fail'];
      const containsDiscouraging = (msg: string) => 
        discouragingWords.some(word => msg.toLowerCase().includes(word));
        
      expect(containsDiscouraging(feedback.message)).toBe(false);
      expect(feedback.message.length).toBeGreaterThan(5); // Not just empty or terse
    });

    it('should keep correct answer celebration unchanged', () => {
      const feedback = getProximityFeedback(1969, 1969);
      expect(feedback.message).toBe('CORRECT!');
    });
  });

  describe('Progressive Improvement Tracking', () => {
    it('should acknowledge when guess improves from previous attempt', () => {
      // First guess is far off, second guess is closer
      const previousGuess = 1800;
      const currentGuess = 1950;
      const target = 1969;
      
      // This would require extending the function signature
      // For now, we'll test the concept with a new function
      const feedback = getProgressiveFeedback(currentGuess, target, [previousGuess]);
      
      expect(feedback.message).toMatch(/getting closer|improving|warmer|better/i);
    });

    it('should acknowledge when guess moves away from target', () => {
      const previousGuess = 1950;
      const currentGuess = 1800; 
      const target = 1969;
      
      const feedback = getProgressiveFeedback(currentGuess, target, [previousGuess]);
      
      expect(feedback.message).toMatch(/further|colder|wrong direction/i);
    });

    it('should handle first guess without previous context', () => {
      const feedback = getProgressiveFeedback(1950, 1969, []);
      
      // Should not mention improvement/regression
      expect(feedback.message).not.toMatch(/closer|further|warmer|colder/i);
    });
  });

  describe('Historical Era Hints', () => {
    it('should provide era-based context for different time periods', () => {
      // Ancient history
      const ancientFeedback = getHistoricalFeedback(500, 1969); // Ancient vs Modern
      expect(ancientFeedback.message).toMatch(/ancient|classical|medieval|centuries/i);
      
      // Medieval to modern
      const medievalFeedback = getHistoricalFeedback(1200, 1969); // Medieval vs Modern
      expect(medievalFeedback.message).toMatch(/medieval|renaissance|centuries|era/i);
      
      // Recent history
      const recentFeedback = getHistoricalFeedback(1920, 1969); // Early vs Mid 20th century
      expect(recentFeedback.message).toMatch(/century|decades|era|period/i);
    });

    it('should handle BC/AD transitions appropriately', () => {
      const bcFeedback = getHistoricalFeedback(-100, 100); // 100 BC to 100 AD
      expect(bcFeedback.message).toMatch(/BC|AD|centuries|ancient/i);
    });

    it('should provide contextual hints for major historical periods', () => {
      // World War era guess vs Ancient times
      const warEraFeedback = getHistoricalFeedback(1940, 500);
      expect(warEraFeedback.message).toMatch(/modern|ancient|centuries|millennia/i);
    });
  });

  describe('Enhanced Comprehensive Feedback', () => {
    it('should combine progressive and historical feedback', () => {
      const feedback = getEnhancedProximityFeedback(1850, 1969, {
        previousGuesses: [1400], // was further away and different era
        includeHistoricalContext: true
      });
      
      expect(feedback.message).toMatch(/getting closer/i);
      expect(feedback.message).toMatch(/centur|modern|era/i);
    });

    it('should work with just progressive feedback', () => {
      const feedback = getEnhancedProximityFeedback(1950, 1969, {
        previousGuesses: [1800],
        includeHistoricalContext: false
      });
      
      expect(feedback.message).toMatch(/getting closer/i);
      expect(feedback.message).not.toMatch(/century|era/i);
    });

    it('should work with just historical feedback', () => {
      const feedback = getEnhancedProximityFeedback(1200, 1969, {
        includeHistoricalContext: true
      });
      
      expect(feedback.message).toMatch(/medieval|era|centuries/i);
      expect(feedback.message).not.toMatch(/closer|further/i);
    });

    it('should handle edge cases gracefully', () => {
      // No options
      const basicFeedback = getEnhancedProximityFeedback(1950, 1969);
      expect(basicFeedback.message).toMatch(/nice|good|warm|keep going/i);
      
      // Correct answer
      const correctFeedback = getEnhancedProximityFeedback(1969, 1969, {
        previousGuesses: [1800],
        includeHistoricalContext: true
      });
      expect(correctFeedback.message).toBe('CORRECT!');
    });
  });
});
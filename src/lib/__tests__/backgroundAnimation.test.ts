import { describe, it, expect } from 'vitest';
import { 
  calculateAnimationIntensity, 
  getAnimationPhase,
  AnimationPhase 
} from '../backgroundAnimation';

describe('Background Animation Logic', () => {
  describe('calculateAnimationIntensity', () => {
    it('should return 0 intensity when no guesses made', () => {
      const intensity = calculateAnimationIntensity([], 1969);
      expect(intensity).toBe(0);
    });

    it('should calculate intensity based on best guess proximity', () => {
      // Target year: 1969
      // Guesses: [1900, 1950, 1965] - best is 1965 (4 years off)
      const intensity = calculateAnimationIntensity([1900, 1950, 1965], 1969);
      
      // Within 5 years should give high intensity
      expect(intensity).toBeGreaterThan(0.8);
      expect(intensity).toBeLessThanOrEqual(1.0);
    });

    it('should cap intensity at 1.0 for perfect guesses', () => {
      const intensity = calculateAnimationIntensity([1969], 1969);
      expect(intensity).toBe(1.0);
    });

    it('should have lower intensity for distant guesses', () => {
      // 500+ years off should have very low intensity
      const intensity = calculateAnimationIntensity([1400], 1969);
      expect(intensity).toBeLessThan(0.2);
    });

    it('should use best guess for intensity calculation', () => {
      // Best guess determines intensity, not latest
      const intensity1 = calculateAnimationIntensity([1900, 1968], 1969); // best: 1968 (1 year off)
      const intensity2 = calculateAnimationIntensity([1968, 1900], 1969); // best: 1968 (1 year off)
      
      expect(intensity1).toBe(intensity2);
      expect(intensity1).toBeGreaterThan(0.9);
    });

    it('should handle BCE years correctly', () => {
      const intensity = calculateAnimationIntensity([-48, -52], -50); // 2 years off from 50 BCE
      expect(intensity).toBeGreaterThan(0.8);
    });
  });

  describe('getAnimationPhase', () => {
    it('should return idle phase for zero intensity', () => {
      const phase = getAnimationPhase(0);
      expect(phase).toBe(AnimationPhase.Idle);
    });

    it('should return subtle phase for low intensity', () => {
      const phase = getAnimationPhase(0.15);
      expect(phase).toBe(AnimationPhase.Subtle);
    });

    it('should return moderate phase for medium intensity', () => {
      const phase = getAnimationPhase(0.35);
      expect(phase).toBe(AnimationPhase.Moderate);
    });

    it('should return intense phase for high intensity', () => {
      const phase = getAnimationPhase(0.55);
      expect(phase).toBe(AnimationPhase.Intense);
    });

    it('should return climax phase for maximum intensity', () => {
      const phase = getAnimationPhase(0.95);
      expect(phase).toBe(AnimationPhase.Climax);
    });

    it('should handle boundary conditions correctly', () => {
      expect(getAnimationPhase(0.0)).toBe(AnimationPhase.Idle);
      expect(getAnimationPhase(0.2)).toBe(AnimationPhase.Subtle);
      expect(getAnimationPhase(0.4)).toBe(AnimationPhase.Moderate);
      expect(getAnimationPhase(0.6)).toBe(AnimationPhase.Intense);
      expect(getAnimationPhase(1.0)).toBe(AnimationPhase.Climax);
    });
  });
});
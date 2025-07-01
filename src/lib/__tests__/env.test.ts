// Tests for Environment Variable Validation
// Following TDD approach: test the interface, not the implementation

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateServerEnvironment, getOpenRouterApiKey } from '../env';

describe('Server Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  describe('validateServerEnvironment', () => {
    it('should pass when OPENROUTER_API_KEY is configured', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      
      expect(() => validateServerEnvironment()).not.toThrow();
    });

    it('should throw error when OPENROUTER_API_KEY is missing', () => {
      delete process.env.OPENROUTER_API_KEY;
      
      expect(() => validateServerEnvironment()).toThrow(
        'OPENROUTER_API_KEY is required for AI historical context generation'
      );
    });

    it('should throw error when OPENROUTER_API_KEY is empty string', () => {
      process.env.OPENROUTER_API_KEY = '';
      
      expect(() => validateServerEnvironment()).toThrow(
        'OPENROUTER_API_KEY is required for AI historical context generation'
      );
    });
  });

  describe('getOpenRouterApiKey', () => {
    it('should return API key when configured', () => {
      const testKey = 'test-api-key-12345';
      process.env.OPENROUTER_API_KEY = testKey;
      
      expect(getOpenRouterApiKey()).toBe(testKey);
    });

    it('should throw error when API key is not configured', () => {
      delete process.env.OPENROUTER_API_KEY;
      
      expect(() => getOpenRouterApiKey()).toThrow(
        'OPENROUTER_API_KEY is not configured'
      );
    });

    it('should throw error when API key is empty string', () => {
      process.env.OPENROUTER_API_KEY = '';
      
      expect(() => getOpenRouterApiKey()).toThrow(
        'OPENROUTER_API_KEY is not configured'
      );
    });
  });
});
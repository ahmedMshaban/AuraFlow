import { describe, it, expect } from 'vitest';
import getStressColor from './getStressColor';

describe('getStressColor', () => {
  describe('Valid priority levels', () => {
    it('should return red.300 for high priority', () => {
      const result = getStressColor('high');
      expect(result).toBe('red.300');
    });

    it('should return orange.300 for medium priority', () => {
      const result = getStressColor('medium');
      expect(result).toBe('orange.300');
    });

    it('should return green.300 for low priority', () => {
      const result = getStressColor('low');
      expect(result).toBe('green.300');
    });
  });

  describe('Invalid or edge cases', () => {
    it('should return gray.300 for empty string', () => {
      const result = getStressColor('');
      expect(result).toBe('gray.300');
    });

    it('should return gray.300 for invalid priority', () => {
      const result = getStressColor('invalid');
      expect(result).toBe('gray.300');
    });

    it('should return gray.300 for numeric strings', () => {
      const result = getStressColor('123');
      expect(result).toBe('gray.300');
    });

    it('should return gray.300 for mixed case input', () => {
      const result = getStressColor('HIGH');
      expect(result).toBe('gray.300');
    });

    it('should return gray.300 for null-like string', () => {
      const result = getStressColor('null');
      expect(result).toBe('gray.300');
    });

    it('should return gray.300 for undefined-like string', () => {
      const result = getStressColor('undefined');
      expect(result).toBe('gray.300');
    });
  });

  describe('Type safety and contract validation', () => {
    it('should always return a string', () => {
      const validInputs = ['high', 'medium', 'low'];
      const invalidInputs = ['', 'invalid', '123'];

      [...validInputs, ...invalidInputs].forEach((input) => {
        const result = getStressColor(input);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should return valid Chakra UI color format', () => {
      const validInputs = ['high', 'medium', 'low', 'invalid'];
      const expectedPattern = /^(red|orange|green|gray)\.300$/;

      validInputs.forEach((input) => {
        const result = getStressColor(input);
        expect(result).toMatch(expectedPattern);
      });
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const priorities = ['high', 'medium', 'low', 'invalid'];

      priorities.forEach((priority) => {
        const result1 = getStressColor(priority);
        const result2 = getStressColor(priority);
        expect(result1).toBe(result2);
      });
    });

    it('should handle repeated calls efficiently', () => {
      const start = performance.now();

      // Execute function many times
      for (let i = 0; i < 1000; i++) {
        getStressColor('high');
        getStressColor('medium');
        getStressColor('low');
        getStressColor('invalid');
      }

      const end = performance.now();
      const executionTime = end - start;

      // Should complete in reasonable time (less than 50ms for 4000 calls)
      expect(executionTime).toBeLessThan(50);
    });
  });
});

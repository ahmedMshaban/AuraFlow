import { describe, it, expect } from 'vitest';
import getStatusColor from './getStatusColor';

describe('getStatusColor', () => {
  describe('Valid status types', () => {
    it('should return green for completed status', () => {
      const result = getStatusColor('completed');
      expect(result).toBe('green');
    });

    it('should return red for overdue status', () => {
      const result = getStatusColor('overdue');
      expect(result).toBe('red');
    });

    it('should return blue for pending status', () => {
      const result = getStatusColor('pending');
      expect(result).toBe('blue');
    });
  });

  describe('Invalid or edge cases', () => {
    it('should return gray for empty string', () => {
      const result = getStatusColor('');
      expect(result).toBe('gray');
    });

    it('should return gray for invalid status', () => {
      const result = getStatusColor('invalid');
      expect(result).toBe('gray');
    });

    it('should return gray for mixed case input', () => {
      const result = getStatusColor('COMPLETED');
      expect(result).toBe('gray');
    });

    it('should return gray for partial matches', () => {
      const result = getStatusColor('complete');
      expect(result).toBe('gray');
    });

    it('should return gray for numeric strings', () => {
      const result = getStatusColor('123');
      expect(result).toBe('gray');
    });

    it('should return gray for special characters', () => {
      const result = getStatusColor('pending!');
      expect(result).toBe('gray');
    });

    it('should return gray for whitespace', () => {
      const result = getStatusColor(' ');
      expect(result).toBe('gray');
    });

    it('should return gray for status with leading/trailing spaces', () => {
      const result = getStatusColor(' pending ');
      expect(result).toBe('gray');
    });
  });

  describe('Type safety and contract validation', () => {
    it('should always return a string', () => {
      const validInputs = ['completed', 'overdue', 'pending'];
      const invalidInputs = ['', 'invalid', '123', 'COMPLETED'];

      [...validInputs, ...invalidInputs].forEach((input) => {
        const result = getStatusColor(input);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should return valid Chakra UI color format', () => {
      const inputs = ['completed', 'overdue', 'pending', 'invalid'];
      const validColors = ['green', 'red', 'blue', 'gray'];

      inputs.forEach((input) => {
        const result = getStatusColor(input);
        expect(validColors).toContain(result);
      });
    });

    it('should return only expected color values', () => {
      const testCases = [
        { input: 'completed', expected: 'green' },
        { input: 'overdue', expected: 'red' },
        { input: 'pending', expected: 'blue' },
        { input: 'unknown', expected: 'gray' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = getStatusColor(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const statuses = ['completed', 'overdue', 'pending', 'invalid'];

      statuses.forEach((status) => {
        const result1 = getStatusColor(status);
        const result2 = getStatusColor(status);
        expect(result1).toBe(result2);
      });
    });

    it('should handle repeated calls efficiently', () => {
      const start = performance.now();

      // Execute function many times
      for (let i = 0; i < 1000; i++) {
        getStatusColor('completed');
        getStatusColor('overdue');
        getStatusColor('pending');
        getStatusColor('invalid');
      }

      const end = performance.now();
      const executionTime = end - start;

      // Should complete in reasonable time (less than 50ms for 4000 calls)
      expect(executionTime).toBeLessThan(50);
    });
  });

  describe('Status mapping completeness', () => {
    it('should handle all expected task lifecycle statuses', () => {
      // Test typical task lifecycle
      expect(getStatusColor('pending')).toBe('blue'); // Initial state
      expect(getStatusColor('completed')).toBe('green'); // Success state
      expect(getStatusColor('overdue')).toBe('red'); // Error/warning state
    });

    it('should provide fallback for unexpected statuses', () => {
      const unexpectedStatuses = ['in-progress', 'cancelled', 'draft', 'archived', 'paused'];

      unexpectedStatuses.forEach((status) => {
        const result = getStatusColor(status);
        expect(result).toBe('gray');
      });
    });
  });
});

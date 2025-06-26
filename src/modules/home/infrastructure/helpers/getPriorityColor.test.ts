import { describe, it, expect } from 'vitest';
import getPriorityColor from './getPriorityColor';

describe('getPriorityColor', () => {
  describe('Valid priority levels', () => {
    it('should return red for high priority', () => {
      const result = getPriorityColor('high');
      expect(result).toBe('red');
    });

    it('should return yellow for medium priority', () => {
      const result = getPriorityColor('medium');
      expect(result).toBe('yellow');
    });

    it('should return green for low priority', () => {
      const result = getPriorityColor('low');
      expect(result).toBe('green');
    });
  });

  describe('Invalid or edge cases', () => {
    it('should return gray for empty string', () => {
      const result = getPriorityColor('');
      expect(result).toBe('gray');
    });

    it('should return gray for invalid priority', () => {
      const result = getPriorityColor('invalid');
      expect(result).toBe('gray');
    });

    it('should return gray for mixed case input', () => {
      const result = getPriorityColor('HIGH');
      expect(result).toBe('gray');
    });

    it('should return gray for partial matches', () => {
      const result = getPriorityColor('hi');
      expect(result).toBe('gray');
    });

    it('should return gray for numeric strings', () => {
      const result = getPriorityColor('1');
      expect(result).toBe('gray');
    });

    it('should return gray for priority with spaces', () => {
      const result = getPriorityColor(' high ');
      expect(result).toBe('gray');
    });

    it('should return gray for special characters', () => {
      const result = getPriorityColor('high!');
      expect(result).toBe('gray');
    });

    it('should return gray for null-like strings', () => {
      const result = getPriorityColor('null');
      expect(result).toBe('gray');
    });
  });

  describe('Type safety and contract validation', () => {
    it('should always return a string', () => {
      const validInputs = ['high', 'medium', 'low'];
      const invalidInputs = ['', 'invalid', '123', 'HIGH'];
      
      [...validInputs, ...invalidInputs].forEach(input => {
        const result = getPriorityColor(input);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should return valid Chakra UI color format', () => {
      const inputs = ['high', 'medium', 'low', 'invalid'];
      const validColors = ['red', 'yellow', 'green', 'gray'];
      
      inputs.forEach(input => {
        const result = getPriorityColor(input);
        expect(validColors).toContain(result);
      });
    });

    it('should return only expected color values', () => {
      const testCases = [
        { input: 'high', expected: 'red' },
        { input: 'medium', expected: 'yellow' },
        { input: 'low', expected: 'green' },
        { input: 'unknown', expected: 'gray' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = getPriorityColor(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Priority mapping logic', () => {
    it('should follow intuitive color mapping', () => {
      // High priority should be urgent/attention-grabbing (red)
      expect(getPriorityColor('high')).toBe('red');
      
      // Medium priority should be cautionary (yellow)
      expect(getPriorityColor('medium')).toBe('yellow');
      
      // Low priority should be calm/safe (green)
      expect(getPriorityColor('low')).toBe('green');
    });

    it('should provide consistent priority hierarchy', () => {
      const priorities = ['high', 'medium', 'low'];
      const colors = priorities.map(priority => getPriorityColor(priority));
      
      // Should have unique colors for each priority
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(priorities.length);
    });

    it('should handle priority system extensions gracefully', () => {
      // Future priority levels should default to gray
      const futurePriorities = [
        'urgent',
        'critical',
        'lowest',
        'highest',
        'normal',
      ];

      futurePriorities.forEach(priority => {
        const result = getPriorityColor(priority);
        expect(result).toBe('gray');
      });
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const priorities = ['high', 'medium', 'low', 'invalid'];
      
      priorities.forEach(priority => {
        const result1 = getPriorityColor(priority);
        const result2 = getPriorityColor(priority);
        expect(result1).toBe(result2);
      });
    });

    it('should handle repeated calls efficiently', () => {
      const start = performance.now();
      
      // Execute function many times
      for (let i = 0; i < 1000; i++) {
        getPriorityColor('high');
        getPriorityColor('medium');
        getPriorityColor('low');
        getPriorityColor('invalid');
      }
      
      const end = performance.now();
      const executionTime = end - start;
      
      // Should complete in reasonable time (less than 50ms for 4000 calls)
      expect(executionTime).toBeLessThan(50);
    });
  });

  describe('Integration scenarios', () => {
    it('should work with common task priority workflows', () => {
      // Typical task creation workflow
      const newTaskPriority = 'medium';
      expect(getPriorityColor(newTaskPriority)).toBe('yellow');
      
      // Escalated task
      const escalatedPriority = 'high';
      expect(getPriorityColor(escalatedPriority)).toBe('red');
      
      // Routine task
      const routinePriority = 'low';
      expect(getPriorityColor(routinePriority)).toBe('green');
    });

    it('should provide visual distinction for different priorities', () => {
      const priorities = ['high', 'medium', 'low'];
      const colors = priorities.map(priority => getPriorityColor(priority));
      
      // All colors should be different
      expect(colors[0]).not.toBe(colors[1]);
      expect(colors[1]).not.toBe(colors[2]);
      expect(colors[0]).not.toBe(colors[2]);
    });
  });
});

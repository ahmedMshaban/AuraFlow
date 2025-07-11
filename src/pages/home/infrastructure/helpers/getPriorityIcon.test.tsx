import { describe, it, expect } from 'vitest';
import getPriorityIcon from './getPriorityIcon';

describe('getPriorityIcon', () => {
  describe('Valid priority levels', () => {
    it('should return React element for high priority', () => {
      const icon = getPriorityIcon('high');

      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('object');
      expect(icon.type).toBeTruthy();
    });

    it('should return React element for medium priority', () => {
      const icon = getPriorityIcon('medium');

      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('object');
      expect(icon.type).toBeTruthy();
    });

    it('should return React element for low priority', () => {
      const icon = getPriorityIcon('low');

      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('object');
      expect(icon.type).toBeTruthy();
    });
  });

  describe('Invalid or edge cases', () => {
    it('should return React element for empty string', () => {
      const icon = getPriorityIcon('');

      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('object');
    });

    it('should return React element for invalid priority', () => {
      const icon = getPriorityIcon('invalid');

      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('object');
    });

    it('should return React element for mixed case input', () => {
      const icon = getPriorityIcon('HIGH');

      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('object');
    });

    it('should return React element for numeric strings', () => {
      const icon = getPriorityIcon('123');

      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('object');
    });
  });

  describe('React element validation', () => {
    it('should return valid React elements for all priority levels', () => {
      const priorities = ['high', 'medium', 'low', 'invalid'];

      priorities.forEach((priority) => {
        const icon = getPriorityIcon(priority);
        expect(icon).toBeTruthy();
        expect(typeof icon).toBe('object');
      });
    });

    it('should return different element types for different priorities', () => {
      const highIcon = getPriorityIcon('high');
      const mediumIcon = getPriorityIcon('medium');
      const lowIcon = getPriorityIcon('low');

      // Should have different component types
      expect(highIcon.type).not.toBe(mediumIcon.type);
      expect(mediumIcon.type).not.toBe(lowIcon.type);
      expect(highIcon.type).not.toBe(lowIcon.type);
    });
  });

  describe('Props validation', () => {
    it('should have color props for all priority levels', () => {
      const priorities = ['high', 'medium', 'low', 'invalid'];

      priorities.forEach((priority) => {
        const icon = getPriorityIcon(priority);
        // Check that icon has props (though we can't access them directly in TS)
        expect(icon).toHaveProperty('props');
      });
    });

    it('should use different colors for different priorities', () => {
      const highIcon = getPriorityIcon('high');
      const mediumIcon = getPriorityIcon('medium');
      const lowIcon = getPriorityIcon('low');

      // Icons should be different objects with different props
      expect(JSON.stringify(highIcon)).not.toBe(JSON.stringify(mediumIcon));
      expect(JSON.stringify(mediumIcon)).not.toBe(JSON.stringify(lowIcon));
      expect(JSON.stringify(highIcon)).not.toBe(JSON.stringify(lowIcon));
    });
  });

  describe('Icon semantics', () => {
    it('should provide consistent fallback for unknown priorities', () => {
      const unknownPriorities = ['unknown', 'urgent', 'critical', '', '123'];

      unknownPriorities.forEach((priority) => {
        const icon = getPriorityIcon(priority);
        expect(icon).toBeTruthy();
        expect(typeof icon).toBe('object');
      });
    });

    it('should return consistent icons for same priority', () => {
      const priorities = ['high', 'medium', 'low'];

      priorities.forEach((priority) => {
        const icon1 = getPriorityIcon(priority);
        const icon2 = getPriorityIcon(priority);

        // Should return same type of component
        expect(icon1.type).toBe(icon2.type);
        expect(JSON.stringify(icon1)).toBe(JSON.stringify(icon2));
      });
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const priorities = ['high', 'medium', 'low', 'invalid'];

      priorities.forEach((priority) => {
        const icon1 = getPriorityIcon(priority);
        const icon2 = getPriorityIcon(priority);

        expect(icon1.type).toBe(icon2.type);
        expect(JSON.stringify(icon1)).toBe(JSON.stringify(icon2));
      });
    });

    it('should handle repeated calls efficiently', () => {
      const start = performance.now();

      // Execute function many times
      for (let i = 0; i < 1000; i++) {
        getPriorityIcon('high');
        getPriorityIcon('medium');
        getPriorityIcon('low');
        getPriorityIcon('invalid');
      }

      const end = performance.now();
      const executionTime = end - start;

      // Should complete in reasonable time (less than 100ms for 4000 calls)
      expect(executionTime).toBeLessThan(100);
    });
  });

  describe('Integration scenarios', () => {
    it('should work with common task priority workflows', () => {
      const routineIcon = getPriorityIcon('low');
      const escalatedIcon = getPriorityIcon('medium');
      const urgentIcon = getPriorityIcon('high');

      // Should return different icon types for visual progression
      expect(routineIcon.type).not.toBe(escalatedIcon.type);
      expect(escalatedIcon.type).not.toBe(urgentIcon.type);
      expect(routineIcon.type).not.toBe(urgentIcon.type);
    });

    it('should be callable without errors', () => {
      const priorities = ['high', 'medium', 'low'];

      priorities.forEach((priority) => {
        // Should not throw when called
        expect(() => {
          getPriorityIcon(priority);
        }).not.toThrow();
      });
    });

    it('should maintain type safety', () => {
      const priorities = ['high', 'medium', 'low'];

      priorities.forEach((priority) => {
        const icon = getPriorityIcon(priority);

        // Should return ReactElement-like object
        expect(icon).toBeTruthy();
        expect(typeof icon).toBe('object');
        expect(icon).toHaveProperty('type');
        expect(typeof icon.type).toBe('function');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle edge case inputs gracefully', () => {
      const edgeCases = ['', ' ', 'null', 'undefined', '0', 'false'];

      edgeCases.forEach((input) => {
        expect(() => {
          const icon = getPriorityIcon(input);
          expect(icon).toBeTruthy();
        }).not.toThrow();
      });
    });

    it('should provide fallback for all non-standard priorities', () => {
      const nonStandardPriorities = [
        'urgent',
        'critical',
        'normal',
        'lowest',
        'highest',
        'MEDIUM',
        'Low',
        'HIGH',
        '1',
        '2',
        '3',
      ];

      // All non-standard priorities should get the same fallback icon type
      const fallbackType = getPriorityIcon('unknown').type;

      nonStandardPriorities.forEach((priority) => {
        const icon = getPriorityIcon(priority);
        expect(icon.type).toBe(fallbackType);
      });
    });
  });
});

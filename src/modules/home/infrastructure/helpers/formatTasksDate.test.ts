import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import formatTasksDate from './formatTasksDate';

describe('formatTasksDate', () => {
  beforeEach(() => {
    // Set up fake timers for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic date formatting', () => {
    it('should format date in US locale format', () => {
      const date = new Date('2023-12-25');
      const result = formatTasksDate(date);
      
      expect(result).toBe('Dec 25, 2023');
    });

    it('should format date with short month name', () => {
      const date = new Date('2023-01-01');
      const result = formatTasksDate(date);
      
      expect(result).toBe('Jan 1, 2023');
    });

    it('should format date with numeric day without leading zero', () => {
      const date = new Date('2023-03-05');
      const result = formatTasksDate(date);
      
      expect(result).toBe('Mar 5, 2023');
    });

    it('should format date with full year', () => {
      const date = new Date('2023-07-15');
      const result = formatTasksDate(date);
      
      expect(result).toBe('Jul 15, 2023');
    });
  });

  describe('Edge cases and date variations', () => {
    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29');
      const result = formatTasksDate(date);
      
      expect(result).toBe('Feb 29, 2024');
    });

    it('should handle New Year\'s Day', () => {
      const date = new Date('2024-01-01');
      const result = formatTasksDate(date);
      
      expect(result).toBe('Jan 1, 2024');
    });

    it('should handle New Year\'s Eve', () => {
      const date = new Date('2023-12-31');
      const result = formatTasksDate(date);
      
      expect(result).toBe('Dec 31, 2023');
    });

    it('should handle dates from different years', () => {
      const dates = [
        { input: new Date('2020-06-15'), expected: 'Jun 15, 2020' },
        { input: new Date('2025-06-15'), expected: 'Jun 15, 2025' },
        { input: new Date('1999-06-15'), expected: 'Jun 15, 1999' },
      ];

      dates.forEach(({ input, expected }) => {
        const result = formatTasksDate(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle all months correctly', () => {
      const months = [
        { month: 0, name: 'Jan' },
        { month: 1, name: 'Feb' },
        { month: 2, name: 'Mar' },
        { month: 3, name: 'Apr' },
        { month: 4, name: 'May' },
        { month: 5, name: 'Jun' },
        { month: 6, name: 'Jul' },
        { month: 7, name: 'Aug' },
        { month: 8, name: 'Sep' },
        { month: 9, name: 'Oct' },
        { month: 10, name: 'Nov' },
        { month: 11, name: 'Dec' },
      ];

      months.forEach(({ month, name }) => {
        const date = new Date(2023, month, 15);
        const result = formatTasksDate(date);
        expect(result).toBe(`${name} 15, 2023`);
      });
    });
  });

  describe('Time independence', () => {
    it('should format only date, ignoring time', () => {
      // Use dates that are clearly the same day in the same timezone
      const dates = [
        new Date(2023, 5, 15, 0, 0, 0), // Midnight local time
        new Date(2023, 5, 15, 12, 0, 0), // Noon local time
        new Date(2023, 5, 15, 23, 59, 59), // End of day local time
      ];

      const results = dates.map(date => formatTasksDate(date));
      
      // All should format to the same date string regardless of time
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(1);
      expect(results[0]).toBe('Jun 15, 2023');
    });

    it('should handle midnight correctly', () => {
      const date = new Date('2023-06-15T00:00:00Z');
      const result = formatTasksDate(date);
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\w{3} \d{1,2}, \d{4}/); // Month Day, Year pattern
    });
  });

  describe('Type safety and validation', () => {
    it('should always return a string', () => {
      const testDates = [
        new Date('2023-01-01'),
        new Date('2023-12-31'),
        new Date('2024-02-29'),
        new Date(),
      ];

      testDates.forEach(date => {
        const result = formatTasksDate(date);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should return properly formatted string pattern', () => {
      const date = new Date('2023-06-15');
      const result = formatTasksDate(date);
      
      // Should match pattern: "Month Day, Year"
      const pattern = /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/;
      expect(result).toMatch(pattern);
    });

    it('should handle current date', () => {
      const now = new Date();
      const result = formatTasksDate(now);
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/\w{3} \d{1,2}, \d{4}/);
    });

    it('should handle Date constructor variations', () => {
      const dates = [
        new Date(2023, 5, 15), // Month is 0-indexed
        new Date('2023-06-15'),
        new Date('June 15, 2023'),
        new Date(1686844800000), // Timestamp
      ];

      dates.forEach(date => {
        const result = formatTasksDate(date);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Locale consistency', () => {
    it('should always use US locale format', () => {
      const date = new Date('2023-06-15');
      const result = formatTasksDate(date);
      
      // Should use US format regardless of system locale
      expect(result).toBe('Jun 15, 2023');
    });

    it('should use abbreviated month names', () => {
      const longMonthDate = new Date('2023-09-15'); // September -> Sep
      const result = formatTasksDate(longMonthDate);
      
      expect(result).toBe('Sep 15, 2023');
      expect(result).not.toContain('September');
    });

    it('should not include day of week', () => {
      const date = new Date('2023-06-15'); // Thursday
      const result = formatTasksDate(date);
      
      expect(result).not.toContain('Thursday');
      expect(result).not.toContain('Thu');
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const date = new Date('2023-06-15');
      
      const result1 = formatTasksDate(date);
      const result2 = formatTasksDate(date);
      
      expect(result1).toBe(result2);
    });

    it('should handle repeated calls efficiently', () => {
      const date = new Date('2023-06-15');
      const start = performance.now();
      
      // Execute function many times
      for (let i = 0; i < 1000; i++) {
        formatTasksDate(date);
      }
      
      const end = performance.now();
      const executionTime = end - start;
      
      // Should complete in reasonable time (less than 50ms for 1000 calls)
      expect(executionTime).toBeLessThan(50);
    });

    it('should not mutate input date', () => {
      const originalDate = new Date('2023-06-15');
      const originalTime = originalDate.getTime();
      
      formatTasksDate(originalDate);
      
      expect(originalDate.getTime()).toBe(originalTime);
    });
  });

  describe('Integration scenarios', () => {
    it('should work with task due dates', () => {
      const taskDueDate = new Date('2023-06-30');
      const result = formatTasksDate(taskDueDate);
      
      expect(result).toBe('Jun 30, 2023');
    });

    it('should work with task creation dates', () => {
      const taskCreatedDate = new Date('2023-06-01');
      const result = formatTasksDate(taskCreatedDate);
      
      expect(result).toBe('Jun 1, 2023');
    });

    it('should provide sorting-friendly format', () => {
      const dates = [
        new Date('2023-01-15'),
        new Date('2023-06-15'),
        new Date('2023-12-15'),
      ];

      const formattedDates = dates.map(date => formatTasksDate(date));
      
      // All should be from same year, allowing for chronological sorting
      formattedDates.forEach(formatted => {
        expect(formatted).toContain('2023');
      });
    });
  });

  describe('Real-world date scenarios', () => {
    it('should handle common task scheduling dates', () => {
      const commonDates = [
        { date: new Date('2023-07-04'), expected: 'Jul 4, 2023' }, // Independence Day
        { date: new Date('2023-12-25'), expected: 'Dec 25, 2023' }, // Christmas
        { date: new Date('2023-11-24'), expected: 'Nov 24, 2023' }, // Thanksgiving week
      ];

      commonDates.forEach(({ date, expected }) => {
        const result = formatTasksDate(date);
        expect(result).toBe(expected);
      });
    });

    it('should handle month transitions correctly', () => {
      const monthTransitions = [
        { date: new Date('2023-01-31'), expected: 'Jan 31, 2023' },
        { date: new Date('2023-02-01'), expected: 'Feb 1, 2023' },
        { date: new Date('2023-02-28'), expected: 'Feb 28, 2023' },
        { date: new Date('2023-03-01'), expected: 'Mar 1, 2023' },
      ];

      monthTransitions.forEach(({ date, expected }) => {
        const result = formatTasksDate(date);
        expect(result).toBe(expected);
      });
    });
  });
});

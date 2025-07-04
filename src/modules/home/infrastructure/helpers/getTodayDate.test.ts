import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import getTodayDate from './getTodayDate';

describe('getTodayDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Date Calculation', () => {
    it("returns today's date when called", () => {
      // Set system time to June 26, 2025
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('2025-06-26');
    });

    it('correctly handles month transitions', () => {
      // First day of July
      vi.setSystemTime(new Date('2025-07-01T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('2025-07-01');
    });

    it('correctly handles year transitions', () => {
      // First day of the year
      vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('2025-01-01');
    });

    it('correctly handles leap year February', () => {
      // February 29, 2024 (leap year)
      vi.setSystemTime(new Date('2024-02-29T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('2024-02-29');
    });

    it('correctly handles non-leap year February end', () => {
      // February 28, 2025 (non-leap year)
      vi.setSystemTime(new Date('2025-02-28T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('2025-02-28');
    });

    it('works consistently regardless of time of day', () => {
      const testTimes = [
        '2025-06-26T00:00:00.000Z', // Midnight
        '2025-06-26T06:30:00.000Z', // Morning
        '2025-06-26T12:00:00.000Z', // Noon
        '2025-06-26T18:45:00.000Z', // Evening
        '2025-06-26T23:59:59.999Z', // Just before midnight
      ];

      testTimes.forEach((time) => {
        vi.setSystemTime(new Date(time));
        const result = getTodayDate();
        expect(result).toBe('2025-06-26');
      });
    });
  });

  describe('Return Format', () => {
    it('returns date in ISO format (YYYY-MM-DD)', () => {
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toBe('2025-06-26');
    });

    it('always returns a string', () => {
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const result = getTodayDate();
      expect(typeof result).toBe('string');
    });

    it('returns correctly formatted single-digit days and months', () => {
      // Single digit month and day
      vi.setSystemTime(new Date('2025-01-09T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('2025-01-09');
    });

    it('pads single digits with zeros', () => {
      // Test month padding
      vi.setSystemTime(new Date('2025-09-05T12:00:00.000Z'));
      expect(getTodayDate()).toBe('2025-09-05');

      // Test day padding
      vi.setSystemTime(new Date('2025-06-09T12:00:00.000Z'));
      expect(getTodayDate()).toBe('2025-06-09');
    });
  });

  describe('Edge Cases', () => {
    it('handles different time zones consistently', () => {
      // The function should work with UTC time regardless of local timezone
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('2025-06-26');
    });

    it('works with very far future dates', () => {
      vi.setSystemTime(new Date('2099-12-31T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('2099-12-31');
    });

    it('works with very far past dates', () => {
      vi.setSystemTime(new Date('1900-01-01T12:00:00.000Z'));

      const result = getTodayDate();
      expect(result).toBe('1900-01-01');
    });
  });

  describe('Real-world Usage', () => {
    it('provides valid minimum date for HTML date inputs', () => {
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const result = getTodayDate();

      // Should be a valid date that can be used as min attribute in date input
      const dateObj = new Date(result);
      expect(dateObj).toBeInstanceOf(Date);
      expect(dateObj.getTime()).not.toBeNaN();

      // Should be today
      const today = new Date('2025-06-26');
      const resultDate = new Date(result);
      expect(resultDate.toDateString()).toBe(today.toDateString());
    });

    it('allows users to select today for task creation', () => {
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const minDate = getTodayDate();
      const today = new Date().toISOString().split('T')[0];

      // Today should be equal to the minimum date (allows selecting today)
      expect(minDate).toBe(today);
    });
  });

  describe('Performance', () => {
    it('executes quickly for multiple calls', () => {
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        getTodayDate();
      }
      const end = performance.now();

      // Should execute 1000 calls in reasonable time (less than 100ms)
      expect(end - start).toBeLessThan(100);
    });

    it('returns consistent results for same system time', () => {
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const results = Array.from({ length: 10 }, () => getTodayDate());
      const uniqueResults = new Set(results);

      expect(uniqueResults.size).toBe(1);
      expect(results[0]).toBe('2025-06-26');
    });
  });

  describe('Function Contract', () => {
    it('returns current date exactly', () => {
      const testDates = ['2025-01-01T00:00:00.000Z', '2025-06-15T12:00:00.000Z', '2025-12-31T23:59:59.999Z'];

      testDates.forEach((testDate) => {
        vi.setSystemTime(new Date(testDate));

        const result = getTodayDate();
        const expected = new Date(testDate).toISOString().split('T')[0];

        expect(result).toBe(expected);
      });
    });

    it('always returns valid date format', () => {
      const testDates = ['2025-01-15T10:30:00.000Z', '2025-07-04T16:45:00.000Z', '2025-11-28T21:15:00.000Z'];

      testDates.forEach((testDate) => {
        vi.setSystemTime(new Date(testDate));

        const result = getTodayDate();
        const dateFromResult = new Date(result);

        expect(dateFromResult).toBeInstanceOf(Date);
        expect(dateFromResult.getTime()).not.toBeNaN();
      });
    });

    it('produces results compatible with Date constructor', () => {
      vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));

      const result = getTodayDate();
      const dateFromResult = new Date(result);

      expect(dateFromResult).toBeInstanceOf(Date);
      expect(dateFromResult.getTime()).not.toBeNaN();
      expect(dateFromResult.getFullYear()).toBe(2025);
      expect(dateFromResult.getMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(dateFromResult.getDate()).toBe(26);
    });
  });
});

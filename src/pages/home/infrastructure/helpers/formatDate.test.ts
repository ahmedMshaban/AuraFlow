import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import formatDate from './formatDate';

describe('formatDate', () => {
  beforeEach(() => {
    // Mock the system time to ensure consistent test results
    vi.useFakeTimers();
    // Set a fixed date: June 26, 2025, 12:00:00 PM
    vi.setSystemTime(new Date('2025-06-26T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Valid Date Inputs', () => {
    it('returns "Just now" for dates less than 1 hour ago', () => {
      // 30 minutes ago
      const date30MinAgo = new Date('2025-06-26T11:30:00.000Z');
      expect(formatDate(date30MinAgo)).toBe('Just now');

      // 59 minutes ago
      const date59MinAgo = new Date('2025-06-26T11:01:00.000Z');
      expect(formatDate(date59MinAgo)).toBe('Just now');

      // Current time
      const now = new Date('2025-06-26T12:00:00.000Z');
      expect(formatDate(now)).toBe('Just now');
    });

    it('returns "{n}h ago" for dates between 1-23 hours ago', () => {
      // Exactly 1 hour ago
      const date1HourAgo = new Date('2025-06-26T11:00:00.000Z');
      expect(formatDate(date1HourAgo)).toBe('1h ago');

      // 5 hours ago
      const date5HoursAgo = new Date('2025-06-26T07:00:00.000Z');
      expect(formatDate(date5HoursAgo)).toBe('5h ago');

      // 23 hours ago
      const date23HoursAgo = new Date('2025-06-25T13:00:00.000Z');
      expect(formatDate(date23HoursAgo)).toBe('23h ago');
    });

    it('returns "{n}d ago" for dates between 1-6 days ago', () => {
      // Exactly 1 day ago (24 hours)
      const date1DayAgo = new Date('2025-06-25T12:00:00.000Z');
      expect(formatDate(date1DayAgo)).toBe('1d ago');

      // 3 days ago
      const date3DaysAgo = new Date('2025-06-23T12:00:00.000Z');
      expect(formatDate(date3DaysAgo)).toBe('3d ago');

      // 6 days ago
      const date6DaysAgo = new Date('2025-06-20T12:00:00.000Z');
      expect(formatDate(date6DaysAgo)).toBe('6d ago');
    });

    it('returns localized date string for dates 7+ days ago', () => {
      // 7 days ago
      const date7DaysAgo = new Date('2025-06-19T12:00:00.000Z');
      expect(formatDate(date7DaysAgo)).toBe(date7DaysAgo.toLocaleDateString());

      // 30 days ago
      const date30DaysAgo = new Date('2025-05-27T12:00:00.000Z');
      expect(formatDate(date30DaysAgo)).toBe(date30DaysAgo.toLocaleDateString());

      // 1 year ago
      const date1YearAgo = new Date('2024-06-26T12:00:00.000Z');
      expect(formatDate(date1YearAgo)).toBe(date1YearAgo.toLocaleDateString());
    });

    it('handles future dates correctly', () => {
      // 1 hour in the future (negative difference)
      const futureDate = new Date('2025-06-26T13:00:00.000Z');
      expect(formatDate(futureDate)).toBe('Just now'); // Negative hours < 1
    });

    it('handles edge cases around boundaries', () => {
      // Exactly at 1 hour boundary
      const exactly1Hour = new Date('2025-06-26T11:00:00.000Z');
      expect(formatDate(exactly1Hour)).toBe('1h ago');

      // Just under 24 hours
      const just23h59m = new Date('2025-06-25T12:01:00.000Z');
      expect(formatDate(just23h59m)).toBe('23h ago');

      // Exactly 24 hours (should be 1 day)
      const exactly24Hours = new Date('2025-06-25T12:00:00.000Z');
      expect(formatDate(exactly24Hours)).toBe('1d ago');

      // Just under 7 days
      const just6d23h = new Date('2025-06-19T13:00:00.000Z');
      expect(formatDate(just6d23h)).toBe('6d ago');

      // Exactly 7 days
      const exactly7Days = new Date('2025-06-19T12:00:00.000Z');
      expect(formatDate(exactly7Days)).toBe(exactly7Days.toLocaleDateString());
    });
  });

  describe('Invalid Date Inputs', () => {
    it('throws error for invalid Date objects', () => {
      const invalidDate = new Date('invalid-date-string');
      expect(() => formatDate(invalidDate)).toThrow('Invalid date provided');
    });

    it('throws error for null input', () => {
      expect(() => formatDate(null as unknown as Date)).toThrow('Invalid date provided');
    });

    it('throws error for undefined input', () => {
      expect(() => formatDate(undefined as unknown as Date)).toThrow('Invalid date provided');
    });

    it('throws error for string input', () => {
      expect(() => formatDate('2025-06-26' as unknown as Date)).toThrow('Invalid date provided');
    });

    it('throws error for number input', () => {
      expect(() => formatDate(1234567890 as unknown as Date)).toThrow('Invalid date provided');
    });

    it('throws error for object input', () => {
      expect(() => formatDate({} as unknown as Date)).toThrow('Invalid date provided');
    });

    it('throws error for array input', () => {
      expect(() => formatDate([] as unknown as Date)).toThrow('Invalid date provided');
    });
  });

  describe('Time Zone Handling', () => {
    it('works consistently across different time zones', () => {
      // Test with explicit UTC dates to ensure consistency
      const baseTime = new Date('2025-06-26T12:00:00.000Z');
      const oneHourAgo = new Date('2025-06-26T11:00:00.000Z');

      // Set system time to base time
      vi.setSystemTime(baseTime);

      expect(formatDate(oneHourAgo)).toBe('1h ago');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles very old dates', () => {
      const veryOldDate = new Date('1990-01-01T00:00:00.000Z');
      const result = formatDate(veryOldDate);
      expect(result).toBe(veryOldDate.toLocaleDateString());
      expect(typeof result).toBe('string');
    });

    it('handles dates with different time components', () => {
      // Date with milliseconds
      const dateWithMs = new Date('2025-06-26T11:30:45.123Z');
      expect(formatDate(dateWithMs)).toBe('Just now');

      // Date with seconds
      const dateWithSeconds = new Date('2025-06-26T10:45:30.000Z');
      expect(formatDate(dateWithSeconds)).toBe('1h ago');
    });

    it('maintains consistent formatting for same relative times', () => {
      const date1 = new Date('2025-06-26T10:00:00.000Z');
      const date2 = new Date('2025-06-26T10:30:00.000Z');

      expect(formatDate(date1)).toBe('2h ago');
      expect(formatDate(date2)).toBe('1h ago');
    });
  });

  describe('Locale-specific formatting', () => {
    it('uses system locale for date formatting', () => {
      const oldDate = new Date('2025-01-15T12:00:00.000Z');
      const result = formatDate(oldDate);

      // Should be a valid date string (format depends on system locale)
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should match the locale date format
      expect(result).toBe(oldDate.toLocaleDateString());
    });
  });

  describe('Real-world scenarios', () => {
    it('formats email timestamps correctly', () => {
      // Email received 2 hours ago
      const emailTime = new Date('2025-06-26T10:00:00.000Z');
      expect(formatDate(emailTime)).toBe('2h ago');
    });

    it('formats task creation dates correctly', () => {
      // Task created 3 days ago
      const taskCreationDate = new Date('2025-06-23T12:00:00.000Z');
      expect(formatDate(taskCreationDate)).toBe('3d ago');
    });

    it('formats historical data correctly', () => {
      // Data from last month
      const historicalDate = new Date('2025-05-15T12:00:00.000Z');
      expect(formatDate(historicalDate)).toBe(historicalDate.toLocaleDateString());
    });
  });

  describe('Function contract validation', () => {
    it('always returns a string', () => {
      const testDates = [
        new Date(),
        new Date('2025-06-26T11:00:00.000Z'),
        new Date('2025-06-20T12:00:00.000Z'),
        new Date('2024-01-01T00:00:00.000Z'),
      ];

      testDates.forEach((date) => {
        const result = formatDate(date);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('never returns empty string for valid dates', () => {
      const validDates = [
        new Date(),
        new Date('2025-06-26T11:00:00.000Z'),
        new Date('2000-01-01T00:00:00.000Z'),
        new Date('2030-12-31T23:59:59.999Z'),
      ];

      validDates.forEach((date) => {
        const result = formatDate(date);
        expect(result).not.toBe('');
      });
    });
  });
});

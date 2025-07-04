import { describe, it, expect } from 'vitest';
import { calculateTaskStatus, getDateRangeForView, getStandardDateRanges } from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('calculateTaskStatus', () => {
    it('should return completed status for completed tasks regardless of due date', () => {
      const pastDate = new Date('2024-01-01');
      const result = calculateTaskStatus(pastDate, 'completed');
      expect(result).toBe('completed');
    });

    it('should return overdue status for pending tasks past due date (before today)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = calculateTaskStatus(yesterday, 'pending');
      expect(result).toBe('overdue');
    });

    it('should return pending status for tasks due today', () => {
      const today = new Date();
      const result = calculateTaskStatus(today, 'pending');
      expect(result).toBe('pending');
    });

    it('should return pending status for tasks due later today', () => {
      const laterToday = new Date();
      laterToday.setHours(23, 59, 0, 0); // Later today
      const result = calculateTaskStatus(laterToday, 'pending');
      expect(result).toBe('pending');
    });

    it('should return pending status for pending tasks not yet due', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const result = calculateTaskStatus(futureDate, 'pending');
      expect(result).toBe('pending');
    });

    it('should return overdue status for tasks that were due earlier this week', () => {
      const earlierThisWeek = new Date();
      earlierThisWeek.setDate(earlierThisWeek.getDate() - 3);
      const result = calculateTaskStatus(earlierThisWeek, 'pending');
      expect(result).toBe('overdue');
    });
  });

  describe('getDateRangeForView', () => {
    it('should return correct date range for my-day view', () => {
      const { startDate, endDate } = getDateRangeForView('my-day');
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      expect(startDate.getTime()).toBe(todayStart.getTime());
      expect(endDate.getTime()).toBe(todayEnd.getTime());
    });

    it('should return correct date range for my-week view', () => {
      const { startDate, endDate } = getDateRangeForView('my-week');
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      expect(startDate.getTime()).toBe(todayStart.getTime());
      expect(endDate.getTime()).toBe(weekEnd.getTime());
    });

    it('should throw error for invalid view type', () => {
      // @ts-expect-error Testing invalid input
      expect(() => getDateRangeForView('invalid')).toThrow('Invalid view type: invalid');
    });
  });

  describe('getStandardDateRanges', () => {
    it('should return all standard date ranges', () => {
      const ranges = getStandardDateRanges();

      expect(ranges).toHaveProperty('today');
      expect(ranges).toHaveProperty('tomorrow');
      expect(ranges).toHaveProperty('weekFromNow');
      expect(ranges).toHaveProperty('monthFromNow');

      expect(ranges.today instanceof Date).toBe(true);
      expect(ranges.tomorrow instanceof Date).toBe(true);
      expect(ranges.weekFromNow instanceof Date).toBe(true);
      expect(ranges.monthFromNow instanceof Date).toBe(true);
    });
  });
});

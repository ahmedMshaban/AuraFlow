import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useGreeting from './useGreeting';

describe('useGreeting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockDate = (year: number, month: number, day: number, hours: number, minutes = 0, seconds = 0) => {
    // Note: month is 0-based in JavaScript Date constructor
    const targetDate = new Date(year, month, day, hours, minutes, seconds);
    vi.setSystemTime(targetDate);
  };

  describe('greeting based on time of day', () => {
    it('returns "Good Morning" for early morning (6 AM)', () => {
      mockDate(2025, 5, 26, 6); // June 26, 2025, 6:00 AM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Morning');
    });

    it('returns "Good Morning" for late morning (11 AM)', () => {
      mockDate(2025, 5, 26, 11); // June 26, 2025, 11:00 AM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Morning');
    });

    it('returns "Good Afternoon" for noon (12 PM)', () => {
      mockDate(2025, 5, 26, 12); // June 26, 2025, 12:00 PM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Afternoon');
    });

    it('returns "Good Afternoon" for early afternoon (2 PM)', () => {
      mockDate(2025, 5, 26, 14); // June 26, 2025, 2:00 PM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Afternoon');
    });

    it('returns "Good Afternoon" for late afternoon (5 PM)', () => {
      mockDate(2025, 5, 26, 17); // June 26, 2025, 5:00 PM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Afternoon');
    });

    it('returns "Good Evening" for early evening (6 PM)', () => {
      mockDate(2025, 5, 26, 18); // June 26, 2025, 6:00 PM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Evening');
    });

    it('returns "Good Evening" for late evening (10 PM)', () => {
      mockDate(2025, 5, 26, 22); // June 26, 2025, 10:00 PM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Evening');
    });

    it('returns "Good Morning" for midnight (12 AM)', () => {
      mockDate(2025, 5, 26, 0); // June 26, 2025, 12:00 AM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Morning');
    });

    it('returns "Good Morning" for very early morning (3 AM)', () => {
      mockDate(2025, 5, 26, 3); // June 26, 2025, 3:00 AM

      const { result } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Morning');
    });
  });

  describe('date formatting', () => {
    it('formats date correctly for a weekday', () => {
      mockDate(2025, 5, 26, 10); // Thursday, June 26, 2025

      const { result } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Thursday, June 26');
    });

    it('formats date correctly for a weekend', () => {
      mockDate(2025, 5, 28, 10); // Saturday, June 28, 2025

      const { result } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Saturday, June 28');
    });

    it('formats date correctly for different months', () => {
      mockDate(2025, 0, 1, 10); // Wednesday, January 1, 2025

      const { result } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Wednesday, January 1');
    });

    it('formats date correctly for December', () => {
      mockDate(2025, 11, 25, 10); // Thursday, December 25, 2025

      const { result } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Thursday, December 25');
    });

    it('formats date correctly for different years', () => {
      mockDate(2024, 1, 29, 10); // Thursday, February 29, 2024 (leap year)

      const { result } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Thursday, February 29');
    });
  });

  describe('boundary conditions', () => {
    it('handles transition from morning to afternoon (11:59 AM to 12:00 PM)', () => {
      // 11:59 AM
      mockDate(2025, 5, 26, 11, 59);
      const { result: result1 } = renderHook(() => useGreeting());
      expect(result1.current.greeting).toBe('Good Morning');

      // 12:00 PM
      mockDate(2025, 5, 26, 12, 0);
      const { result: result2 } = renderHook(() => useGreeting());
      expect(result2.current.greeting).toBe('Good Afternoon');
    });

    it('handles transition from afternoon to evening (5:59 PM to 6:00 PM)', () => {
      // 5:59 PM
      mockDate(2025, 5, 26, 17, 59);
      const { result: result1 } = renderHook(() => useGreeting());
      expect(result1.current.greeting).toBe('Good Afternoon');

      // 6:00 PM
      mockDate(2025, 5, 26, 18, 0);
      const { result: result2 } = renderHook(() => useGreeting());
      expect(result2.current.greeting).toBe('Good Evening');
    });

    it('handles end of day transition (11:59 PM to 12:00 AM)', () => {
      // 11:59 PM
      mockDate(2025, 5, 26, 23, 59);
      const { result: result1 } = renderHook(() => useGreeting());
      expect(result1.current.greeting).toBe('Good Evening');

      // 12:00 AM (next day)
      mockDate(2025, 5, 27, 0, 0);
      const { result: result2 } = renderHook(() => useGreeting());
      expect(result2.current.greeting).toBe('Good Morning');
    });
  });

  describe('edge cases', () => {
    it('handles leap year dates correctly', () => {
      mockDate(2024, 1, 29, 10); // February 29, 2024

      const { result } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Thursday, February 29');
    });

    it('handles first day of year', () => {
      mockDate(2025, 0, 1, 10); // January 1, 2025

      const { result } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Wednesday, January 1');
      expect(result.current.greeting).toBe('Good Morning');
    });

    it('handles last day of year', () => {
      mockDate(2025, 11, 31, 20); // December 31, 2025

      const { result } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Wednesday, December 31');
      expect(result.current.greeting).toBe('Good Evening');
    });
  });

  describe('return value structure', () => {
    it('returns an object with date and greeting properties', () => {
      mockDate(2025, 5, 26, 10);

      const { result } = renderHook(() => useGreeting());

      expect(result.current).toHaveProperty('date');
      expect(result.current).toHaveProperty('greeting');
      expect(typeof result.current.date).toBe('string');
      expect(typeof result.current.greeting).toBe('string');
    });

    it('returns consistent values on multiple calls at the same time', () => {
      mockDate(2025, 5, 26, 15); // 3 PM

      const { result: result1 } = renderHook(() => useGreeting());
      const { result: result2 } = renderHook(() => useGreeting());

      expect(result1.current.date).toBe(result2.current.date);
      expect(result1.current.greeting).toBe(result2.current.greeting);
    });
  });

  describe('real-time behavior', () => {
    it('updates when time changes during hook lifetime', () => {
      // Start at 11:59 AM
      mockDate(2025, 5, 26, 11, 59);
      const { result, rerender } = renderHook(() => useGreeting());

      expect(result.current.greeting).toBe('Good Morning');

      // Change to 12:00 PM
      mockDate(2025, 5, 26, 12, 0);
      rerender();

      expect(result.current.greeting).toBe('Good Afternoon');
    });

    it('updates date when day changes', () => {
      // Start on June 26
      mockDate(2025, 5, 26, 23, 59);
      const { result, rerender } = renderHook(() => useGreeting());

      expect(result.current.date).toBe('Thursday, June 26');

      // Change to June 27
      mockDate(2025, 5, 27, 0, 0);
      rerender();

      expect(result.current.date).toBe('Friday, June 27');
      expect(result.current.greeting).toBe('Good Morning');
    });
  });

  describe('locale handling', () => {
    it('uses en-US locale for date formatting', () => {
      mockDate(2025, 5, 26, 10);

      const { result } = renderHook(() => useGreeting());

      // Verify the date is formatted in US style (Month Day format)
      expect(result.current.date).toMatch(/^[A-Za-z]+, [A-Za-z]+ \d{1,2}$/);
    });
  });

  describe('performance', () => {
    it('executes quickly without performance issues', () => {
      mockDate(2025, 5, 26, 10);

      const startTime = performance.now();
      renderHook(() => useGreeting());
      const endTime = performance.now();

      // Hook should execute in less than 10ms
      expect(endTime - startTime).toBeLessThan(10);
    });

    it('handles multiple rapid calls efficiently', () => {
      mockDate(2025, 5, 26, 10);

      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        renderHook(() => useGreeting());
      }
      const endTime = performance.now();

      // 100 calls should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('all hours of the day', () => {
    it('returns correct greetings for each hour', () => {
      const expectedGreetings = [
        // Hours 0-11: Good Morning
        ...Array(12).fill('Good Morning'),
        // Hours 12-17: Good Afternoon
        ...Array(6).fill('Good Afternoon'),
        // Hours 18-23: Good Evening
        ...Array(6).fill('Good Evening'),
      ];

      expectedGreetings.forEach((expectedGreeting, hour) => {
        mockDate(2025, 5, 26, hour);
        const { result } = renderHook(() => useGreeting());
        expect(result.current.greeting).toBe(expectedGreeting);
      });
    });
  });
});

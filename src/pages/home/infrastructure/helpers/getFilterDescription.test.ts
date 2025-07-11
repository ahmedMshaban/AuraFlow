import { describe, it, expect } from 'vitest';
import { getFilterDescription } from './getFilterDescription';
import type { ViewType } from '@/shared/hooks/useFilters';

describe('getFilterDescription', () => {
  it('should return correct time descriptions for all view types', () => {
    expect(getFilterDescription('my-day')).toBe('today');
    expect(getFilterDescription('my-week')).toBe('this week');
    expect(getFilterDescription('my-month')).toBe('this month');
  });

  it('should return default description for unknown filter', () => {
    expect(getFilterDescription('unknown' as ViewType)).toBe('in the current view');
  });

  it('should handle all ViewType values', () => {
    const viewTypes: ViewType[] = ['my-day', 'my-week', 'my-month'];

    viewTypes.forEach((viewType) => {
      const result = getFilterDescription(viewType);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  it('should return lowercase descriptions for consistent formatting', () => {
    expect(getFilterDescription('my-day')).toBe(getFilterDescription('my-day').toLowerCase());
    expect(getFilterDescription('my-week')).toBe(getFilterDescription('my-week').toLowerCase());
    expect(getFilterDescription('my-month')).toBe(getFilterDescription('my-month').toLowerCase());
  });
});

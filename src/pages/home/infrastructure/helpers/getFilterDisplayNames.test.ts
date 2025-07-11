import { describe, it, expect } from 'vitest';
import { getFilterDisplayName, getFilterSearchDescription } from './getFilterDisplayNames';
import type { ViewType } from '@/shared/hooks/useFilters';

describe('getFilterDisplayName', () => {
  it('should return correct display names for all view types', () => {
    expect(getFilterDisplayName('my-day')).toBe('Today');
    expect(getFilterDisplayName('my-week')).toBe('This Week');
    expect(getFilterDisplayName('my-month')).toBe('This Month');
  });

  it('should return default for unknown filter', () => {
    expect(getFilterDisplayName('unknown' as ViewType)).toBe('This Month');
  });
});

describe('getFilterSearchDescription', () => {
  it('should return correct search descriptions for all view types', () => {
    expect(getFilterSearchDescription('my-day')).toBe('emails from today');
    expect(getFilterSearchDescription('my-week')).toBe('emails from the last 7 days');
    expect(getFilterSearchDescription('my-month')).toBe('emails from the last 30 days');
  });

  it('should return default for unknown filter', () => {
    expect(getFilterSearchDescription('unknown' as ViewType)).toBe('emails from the last 30 days');
  });
});

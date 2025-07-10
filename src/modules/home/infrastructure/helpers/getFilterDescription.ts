import type { ViewType } from '@/shared/hooks/useFilters';

/**
 * Get a time-based description for a filter view type
 * Used to provide context in empty state messages for tasks
 *
 * @param filter - The ViewType filter to get description for
 * @returns Time-based description for the filter (e.g., "today", "this week")
 *
 * @example
 * ```typescript
 * getFilterDescription('my-day') // returns "today"
 * getFilterDescription('my-week') // returns "this week"
 * getFilterDescription('my-month') // returns "this month"
 * ```
 */
export const getFilterDescription = (filter: ViewType): string => {
  switch (filter) {
    case 'my-day':
      return 'today';
    case 'my-week':
      return 'this week';
    case 'my-month':
      return 'this month';
    default:
      return 'in the current view';
  }
};

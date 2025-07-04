import type { ViewType } from '@/shared/hooks/useFilters';

/**
 * Get filter options for task/email views based on user's stress state
 * When stressed, simplifies options to reduce cognitive load
 *
 * @param isCurrentlyStressed - Whether the user is currently experiencing stress
 * @returns Array of filter options with label and value properties
 *
 * @example
 * ```typescript
 * // Normal state - full options
 * getFilterOptions(false)
 * // Returns: [
 * //   { label: 'My Day', value: 'my-day' },
 * //   { label: 'My Week', value: 'my-week' },
 * //   { label: 'My Month', value: 'my-month' }
 * // ]
 *
 * // Stressed state - simplified options
 * getFilterOptions(true)
 * // Returns: [{ label: 'My Day', value: 'my-day' }]
 * ```
 */
const getFilterOptions = (isCurrentlyStressed: boolean): Array<{ label: string; value: ViewType }> => {
  if (isCurrentlyStressed) {
    return [{ label: 'My Day', value: 'my-day' }];
  }

  return [
    { label: 'My Day', value: 'my-day' },
    { label: 'My Week', value: 'my-week' },
    { label: 'My Month', value: 'my-month' },
    { label: 'All Time', value: 'all-time' },
  ];
};

export default getFilterOptions;

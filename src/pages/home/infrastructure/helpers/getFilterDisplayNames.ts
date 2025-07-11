import type { ViewType } from '@/shared/hooks/useFilters';

/**
 * Get the display name for a filter view type
 * Used to show user-friendly names for date filters in the UI
 *
 * @param filter - The ViewType filter to get display name for
 * @returns User-friendly display name for the filter
 */
export const getFilterDisplayName = (filter: ViewType): string => {
  switch (filter) {
    case 'my-day':
      return 'Today';
    case 'my-week':
      return 'This Week';
    case 'my-month':
      return 'This Month';
    default:
      return 'This Month';
  }
};

/**
 * Get a description of what emails will be searched within the given filter
 *
 * @param filter - The ViewType filter to get description for
 * @returns Description of the search scope
 */
export const getFilterSearchDescription = (filter: ViewType): string => {
  switch (filter) {
    case 'my-day':
      return 'emails from today';
    case 'my-week':
      return 'emails from the last 7 days';
    case 'my-month':
      return 'emails from the last 30 days';
    default:
      return 'emails from the last 30 days';
  }
};

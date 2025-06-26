/**
 * Format a Date object to a human-readable string for task display
 * Uses US locale format (MMM dd, yyyy) for consistency across the application
 *
 * @param date - The Date object to format
 * @returns Formatted date string in "MMM dd, yyyy" format (e.g., "Dec 25, 2023")
 *
 * @example
 * ```typescript
 * formatTasksDate(new Date('2023-12-25'))
 * // returns "Dec 25, 2023"
 *
 * formatTasksDate(new Date('2023-01-01'))
 * // returns "Jan 1, 2023"
 * ```
 */
const formatTasksDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export default formatTasksDate;

/**
 * Formats a date relative to the current time
 * @param date - The date to format
 * @returns A human-readable string representation of the date:
 *   - "Just now" for dates less than 1 hour ago
 *   - "{n}h ago" for dates less than 24 hours ago
 *   - "{n}d ago" for dates less than 7 days ago
 *   - Localized date string for older dates
 * @throws {Error} When date is invalid
 * @example
 * formatDate(new Date()) // "Just now"
 * formatDate(new Date(Date.now() - 2 * 60 * 60 * 1000)) // "2h ago"
 * formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // "3d ago"
 */
const formatDate = (date: Date): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default formatDate;

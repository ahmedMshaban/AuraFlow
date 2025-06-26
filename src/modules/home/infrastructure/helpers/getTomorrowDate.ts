/**
 * Gets tomorrow's date formatted as an ISO date string (YYYY-MM-DD)
 * Used as the minimum date for date inputs to prevent selecting past dates
 * @returns ISO date string representing tomorrow's date
 * @example
 * getTomorrowDate() // "2025-06-27" (if today is 2025-06-26)
 */
const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export default getTomorrowDate;

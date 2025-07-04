/**
 * Gets today's date formatted as an ISO date string (YYYY-MM-DD)
 * Used as the minimum date for date inputs to allow selecting today's date
 * @returns ISO date string representing today's date
 * @example
 * getTodayDate() // "2025-06-26" (if today is 2025-06-26)
 */
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default getTodayDate;

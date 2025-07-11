/**
 * Custom hook for generating time-appropriate greetings and formatted dates.
 * Provides dynamic greeting messages based on the current time of day and
 * localized date formatting using the user's browser settings.
 *
 * Greeting Logic:
 * - "Good Morning" for hours 0-11 (12:00 AM - 11:59 AM)
 * - "Good Afternoon" for hours 12-17 (12:00 PM - 5:59 PM)
 * - "Good Evening" for hours 18-23 (6:00 PM - 11:59 PM)
 *
 * Date Formatting:
 * - Uses browser's locale settings (en-US format)
 * - Displays full weekday name, month name, and day number
 * - Example: "Friday, July 11" or "Monday, December 25"
 *
 * @returns {Object} Greeting and date information
 * @returns {string} date - Formatted date string (e.g., "Friday, July 11")
 * @returns {string} greeting - Time-appropriate greeting message
 *
 * @example
 * ```typescript
 * const { date, greeting } = useGreeting();
 *
 * // Morning usage (8:00 AM)
 * console.log(greeting); // "Good Morning"
 * console.log(date);     // "Friday, July 11"
 *
 * // Afternoon usage (2:00 PM)
 * console.log(greeting); // "Good Afternoon"
 *
 * // Evening usage (8:00 PM)
 * console.log(greeting); // "Good Evening"
 *
 * // Display in component
 * <h1>{greeting}, John!</h1>
 * <p>Today is {date}</p>
 * ```
 *
 * @note The hook updates automatically when called, reflecting current time
 * @note Date format respects user's browser locale preferences
 * @note Greeting boundaries are based on 24-hour time format
 */
const useGreeting = () => {
  // time of the day
  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? 'Good Morning' : timeOfDay < 18 ? 'Good Afternoon' : 'Good Evening';

  // date to local user browser settings
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return { date, greeting };
};

export default useGreeting;

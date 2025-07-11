import { useAuth } from '@/shared/hooks/useAuth';
import type { AuthContextType } from '@/shared/types/authContext';
import styles from '../infrastructure/styles/home.module.css';
import useGreeting from '../infrastructure/hooks/useGreeting';

/**
 * A personalized greeting component that displays time-appropriate greetings and current date.
 * Combines user authentication data with dynamic time-based messaging to create a
 * welcoming and contextual interface element for the home page.
 *
 * Features:
 * - Personalized greeting using authenticated user's display name
 * - Time-appropriate greeting messages (Good Morning/Afternoon/Evening)
 * - Current date display in user-friendly format
 * - Fallback to "User" when display name is unavailable
 * - Responsive typography and styling
 *
 * Display Format:
 * - Date: "Friday, July 11" (localized format)
 * - Greeting: "Good Morning, John" (or appropriate time greeting)
 *
 * @returns A personalized greeting interface element
 *
 * @example
 * ```tsx
 * // Basic usage - automatically personalizes based on auth and time
 * <Greeting />
 *
 * // Renders something like:
 * // Friday, July 11
 * // Good Morning, John
 * ```
 *
 * @note Component requires user authentication context to be available
 * @note Greeting updates automatically based on current time when re-rendered
 * @see {@link useAuth} For user authentication data
 * @see {@link useGreeting} For time-based greeting and date formatting
 */
const Greeting = () => {
  const { currentUser } = useAuth() as AuthContextType;
  const { date, greeting } = useGreeting();

  return (
    <div className={styles.greetingContainer}>
      <h1 className={styles.date}>{date}</h1>
      <h2 className={styles.greeting}>
        {greeting}, {currentUser?.displayName || 'User'}
      </h2>
    </div>
  );
};

export default Greeting;

import { createContext } from 'react';
import type { AuthContextType } from '../types/authContext';

/**
 * React context for managing authentication state across the application.
 * Provides centralized access to user authentication data and methods.
 * Used by AuthProvider to distribute auth state to consuming components.
 *
 * Context Value Structure:
 * - userLoggedIn: Boolean indicating if user is authenticated
 * - isEmailUser: True if user authenticated with email/password
 * - isGoogleUser: True if user authenticated with Google OAuth
 * - currentUser: Firebase User object or null
 * - setCurrentUser: Function to update current user state
 * - loading: Boolean indicating auth state check in progress
 *
 * @example
 * ```tsx
 * // Access auth context in components
 * import { useContext } from 'react';
 * import { AuthContext } from '../contexts/context';
 *
 * function MyComponent() {
 *   const auth = useContext(AuthContext);
 *
 *   if (auth?.userLoggedIn) {
 *     return <div>Welcome, {auth.currentUser?.displayName}!</div>;
 *   }
 *   return <div>Please log in</div>;
 * }
 * ```
 *
 * @note Use the useAuth hook instead of direct context access
 * @see {@link AuthProvider} for the context provider implementation
 * @see {@link useAuth} for the recommended way to consume this context
 */
export const AuthContext = createContext<AuthContextType | null>(null);

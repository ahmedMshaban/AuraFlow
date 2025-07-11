import { useContext } from 'react';
import { AuthContext } from '../contexts/context';

/**
 * Custom hook for accessing authentication context throughout the application.
 * Provides convenient access to user authentication state and methods.
 * Eliminates the need to directly import and use React's useContext.
 *
 * Context Access Features:
 * - Current user information and authentication status
 * - Authentication method detection (email vs Google)
 * - Loading states during auth operations
 * - User session management functions
 *
 * @returns Authentication context object or null if outside provider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const auth = useAuth();
 *
 *   if (auth?.loading) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   if (!auth?.userLoggedIn) {
 *     return <LoginForm />;
 *   }
 *
 *   return <div>Welcome, {auth.currentUser?.displayName}!</div>;
 * }
 * ```
 *
 * @note Must be used within AuthProvider component tree
 * @see {@link AuthProvider} for the context provider setup
 * @see {@link AuthContext} for the context definition
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

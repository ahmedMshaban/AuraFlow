import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Flex, Spinner, Text } from '@chakra-ui/react';

import { auth } from '../../auth/firebase/firebase';
import type { AuthContextProviderProps } from '../../types/authContext';
import { AuthContext } from '../context';

/**
 * Authentication context provider that manages user authentication state.
 * Provides centralized auth state management across the entire application.
 * Handles Firebase auth state changes and user session persistence.
 *
 * Context Features:
 * - Real-time auth state monitoring
 * - User session persistence
 * - Authentication method detection (email vs Google)
 * - Loading state management during auth checks
 * - Automatic user initialization
 *
 * State Management:
 * - currentUser: Current authenticated user object
 * - userLoggedIn: Boolean authentication status
 * - isEmailUser: Email/password authentication flag
 * - isGoogleUser: Google OAuth authentication flag
 * - loading: Initial authentication check state
 *
 * @param children - Child components that need access to auth context
 * @returns JSX provider component with loading spinner or children
 *
 * @example
 * ```tsx
 * // Wrap your app with AuthProvider
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes>
 *           <Route path="/login" element={<Login />} />
 *           <Route path="/dashboard" element={<Dashboard />} />
 *         </Routes>
 *       </Router>
 *     </AuthProvider>
 *   );
 * }
 * ```
 *
 * @note Shows loading spinner during initial auth state check
 * @see {@link useAuth} for consuming auth context in components
 */
export function AuthProvider({ children }: AuthContextProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  /**
   * Initializes user authentication state when auth state changes.
   * Called by Firebase onAuthStateChanged listener to update context state.
   * Determines authentication method and sets appropriate flags.
   *
   * Initialization Process:
   * - Updates current user object
   * - Detects authentication provider type
   * - Sets authentication status flags
   * - Completes loading state
   *
   * @param user - Firebase User object or null if signed out
   *
   * @example
   * ```typescript
   * // Called automatically by Firebase auth state listener
   * onAuthStateChanged(auth, initializeUser);
   * ```
   */
  async function initializeUser(user: User | null) {
    if (user) {
      setCurrentUser({ ...user });

      // check if provider is email and password login
      const isEmail = user.providerData.some((provider) => provider.providerId === 'password');
      setIsEmailUser(isEmail);

      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }

    setLoading(false);
  }
  const value = {
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    currentUser,
    setCurrentUser,
    loading,
  };
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="100vh"
          gap={4}
        >
          <Spinner
            color="blue.500"
            size="xl"
          />
          <Text color="gray.600">Checking authentication...</Text>
        </Flex>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

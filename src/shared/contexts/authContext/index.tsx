import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { Flex, Spinner, Text } from '@chakra-ui/react';

import { auth } from '../../auth/firebase/firebase';
import type { AuthContextProviderProps } from '../../types/authContext';
import { AuthContext } from '../context';

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

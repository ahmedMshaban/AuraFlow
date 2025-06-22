import { Navigate } from 'react-router';
import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

interface RouteGuardProps {
  children: React.ReactNode;
  isPublicRoute?: boolean;
}

export function RouteGuard({ children, isPublicRoute = false }: RouteGuardProps) {
  const auth = useAuth();

  if (!auth) {
    // Auth context not available
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (auth.loading) {
    // Still checking authentication status
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        gap={4}
      >
        {' '}
        <Spinner
          color="blue.500"
          size="xl"
        />
        <Text color="gray.600">{isPublicRoute ? 'Loading...' : 'Verifying access...'}</Text>
      </Flex>
    );
  }

  if (isPublicRoute) {
    // This is a public route (login/register)
    if (auth.userLoggedIn) {
      // User is already authenticated, redirect to home
      return (
        <Navigate
          to="/home"
          replace
        />
      );
    }
    // User is not authenticated, show the public route
    return <>{children}</>;
  } else {
    // This is a protected route
    if (!auth.userLoggedIn) {
      // User is not authenticated, redirect to login
      return (
        <Navigate
          to="/login"
          replace
        />
      );
    }
    // User is authenticated, show the protected content
    return <>{children}</>;
  }
}

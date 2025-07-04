import { useState, useEffect, useCallback } from 'react';

// Import individual functions from email modules
import { initializeAuth, isAuthenticated, authenticate, signOut } from '@/shared/services/email/auth/googleAuth';
import { getProfile } from '@/shared/services/email/operations/api';
import { getEmailsByPriority } from '@/shared/services/email/business/categorization';
import { addPriorityToEmails } from '@/shared/services/email/business/priorityClassifier';
import type { GmailAuthStatus, GmailMessageWithStress } from '../types/gmail.types';
import type { ViewType } from '@/shared/hooks/useFilters';

/**
 * Custom hook for Gmail integration with stress analysis
 */
export const useGmail = (selectedView: ViewType) => {
  const [authStatus, setAuthStatus] = useState<GmailAuthStatus>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    profile: null,
    accessToken: null,
  });

  const [focusedEmails, setFocusedEmails] = useState<GmailMessageWithStress[]>([]);
  const [otherEmails, setOtherEmails] = useState<GmailMessageWithStress[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthStatus((prev) => ({ ...prev, isLoading: true }));

      try {
        await initializeAuth();
        const isAuth = isAuthenticated();

        if (isAuth) {
          const profileResponse = await getProfile();
          if (profileResponse.success) {
            setAuthStatus({
              isAuthenticated: true,
              isLoading: false,
              error: null,
              profile: profileResponse.data,
              accessToken: 'present', // Don't expose actual token
            });
          } else {
            setAuthStatus({
              isAuthenticated: false,
              isLoading: false,
              error: profileResponse.error || 'Failed to get profile',
              profile: null,
              accessToken: null,
            });
          }
        } else {
          setAuthStatus({
            isAuthenticated: false,
            isLoading: false,
            error: null,
            profile: null,
            accessToken: null,
          });
        }
      } catch (error) {
        setAuthStatus({
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          profile: null,
          accessToken: null,
        });
      }
    };

    checkAuth();
  }, []);

  // Authenticate with Gmail
  const authenticateUser = useCallback(async (): Promise<boolean> => {
    setAuthStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const authResponse = await authenticate();

      if (authResponse.success) {
        const profileResponse = await getProfile();

        if (profileResponse.success) {
          setAuthStatus({
            isAuthenticated: true,
            isLoading: false,
            error: null,
            profile: profileResponse.data,
            accessToken: 'present',
          });
          return true;
        } else {
          setAuthStatus({
            isAuthenticated: false,
            isLoading: false,
            error: profileResponse.error || 'Failed to get profile',
            profile: null,
            accessToken: null,
          });
          return false;
        }
      } else {
        setAuthStatus({
          isAuthenticated: false,
          isLoading: false,
          error: authResponse.error || 'Authentication failed',
          profile: null,
          accessToken: null,
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthStatus({
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
        profile: null,
        accessToken: null,
      });
      return false;
    }
  }, []);

  // Sign out
  const signOutUser = useCallback(async (): Promise<void> => {
    try {
      await signOut();
      setAuthStatus({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        profile: null,
        accessToken: null,
      });
      setFocusedEmails([]);
      setOtherEmails([]);
      setIsLoadingEmails(false);
      setEmailsError(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Fetch emails categorized by priority with date filtering based on selected view
  const fetchEmailsByPriority = useCallback(
    async (focusedCount: number = 5, otherCount: number = 5): Promise<void> => {
      if (!authStatus.isAuthenticated) {
        setEmailsError('Not authenticated');
        return;
      }

      setIsLoadingEmails(true);
      setEmailsError(null);

      try {
        const emailsResponse = await getEmailsByPriority(
          focusedCount,
          otherCount,
          selectedView, // Pass the selectedView for date filtering
        );

        if (emailsResponse.success) {
          // Convert to emails with stress analysis
          const focusedWithStress = addPriorityToEmails(emailsResponse.data.focused);
          const othersWithStress = addPriorityToEmails(emailsResponse.data.others);

          setFocusedEmails(focusedWithStress);
          setOtherEmails(othersWithStress);
        } else {
          setEmailsError(emailsResponse.error || 'Failed to fetch emails by priority');
          setFocusedEmails([]);
          setOtherEmails([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch emails by priority';
        setEmailsError(errorMessage);
        setFocusedEmails([]);
        setOtherEmails([]);
      } finally {
        setIsLoadingEmails(false);
      }
    },
    [authStatus.isAuthenticated, selectedView],
  );

  return {
    // Authentication state
    authStatus,
    isAuthenticated: authStatus.isAuthenticated,
    isLoading: authStatus.isLoading,
    error: authStatus.error,
    profile: authStatus.profile,

    focusedEmails,
    otherEmails,
    isLoadingEmails,
    emailsError,

    // Actions
    authenticate: authenticateUser,
    signOut: signOutUser,
    fetchEmailsByPriority,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { gmailService } from '../services/gmailService';
import type { GmailAuthStatus, GmailMessageWithStress } from '../types/gmail.types';

/**
 * Custom hook for Gmail integration with stress analysis
 */
export const useGmail = () => {
  const [authStatus, setAuthStatus] = useState<GmailAuthStatus>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    profile: null,
    accessToken: null,
  });

  const [emails, setEmails] = useState<GmailMessageWithStress[]>([]);
  const [focusedEmails, setFocusedEmails] = useState<GmailMessageWithStress[]>([]);
  const [otherEmails, setOtherEmails] = useState<GmailMessageWithStress[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailsError, setEmailsError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthStatus((prev) => ({ ...prev, isLoading: true }));

      try {
        await gmailService.initialize();
        const isAuth = gmailService.isAuthenticated();

        if (isAuth) {
          const profileResponse = await gmailService.getProfile();
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
  const authenticate = useCallback(async (): Promise<boolean> => {
    setAuthStatus((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const authResponse = await gmailService.authenticate();

      if (authResponse.success) {
        const profileResponse = await gmailService.getProfile();

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
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await gmailService.signOut();
      setAuthStatus({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        profile: null,
        accessToken: null,
      });
      setEmails([]);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Fetch emails categorized by priority
  const fetchEmailsByPriority = useCallback(
    async (focusedCount: number = 5, otherCount: number = 5): Promise<void> => {
      if (!authStatus.isAuthenticated) {
        setEmailsError('Not authenticated');
        return;
      }

      setIsLoadingEmails(true);
      setEmailsError(null);

      try {
        const emailsResponse = await gmailService.getEmailsByPriority(focusedCount, otherCount);

        if (emailsResponse.success) {
          // Set the separated emails
          setFocusedEmails(emailsResponse.data.focused);
          setOtherEmails(emailsResponse.data.others);

          // Also combine for backward compatibility
          const combinedEmails = [...emailsResponse.data.focused, ...emailsResponse.data.others];
          setEmails(combinedEmails);
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
    [authStatus.isAuthenticated],
  );

  return {
    // Authentication state
    authStatus,
    isAuthenticated: authStatus.isAuthenticated,
    isLoading: authStatus.isLoading,
    error: authStatus.error,
    profile: authStatus.profile,

    // Email data
    emails,
    focusedEmails, // Add this
    otherEmails,
    isLoadingEmails,
    emailsError,

    // Actions
    authenticate,
    signOut,
    fetchEmailsByPriority,
  };
};

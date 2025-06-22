import { useState, useEffect, useCallback } from 'react';
import { gmailService } from '../services/gmailService';
import type { GmailAuthStatus, GmailMessage, GmailMessageWithStress, GmailQueryParams } from '../types/gmail.types';

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

  // Fetch emails with stress analysis
  const fetchEmails = useCallback(
    async (params: GmailQueryParams = {}): Promise<void> => {
      if (!authStatus.isAuthenticated) {
        setEmailsError('Not authenticated');
        return;
      }

      setIsLoadingEmails(true);
      setEmailsError(null);

      try {
        const emailsResponse = await gmailService.getEmailsWithStressAnalysis(params);

        if (emailsResponse.success) {
          setEmails(emailsResponse.data);
        } else {
          setEmailsError(emailsResponse.error || 'Failed to fetch emails');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch emails';
        setEmailsError(errorMessage);
      } finally {
        setIsLoadingEmails(false);
      }
    },
    [authStatus.isAuthenticated],
  );

  // Get emails without stress analysis
  const fetchEmailsBasic = useCallback(
    async (params: GmailQueryParams = {}): Promise<GmailMessage[]> => {
      if (!authStatus.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      const emailsResponse = await gmailService.getEmails(params);

      if (emailsResponse.success) {
        return emailsResponse.data.messages;
      } else {
        throw new Error(emailsResponse.error || 'Failed to fetch emails');
      }
    },
    [authStatus.isAuthenticated],
  );

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
          // Combine both categories for the existing emails state
          const combinedEmails = [...emailsResponse.data.focused, ...emailsResponse.data.others];
          setEmails(combinedEmails);
        } else {
          setEmailsError(emailsResponse.error || 'Failed to fetch emails by priority');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch emails by priority';
        setEmailsError(errorMessage);
      } finally {
        setIsLoadingEmails(false);
      }
    },
    [authStatus.isAuthenticated],
  );

  // Calculate stress statistics from current emails
  const getStressStatistics = useCallback(() => {
    if (emails.length === 0) {
      return {
        totalEmails: 0,
        highStressEmails: 0,
        mediumStressEmails: 0,
        lowStressEmails: 0,
        averageStressScore: 0,
        mostStressfulEmail: null,
      };
    }

    const highStressEmails = emails.filter((email) => email.stressAnalysis?.priority === 'high');
    const mediumStressEmails = emails.filter((email) => email.stressAnalysis?.priority === 'medium');
    const lowStressEmails = emails.filter((email) => email.stressAnalysis?.priority === 'low');

    const totalStressScore = emails.reduce((sum, email) => sum + (email.stressAnalysis?.stressScore || 0), 0);
    const averageStressScore = totalStressScore / emails.length;

    const mostStressfulEmail = emails.reduce((highest, current) => {
      const currentScore = current.stressAnalysis?.stressScore || 0;
      const highestScore = highest?.stressAnalysis?.stressScore || 0;
      return currentScore > highestScore ? current : highest;
    }, emails[0]);

    return {
      totalEmails: emails.length,
      highStressEmails: highStressEmails.length,
      mediumStressEmails: mediumStressEmails.length,
      lowStressEmails: lowStressEmails.length,
      averageStressScore: Math.round(averageStressScore),
      mostStressfulEmail,
    };
  }, [emails]);

  return {
    // Authentication state
    authStatus,
    isAuthenticated: authStatus.isAuthenticated,
    isLoading: authStatus.isLoading,
    error: authStatus.error,
    profile: authStatus.profile,

    // Email data
    emails,
    isLoadingEmails,
    emailsError,

    // Actions
    authenticate,
    signOut,
    fetchEmails,
    fetchEmailsBasic,
    fetchEmailsByPriority,

    // Analytics
    getStressStatistics,
  };
};

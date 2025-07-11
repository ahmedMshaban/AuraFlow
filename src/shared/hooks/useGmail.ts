import { useState, useEffect, useCallback } from 'react';

// Import individual functions from email modules
import { initializeAuth, isAuthenticated, authenticate, signOut } from '@/shared/services/email/auth/googleAuth';
import { getProfile } from '@/shared/services/email/operations/api';
import { getEmailsByPriority } from '@/shared/services/email/business/categorization';
import { addPriorityToEmails } from '@/shared/services/email/business/priorityClassifier';
import type { GmailAuthStatus, GmailMessageWithStress } from '../types/gmail.types';
import type { ViewType } from '@/shared/hooks/useFilters';

/**
 * Comprehensive hook for Gmail integration with stress-aware email management.
 * Provides complete email functionality including authentication, fetching, searching,
 * and stress-based prioritization of messages.
 *
 * Core Features:
 * - Gmail OAuth authentication and session management
 * - Stress-aware email categorization (focused vs other)
 * - View-based date filtering (day/week/month)
 * - Real-time email search with stress analysis
 * - Priority classification for better email management
 *
 * Authentication Flow:
 * - Automatic auth status checking on mount
 * - Google OAuth popup authentication
 * - Profile information retrieval
 * - Secure session management
 *
 * Email Management:
 * - Categorizes emails by stress-based priority
 * - Applies date filters based on selected view
 * - Provides search functionality with stress analysis
 * - Maintains separate focused and other email lists
 *
 * @param selectedView - Current time-based view filter for date range filtering
 * @returns Object containing auth state, email data, and management functions
 *
 * @example
 * ```tsx
 * function EmailDashboard() {
 *   const { selectedView } = useFilters();
 *   const {
 *     isAuthenticated,
 *     focusedEmails,
 *     otherEmails,
 *     authenticate,
 *     fetchEmailsByPriority,
 *     searchEmails
 *   } = useGmail(selectedView);
 *
 *   if (!isAuthenticated) {
 *     return <Button onClick={authenticate}>Connect Gmail</Button>;
 *   }
 *
 *   return (
 *     <div>
 *       <EmailList title="Priority Emails" emails={focusedEmails} />
 *       <EmailList title="Other Emails" emails={otherEmails} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @note Integrates with stress monitoring for intelligent email prioritization
 * @see {@link useFilters} for view-based filtering
 * @see {@link useStressMonitoring} for stress analysis integration
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
  const [searchResults, setSearchResults] = useState<GmailMessageWithStress[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('');

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

  // Search emails function
  const searchEmails = useCallback(
    async (query: string, maxResults = 20) => {
      if (!authStatus.isAuthenticated || !query.trim()) {
        return;
      }

      setIsSearching(true);
      setSearchError(null);
      setCurrentSearchQuery(query);

      try {
        // Import getEmails and date utils here to avoid circular dependencies
        const { getEmails } = await import('@/shared/services/email/operations/api');
        const { getDateQueryForView } = await import('@/shared/services/email/utils/dateUtils');

        // Get date query for the selected view to filter search results
        const dateQuery = getDateQueryForView(selectedView);

        // Combine user search query with date filter
        const combinedQuery = dateQuery ? `${query} ${dateQuery}` : query;

        const response = await getEmails({
          q: combinedQuery,
          maxResults,
        });

        if (response.success) {
          // Add stress analysis to search results
          const emailsWithStress = await addPriorityToEmails(response.data.messages);
          setSearchResults(emailsWithStress);
        } else {
          setSearchError(response.error || 'Failed to search emails');
          setSearchResults([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search emails';
        setSearchError(errorMessage);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [authStatus.isAuthenticated, selectedView],
  );

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setCurrentSearchQuery('');
  }, []);

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

    // Search state
    searchResults,
    isSearching,
    searchError,
    currentSearchQuery,

    // Actions
    authenticate: authenticateUser,
    signOut: signOutUser,
    fetchEmailsByPriority,
    searchEmails,
    clearSearch,
  };
};

import { FaColumns } from 'react-icons/fa';

import { useStressAnalytics } from '@/shared/hooks/useStressAnalytics';
import useFilters from '@/shared/hooks/useFilters';
import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';
import { useGmail } from '@/shared/hooks/useGmail';

import styles from '../home/infrastructure/styles/home.module.css';
import Emails from '../home/components/emails/Emails';
import Filters from '../home/components/Filters';

/**
 * The main emails page component providing comprehensive email management functionality.
 * Integrates Gmail API access, stress-aware filtering, and advanced search capabilities
 * within a responsive sidebar layout with intelligent email prioritization.
 *
 * Key Features:
 * - Gmail authentication and profile management
 * - Stress-adaptive email filtering and prioritization
 * - Advanced email search with context-aware results
 * - Time-based filtering (today, week, month views)
 * - Sidebar navigation with toggle functionality
 * - Responsive design with mobile considerations
 * - Error handling and loading states
 *
 * Email Management:
 * - Fetches and categorizes emails by stress level and importance
 * - Provides focused vs. other email separation
 * - Supports up to 20 emails display for comprehensive view
 * - Real-time search across email content, subjects, and senders
 * - Filter-aware search results with contextual information
 *
 * Stress Integration:
 * - Adapts interface based on current user stress level
 * - Prioritizes important emails during high stress periods
 * - Provides stress-aware messaging and guidance
 * - Filters email recommendations based on stress state
 *
 * @returns A complete email management interface
 *
 * @example
 * ```tsx
 * // Basic usage - renders the full emails page
 * <EmailsPage />
 *
 * // The component automatically handles:
 * // - Gmail authentication flow
 * // - Stress level detection and adaptation
 * // - Email filtering and search
 * // - Sidebar state management
 * ```
 *
 * @note This component serves as the main entry point for email functionality
 * @note Integrates with multiple shared hooks for comprehensive state management
 * @see {@link useGmail} For Gmail integration and email management
 * @see {@link useStressAnalytics} For stress level detection
 * @see {@link useFilters} For time-based email filtering
 * @see {@link useSidebar} For sidebar state management
 */
const EmailsPage = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { selectedView, setSelectedView } = useFilters();
  const { isCurrentlyStressed } = useStressAnalytics();
  const {
    isAuthenticated,
    isLoading,
    error,
    profile,
    focusedEmails,
    otherEmails,
    isLoadingEmails,
    emailsError,
    searchResults,
    isSearching,
    searchError,
    currentSearchQuery,
    authenticate,
    signOut,
    fetchEmailsByPriority,
    searchEmails,
    clearSearch,
  } = useGmail(selectedView);

  return (
    <div className={styles.homePageContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.mainContentContainer}>
          <div
            className={styles.sidebarToggleButton}
            onClick={toggleSidebar}
            title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          >
            <FaColumns size={32} />
          </div>

          <div className={styles.workAreasContainer}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Email Management</h1>
              <p className={styles.pageSubtitle}>
                {isCurrentlyStressed
                  ? 'Focus on your important emails to reduce stress'
                  : 'Manage and organize all your emails with intelligent filtering'}
              </p>
            </div>

            <Filters
              selectedView={selectedView}
              setSelectedView={setSelectedView}
              isCurrentlyStressed={isCurrentlyStressed}
              numOfFocusedEmails={focusedEmails.length}
              numOfOtherEmails={otherEmails.length}
              isLoadingEmails={isLoadingEmails}
              showEmails={true}
              showTasks={false}
            />

            <div className={styles.workAreas}>
              <div className={styles.workArea}>
                <div className={styles.workAreaContent}>
                  <Emails
                    maxEmails={20} // Fetch more emails for the full emails page
                    isAuthenticated={isAuthenticated}
                    isLoading={isLoading}
                    error={error}
                    profile={profile}
                    focusedEmails={focusedEmails}
                    otherEmails={otherEmails}
                    isLoadingEmails={isLoadingEmails}
                    emailsError={emailsError}
                    authenticate={authenticate}
                    signOut={signOut}
                    fetchEmailsByPriority={fetchEmailsByPriority}
                    isHomePage={false} // This indicates it's the full emails page
                    searchResults={searchResults}
                    isSearching={isSearching}
                    searchError={searchError}
                    currentSearchQuery={currentSearchQuery}
                    searchEmails={searchEmails}
                    clearSearch={clearSearch}
                    selectedView={selectedView}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default EmailsPage;

import { FaColumns } from 'react-icons/fa';

import { useStressAnalytics } from '@/shared/hooks/useStressAnalytics';
import useFilters from '@/shared/hooks/useFilters';
import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';
import { useGmail } from '@/shared/hooks/useGmail';

import styles from '../home/infrastructure/styles/home.module.css';
import Emails from '../home/components/emails/Emails';
import Filters from '../home/components/Filters';

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

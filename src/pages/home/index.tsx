import { FaColumns } from 'react-icons/fa';

import { useStressAnalytics } from '@/shared/hooks/useStressAnalytics';
import useFilters from '@/shared/hooks/useFilters';
import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';
import { useGmail } from '@/shared/hooks/useGmail';
import { useTasks } from '@/shared/hooks/useTasks';

import styles from './infrastructure/styles/home.module.css';
import Greeting from './components/Greeting';
import Filters from './components/Filters';
import Emails from './components/emails/Emails';
import Tasks from './components/tasks/Tasks';
import { getEmailDescription, getTaskDescription } from './infrastructure/helpers/getWorkAreaDescription';

/**
 * The main home page component that serves as the central dashboard for AuraFlow.
 * Integrates stress monitoring, email management, task tracking, and wellness features
 * into a unified, stress-adaptive interface that prioritizes user wellbeing.
 *
 * Key Features:
 * - Personalized greeting with time-appropriate messaging
 * - Stress-adaptive email prioritization and management
 * - Mindful task management with wellbeing focus
 * - Real-time stress monitoring integration
 * - Time-based filtering (Today, This Week, This Month)
 * - Responsive sidebar navigation
 * - Intelligent content organization based on stress levels
 *
 * Stress-Adaptive Behavior:
 * - When stressed: Prioritizes important emails, focuses on manageable tasks
 * - When calm: Shows comprehensive view with full productivity features
 * - Adaptive messaging and guidance based on current stress state
 * - Automatically adjusts interface complexity and options
 *
 * Layout Structure:
 * - Header: Personalized greeting with date and time-based message
 * - Filters: Time-based view controls with statistics display
 * - Work Areas: Split-screen layout with emails and tasks
 * - Sidebar: Navigation and additional tools (collapsible)
 *
 * Integration Points:
 * - Gmail API for email management and prioritization
 * - Task management system with CRUD operations
 * - Real-time stress monitoring and analytics
 * - Authentication and user profile management
 * - Responsive design for various screen sizes
 *
 * @returns The complete home page interface with all integrated features
 *
 * @example
 * ```tsx
 * // Basic usage - renders the complete home dashboard
 * <Home />
 *
 * // The component automatically handles:
 * // - User authentication and profile loading
 * // - Stress level detection and interface adaptation
 * // - Email fetching and intelligent categorization
 * // - Task loading and management
 * // - Time-based filtering and data organization
 * ```
 *
 * @note This component serves as the main entry point and orchestrates all major features
 * @note All sub-components receive stress state for adaptive behavior
 * @see {@link useStressAnalytics} For real-time stress monitoring
 * @see {@link useGmail} For email management and prioritization
 * @see {@link useTasks} For task management functionality
 * @see {@link useFilters} For time-based view filtering
 * @see {@link useSidebar} For navigation state management
 */
const Home = () => {
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
    authenticate,
    signOut,
    fetchEmailsByPriority,
  } = useGmail(selectedView);
  const {
    upcomingTasks,
    overdueTasks,
    completedTasks,
    taskStats,
    isLoading: isTasksLoading,
    error: tasksError,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    isCreating,
  } = useTasks(selectedView);

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

          <Greeting />

          <div className={styles.workAreasContainer}>
            <Filters
              selectedView={selectedView}
              setSelectedView={setSelectedView}
              isCurrentlyStressed={isCurrentlyStressed}
              numOfFocusedEmails={focusedEmails.length}
              numOfOtherEmails={otherEmails.length}
              isLoadingEmails={isLoadingEmails}
              taskStats={taskStats}
              isLoadingTasks={isTasksLoading}
              showEmails={true}
              showTasks={true}
            />
            <div className={styles.workAreas}>
              <div
                className={styles.workArea}
                data-status={isLoadingEmails ? 'loading' : emailsError ? 'error' : 'success'}
              >
                <div className={styles.workAreaHeader}>
                  <h2 className={styles.workAreaTitle}>📧 Smart Email Management</h2>
                  <p className={styles.workAreaSubtitle}>{getEmailDescription(isCurrentlyStressed)}</p>
                </div>
                <div className={styles.workAreaContent}>
                  <Emails
                    maxEmails={10} // Fetch more emails for better categorization
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
                    isHomePage={true} // This indicates it's on the home page (with limits)
                    selectedView={selectedView} // Pass the current filter to ensure consistency
                  />
                </div>
              </div>
              <div className={styles.workArea}>
                <div className={styles.workAreaHeader}>
                  <h2 className={styles.workAreaTitle}>✅ Mindful Task Management</h2>
                  <p className={styles.workAreaSubtitle}>{getTaskDescription(isCurrentlyStressed)}</p>
                </div>
                <div className={styles.workAreaContent}>
                  <Tasks
                    upcomingTasks={upcomingTasks}
                    overdueTasks={overdueTasks}
                    completedTasks={completedTasks}
                    taskStats={taskStats}
                    isLoading={isTasksLoading}
                    error={tasksError}
                    createTask={createTask}
                    updateTask={updateTask}
                    deleteTask={deleteTask}
                    toggleTaskStatus={toggleTaskStatus}
                    isCreating={isCreating}
                    isCurrentlyStressed={isCurrentlyStressed}
                    currentView={selectedView}
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

export default Home;

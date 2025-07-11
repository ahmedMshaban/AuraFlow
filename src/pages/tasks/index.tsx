import { FaColumns } from 'react-icons/fa';

import { useStressAnalytics } from '@/shared/hooks/useStressAnalytics';
import useFilters from '@/shared/hooks/useFilters';
import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';
import { useTasks } from '@/shared/hooks/useTasks';

import styles from '../home/infrastructure/styles/home.module.css';
import Tasks from '../home/components/tasks/Tasks';
import Filters from '../home/components/Filters';

/**
 * The dedicated tasks page component providing comprehensive task management functionality.
 * Offers a full-featured task management interface with stress-adaptive behavior,
 * time-based filtering, and focused productivity tools within a responsive sidebar layout.
 *
 * Key Features:
 * - Full-page task management with unlimited task display
 * - Stress-adaptive interface that prioritizes wellbeing over productivity
 * - Time-based filtering (Today, This Week, This Month)
 * - Comprehensive CRUD operations for task management
 * - Sidebar navigation with toggle functionality
 * - Real-time stress monitoring integration
 * - Responsive design for various screen sizes
 *
 * Task Management:
 * - Complete task lifecycle management (create, read, update, delete)
 * - Intelligent task categorization (upcoming, overdue, completed)
 * - Priority-based task organization with visual indicators
 * - Status tracking with completion toggling
 * - Time-based filtering for contextual task views
 * - Stress-adaptive task recommendations and guidance
 *
 * Stress Integration:
 * - Adapts interface messaging based on current stress level
 * - Prioritizes manageable tasks during high stress periods
 * - Provides stress-aware guidance and recommendations
 * - Emphasizes wellbeing over pure productivity metrics
 * - Shows focused task subsets when stress is detected
 *
 * Layout Structure:
 * - Header: Page title with stress-adaptive subtitle messaging
 * - Filters: Time-based view controls with task statistics
 * - Work Area: Full-featured task management interface
 * - Sidebar: Navigation and additional tools (collapsible)
 *
 * @returns A complete dedicated task management page
 *
 * @example
 * ```tsx
 * // Basic usage - renders the full tasks page
 * <TasksPage />
 *
 * // The component automatically handles:
 * // - Task loading and management operations
 * // - Stress level detection and interface adaptation
 * // - Time-based filtering and organization
 * // - Sidebar state management
 * ```
 *
 * @note This component provides the full task management experience (vs. home page preview)
 * @note All task operations integrate with stress monitoring for user wellbeing
 * @see {@link useTasks} For comprehensive task management functionality
 * @see {@link useStressAnalytics} For stress-adaptive behavior
 * @see {@link useFilters} For time-based task filtering
 * @see {@link useSidebar} For navigation state management
 * @see {@link Tasks} For the core task management component
 */
const TasksPage = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { selectedView, setSelectedView } = useFilters();
  const { isCurrentlyStressed } = useStressAnalytics();
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

          <div className={styles.workAreasContainer}>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Task Management</h1>
              <p className={styles.pageSubtitle}>
                {isCurrentlyStressed
                  ? 'Focus on your priority tasks to reduce stress'
                  : 'Organize and manage all your tasks effectively'}
              </p>
            </div>

            <Filters
              selectedView={selectedView}
              setSelectedView={setSelectedView}
              isCurrentlyStressed={isCurrentlyStressed}
              taskStats={taskStats}
              isLoadingTasks={isTasksLoading}
              showEmails={false}
              showTasks={true}
            />

            <div className={styles.workAreas}>
              <div className={styles.workArea}>
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
                    isHomePage={false} // This indicates it's the full tasks page
                    currentView={selectedView} // Pass the current filter view
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

export default TasksPage;

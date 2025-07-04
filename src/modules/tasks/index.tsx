import { FaColumns } from 'react-icons/fa';

import { useStressAnalytics } from '@/shared/hooks/useStressAnalytics';
import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';
import { useTasks } from '@/shared/hooks/useTasks';

import styles from '../home/infrastructure/styles/home.module.css';
import Tasks from '../home/components/tasks/Tasks';

const TasksPage = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { isCurrentlyStressed } = useStressAnalytics();
  const {
    upcomingTasks,
    overdueTasks,
    completedTasks,
    taskStats,
    isLoading: isTasksLoading,
    error: tasksError,
    createTask,
    deleteTask,
    toggleTaskStatus,
    isCreating,
  } = useTasks();

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
              <h1 className={styles.pageTitle}>✅ Task Management</h1>
              <p className={styles.pageSubtitle}>
                {isCurrentlyStressed
                  ? 'Focus on your priority tasks to reduce stress'
                  : 'Organize and manage all your tasks effectively'}
              </p>
            </div>

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
                    deleteTask={deleteTask}
                    toggleTaskStatus={toggleTaskStatus}
                    isCreating={isCreating}
                    isCurrentlyStressed={isCurrentlyStressed}
                    isHomePage={false} // This indicates it's the full tasks page
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

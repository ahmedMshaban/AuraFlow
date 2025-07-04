import type { TaskStats, Task } from '@/shared/types/task.types';

/**
 * Get task tabs configuration based on stress mode and task data
 * Adapts the tab structure to reduce cognitive load when user is stressed
 *
 * @param upcomingTasks - Array of upcoming/pending tasks
 * @param overdueTasks - Array of overdue tasks
 * @param completedTasks - Array of completed tasks
 * @param taskStats - Task statistics object with counts
 * @param isCurrentlyStressed - Whether the user is currently experiencing stress
 * @param isHomePage - Whether this is being rendered on the home page (limits to 5 tasks per tab)
 * @returns Array of tab configuration objects with key, label, count, tasks, color, and description
 *
 * @example
 * ```typescript
 * // Normal mode - full tab experience
 * getTabsForMode(upcoming, overdue, completed, stats, false, false)
 * // Returns: [
 * //   { key: 'upcoming', label: 'Upcoming', count: 5, tasks: [...], color: 'blue', description: 'Plan your future tasks' },
 * //   { key: 'overdue', label: 'Overdue', count: 2, tasks: [...], color: 'red', description: 'Catch up on missed deadlines' },
 * //   { key: 'completed', label: 'Completed', count: 8, tasks: [...], color: 'green', description: 'Celebrate your achievements' }
 * // ]
 *
 * // Home page mode - limited to 5 tasks per tab
 * getTabsForMode(upcoming, overdue, completed, stats, false, true)
 * // Returns same structure but with maximum 5 tasks per tab
 *
 * // Stressed mode - simplified priority focus
 * getTabsForMode(upcoming, overdue, completed, stats, true, false)
 * // Returns: [
 * //   { key: 'priority', label: 'Priority', count: 3, tasks: [...], color: 'orange', description: 'Focus on what matters most' }
 * // ]
 * ```
 */
const getTabsForMode = (
  upcomingTasks: Task[],
  overdueTasks: Task[],
  completedTasks: Task[],
  taskStats: TaskStats,
  isCurrentlyStressed: boolean,
  isHomePage: boolean = false,
): Array<{
  key: 'upcoming' | 'overdue' | 'completed' | 'priority';
  label: string;
  count: number;
  tasks: Task[];
  color: string;
  description: string;
  hasMore?: boolean; // Indicates if there are more tasks than the displayed limit
}> => {
  const TASK_LIMIT = 5;

  // Helper function to limit tasks and add hasMore indicator
  const limitTasks = (tasks: Task[]) => {
    if (!isHomePage) return { limitedTasks: tasks, hasMore: false };
    return {
      limitedTasks: tasks.slice(0, TASK_LIMIT),
      hasMore: tasks.length > TASK_LIMIT,
    };
  };

  if (isCurrentlyStressed) {
    // STRESS MODE: Simplified tabs focusing on immediate priorities
    const priorityTasks = [...overdueTasks, ...upcomingTasks.filter((task) => task.priority === 'high')];
    const { limitedTasks, hasMore } = limitTasks(priorityTasks);

    return [
      {
        key: 'priority' as const,
        label: 'Priority',
        count: priorityTasks.length,
        tasks: limitedTasks,
        color: 'orange',
        description: 'Focus on what matters most',
        hasMore,
      },
    ];
  } else {
    // NORMAL MODE: Full tab experience
    const { limitedTasks: limitedUpcoming, hasMore: upcomingHasMore } = limitTasks(upcomingTasks);
    const { limitedTasks: limitedOverdue, hasMore: overdueHasMore } = limitTasks(overdueTasks);
    const { limitedTasks: limitedCompleted, hasMore: completedHasMore } = limitTasks(completedTasks);

    return [
      {
        key: 'upcoming' as const,
        label: 'Upcoming',
        count: taskStats.pending,
        tasks: limitedUpcoming,
        color: 'blue',
        description: 'Plan your future tasks',
        hasMore: upcomingHasMore,
      },
      {
        key: 'overdue' as const,
        label: 'Overdue',
        count: taskStats.overdue,
        tasks: limitedOverdue,
        color: 'red',
        description: 'Catch up on missed deadlines',
        hasMore: overdueHasMore,
      },
      {
        key: 'completed' as const,
        label: 'Completed',
        count: taskStats.completed,
        tasks: limitedCompleted,
        color: 'green',
        description: 'Celebrate your achievements',
        hasMore: completedHasMore,
      },
    ];
  }
};

export default getTabsForMode;

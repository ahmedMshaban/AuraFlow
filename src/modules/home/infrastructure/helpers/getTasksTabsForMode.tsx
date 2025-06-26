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
 * @returns Array of tab configuration objects with key, label, count, tasks, color, and description
 * 
 * @example
 * ```typescript
 * // Normal mode - full tab experience
 * getTabsForMode(upcoming, overdue, completed, stats, false)
 * // Returns: [
 * //   { key: 'upcoming', label: 'Upcoming', count: 5, tasks: [...], color: 'blue', description: 'Plan your future tasks' },
 * //   { key: 'overdue', label: 'Overdue', count: 2, tasks: [...], color: 'red', description: 'Catch up on missed deadlines' },
 * //   { key: 'completed', label: 'Completed', count: 8, tasks: [...], color: 'green', description: 'Celebrate your achievements' }
 * // ]
 * 
 * // Stressed mode - simplified priority focus
 * getTabsForMode(upcoming, overdue, completed, stats, true)
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
): Array<{
  key: 'upcoming' | 'overdue' | 'completed' | 'priority';
  label: string;
  count: number;
  tasks: Task[];
  color: string;
  description: string;
}> => {
  if (isCurrentlyStressed) {
    // STRESS MODE: Simplified tabs focusing on immediate priorities
    const priorityTasks = [...overdueTasks, ...upcomingTasks.filter((task) => task.priority === 'high')];

    return [
      {
        key: 'priority' as const,
        label: 'Priority',
        count: priorityTasks.length,
        tasks: priorityTasks,
        color: 'orange',
        description: 'Focus on what matters most',
      },
    ];
  } else {
    // NORMAL MODE: Full tab experience
    return [
      {
        key: 'upcoming' as const,
        label: 'Upcoming',
        count: taskStats.pending,
        tasks: upcomingTasks,
        color: 'blue',
        description: 'Plan your future tasks',
      },
      {
        key: 'overdue' as const,
        label: 'Overdue',
        count: taskStats.overdue,
        tasks: overdueTasks,
        color: 'red',
        description: 'Catch up on missed deadlines',
      },
      {
        key: 'completed' as const,
        label: 'Completed',
        count: taskStats.completed,
        tasks: completedTasks,
        color: 'green',
        description: 'Celebrate your achievements',
      },
    ];
  }
};

export default getTabsForMode;

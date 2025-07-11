import type { Task } from '@/shared/types/task.types';

/**
 * Limits tasks to a specified maximum count for display purposes
 * Used primarily on the home page to show a preview of tasks with a "View All" option
 *
 * @param tasks - Array of tasks to potentially limit
 * @param isHomePage - Whether this is being rendered on the home page (limits tasks)
 * @param limit - Maximum number of tasks to return (default: 5)
 * @returns Object containing limited tasks array and hasMore boolean indicator
 *
 * @example
 * ```typescript
 * // Home page mode - limit to 5 tasks
 * const { limitedTasks, hasMore } = limitTasks(tasks, true, 5);
 * // Returns: { limitedTasks: [first 5 tasks], hasMore: true if >5 tasks }
 *
 * // Full page mode - no limiting
 * const { limitedTasks, hasMore } = limitTasks(tasks, false, 5);
 * // Returns: { limitedTasks: [all tasks], hasMore: false }
 * ```
 */
const limitTasks = (
  tasks: Task[],
  isHomePage: boolean,
  limit: number = 5,
): {
  limitedTasks: Task[];
  hasMore: boolean;
} => {
  if (!isHomePage) {
    return {
      limitedTasks: tasks,
      hasMore: false,
    };
  }

  return {
    limitedTasks: tasks.slice(0, limit),
    hasMore: tasks.length > limit,
  };
};

export default limitTasks;

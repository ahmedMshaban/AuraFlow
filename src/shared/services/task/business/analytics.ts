import type { Task, TaskStats } from '@/shared/types/task.types';
import { getStandardDateRanges } from '../utils/dateUtils';

/**
 * Generates comprehensive task statistics from a collection of tasks.
 * Provides detailed analytics for task management dashboards and productivity insights.
 * Calculates time-based task distributions and status breakdowns for better planning.
 *
 * Statistics Generated:
 * - Total task count across all statuses
 * - Status-based categorization (pending, completed, overdue)
 * - Time-sensitive due date tracking (today, week, month)
 * - Productivity metrics for dashboard visualization
 *
 * Date Range Analysis:
 * - Today's tasks: Due within current day (excludes completed)
 * - This week's tasks: Due within 7 days from today
 * - This month's tasks: Due within 30 days from today
 * - Overdue tracking for urgent attention
 *
 * @param tasks - Array of task objects to analyze
 * @returns TaskStats object containing comprehensive task analytics
 *
 * @example
 * ```typescript
 * const userTasks = await getUserTasks();
 * const stats = getTaskStats(userTasks);
 *
 * console.log(`Total: ${stats.total}, Today: ${stats.todayDue}`);
 * // Display stats in dashboard components
 * <TaskStatsDashboard stats={stats} />
 * ```
 *
 * @note Excludes completed tasks from due date calculations
 * @see {@link getStandardDateRanges} for date range calculation logic
 */
export function getTaskStats(tasks: Task[]): TaskStats {
  const { today, tomorrow, weekFromNow, monthFromNow } = getStandardDateRanges();

  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => t.status === 'overdue').length,
    todayDue: tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      return taskDate >= today && taskDate < tomorrow && t.status !== 'completed';
    }).length,
    thisWeekDue: tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      return taskDate >= today && taskDate < weekFromNow && t.status !== 'completed';
    }).length,
    thisMonthDue: tasks.filter((t) => {
      const taskDate = new Date(t.dueDate);
      return taskDate >= today && taskDate < monthFromNow && t.status !== 'completed';
    }).length,
  };
}

/**
 * Categorizes tasks into logical status-based groups for organized task management.
 * Provides clean separation of task states for different UI sections and workflows.
 * Enables efficient task organization and focused productivity interfaces.
 *
 * Categorization Logic:
 * - Upcoming: All pending tasks that need attention
 * - Overdue: Tasks past their due date requiring immediate action
 * - Completed: Finished tasks for progress tracking and history
 *
 * Use Cases:
 * - Dashboard sections showing different task priorities
 * - Kanban-style task boards with status columns
 * - Progress tracking and completion analytics
 * - Filtered task views based on urgency
 *
 * @param tasks - Array of tasks to categorize by status
 * @returns Object containing categorized task arrays
 *
 * @example
 * ```typescript
 * const allTasks = await fetchUserTasks();
 * const { upcoming, overdue, completed } = categorizeTasks(allTasks);
 *
 * return (
 *   <TaskBoard>
 *     <TaskColumn title="To Do" tasks={upcoming} />
 *     <TaskColumn title="Overdue" tasks={overdue} urgent />
 *     <TaskColumn title="Done" tasks={completed} />
 *   </TaskBoard>
 * );
 * ```
 *
 * @note Task status should be updated separately for overdue detection
 * @see {@link getTaskStats} for numerical task analytics
 */
export function categorizeTasks(tasks: Task[]) {
  return {
    upcoming: tasks.filter((task) => task.status === 'pending'),
    overdue: tasks.filter((task) => task.status === 'overdue'),
    completed: tasks.filter((task) => task.status === 'completed'),
  };
}

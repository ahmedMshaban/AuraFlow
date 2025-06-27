import type { Task } from '@/shared/types/task.types';
import { getDateRangeForView } from '../utils/dateUtils';
import { filterTasksByDateRange } from '../utils/filterUtils';

/**
 * Get tasks filtered by date range based on view type
 */
export function getTasksByDateRange(tasks: Task[], viewType: 'my-day' | 'my-week' | 'my-month'): Task[] {
  const { startDate, endDate } = getDateRangeForView(viewType);
  return filterTasksByDateRange(tasks, startDate, endDate);
}

/**
 * Get tasks for today's view
 */
export function getTodayTasks(tasks: Task[]): Task[] {
  return getTasksByDateRange(tasks, 'my-day');
}

/**
 * Get tasks for this week's view
 */
export function getWeekTasks(tasks: Task[]): Task[] {
  return getTasksByDateRange(tasks, 'my-week');
}

/**
 * Get tasks for this month's view
 */
export function getMonthTasks(tasks: Task[]): Task[] {
  return getTasksByDateRange(tasks, 'my-month');
}

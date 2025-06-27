import type { Task, TaskStats } from '@/shared/types/task.types';
import { getStandardDateRanges } from '../utils/dateUtils';

/**
 * Generate task statistics from a list of tasks
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
 * Categorize tasks into different status groups
 */
export function categorizeTasks(tasks: Task[]) {
  return {
    upcoming: tasks.filter((task) => task.status === 'pending'),
    overdue: tasks.filter((task) => task.status === 'overdue'),
    completed: tasks.filter((task) => task.status === 'completed'),
  };
}

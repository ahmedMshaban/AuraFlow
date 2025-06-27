import type { Task, TaskFilters } from '@/shared/types/task.types';

/**
 * Apply filters to a list of tasks
 */
export function applyFilters(tasks: Task[], filters?: TaskFilters): Task[] {
  if (!filters) return tasks;

  let filteredTasks = [...tasks];

  if (filters.status && filters.status.length > 0) {
    filteredTasks = filteredTasks.filter((task) => filters.status!.includes(task.status));
  }

  if (filters.priority && filters.priority.length > 0) {
    filteredTasks = filteredTasks.filter((task) => filters.priority!.includes(task.priority));
  }

  if (filters.dateRange) {
    filteredTasks = filteredTasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= filters.dateRange!.start && taskDate <= filters.dateRange!.end;
    });
  }

  return filteredTasks;
}

/**
 * Filter tasks by date range
 */
export function filterTasksByDateRange(tasks: Task[], startDate: Date, endDate: Date): Task[] {
  return tasks.filter((task) => {
    const taskDate = new Date(task.dueDate);
    return taskDate >= startDate && taskDate < endDate;
  });
}

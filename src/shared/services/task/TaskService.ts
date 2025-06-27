import type { User } from 'firebase/auth';
import type { Task, CreateTaskData, UpdateTaskData, TaskFilters, TaskStats } from '@/shared/types/task.types';

import {
  createTask as createTaskInDb,
  getUserTasksFromDb,
  updateTask as updateTaskInDb,
  deleteTask as deleteTaskFromDb,
} from './operations/crud';

import { getTaskStats, categorizeTasks } from './business/analytics';
import { getTasksByDateRange as getTasksByDateRangeFromViews } from './business/views';

import { applyFilters } from './utils/filterUtils';

/**
 * Main Task Service - Orchestrates all task-related operations
 * This service provides a clean API for task management while delegating
 * specific responsibilities to specialized modules.
 */
class TaskService {
  /**
   * Create a new task
   */
  async createTask(user: User, taskData: CreateTaskData): Promise<string> {
    return createTaskInDb(user, taskData);
  }

  /**
   * Get all tasks for a user with optional filtering
   */
  async getUserTasks(user: User, filters?: TaskFilters): Promise<Task[]> {
    const tasks = await getUserTasksFromDb(user);
    return applyFilters(tasks, filters);
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updateData: UpdateTaskData): Promise<void> {
    return updateTaskInDb(taskId, updateData);
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    return deleteTaskFromDb(taskId);
  }

  /**
   * Get tasks filtered by date range for different views
   */
  getTasksByDateRange(tasks: Task[], viewType: 'my-day' | 'my-week' | 'my-month'): Task[] {
    return getTasksByDateRangeFromViews(tasks, viewType);
  }

  /**
   * Get comprehensive task statistics
   */
  getTaskStats(tasks: Task[]): TaskStats {
    return getTaskStats(tasks);
  }

  /**
   * Categorize tasks by status
   */
  categorizeTasks(tasks: Task[]) {
    return categorizeTasks(tasks);
  }

  /**
   * Apply filters to a list of tasks
   */
  applyFilters(tasks: Task[], filters?: TaskFilters): Task[] {
    return applyFilters(tasks, filters);
  }
}

export const taskService = new TaskService();

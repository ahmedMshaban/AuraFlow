import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  createTask as createTaskInDb,
  getUserTasksFromDb,
  updateTask as updateTaskInDb,
  deleteTask as deleteTaskFromDb,
} from '@/shared/services/task/operations/crud';
import { getTaskStats, categorizeTasks } from '@/shared/services/task/business/analytics';
import { getTasksByDateRange } from '@/shared/services/task/business/views';
import { applyFilters } from '@/shared/services/task/utils/filterUtils';
import type { Task, CreateTaskData, UpdateTaskData, TaskStats, TaskFilters } from '@/shared/types/task.types';

import type { ViewType } from '@/shared/hooks/useFilters';

/**
 * Comprehensive hook for task management with stress-aware prioritization.
 * Provides complete CRUD operations for tasks with intelligent categorization,
 * filtering, and analytics capabilities.
 *
 * Core Features:
 * - Full task lifecycle management (create, read, update, delete)
 * - View-based filtering (day/week/month)
 * - Task categorization (upcoming, overdue, completed)
 * - Real-time task statistics and analytics
 * - User-specific task isolation
 *
 * Task Operations:
 * - Create tasks with due dates and priorities
 * - Update task status, content, and metadata
 * - Delete tasks with proper cleanup
 * - Toggle completion status efficiently
 * - Bulk operations and filtering
 *
 * Analytics & Insights:
 * - Task completion statistics
 * - Overdue task tracking
 * - Time-based task distribution
 * - Productivity metrics
 *
 * @param selectedView - Optional view filter for date-based task filtering
 * @returns Object containing task data, statistics, and management functions
 *
 * @example
 * ```tsx
 * function TaskManager() {
 *   const { selectedView } = useFilters();
 *   const {
 *     tasks,
 *     upcomingTasks,
 *     overdueTasks,
 *     taskStats,
 *     createTask,
 *     updateTask,
 *     toggleTaskStatus
 *   } = useTasks(selectedView);
 *
 *   const handleCreateTask = async (data) => {
 *     await createTask({
 *       title: data.title,
 *       description: data.description,
 *       dueDate: data.dueDate,
 *       priority: 'medium'
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <TaskStats stats={taskStats} />
 *       <TaskList tasks={upcomingTasks} onToggle={toggleTaskStatus} />
 *       <CreateTaskForm onSubmit={handleCreateTask} />
 *     </div>
 *   );
 * }
 * ```
 *
 * @note Requires user authentication for task access
 * @see {@link useAuth} for authentication state
 * @see {@link useFilters} for view-based filtering
 */
export const useTasks = (selectedView?: ViewType) => {
  const authContext = useAuth();
  const currentUser = authContext?.currentUser;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    todayDue: 0,
    thisWeekDue: 0,
    thisMonthDue: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(
    async (filters?: TaskFilters) => {
      if (!currentUser) return;

      setIsLoading(true);
      setError(null);

      try {
        let allTasks = await getUserTasksFromDb(currentUser);

        // Apply filters if provided
        if (filters) {
          allTasks = applyFilters(allTasks, filters);
        }

        // Apply view-based filtering
        if (selectedView && ['my-day', 'my-week', 'my-month'].includes(selectedView)) {
          allTasks = getTasksByDateRange(allTasks, selectedView as 'my-day' | 'my-week' | 'my-month');
        }

        setTasks(allTasks);
        setTaskStats(getTaskStats(allTasks));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        console.error('Error fetching tasks:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, selectedView],
  );

  // Create task
  const createTask = useCallback(
    async (taskData: CreateTaskData) => {
      if (!currentUser) return;

      setIsCreating(true);
      try {
        await createTaskInDb(currentUser, taskData);
        await fetchTasks(); // Refresh tasks
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create task');
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [currentUser, fetchTasks],
  );

  // Update task
  const updateTask = useCallback(
    async (taskId: string, updateData: UpdateTaskData) => {
      try {
        await updateTaskInDb(taskId, updateData);
        await fetchTasks(); // Refresh tasks
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update task');
        throw err;
      }
    },
    [fetchTasks],
  );

  // Delete task
  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        await deleteTaskFromDb(taskId);
        await fetchTasks(); // Refresh tasks
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task');
        throw err;
      }
    },
    [fetchTasks],
  );
  // Toggle task status (complete/incomplete)
  const toggleTaskStatus = useCallback(
    async (taskId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await updateTask(taskId, { status: newStatus });
    },
    [updateTask],
  );

  // Get categorized tasks
  const categorizedTasks = categorizeTasks(tasks);

  // Effect to fetch tasks when dependencies change
  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser, selectedView, fetchTasks]);

  return {
    tasks,
    upcomingTasks: categorizedTasks.upcoming,
    overdueTasks: categorizedTasks.overdue,
    completedTasks: categorizedTasks.completed,
    taskStats,
    isLoading,
    isCreating,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    fetchTasks,
  };
};

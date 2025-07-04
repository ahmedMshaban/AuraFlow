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
        // For 'all-time', we don't apply any date filtering

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

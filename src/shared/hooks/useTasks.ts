import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { taskService } from '../services/taskService';
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskStats,
} from '../../modules/home/infrastructure/types/task.types';
import type { ViewType } from '../../modules/home/infrastructure/types/home.types';

interface UseTasksReturn {
  // Data
  tasks: Task[];
  upcomingTasks: Task[];
  overdueTasks: Task[];
  completedTasks: Task[];
  taskStats: TaskStats;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<string | null>;
  updateTask: (taskId: string, updateData: UpdateTaskData) => Promise<boolean>;
  deleteTask: (taskId: string) => Promise<boolean>;
  toggleTaskStatus: (taskId: string) => Promise<boolean>;
  
  // Filtering
  getTasksByView: (viewType: ViewType) => Task[];
  getTasksByStatus: (status: 'upcoming' | 'overdue' | 'completed') => Task[];
}

export const useTasks = (selectedView?: ViewType): UseTasksReturn => {
  const authContext = useAuth();
  const currentUser = authContext?.currentUser;
  
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const userTasks = await taskService.getUserTasks(currentUser);
      setTasks(userTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Create task
  const createTask = useCallback(async (taskData: CreateTaskData): Promise<string | null> => {
    if (!currentUser) return null;

    setIsCreating(true);
    setCreateError(null);
    
    try {
      const taskId = await taskService.createTask(currentUser, taskData);
      await fetchTasks(); // Refresh tasks list
      return taskId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setCreateError(errorMessage);
      console.error('Error creating task:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [currentUser, fetchTasks]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updateData: UpdateTaskData): Promise<boolean> => {
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      await taskService.updateTask(taskId, updateData);
      await fetchTasks(); // Refresh tasks list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setUpdateError(errorMessage);
      console.error('Error updating task:', err);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchTasks]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await taskService.deleteTask(taskId);
      await fetchTasks(); // Refresh tasks list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setDeleteError(errorMessage);
      console.error('Error deleting task:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [fetchTasks]);

  // Toggle task status between pending and completed
  const toggleTaskStatus = useCallback(async (taskId: string): Promise<boolean> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    return await updateTask(taskId, { status: newStatus });
  }, [tasks, updateTask]);
  // Get tasks by view (my-day, my-week, my-month)
  const getTasksByView = useCallback((viewType: ViewType): Task[] => {
    return taskService.getTasksByDateRange(tasks, viewType);
  }, [tasks]);

  // Get tasks by status
  const getTasksByStatus = useCallback((status: 'upcoming' | 'overdue' | 'completed'): Task[] => {
    const categorized = taskService.categorizeTasks(tasks);
    return categorized[status];
  }, [tasks]);

  // Compute derived data
  const categorizedTasks = taskService.categorizeTasks(tasks);
  const taskStats = taskService.getTaskStats(tasks);

  // Filter tasks based on selected view
  const filteredTasks = selectedView ? getTasksByView(selectedView) : tasks;

  // Fetch tasks on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    } else {
      setTasks([]);
      setError(null);
    }
  }, [currentUser, fetchTasks]);

  return {
    // Data
    tasks: filteredTasks,
    upcomingTasks: categorizedTasks.upcoming,
    overdueTasks: categorizedTasks.overdue,
    completedTasks: categorizedTasks.completed,
    taskStats,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Error states
    error,
    createError,
    updateError,
    deleteError,

    // Actions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    
    // Filtering
    getTasksByView,
    getTasksByStatus,
  };
};

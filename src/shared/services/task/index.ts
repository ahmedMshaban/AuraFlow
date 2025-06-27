// Export all task modules for direct use
export * from './operations/crud';
export * from './business/analytics';
export * from './business/views';
export * from './utils/dateUtils';
export * from './utils/filterUtils';

// Re-export types for convenience
export type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  TaskPriority,
  TaskFilters,
  TaskStats,
} from '@/shared/types/task.types';

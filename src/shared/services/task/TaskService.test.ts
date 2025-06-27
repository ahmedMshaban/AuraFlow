import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from 'firebase/auth';
import type { Task } from '@/shared/types/task.types';
import * as crudOperations from './operations/crud';
import { getTaskStats, categorizeTasks } from './business/analytics';
import { applyFilters } from './utils/filterUtils';

// Mock the CRUD operations
vi.mock('./operations/crud', () => ({
  createTask: vi.fn(),
  getUserTasksFromDb: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const mockUser = { uid: 'test-user-id' } as User;

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Description 1',
    dueDate: new Date('2024-06-15'),
    status: 'pending',
    priority: 'high',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    userId: 'test-user-id',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Description 2',
    dueDate: new Date('2024-06-20'),
    status: 'completed',
    priority: 'medium',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01'),
    userId: 'test-user-id',
    completedAt: new Date('2024-06-10'),
  },
];

describe('Task Service Modules Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    it('should call createTask operation', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        dueDate: new Date('2024-06-25'),
        priority: 'medium' as const,
      };
      vi.mocked(crudOperations.createTask).mockResolvedValue('new-task-id');

      const result = await crudOperations.createTask(mockUser, taskData);

      expect(crudOperations.createTask).toHaveBeenCalledWith(mockUser, taskData);
      expect(result).toBe('new-task-id');
    });

    it('should call getUserTasksFromDb operation', async () => {
      vi.mocked(crudOperations.getUserTasksFromDb).mockResolvedValue(mockTasks);

      const result = await crudOperations.getUserTasksFromDb(mockUser);

      expect(crudOperations.getUserTasksFromDb).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('Analytics Module', () => {
    it('should calculate task statistics correctly', () => {
      const stats = getTaskStats(mockTasks);

      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(1);
      expect(stats.completed).toBe(1);
      expect(stats.overdue).toBe(0);
    });

    it('should categorize tasks by status', () => {
      const categorized = categorizeTasks(mockTasks);

      expect(categorized.upcoming).toHaveLength(1);
      expect(categorized.completed).toHaveLength(1);
      expect(categorized.overdue).toHaveLength(0);
      expect(categorized.upcoming[0].id).toBe('1');
      expect(categorized.completed[0].id).toBe('2');
    });
  });

  describe('Filter Utils', () => {
    it('should apply status filters correctly', () => {
      const result = applyFilters(mockTasks, { status: ['pending'] });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('pending');
    });

    it('should return all tasks when no filters provided', () => {
      const result = applyFilters(mockTasks);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockTasks);
    });
  });
});

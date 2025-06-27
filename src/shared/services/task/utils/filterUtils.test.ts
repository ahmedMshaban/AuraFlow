import { describe, it, expect } from 'vitest';
import { applyFilters, filterTasksByDateRange } from './filterUtils';
import type { Task, TaskFilters } from '@/shared/types/task.types';

// Mock task data for testing
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  dueDate: new Date('2024-06-15'),
  status: 'pending',
  priority: 'medium',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  userId: 'user1',
  ...overrides,
});

describe('filterUtils', () => {
  describe('applyFilters', () => {
    const mockTasks: Task[] = [
      createMockTask({ id: '1', status: 'pending', priority: 'high' }),
      createMockTask({ id: '2', status: 'completed', priority: 'medium' }),
      createMockTask({ id: '3', status: 'overdue', priority: 'low' }),
      createMockTask({ id: '4', status: 'pending', priority: 'high' }),
    ];

    it('should return all tasks when no filters are provided', () => {
      const result = applyFilters(mockTasks);
      expect(result).toHaveLength(4);
      expect(result).toEqual(mockTasks);
    });

    it('should filter tasks by status', () => {
      const filters: TaskFilters = { status: ['pending'] };
      const result = applyFilters(mockTasks, filters);

      expect(result).toHaveLength(2);
      expect(result.every((task) => task.status === 'pending')).toBe(true);
    });

    it('should filter tasks by multiple statuses', () => {
      const filters: TaskFilters = { status: ['pending', 'completed'] };
      const result = applyFilters(mockTasks, filters);

      expect(result).toHaveLength(3);
      expect(result.every((task) => ['pending', 'completed'].includes(task.status))).toBe(true);
    });

    it('should filter tasks by priority', () => {
      const filters: TaskFilters = { priority: ['high'] };
      const result = applyFilters(mockTasks, filters);

      expect(result).toHaveLength(2);
      expect(result.every((task) => task.priority === 'high')).toBe(true);
    });

    it('should filter tasks by date range', () => {
      const tasksWithDifferentDates = [
        createMockTask({ id: '1', dueDate: new Date('2024-06-10') }),
        createMockTask({ id: '2', dueDate: new Date('2024-06-15') }),
        createMockTask({ id: '3', dueDate: new Date('2024-06-20') }),
      ];

      const filters: TaskFilters = {
        dateRange: {
          start: new Date('2024-06-12'),
          end: new Date('2024-06-18'),
        },
      };

      const result = applyFilters(tasksWithDifferentDates, filters);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should apply multiple filters simultaneously', () => {
      const filters: TaskFilters = {
        status: ['pending'],
        priority: ['high'],
      };

      const result = applyFilters(mockTasks, filters);
      expect(result).toHaveLength(2);
      expect(result.every((task) => task.status === 'pending' && task.priority === 'high')).toBe(true);
    });
  });

  describe('filterTasksByDateRange', () => {
    const tasksWithDifferentDates = [
      createMockTask({ id: '1', dueDate: new Date('2024-06-10') }),
      createMockTask({ id: '2', dueDate: new Date('2024-06-15') }),
      createMockTask({ id: '3', dueDate: new Date('2024-06-20') }),
    ];

    it('should filter tasks within date range', () => {
      const startDate = new Date('2024-06-12');
      const endDate = new Date('2024-06-18');

      const result = filterTasksByDateRange(tasksWithDifferentDates, startDate, endDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should return empty array when no tasks match date range', () => {
      const startDate = new Date('2024-06-25');
      const endDate = new Date('2024-06-30');

      const result = filterTasksByDateRange(tasksWithDifferentDates, startDate, endDate);
      expect(result).toHaveLength(0);
    });

    it('should include tasks on start date boundary', () => {
      const startDate = new Date('2024-06-15');
      const endDate = new Date('2024-06-18');

      const result = filterTasksByDateRange(tasksWithDifferentDates, startDate, endDate);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });
});

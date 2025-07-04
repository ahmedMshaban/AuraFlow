import { describe, it, expect } from 'vitest';
import limitTasks from './limitTasks';
import type { Task } from '@/shared/types/task.types';

// Helper function to create mock tasks
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'mock-id',
  title: 'Mock Task',
  description: 'Mock description',
  priority: 'medium',
  status: 'pending',
  dueDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-id',
  ...overrides,
});

describe('limitTasks', () => {
  describe('Home page mode (isHomePage = true)', () => {
    it('should limit tasks to default limit of 5', () => {
      const tasks = Array.from({ length: 7 }, (_, index) =>
        createMockTask({ id: `task-${index + 1}`, title: `Task ${index + 1}` }),
      );

      const result = limitTasks(tasks, true);

      expect(result.limitedTasks).toHaveLength(5);
      expect(result.hasMore).toBe(true);
      expect(result.limitedTasks.map((task) => task.id)).toEqual(['task-1', 'task-2', 'task-3', 'task-4', 'task-5']);
    });

    it('should limit tasks to custom limit', () => {
      const tasks = Array.from({ length: 10 }, (_, index) => createMockTask({ id: `task-${index + 1}` }));

      const result = limitTasks(tasks, true, 3);

      expect(result.limitedTasks).toHaveLength(3);
      expect(result.hasMore).toBe(true);
    });

    it('should return all tasks when count is less than limit', () => {
      const tasks = Array.from({ length: 3 }, (_, index) => createMockTask({ id: `task-${index + 1}` }));

      const result = limitTasks(tasks, true, 5);

      expect(result.limitedTasks).toHaveLength(3);
      expect(result.hasMore).toBe(false);
    });

    it('should return all tasks when count equals limit', () => {
      const tasks = Array.from({ length: 5 }, (_, index) => createMockTask({ id: `task-${index + 1}` }));

      const result = limitTasks(tasks, true, 5);

      expect(result.limitedTasks).toHaveLength(5);
      expect(result.hasMore).toBe(false);
    });

    it('should handle empty task array', () => {
      const result = limitTasks([], true);

      expect(result.limitedTasks).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    it('should preserve task order when limiting', () => {
      const tasks = [
        createMockTask({ id: 'first', title: 'First Task' }),
        createMockTask({ id: 'second', title: 'Second Task' }),
        createMockTask({ id: 'third', title: 'Third Task' }),
        createMockTask({ id: 'fourth', title: 'Fourth Task' }),
        createMockTask({ id: 'fifth', title: 'Fifth Task' }),
        createMockTask({ id: 'sixth', title: 'Sixth Task' }),
      ];

      const result = limitTasks(tasks, true, 4);

      expect(result.limitedTasks.map((task) => task.id)).toEqual(['first', 'second', 'third', 'fourth']);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('Full page mode (isHomePage = false)', () => {
    it('should return all tasks without limiting', () => {
      const tasks = Array.from({ length: 10 }, (_, index) => createMockTask({ id: `task-${index + 1}` }));

      const result = limitTasks(tasks, false, 5);

      expect(result.limitedTasks).toHaveLength(10);
      expect(result.hasMore).toBe(false);
    });

    it('should return hasMore as false even with many tasks', () => {
      const tasks = Array.from({ length: 20 }, (_, index) => createMockTask({ id: `task-${index + 1}` }));

      const result = limitTasks(tasks, false, 5);

      expect(result.limitedTasks).toHaveLength(20);
      expect(result.hasMore).toBe(false);
    });

    it('should handle empty task array', () => {
      const result = limitTasks([], false);

      expect(result.limitedTasks).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    it('should ignore limit parameter in full page mode', () => {
      const tasks = Array.from({ length: 15 }, (_, index) => createMockTask({ id: `task-${index + 1}` }));

      const result = limitTasks(tasks, false, 3);

      expect(result.limitedTasks).toHaveLength(15);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle limit of 0 in home page mode', () => {
      const tasks = [createMockTask({ id: 'task-1' })];

      const result = limitTasks(tasks, true, 0);

      expect(result.limitedTasks).toHaveLength(0);
      expect(result.hasMore).toBe(true);
    });

    it('should handle negative limit gracefully', () => {
      const tasks = [createMockTask({ id: 'task-1' })];

      const result = limitTasks(tasks, true, -1);

      expect(result.limitedTasks).toHaveLength(0);
      expect(result.hasMore).toBe(true);
    });

    it('should handle very large limit', () => {
      const tasks = Array.from({ length: 5 }, (_, index) => createMockTask({ id: `task-${index + 1}` }));

      const result = limitTasks(tasks, true, 1000);

      expect(result.limitedTasks).toHaveLength(5);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('Type safety and immutability', () => {
    it('should not modify the original tasks array', () => {
      const originalTasks = [
        createMockTask({ id: 'task-1' }),
        createMockTask({ id: 'task-2' }),
        createMockTask({ id: 'task-3' }),
      ];
      const tasksCopy = [...originalTasks];

      const result = limitTasks(originalTasks, true, 2);

      expect(originalTasks).toEqual(tasksCopy);
      expect(result.limitedTasks).not.toBe(originalTasks);
    });

    it('should return proper types', () => {
      const tasks = [createMockTask({ id: 'task-1' })];
      const result = limitTasks(tasks, true);

      expect(typeof result.hasMore).toBe('boolean');
      expect(Array.isArray(result.limitedTasks)).toBe(true);
      expect(result.limitedTasks.every((task) => typeof task.id === 'string')).toBe(true);
    });
  });
});

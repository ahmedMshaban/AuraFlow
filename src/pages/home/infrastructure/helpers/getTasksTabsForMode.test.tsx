import { describe, it, expect } from 'vitest';
import getTabsForMode from './getTasksTabsForMode';
import type { Task, TaskStats } from '@/shared/types/task.types';

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

// Helper function to create mock task stats
const createMockTaskStats = (overrides: Partial<TaskStats> = {}): TaskStats => ({
  total: 10,
  pending: 5,
  completed: 3,
  overdue: 2,
  todayDue: 1,
  thisWeekDue: 3,
  thisMonthDue: 5,
  ...overrides,
});

describe('getTabsForMode', () => {
  describe('Normal mode (not stressed)', () => {
    const isStressed = false;

    it('should return all three tabs in normal mode', () => {
      const upcomingTasks = [
        createMockTask({ id: '1', status: 'pending' }),
        createMockTask({ id: '2', status: 'pending' }),
      ];
      const overdueTasks = [createMockTask({ id: '3', status: 'overdue' })];
      const completedTasks = [
        createMockTask({ id: '4', status: 'completed' }),
        createMockTask({ id: '5', status: 'completed' }),
        createMockTask({ id: '6', status: 'completed' }),
      ];
      const taskStats = createMockTaskStats({
        pending: 2,
        overdue: 1,
        completed: 3,
      });

      const result = getTabsForMode(upcomingTasks, overdueTasks, completedTasks, taskStats, isStressed);

      expect(result).toHaveLength(3);
      expect(result.map((tab) => tab.key)).toEqual(['upcoming', 'overdue', 'completed']);
    });

    it('should configure upcoming tab correctly', () => {
      const upcomingTasks = [
        createMockTask({ id: '1', status: 'pending' }),
        createMockTask({ id: '2', status: 'pending' }),
      ];
      const taskStats = createMockTaskStats({ pending: 2 });

      const result = getTabsForMode(upcomingTasks, [], [], taskStats, isStressed, false);
      const upcomingTab = result.find((tab) => tab.key === 'upcoming');

      expect(upcomingTab).toEqual({
        key: 'upcoming',
        label: 'Upcoming',
        count: 2,
        tasks: upcomingTasks,
        color: 'blue',
        description: 'Plan your future tasks',
        hasMore: false,
      });
    });

    it('should configure overdue tab correctly', () => {
      const overdueTasks = [createMockTask({ id: '1', status: 'overdue' })];
      const taskStats = createMockTaskStats({ overdue: 1 });

      const result = getTabsForMode([], overdueTasks, [], taskStats, isStressed);
      const overdueTab = result.find((tab) => tab.key === 'overdue');

      expect(overdueTab).toEqual({
        key: 'overdue',
        label: 'Overdue',
        count: 1,
        tasks: overdueTasks,
        color: 'red',
        description: 'Catch up on missed deadlines',
        hasMore: false,
      });
    });

    it('should configure completed tab correctly', () => {
      const completedTasks = [
        createMockTask({ id: '1', status: 'completed' }),
        createMockTask({ id: '2', status: 'completed' }),
        createMockTask({ id: '3', status: 'completed' }),
      ];
      const taskStats = createMockTaskStats({ completed: 3 });

      const result = getTabsForMode([], [], completedTasks, taskStats, isStressed);
      const completedTab = result.find((tab) => tab.key === 'completed');

      expect(completedTab).toEqual({
        key: 'completed',
        label: 'Completed',
        count: 3,
        tasks: completedTasks,
        color: 'green',
        description: 'Celebrate your achievements',
        hasMore: false,
      });
    });

    it('should use taskStats counts for tab counts', () => {
      const taskStats = createMockTaskStats({
        pending: 10,
        overdue: 5,
        completed: 15,
      });

      const result = getTabsForMode([], [], [], taskStats, isStressed);

      expect(result.find((tab) => tab.key === 'upcoming')?.count).toBe(10);
      expect(result.find((tab) => tab.key === 'overdue')?.count).toBe(5);
      expect(result.find((tab) => tab.key === 'completed')?.count).toBe(15);
    });
  });

  describe('Stressed mode', () => {
    const isStressed = true;

    it('should return only priority tab in stressed mode', () => {
      const upcomingTasks = [
        createMockTask({ id: '1', priority: 'high' }),
        createMockTask({ id: '2', priority: 'medium' }),
        createMockTask({ id: '3', priority: 'low' }),
      ];
      const overdueTasks = [createMockTask({ id: '4', priority: 'medium' })];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, overdueTasks, [], taskStats, isStressed);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('priority');
    });

    it('should include overdue tasks and high priority upcoming tasks', () => {
      const upcomingTasks = [
        createMockTask({ id: '1', priority: 'high', status: 'pending' }),
        createMockTask({ id: '2', priority: 'medium', status: 'pending' }),
        createMockTask({ id: '3', priority: 'low', status: 'pending' }),
      ];
      const overdueTasks = [
        createMockTask({ id: '4', priority: 'medium', status: 'overdue' }),
        createMockTask({ id: '5', priority: 'low', status: 'overdue' }),
      ];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, overdueTasks, [], taskStats, isStressed);
      const priorityTab = result[0];

      expect(priorityTab.tasks).toHaveLength(3); // 2 overdue + 1 high priority upcoming
      expect(priorityTab.tasks).toContain(upcomingTasks[0]); // High priority upcoming
      expect(priorityTab.tasks).toContain(overdueTasks[0]); // Overdue
      expect(priorityTab.tasks).toContain(overdueTasks[1]); // Overdue
      expect(priorityTab.tasks).not.toContain(upcomingTasks[1]); // Medium priority upcoming
      expect(priorityTab.tasks).not.toContain(upcomingTasks[2]); // Low priority upcoming
    });

    it('should configure priority tab correctly', () => {
      const upcomingTasks = [createMockTask({ id: '1', priority: 'high' })];
      const overdueTasks = [createMockTask({ id: '2', priority: 'medium' })];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, overdueTasks, [], taskStats, isStressed);

      expect(result[0]).toEqual({
        key: 'priority',
        label: 'Priority',
        count: 2, // 1 overdue + 1 high priority upcoming
        tasks: expect.arrayContaining([expect.objectContaining({ id: '1' }), expect.objectContaining({ id: '2' })]),
        color: 'orange',
        description: 'Focus on what matters most',
        hasMore: false,
      });
    });

    it('should handle empty priority tasks', () => {
      const upcomingTasks = [createMockTask({ priority: 'medium' }), createMockTask({ priority: 'low' })];
      const overdueTasks: Task[] = [];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, overdueTasks, [], taskStats, isStressed);

      expect(result[0].tasks).toHaveLength(0);
      expect(result[0].count).toBe(0);
    });

    it('should include all overdue tasks regardless of priority', () => {
      const upcomingTasks: Task[] = [];
      const overdueTasks = [
        createMockTask({ id: '1', priority: 'high' }),
        createMockTask({ id: '2', priority: 'medium' }),
        createMockTask({ id: '3', priority: 'low' }),
      ];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, overdueTasks, [], taskStats, isStressed);

      expect(result[0].tasks).toHaveLength(3);
      expect(result[0].tasks).toEqual(overdueTasks);
    });
  });

  describe('Priority filtering logic', () => {
    const isStressed = true;

    it('should only include high priority upcoming tasks', () => {
      const upcomingTasks = [
        createMockTask({ id: '1', priority: 'high' }),
        createMockTask({ id: '2', priority: 'medium' }),
        createMockTask({ id: '3', priority: 'low' }),
        createMockTask({ id: '4', priority: 'high' }),
      ];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, [], [], taskStats, isStressed, false);
      const priorityTasks = result[0].tasks;

      expect(priorityTasks).toHaveLength(2);
      expect(priorityTasks.every((task) => task.priority === 'high')).toBe(true);
    });

    it('should handle case-sensitive priority matching', () => {
      const upcomingTasks = [
        createMockTask({ id: '1', priority: 'high' }),
        createMockTask({ id: '2', priority: 'HIGH' as 'high' }),
        createMockTask({ id: '3', priority: 'High' as 'high' }),
      ];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, [], [], taskStats, isStressed, false);

      // Only exact 'high' match should be included
      expect(result[0].tasks).toHaveLength(1);
      expect(result[0].tasks[0].id).toBe('1');
    });

    it('should preserve task order in priority tab', () => {
      const overdueTasks = [createMockTask({ id: 'overdue1' }), createMockTask({ id: 'overdue2' })];
      const upcomingTasks = [
        createMockTask({ id: 'high1', priority: 'high' }),
        createMockTask({ id: 'medium1', priority: 'medium' }),
        createMockTask({ id: 'high2', priority: 'high' }),
      ];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, overdueTasks, [], taskStats, isStressed);
      const priorityTasks = result[0].tasks;

      // Should include overdue tasks first, then high priority upcoming
      expect(priorityTasks).toHaveLength(4);
      expect(priorityTasks[0].id).toBe('overdue1');
      expect(priorityTasks[1].id).toBe('overdue2');
      expect(priorityTasks[2].id).toBe('high1');
      expect(priorityTasks[3].id).toBe('high2');
    });
  });

  describe('Tab configuration validation', () => {
    it('should have consistent tab structure in normal mode', () => {
      const taskStats = createMockTaskStats();
      const result = getTabsForMode([], [], [], taskStats, false);

      result.forEach((tab) => {
        expect(tab).toHaveProperty('key');
        expect(tab).toHaveProperty('label');
        expect(tab).toHaveProperty('count');
        expect(tab).toHaveProperty('tasks');
        expect(tab).toHaveProperty('color');
        expect(tab).toHaveProperty('description');

        expect(typeof tab.key).toBe('string');
        expect(typeof tab.label).toBe('string');
        expect(typeof tab.count).toBe('number');
        expect(Array.isArray(tab.tasks)).toBe(true);
        expect(typeof tab.color).toBe('string');
        expect(typeof tab.description).toBe('string');
      });
    });

    it('should have consistent tab structure in stressed mode', () => {
      const taskStats = createMockTaskStats();
      const result = getTabsForMode([], [], [], taskStats, true);

      expect(result).toHaveLength(1);
      const tab = result[0];

      expect(tab).toHaveProperty('key');
      expect(tab).toHaveProperty('label');
      expect(tab).toHaveProperty('count');
      expect(tab).toHaveProperty('tasks');
      expect(tab).toHaveProperty('color');
      expect(tab).toHaveProperty('description');
    });

    it('should use appropriate colors for each tab type', () => {
      const taskStats = createMockTaskStats();
      const normalTabs = getTabsForMode([], [], [], taskStats, false);

      expect(normalTabs.find((tab) => tab.key === 'upcoming')?.color).toBe('blue');
      expect(normalTabs.find((tab) => tab.key === 'overdue')?.color).toBe('red');
      expect(normalTabs.find((tab) => tab.key === 'completed')?.color).toBe('green');

      const stressedTabs = getTabsForMode([], [], [], taskStats, true);
      expect(stressedTabs[0].color).toBe('orange');
    });

    it('should provide descriptive and helpful tab descriptions', () => {
      const taskStats = createMockTaskStats();
      const normalTabs = getTabsForMode([], [], [], taskStats, false);

      normalTabs.forEach((tab) => {
        expect(tab.description.length).toBeGreaterThan(10);
        expect(tab.description).not.toBe('');
      });

      const stressedTabs = getTabsForMode([], [], [], taskStats, true);
      expect(stressedTabs[0].description).toBe('Focus on what matters most');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty task arrays', () => {
      const taskStats = createMockTaskStats({ pending: 0, overdue: 0, completed: 0 });

      const normalResult = getTabsForMode([], [], [], taskStats, false);
      const stressedResult = getTabsForMode([], [], [], taskStats, true);

      expect(normalResult).toHaveLength(3);
      expect(stressedResult).toHaveLength(1);

      normalResult.forEach((tab) => {
        expect(tab.tasks).toHaveLength(0);
      });

      expect(stressedResult[0].tasks).toHaveLength(0);
    });

    it('should handle mismatched task arrays and stats', () => {
      const upcomingTasks = [createMockTask(), createMockTask()];
      const taskStats = createMockTaskStats({ pending: 10 }); // Different count

      const result = getTabsForMode(upcomingTasks, [], [], taskStats, false);
      const upcomingTab = result.find((tab) => tab.key === 'upcoming');

      // Should use stats count, not array length
      expect(upcomingTab?.count).toBe(10);
      expect(upcomingTab?.tasks).toHaveLength(2);
    });

    it('should handle tasks with missing or invalid priority', () => {
      const upcomingTasks = [
        createMockTask({ priority: 'medium' }), // Invalid for test
        createMockTask({ priority: 'low' }), // Invalid for test
        createMockTask({ priority: 'unknown' as 'high' }), // Invalid for test
        createMockTask({ priority: 'high' }),
      ];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, [], [], taskStats, true);

      // Only the task with valid 'high' priority should be included
      expect(result[0].tasks).toHaveLength(1);
      expect(result[0].tasks[0].priority).toBe('high');
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const upcomingTasks = [createMockTask({ priority: 'high' })];
      const overdueTasks = [createMockTask()];
      const completedTasks = [createMockTask()];
      const taskStats = createMockTaskStats();

      const result1 = getTabsForMode(upcomingTasks, overdueTasks, completedTasks, taskStats, false);
      const result2 = getTabsForMode(upcomingTasks, overdueTasks, completedTasks, taskStats, false);

      expect(result1).toEqual(result2);
    });

    it('should handle large task arrays efficiently', () => {
      const largeUpcomingArray = Array.from({ length: 1000 }, (_, i) =>
        createMockTask({ id: `upcoming-${i}`, priority: i % 3 === 0 ? 'high' : 'medium' }),
      );
      const largeOverdueArray = Array.from({ length: 500 }, (_, i) => createMockTask({ id: `overdue-${i}` }));
      const taskStats = createMockTaskStats();

      const start = performance.now();
      const result = getTabsForMode(largeUpcomingArray, largeOverdueArray, [], taskStats, true);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // Should complete in reasonable time
      expect(result[0].tasks.length).toBeGreaterThan(0);
    });

    it('should not mutate input arrays', () => {
      const upcomingTasks = [createMockTask({ id: 'test' })];
      const overdueTasks = [createMockTask({ id: 'test2' })];
      const originalUpcomingLength = upcomingTasks.length;
      const originalOverdueLength = overdueTasks.length;

      getTabsForMode(upcomingTasks, overdueTasks, [], createMockTaskStats(), true);

      expect(upcomingTasks).toHaveLength(originalUpcomingLength);
      expect(overdueTasks).toHaveLength(originalOverdueLength);
    });
  });

  describe('Wellbeing and stress adaptation', () => {
    it('should reduce cognitive load in stressed mode', () => {
      const taskStats = createMockTaskStats();
      const normalTabs = getTabsForMode([], [], [], taskStats, false);
      const stressedTabs = getTabsForMode([], [], [], taskStats, true);

      expect(stressedTabs.length).toBeLessThan(normalTabs.length);
      expect(stressedTabs).toHaveLength(1);
      expect(normalTabs).toHaveLength(3);
    });

    it('should focus on immediate priorities when stressed', () => {
      const upcomingTasks = [
        createMockTask({ priority: 'high' }),
        createMockTask({ priority: 'medium' }),
        createMockTask({ priority: 'low' }),
      ];
      const overdueTasks = [createMockTask()];
      const taskStats = createMockTaskStats();

      const result = getTabsForMode(upcomingTasks, overdueTasks, [], taskStats, true);

      expect(result[0].label).toBe('Priority');
      expect(result[0].description).toBe('Focus on what matters most');
      expect(result[0].tasks).toHaveLength(2); // 1 overdue + 1 high priority
    });

    it('should maintain positive messaging in descriptions', () => {
      const taskStats = createMockTaskStats();
      const allTabs = [...getTabsForMode([], [], [], taskStats, false), ...getTabsForMode([], [], [], taskStats, true)];

      allTabs.forEach((tab) => {
        // Should not contain negative or stressful language
        const negativeWords = ['stress', 'overwhelm', 'crisis', 'panic', 'urgent'];
        const hasNegativeWords = negativeWords.some((word) => tab.description.toLowerCase().includes(word));
        expect(hasNegativeWords).toBe(false);
      });
    });
  });
});

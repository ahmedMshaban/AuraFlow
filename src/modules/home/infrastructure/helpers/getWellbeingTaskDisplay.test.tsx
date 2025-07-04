import { describe, it, expect } from 'vitest';
import getWellbeingTaskDisplay from './getWellbeingTaskDisplay';
import type { ViewType } from '@/shared/hooks/useFilters';
import type { FiltersProps } from '../types/home.types';

describe('getWellbeingTaskDisplay', () => {
  // Mock task stats for testing
  const createTaskStats = (
    overrides: Partial<NonNullable<FiltersProps['taskStats']>> = {},
  ): NonNullable<FiltersProps['taskStats']> => ({
    total: 20,
    pending: 10,
    completed: 5,
    overdue: 2,
    todayDue: 3,
    thisWeekDue: 8,
    thisMonthDue: 15,
    ...overrides,
  });

  describe('Undefined/null task stats handling', () => {
    it('should return default values when taskStats is undefined', () => {
      const result = getWellbeingTaskDisplay(undefined, 'my-day', false);

      expect(result).toEqual({
        count: 0,
        label: 'tasks',
        icon: '📝',
      });
    });

    it('should return default values when taskStats is null', () => {
      const result = getWellbeingTaskDisplay(undefined, 'my-week', true);

      expect(result).toEqual({
        count: 0,
        label: 'tasks',
        icon: '📝',
      });
    });
  });

  describe('Stressed mode - focus on immediate, achievable goals', () => {
    const isStressed = true;

    describe('My Day view', () => {
      it('should show celebration when all today tasks done', () => {
        const taskStats = createTaskStats({ todayDue: 0 });
        const result = getWellbeingTaskDisplay(taskStats, 'my-day', isStressed);

        expect(result).toEqual({
          count: '',
          label: 'all done today! 🎉',
          icon: '',
        });
      });

      it('should show remaining tasks for today with appropriate icons', () => {
        const testCases = [
          { todayDue: 1, expectedIcon: '🌱' },
          { todayDue: 2, expectedIcon: '🌱' },
          { todayDue: 3, expectedIcon: '🌱' },
          { todayDue: 4, expectedIcon: '⏰' },
          { todayDue: 10, expectedIcon: '⏰' },
        ];

        testCases.forEach(({ todayDue, expectedIcon }) => {
          const taskStats = createTaskStats({ todayDue });
          const result = getWellbeingTaskDisplay(taskStats, 'my-day', isStressed);

          expect(result).toEqual({
            count: todayDue,
            label: 'tasks for today',
            icon: expectedIcon,
          });
        });
      });
    });

    describe('My Week view', () => {
      it('should show celebration when week completed', () => {
        const taskStats = createTaskStats({ thisWeekDue: 0 });
        const result = getWellbeingTaskDisplay(taskStats, 'my-week', isStressed);

        expect(result).toEqual({
          count: '',
          label: 'week completed! 🌟',
          icon: '',
        });
      });

      it('should show remaining week tasks with appropriate icons', () => {
        const testCases = [
          { thisWeekDue: 1, expectedIcon: '🌱' },
          { thisWeekDue: 3, expectedIcon: '🌱' },
          { thisWeekDue: 5, expectedIcon: '⏰' },
          { thisWeekDue: 15, expectedIcon: '⏰' },
        ];

        testCases.forEach(({ thisWeekDue, expectedIcon }) => {
          const taskStats = createTaskStats({ thisWeekDue });
          const result = getWellbeingTaskDisplay(taskStats, 'my-week', isStressed);

          expect(result).toEqual({
            count: thisWeekDue,
            label: 'tasks this week',
            icon: expectedIcon,
          });
        });
      });
    });

    describe('My Month view', () => {
      it('should show celebration when month achieved', () => {
        const taskStats = createTaskStats({ thisMonthDue: 0 });
        const result = getWellbeingTaskDisplay(taskStats, 'my-month', isStressed);

        expect(result).toEqual({
          count: '',
          label: 'month achieved! 🏆',
          icon: '',
        });
      });

      it('should show remaining month tasks with appropriate icons', () => {
        const testCases = [
          { thisMonthDue: 2, expectedIcon: '🌱' },
          { thisMonthDue: 3, expectedIcon: '🌱' },
          { thisMonthDue: 8, expectedIcon: '⏰' },
          { thisMonthDue: 25, expectedIcon: '⏰' },
        ];

        testCases.forEach(({ thisMonthDue, expectedIcon }) => {
          const taskStats = createTaskStats({ thisMonthDue });
          const result = getWellbeingTaskDisplay(taskStats, 'my-month', isStressed);

          expect(result).toEqual({
            count: thisMonthDue,
            label: 'tasks this month',
            icon: expectedIcon,
          });
        });
      });
    });

    describe('Default/other views', () => {
      it('should show celebration when all caught up', () => {
        const taskStats = createTaskStats({ pending: 0 });
        const result = getWellbeingTaskDisplay(taskStats, 'unknown' as ViewType, isStressed);

        expect(result).toEqual({
          count: '',
          label: 'all caught up! ✨',
          icon: '',
        });
      });

      it('should show pending tasks with appropriate icons', () => {
        const testCases = [
          { pending: 1, expectedIcon: '🌱' },
          { pending: 3, expectedIcon: '🌱' },
          { pending: 5, expectedIcon: '⏰' },
          { pending: 20, expectedIcon: '⏰' },
        ];

        testCases.forEach(({ pending, expectedIcon }) => {
          const taskStats = createTaskStats({ pending });
          const result = getWellbeingTaskDisplay(taskStats, 'unknown' as ViewType, isStressed);

          expect(result).toEqual({
            count: pending,
            label: 'pending tasks',
            icon: expectedIcon,
          });
        });
      });
    });
  });

  describe('Normal mode - celebrate achievements and progress', () => {
    const isStressed = false;

    it('should show motivation when no tasks completed', () => {
      const taskStats = createTaskStats({ completed: 0 });
      const views: Array<'my-day' | 'my-week' | 'my-month'> = ['my-day', 'my-week', 'my-month'];

      views.forEach((view) => {
        const result = getWellbeingTaskDisplay(taskStats, view, isStressed);

        expect(result).toEqual({
          count: 0,
          label: ' start achieving!',
          icon: ' 🚀',
        });
      });
    });

    it('should show singular celebration for 1 completed task', () => {
      const taskStats = createTaskStats({ completed: 1 });
      const views: Array<'my-day' | 'my-week' | 'my-month'> = ['my-day', 'my-week', 'my-month'];

      views.forEach((view) => {
        const result = getWellbeingTaskDisplay(taskStats, view, isStressed);

        expect(result).toEqual({
          count: 1,
          label: 'task completed!',
          icon: '✅',
        });
      });
    });

    it('should show appropriate celebration levels based on completed count', () => {
      const testCases = [
        { completed: 2, expectedIcon: '✅', expectedLabel: 'tasks completed' },
        { completed: 5, expectedIcon: '✅', expectedLabel: 'tasks completed' },
        { completed: 6, expectedIcon: '🌟', expectedLabel: 'tasks completed' },
        { completed: 10, expectedIcon: '🌟', expectedLabel: 'tasks completed' },
        { completed: 15, expectedIcon: '🏆', expectedLabel: 'tasks completed' },
        { completed: 25, expectedIcon: '🏆', expectedLabel: 'tasks completed' },
      ];

      testCases.forEach(({ completed, expectedIcon, expectedLabel }) => {
        const taskStats = createTaskStats({ completed });
        const result = getWellbeingTaskDisplay(taskStats, 'my-day', isStressed);

        expect(result).toEqual({
          count: completed,
          label: expectedLabel,
          icon: expectedIcon,
        });
      });
    });

    it('should be consistent across all view types in normal mode', () => {
      const taskStats = createTaskStats({ completed: 8 });
      const views: Array<'my-day' | 'my-week' | 'my-month'> = ['my-day', 'my-week', 'my-month'];

      const results = views.map((view) => getWellbeingTaskDisplay(taskStats, view, isStressed));

      // All results should be identical in normal mode
      results.forEach((result) => {
        expect(result).toEqual({
          count: 8,
          label: 'tasks completed',
          icon: '🌟',
        });
      });
    });
  });

  describe('View type behavior differences', () => {
    it('should use different metrics per view in stressed mode', () => {
      const taskStats = createTaskStats({
        todayDue: 2,
        thisWeekDue: 8,
        thisMonthDue: 20,
        pending: 25,
      });

      const dayResult = getWellbeingTaskDisplay(taskStats, 'my-day', true);
      const weekResult = getWellbeingTaskDisplay(taskStats, 'my-week', true);
      const monthResult = getWellbeingTaskDisplay(taskStats, 'my-month', true);

      expect(dayResult.count).toBe(2);
      expect(dayResult.label).toBe('tasks for today');

      expect(weekResult.count).toBe(8);
      expect(weekResult.label).toBe('tasks this week');

      expect(monthResult.count).toBe(20);
      expect(monthResult.label).toBe('tasks this month');
    });

    it('should ignore view type in normal mode', () => {
      const taskStats = createTaskStats({
        completed: 5,
        todayDue: 10,
        thisWeekDue: 15,
        thisMonthDue: 25,
      });

      const dayResult = getWellbeingTaskDisplay(taskStats, 'my-day', false);
      const weekResult = getWellbeingTaskDisplay(taskStats, 'my-week', false);
      const monthResult = getWellbeingTaskDisplay(taskStats, 'my-month', false);

      // All should show completed count
      expect(dayResult.count).toBe(5);
      expect(weekResult.count).toBe(5);
      expect(monthResult.count).toBe(5);

      expect(dayResult.label).toBe('tasks completed');
      expect(weekResult.label).toBe('tasks completed');
      expect(monthResult.label).toBe('tasks completed');
    });
  });

  describe('Icon progression logic', () => {
    it('should use 🌱 for manageable task counts (1-3) in stressed mode', () => {
      const testCases = [1, 2, 3];

      testCases.forEach((count) => {
        const taskStats = createTaskStats({ todayDue: count });
        const result = getWellbeingTaskDisplay(taskStats, 'my-day', true);

        expect(result.icon).toBe('🌱');
      });
    });

    it('should use ⏰ for higher task counts (4+) in stressed mode', () => {
      const testCases = [4, 5, 10, 20];

      testCases.forEach((count) => {
        const taskStats = createTaskStats({ todayDue: count });
        const result = getWellbeingTaskDisplay(taskStats, 'my-day', true);

        expect(result.icon).toBe('⏰');
      });
    });

    it('should progress celebration icons in normal mode', () => {
      const iconProgression = [
        { completed: 0, expectedIcon: ' 🚀' },
        { completed: 1, expectedIcon: '✅' },
        { completed: 5, expectedIcon: '✅' },
        { completed: 6, expectedIcon: '🌟' },
        { completed: 10, expectedIcon: '🌟' },
        { completed: 11, expectedIcon: '🏆' },
        { completed: 25, expectedIcon: '🏆' },
      ];

      iconProgression.forEach(({ completed, expectedIcon }) => {
        const taskStats = createTaskStats({ completed });
        const result = getWellbeingTaskDisplay(taskStats, 'my-day', false);

        expect(result.icon).toBe(expectedIcon);
      });
    });
  });

  describe('Type safety and contract validation', () => {
    it('should always return required properties', () => {
      const testCases = [
        { taskStats: undefined, view: 'my-day' as const, stressed: false },
        { taskStats: createTaskStats(), view: 'my-week' as const, stressed: true },
        { taskStats: createTaskStats({ completed: 0 }), view: 'my-month' as const, stressed: false },
      ];

      testCases.forEach(({ taskStats, view, stressed }) => {
        const result = getWellbeingTaskDisplay(taskStats, view, stressed);

        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('label');
        expect(result).toHaveProperty('icon');

        expect(typeof result.label).toBe('string');
        expect(typeof result.icon).toBe('string');
        expect(result.label.length).toBeGreaterThan(0);
      });
    });

    it('should return valid count types', () => {
      const testCases = [
        createTaskStats({ completed: 5 }),
        createTaskStats({ todayDue: 0 }),
        createTaskStats({ pending: 10 }),
      ];

      testCases.forEach((taskStats) => {
        const result1 = getWellbeingTaskDisplay(taskStats, 'my-day', false);
        const result2 = getWellbeingTaskDisplay(taskStats, 'my-day', true);

        expect(['number', 'string'].includes(typeof result1.count)).toBe(true);
        expect(['number', 'string'].includes(typeof result2.count)).toBe(true);
      });
    });

    it('should include emojis in labels or icons', () => {
      const taskStats = createTaskStats({ completed: 5, todayDue: 3 });
      const emojiRegex =
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;

      const normalResult = getWellbeingTaskDisplay(taskStats, 'my-day', false);
      const stressedResult = getWellbeingTaskDisplay(taskStats, 'my-day', true);

      expect(emojiRegex.test(normalResult.label) || emojiRegex.test(normalResult.icon)).toBe(true);

      expect(emojiRegex.test(stressedResult.label) || emojiRegex.test(stressedResult.icon)).toBe(true);
    });
  });

  describe('Wellbeing messaging principles', () => {
    it('should use achievement language in normal mode', () => {
      const taskStats = createTaskStats({ completed: 5 });
      const result = getWellbeingTaskDisplay(taskStats, 'my-day', false);

      const achievementWords = ['completed', 'achieving', 'task'];
      const hasAchievementWord = achievementWords.some((word) => result.label.toLowerCase().includes(word));

      expect(hasAchievementWord).toBe(true);
    });

    it('should use calming/focused language in stressed mode', () => {
      const taskStats = createTaskStats({ todayDue: 3 });
      const result = getWellbeingTaskDisplay(taskStats, 'my-day', true);

      const stressWords = ['urgent', 'deadline', 'overdue', 'behind'];
      const hasStressWords = stressWords.some((word) => result.label.toLowerCase().includes(word));

      // Should not use stress-inducing language
      expect(hasStressWords).toBe(false);

      // Should use neutral, focused language
      expect(result.label).toContain('tasks for today');
    });

    it('should celebrate completions in both modes', () => {
      const completedTaskStats = createTaskStats({ todayDue: 0, completed: 0 });

      const normalResult = getWellbeingTaskDisplay(completedTaskStats, 'my-day', false);
      const stressedResult = getWellbeingTaskDisplay(completedTaskStats, 'my-day', true);

      // Both should have celebratory language
      expect(normalResult.label.includes('!')).toBe(true);
      expect(stressedResult.label.includes('!')).toBe(true);
    });

    it('should provide motivation when no progress made', () => {
      const noProgressStats = createTaskStats({ completed: 0, todayDue: 5 });
      const normalResult = getWellbeingTaskDisplay(noProgressStats, 'my-day', false);

      const motivationalWords = ['start', 'achieving', '🚀'];
      const hasMotivation = motivationalWords.some(
        (word) => normalResult.label.includes(word) || normalResult.icon.includes(word),
      );

      expect(hasMotivation).toBe(true);
    });
  });

  describe('Performance and consistency', () => {
    it('should return consistent results for same input', () => {
      const taskStats = createTaskStats({ completed: 5, todayDue: 3 });

      const result1 = getWellbeingTaskDisplay(taskStats, 'my-day', false);
      const result2 = getWellbeingTaskDisplay(taskStats, 'my-day', false);

      expect(result1).toEqual(result2);
    });

    it('should handle large numbers efficiently', () => {
      const start = performance.now();

      // Test with large numbers
      for (let i = 0; i < 100; i++) {
        const taskStats = createTaskStats({
          completed: i * 10,
          todayDue: i * 5,
          pending: i * 15,
        });
        getWellbeingTaskDisplay(taskStats, 'my-day', i % 2 === 0);
      }

      const end = performance.now();
      const executionTime = end - start;

      // Should complete in reasonable time
      expect(executionTime).toBeLessThan(50);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle productive day scenario', () => {
      const productiveDay = createTaskStats({
        completed: 8,
        todayDue: 1,
        pending: 5,
      });

      const normalResult = getWellbeingTaskDisplay(productiveDay, 'my-day', false);
      const stressedResult = getWellbeingTaskDisplay(productiveDay, 'my-day', true);

      // Normal mode celebrates completions
      expect(normalResult.count).toBe(8);
      expect(normalResult.label).toBe('tasks completed');
      expect(normalResult.icon).toBe('🌟');

      // Stressed mode focuses on remaining
      expect(stressedResult.count).toBe(1);
      expect(stressedResult.label).toBe('tasks for today');
      expect(stressedResult.icon).toBe('🌱');
    });

    it('should handle overwhelming day scenario', () => {
      const overwhelmingDay = createTaskStats({
        completed: 2,
        todayDue: 15,
        pending: 25,
      });

      const normalResult = getWellbeingTaskDisplay(overwhelmingDay, 'my-day', false);
      const stressedResult = getWellbeingTaskDisplay(overwhelmingDay, 'my-day', true);

      // Normal mode still celebrates what's done
      expect(normalResult.count).toBe(2);
      expect(normalResult.label).toBe('tasks completed');
      expect(normalResult.icon).toBe('✅');

      // Stressed mode shows manageable focus
      expect(stressedResult.count).toBe(15);
      expect(stressedResult.label).toBe('tasks for today');
      expect(stressedResult.icon).toBe('⏰'); // More urgent icon for higher count
    });

    it('should handle perfect completion scenario', () => {
      const perfectDay = createTaskStats({
        completed: 10,
        todayDue: 0,
        thisWeekDue: 0,
        thisMonthDue: 0,
        pending: 0,
      });

      const views: Array<'my-day' | 'my-week' | 'my-month'> = ['my-day', 'my-week', 'my-month'];

      views.forEach((view) => {
        const normalResult = getWellbeingTaskDisplay(perfectDay, view, false);
        const stressedResult = getWellbeingTaskDisplay(perfectDay, view, true);

        // Normal mode celebrates achievements
        expect(normalResult.count).toBe(10);
        expect(normalResult.icon).toBe('🌟');

        // Stressed mode celebrates completion
        expect(stressedResult.count).toBe('');
        expect(stressedResult.label).toContain('!');
        expect(stressedResult.icon).toBe('');
      });
    });
  });
});

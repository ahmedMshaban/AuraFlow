import type { FiltersProps, ViewType } from '../types/home.types';

/**
 * Get wellbeing-focused task display text and emoji based on task statistics and stress state
 * Promotes positive reinforcement and reduces stress through adaptive messaging
 *
 * @param taskStats - Task statistics object containing counts for different task states
 * @param selectedView - Current view type ('my-day', 'my-week', 'my-month')
 * @param isCurrentlyStressed - Whether the user is currently experiencing stress
 * @returns Object containing count (number|string), label (string), and icon (string) for display
 *
 * @example
 * ```typescript
 * // Normal mode - celebrates completed tasks
 * getWellbeingTaskDisplay(
 *   { completed: 5, pending: 10, todayDue: 3, thisWeekDue: 8, thisMonthDue: 15 },
 *   'my-day',
 *   false
 * )
 * // Returns: { count: 5, label: 'tasks completed', icon: '🌟' }
 *
 * // Stressed mode - focuses on remaining tasks for today
 * getWellbeingTaskDisplay(
 *   { completed: 2, pending: 8, todayDue: 2, thisWeekDue: 6, thisMonthDue: 12 },
 *   'my-day',
 *   true
 * )
 * // Returns: { count: 2, label: 'tasks for today', icon: '🌱' }
 * ```
 */
const getWellbeingTaskDisplay = (
  taskStats: FiltersProps['taskStats'],
  selectedView: ViewType,
  isCurrentlyStressed: boolean,
): { count: number | string; label: string; icon: string } => {
  if (!taskStats) return { count: 0, label: 'tasks', icon: '📝' };

  if (isCurrentlyStressed) {
    // STRESS MODE: Focus on immediate, achievable goals
    let remainingTasks = 0;
    let label = '';

    switch (selectedView) {
      case 'my-day':
        remainingTasks = taskStats.todayDue;
        label = remainingTasks === 0 ? 'all done today! 🎉' : 'tasks for today';
        break;
      case 'my-week':
        remainingTasks = taskStats.thisWeekDue;
        label = remainingTasks === 0 ? 'week completed! 🌟' : 'tasks this week';
        break;
      case 'my-month':
        remainingTasks = taskStats.thisMonthDue;
        label = remainingTasks === 0 ? 'month achieved! 🏆' : 'tasks this month';
        break;
      default:
        remainingTasks = taskStats.pending;
        label = remainingTasks === 0 ? 'all caught up! ✨' : 'pending tasks';
    }

    return {
      count: remainingTasks === 0 ? '' : remainingTasks,
      label,
      icon: remainingTasks === 0 ? '' : remainingTasks <= 3 ? '🌱' : '⏰',
    };
  } else {
    // NORMAL MODE: Celebrate achievements and progress
    const completedCount = taskStats.completed;
    return {
      count: completedCount,
      label: completedCount === 0 ? ' start achieving!' : completedCount === 1 ? 'task completed!' : 'tasks completed',
      icon: completedCount === 0 ? ' 🚀' : completedCount <= 5 ? '✅' : completedCount <= 10 ? '🌟' : '🏆',
    };
  }
};

export default getWellbeingTaskDisplay;

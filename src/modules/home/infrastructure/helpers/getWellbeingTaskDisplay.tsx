import type { FiltersProps, ViewType } from '../types/home.types';

/**
 * Get wellbeing-focused task display text and emoji
 * Promotes positive reinforcement and reduces stress
 */
const getWellbeingTaskDisplay = (
  taskStats: FiltersProps['taskStats'],
  selectedView: ViewType,
  isCurrentlyStressed: boolean,
) => {
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

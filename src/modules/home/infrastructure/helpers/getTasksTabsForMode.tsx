import type { TaskStats, Task } from '@/shared/types/task.types';

const getTabsForMode = (
  upcomingTasks: Task[],
  overdueTasks: Task[],
  completedTasks: Task[],
  taskStats: TaskStats,
  isCurrentlyStressed: boolean,
) => {
  if (isCurrentlyStressed) {
    // STRESS MODE: Simplified tabs focusing on immediate priorities
    const priorityTasks = [...overdueTasks, ...upcomingTasks.filter((task) => task.priority === 'high')];

    return [
      {
        key: 'priority' as const,
        label: 'Priority',
        count: priorityTasks.length,
        tasks: priorityTasks,
        color: 'orange',
        description: 'Focus on what matters most',
      },
    ];
  } else {
    // NORMAL MODE: Full tab experience
    return [
      {
        key: 'upcoming' as const,
        label: 'Upcoming',
        count: taskStats.pending,
        tasks: upcomingTasks,
        color: 'blue',
        description: 'Plan your future tasks',
      },
      {
        key: 'overdue' as const,
        label: 'Overdue',
        count: taskStats.overdue,
        tasks: overdueTasks,
        color: 'red',
        description: 'Catch up on missed deadlines',
      },
      {
        key: 'completed' as const,
        label: 'Completed',
        count: taskStats.completed,
        tasks: completedTasks,
        color: 'green',
        description: 'Celebrate your achievements',
      },
    ];
  }
};

export default getTabsForMode;

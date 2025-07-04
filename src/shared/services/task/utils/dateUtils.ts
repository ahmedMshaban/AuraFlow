import type { TaskStatus } from '@/shared/types/task.types';

/**
 * Calculate task status based on due date and current status
 * Tasks due today are considered "pending" (upcoming) to be more encouraging
 */
export function calculateTaskStatus(dueDate: Date, currentStatus: TaskStatus): TaskStatus {
  if (currentStatus === 'completed') {
    return 'completed';
  }

  const now = new Date();
  // Set to end of today - tasks due today should still be "pending"
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (dueDate <= endOfToday) {
    // Check if the due date is actually before today (not including today)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    if (dueDate < startOfToday) {
      return 'overdue';
    }
    // Tasks due today remain pending
    return 'pending';
  }

  return 'pending';
}

/**
 * Get date range based on view type
 */
export function getDateRangeForView(viewType: 'my-day' | 'my-week' | 'my-month'): { startDate: Date; endDate: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let startDate: Date;
  let endDate: Date;

  switch (viewType) {
    case 'my-day':
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'my-week':
      startDate = today;
      endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      break;
    case 'my-month':
      startDate = today;
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      break;
    default:
      throw new Error(`Invalid view type: ${viewType}`);
  }

  return { startDate, endDate };
}

/**
 * Get commonly used date ranges for statistics
 */
export function getStandardDateRanges() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return {
    today,
    tomorrow: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    weekFromNow: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
    monthFromNow: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  };
}

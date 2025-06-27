import type { TaskStatus } from '@/shared/types/task.types';

/**
 * Calculate task status based on due date and current status
 */
export function calculateTaskStatus(dueDate: Date, currentStatus: TaskStatus): TaskStatus {
  if (currentStatus === 'completed') {
    return 'completed';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  if (dueDate < today) {
    return 'overdue';
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

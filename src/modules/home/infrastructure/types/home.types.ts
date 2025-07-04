import type { ViewType } from '@/shared/hooks/useFilters';

export interface FiltersProps {
  selectedView: ViewType;
  setSelectedView: (view: ViewType) => void;
  isCurrentlyStressed: boolean;
  // Email-related props (optional for tasks-only pages)
  numOfFocusedEmails?: number | undefined;
  numOfOtherEmails?: number | undefined;
  isLoadingEmails?: boolean;
  // Task-related props (optional for emails-only pages)
  taskStats?:
    | {
        total: number;
        pending: number;
        completed: number;
        overdue: number;
        todayDue: number;
        thisWeekDue: number;
        thisMonthDue: number;
      }
    | undefined;
  isLoadingTasks?: boolean;
  // Control which sections to show
  showEmails?: boolean;
  showTasks?: boolean;
}

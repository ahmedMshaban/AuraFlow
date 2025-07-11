import { useState } from 'react';

export type ViewType = 'my-day' | 'my-week' | 'my-month';

/**
 * Custom hook for managing view filter state across the application.
 * Provides centralized time-based view filtering for tasks, emails, and activities.
 * Enables consistent date range filtering throughout different application modules.
 *
 * View Types:
 * - 'my-day': Shows items for today only
 * - 'my-week': Shows items for the current week
 * - 'my-month': Shows items for the current month
 *
 * State Management:
 * - Maintains selected view with localStorage persistence potential
 * - Provides type-safe view selection
 * - Default view is 'my-day' for focused daily productivity
 *
 * @returns Object containing current view state and setter function
 *
 * @example
 * ```typescript
 * function TaskFilters() {
 *   const { selectedView, setSelectedView } = useFilters();
 *
 *   return (
 *     <ButtonGroup>
 *       <Button
 *         isActive={selectedView === 'my-day'}
 *         onClick={() => setSelectedView('my-day')}
 *       >
 *         Today
 *       </Button>
 *       <Button
 *         isActive={selectedView === 'my-week'}
 *         onClick={() => setSelectedView('my-week')}
 *       >
 *         This Week
 *       </Button>
 *     </ButtonGroup>
 *   );
 * }
 * ```
 *
 * @note Used by tasks, emails, and activity modules for consistent filtering
 * @see {@link useTasks} for task filtering integration
 * @see {@link useGmail} for email filtering integration
 */
const useFilters = (): {
  selectedView: ViewType;
  setSelectedView: (view: ViewType) => void;
} => {
  const [selectedView, setSelectedView] = useState<ViewType>('my-day');

  return { selectedView, setSelectedView };
};

export default useFilters;

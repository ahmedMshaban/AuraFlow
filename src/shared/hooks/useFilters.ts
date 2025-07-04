import { useState } from 'react';

export type ViewType = 'my-day' | 'my-week' | 'my-month';

/**
 * Custom hook for managing view filter state across the application
 * Provides state management for switching between different time-based views
 *
 * @returns Object containing the current selected view and setter function
 *
 * @example
 * ```typescript
 * const { selectedView, setSelectedView } = useFilters();
 *
 * // Default view is 'my-day'
 * console.log(selectedView); // 'my-day'
 *
 * // Change to weekly view
 * setSelectedView('my-week');
 * console.log(selectedView); // 'my-week'
 * ```
 */
const useFilters = (): {
  selectedView: ViewType;
  setSelectedView: (view: ViewType) => void;
} => {
  const [selectedView, setSelectedView] = useState<ViewType>('my-day');

  return { selectedView, setSelectedView };
};

export default useFilters;

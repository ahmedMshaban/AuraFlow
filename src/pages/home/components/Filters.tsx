import { Portal, Select, Box, createListCollection, Skeleton } from '@chakra-ui/react';

import styles from '../infrastructure/styles/home.module.css';
import type { FiltersProps } from '../infrastructure/types/home.types';
import type { ViewType } from '@/shared/hooks/useFilters';
import getFilterOptions from '../infrastructure/helpers/getFilterOptions';
import getWellbeingTaskDisplay from '../infrastructure/helpers/getWellbeingTaskDisplay';
import getWellbeingEmailDisplay from '../infrastructure/helpers/getWellbeingEmailDisplay';

/**
 * A comprehensive filter and status display component for home page navigation.
 * Provides time-based filtering controls and displays wellbeing-focused task and email statistics
 * with stress-adaptive behavior and visual feedback.
 *
 * Features:
 * - Time-based view filtering (Today, This Week, This Month)
 * - Stress-adaptive filter options and messaging
 * - Task statistics display with wellbeing insights
 * - Email count display with focused/other categorization
 * - Loading skeleton states for async data
 * - Conditional rendering for tasks and emails
 * - Accessible dropdown with portal rendering
 *
 * Stress-Adaptive Behavior:
 * - Filter options adapt based on current stress level
 * - Task displays emphasize wellbeing over productivity when stressed
 * - Email displays focus on important vs. all emails during stress
 * - Icons and messaging adjust to provide appropriate guidance
 *
 * @param props - The component props
 * @param props.selectedView - Currently selected time-based filter view
 * @param props.setSelectedView - Handler for changing the filter view
 * @param props.isCurrentlyStressed - Current user stress state
 * @param props.numOfFocusedEmails - Count of high-priority/focused emails
 * @param props.numOfOtherEmails - Count of other/low-priority emails
 * @param props.isLoadingEmails - Loading state for email data
 * @param props.taskStats - Task statistics for display calculations
 * @param props.isLoadingTasks - Loading state for task data
 * @param props.showEmails - Whether to display email statistics
 * @param props.showTasks - Whether to display task statistics
 * @returns A filter and statistics interface
 *
 * @example
 * ```tsx
 * const [selectedView, setSelectedView] = useState<ViewType>('my-day');
 * const { isCurrentlyStressed } = useStressAnalytics();
 *
 * <Filters
 *   selectedView={selectedView}
 *   setSelectedView={setSelectedView}
 *   isCurrentlyStressed={isCurrentlyStressed}
 *   numOfFocusedEmails={5}
 *   numOfOtherEmails={12}
 *   isLoadingEmails={false}
 *   taskStats={{ total: 8, completed: 3, overdue: 2 }}
 *   isLoadingTasks={false}
 *   showEmails={true}
 *   showTasks={true}
 * />
 * ```
 *
 * @note Component adapts its display based on stress level for better UX
 * @note Uses Chakra UI Select with portal for proper z-index layering
 * @see {@link FiltersProps} For detailed prop interface
 * @see {@link getFilterOptions} For stress-adaptive filter generation
 * @see {@link getWellbeingTaskDisplay} For task display calculations
 * @see {@link getWellbeingEmailDisplay} For email display calculations
 */
const Filters = ({
  selectedView,
  setSelectedView,
  isCurrentlyStressed,
  numOfFocusedEmails,
  numOfOtherEmails,
  isLoadingEmails = false,
  taskStats,
  isLoadingTasks = false,
  showEmails = true,
  showTasks = true,
}: FiltersProps) => {
  const filterViewsCollection = createListCollection({
    items: getFilterOptions(isCurrentlyStressed),
  });

  // Calculate wellbeing-focused task display
  const taskDisplay = getWellbeingTaskDisplay(taskStats, selectedView, isCurrentlyStressed);

  // Calculate wellbeing-focused email display
  const emailDisplay = getWellbeingEmailDisplay(numOfFocusedEmails, numOfOtherEmails, isCurrentlyStressed);

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterItem}>
        <Select.Root
          collection={filterViewsCollection}
          width="120px"
          variant="outline"
          defaultValue={[selectedView]}
          value={[selectedView]}
          onValueChange={(e) => setSelectedView(e.value[0] as ViewType)}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select view" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {filterViewsCollection.items.map((view) => (
                  <Select.Item
                    item={view}
                    key={view.value}
                  >
                    {view.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </div>
      {showTasks && (
        <Box className={styles.filterItem}>
          <Skeleton
            height="6"
            loading={isLoadingTasks}
            className={styles.filterItem}
          >
            <span>{taskDisplay.icon}</span>
            {taskDisplay.count && `${taskDisplay.count} `}
            {taskDisplay.label}
          </Skeleton>
        </Box>
      )}
      {showEmails && (
        <Box className={styles.filterItem}>
          <Skeleton
            height="6"
            loading={isLoadingEmails}
            className={styles.filterItem}
          >
            <span>{emailDisplay.icon}</span>
            {emailDisplay.count && `${emailDisplay.count} `}
            {emailDisplay.label}
          </Skeleton>
        </Box>
      )}
    </div>
  );
};

export default Filters;

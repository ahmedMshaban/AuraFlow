import { Portal, Select, Box, createListCollection, Skeleton } from '@chakra-ui/react';

import styles from '../infrastructure/styles/home.module.css';
import type { FiltersProps, ViewType } from '../infrastructure/types/home.types';
import getFilterOptions from '../infrastructure/helpers/getFilterOptions';
import getWellbeingTaskDisplay from '../infrastructure/helpers/getWellbeingTaskDisplay';
import getWellbeingEmailDisplay from '../infrastructure/helpers/getWellbeingEmailDisplay';

const Filters = ({
  selectedView,
  setSelectedView,
  isCurrentlyStressed,
  numOfFocusedEmails,
  numOfOtherEmails,
  isLoadingEmails,
  taskStats,
  isLoadingTasks,
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
    </div>
  );
};

export default Filters;

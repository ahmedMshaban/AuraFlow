import { FaCheck } from 'react-icons/fa6';
import { Portal, Select, Box, createListCollection, Skeleton } from '@chakra-ui/react';

import styles from '../infrastructure/styles/home.module.css';
import type { FiltersProps, ViewType } from '../infrastructure/types/home.types';
import getFilterOptions from '../infrastructure/helpers/getFilterOptions';

const Filters = ({
  selectedView,
  setSelectedView,
  isCurrentlyStressed,
  numOfFocusedEmails,
  numOfOtherEmails,
  isLoadingEmails,
}: FiltersProps) => {
  const filterViewsCollection = createListCollection({
    items: getFilterOptions(isCurrentlyStressed),
  });

  const totalEmails = (numOfFocusedEmails ?? 0) + (numOfOtherEmails ?? 0);

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
      <div className={styles.filterItem}>
        <FaCheck /> 0 {isCurrentlyStressed ? 'tasks to go' : 'tasks completed'}
      </div>
      <Box className={styles.filterItem}>
        <Skeleton
          height="6"
          loading={isLoadingEmails}
          className={styles.filterItem}
        >
          <FaCheck />
          {isCurrentlyStressed ? numOfFocusedEmails : totalEmails}{' '}
          {isCurrentlyStressed ? 'important emails' : 'unread emails'}
        </Skeleton>
      </Box>
    </div>
  );
};

export default Filters;

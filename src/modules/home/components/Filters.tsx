import { FaCheck } from 'react-icons/fa6';
import { Portal, Select, createListCollection } from '@chakra-ui/react';

import styles from '../infrastructure/styles/home.module.css';
import type { FiltersProps } from '../infrastructure/types/home.types';
import getFilterOptions from '../infrastructure/helpers/getFilterOptions';

const Filters = ({
  selectedView,
  setSelectedView,
  isCurrentlyStressed,
  numOfFocusedEmails,
  numOfOtherEmails,
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
          onValueChange={(e) => setSelectedView(e.value[0])}
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
      <div className={styles.filterItem}>
        <FaCheck /> {isCurrentlyStressed ? numOfFocusedEmails : totalEmails}{' '}
        {isCurrentlyStressed ? 'important emails' : 'unread emails'}
      </div>
    </div>
  );
};

export default Filters;

import { FaCheck } from 'react-icons/fa6';
import { Portal, Select } from '@chakra-ui/react';

import styles from '../infrastructure/styles/home.module.css';
import type { FiltersProps } from '../infrastructure/types/home.types';
import { filterViewsCollection } from '../infrastructure/helpers/constant';

const Filters = ({ selectedView, setSelectedView }: FiltersProps) => {
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
        <FaCheck /> 0 tasks completed
      </div>
      <div className={styles.filterItem}>
        <FaCheck /> 5 unread emails
      </div>
    </div>
  );
};

export default Filters;

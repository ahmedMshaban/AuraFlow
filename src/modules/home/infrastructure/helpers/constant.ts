import { createListCollection } from '@chakra-ui/react';

export const filterViewsCollection = createListCollection({
  items: [
    { label: 'My Day', value: 'my-day' },
    { label: 'My Week', value: 'my-week' },
    { label: 'My Month', value: 'my-month' },
  ],
});

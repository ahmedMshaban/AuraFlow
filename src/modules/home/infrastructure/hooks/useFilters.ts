import { useState } from 'react';
import type { ViewType } from '../types/home.types';

const useFilters = () => {
  const [selectedView, setSelectedView] = useState<ViewType>('my-day');

  return { selectedView, setSelectedView };
};

export default useFilters;

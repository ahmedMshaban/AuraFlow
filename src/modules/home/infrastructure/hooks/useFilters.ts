import { useState } from 'react';

const useFilters = () => {
  const [selectedView, setSelectedView] = useState('my-day');

  return { selectedView, setSelectedView };
};

export default useFilters;

// When user is stressed, simplify options to reduce cognitive load
const getFilterOptions = (isCurrentlyStressed: boolean) => {
  if (isCurrentlyStressed) {
    return [{ label: 'My Day', value: 'my-day' }];
  }

  return [
    { label: 'My Day', value: 'my-day' },
    { label: 'My Week', value: 'my-week' },
    { label: 'My Month', value: 'my-month' },
  ];
};

export default getFilterOptions;

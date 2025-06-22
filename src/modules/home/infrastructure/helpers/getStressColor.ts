// Get stress color based on priority
const getStressColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'red.300';
    case 'medium':
      return 'orange.300';
    case 'low':
      return 'green.300';
    default:
      return 'gray.300';
  }
};

export default getStressColor;

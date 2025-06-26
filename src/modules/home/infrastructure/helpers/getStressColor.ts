/**
 * Get Chakra UI color scheme for stress visualization based on priority level
 * 
 * @param priority - The priority level ('high', 'medium', 'low', or any other string)
 * @returns Chakra UI color string corresponding to the priority level
 * 
 * @example
 * ```typescript
 * getStressColor('high') // returns 'red.300'
 * getStressColor('medium') // returns 'orange.300'
 * getStressColor('low') // returns 'green.300'
 * getStressColor('invalid') // returns 'gray.300'
 * ```
 */
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

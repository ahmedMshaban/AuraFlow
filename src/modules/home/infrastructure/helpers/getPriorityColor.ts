/**
 * Get Chakra UI color scheme for task priority visualization
 * 
 * @param priority - The task priority ('high', 'medium', 'low', or any other string)
 * @returns Chakra UI color string corresponding to the priority level
 * 
 * @example
 * ```typescript
 * getPriorityColor('high') // returns 'red'
 * getPriorityColor('medium') // returns 'yellow'
 * getPriorityColor('low') // returns 'green'
 * getPriorityColor('unknown') // returns 'gray'
 * ```
 */
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
    default:
      return 'gray';
  }
};

export default getPriorityColor;

/**
 * Get Chakra UI color scheme for task status visualization
 * 
 * @param status - The task status ('completed', 'overdue', 'pending', or any other string)
 * @returns Chakra UI color string corresponding to the task status
 * 
 * @example
 * ```typescript
 * getStatusColor('completed') // returns 'green'
 * getStatusColor('overdue') // returns 'red'
 * getStatusColor('pending') // returns 'blue'
 * getStatusColor('unknown') // returns 'gray'
 * ```
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'overdue':
      return 'red';
    case 'pending':
      return 'blue';
    default:
      return 'gray';
  }
};

export default getStatusColor;

import { FiMail, FiClock, FiAlertTriangle } from 'react-icons/fi';
import type { ReactElement } from 'react';

/**
 * Get React icon component for task/email priority visualization
 * Returns appropriate icon and color based on priority level
 *
 * @param priority - The priority level ('high', 'medium', 'low', or any other string)
 * @returns JSX element with appropriate icon and color for the priority
 *
 * @example
 * ```typescript
 * getPriorityIcon('high')    // <FiAlertTriangle color="#ff4757" />
 * getPriorityIcon('medium')  // <FiClock color="#ffa502" />
 * getPriorityIcon('low')     // <FiMail color="#26de81" />
 * getPriorityIcon('unknown') // <FiMail color="#26de81" />
 * ```
 */
const getPriorityIcon = (priority: string): ReactElement => {
  switch (priority) {
    case 'high':
      return <FiAlertTriangle color="#ff4757" />;
    case 'medium':
      return <FiClock color="#ffa502" />;
    default:
      return <FiMail color="#26de81" />;
  }
};

export default getPriorityIcon;

import { FiMail, FiClock, FiAlertTriangle } from 'react-icons/fi';

// Get priority icon
const getPriorityIcon = (priority: string) => {
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

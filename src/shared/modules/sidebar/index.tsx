import { FaBookOpen, FaTasks, FaEnvelope, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router';

import styles from './infrastructure/styles/sidebar.module.css';
import StressMonitoringPanel from '@/shared/components/StressMonitoringPanel';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div
      style={{
        width: isOpen ? '450px' : '0px',
      }}
      className={styles.sidebarContainer}
    >
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarBodyContainer}>
          <div className={styles.sidebarPanel}>
            <div className={styles.sidebarPanelHeader}>
              <h2 className={styles.sidebarTitle}>Settings</h2>
            </div>
            <StressMonitoringPanel />
          </div>
        </div>

        <div className={styles.sidebarLinksContainer}>
          {/* Home link */}
          <div
            className={styles.sidebarPanelLink}
            onClick={() => handleNavigation('/')}
          >
            <FaHome />
            Home
          </div>
          <div
            className={styles.sidebarPanelLink}
            onClick={() => handleNavigation('/activities')}
          >
            <FaBookOpen />
            <span>Library</span>
          </div>
          <div
            className={styles.sidebarPanelLink}
            onClick={() => handleNavigation('/tasks')}
          >
            <FaTasks />
            <span>My Tasks</span>
          </div>
          <div
            className={styles.sidebarPanelLink}
            onClick={() => handleNavigation('/emails')}
          >
            <FaEnvelope />
            <span>My Emails</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

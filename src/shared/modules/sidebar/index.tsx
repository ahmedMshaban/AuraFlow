import { FaBookOpen, FaTasks, FaEnvelope, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import { Button } from '@chakra-ui/react';

import styles from './infrastructure/styles/sidebar.module.css';
import StressMonitoringPanel from '@/shared/components/StressMonitoringPanel';
import { useAuth } from '@/shared/hooks/useAuth';
import useSidebar from './infrastructure/hooks/useSidebar';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const navigate = useNavigate();
  const authContext = useAuth();
  const { handleSignOut } = useSidebar();

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
              {authContext?.currentUser && (
                <div className={styles.signOutContainer}>
                  <Button
                    size="sm"
                    variant="outline"
                    className={styles.signOutButton}
                    onClick={handleSignOut}
                  >
                    <FaSignOutAlt style={{ marginRight: '0.5rem' }} />
                    Sign Out
                  </Button>
                </div>
              )}
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
            <span>Activities</span>
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

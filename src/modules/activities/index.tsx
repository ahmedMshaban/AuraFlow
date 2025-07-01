import { FaColumns } from 'react-icons/fa';

import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';

import styles from './infrastructure/styles/activities.module.css';

const Activities = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className={styles.activitiesPageContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.mainContentContainer}>
          <div
            className={styles.sidebarToggleButton}
            onClick={toggleSidebar}
            title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          >
            <FaColumns size={32} />
          </div>

          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Activities</h1>
            <p className={styles.pageSubtitle}>Manage your daily activities and wellness tracking</p>
          </div>

          <div className={styles.activitiesContainer}></div>
        </div>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Activities;

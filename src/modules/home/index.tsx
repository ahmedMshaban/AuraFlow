import { FaColumns } from 'react-icons/fa';

import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';
import styles from './infrastructure/styles/home.module.css';
import Greeting from './components/Greeting';

const Home = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className={styles.homePageContainer}>
      <div className={styles.innerContainer}>
        <div className={styles.mainContentContainer}>
          <div
            className={styles.sidebarToggleButton}
            onClick={toggleSidebar}
            title={isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          >
            <FaColumns size={32} />
          </div>
          <Greeting />
          <div className={styles.workAreasContainer}>
            <div className={styles.workArea}>Emails</div>
            <div className={styles.workArea}>Tasks</div>
          </div>
        </div>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Home;

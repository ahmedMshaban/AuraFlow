import { FaColumns } from 'react-icons/fa';

import { useStressAnalytics } from '@/shared/hooks/useStressAnalytics';
import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';
import styles from './infrastructure/styles/home.module.css';
import Greeting from './components/Greeting';
import Filters from './components/Filters';
import useFilters from './infrastructure/hooks/useFilters';
import Emails from './components/emails/Emails';
import Tasks from './components/Tasks';

const Home = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { selectedView, setSelectedView } = useFilters();
  const { isCurrentlyStressed } = useStressAnalytics();

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
            <Filters
              selectedView={selectedView}
              setSelectedView={setSelectedView}
              isCurrentlyStressed={isCurrentlyStressed}
            />

            <div className={styles.workAreas}>
              <div className={styles.workArea}>
                <Emails />
              </div>
              <div className={styles.workArea}>
                <Tasks />
              </div>
            </div>
          </div>
        </div>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Home;

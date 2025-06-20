import { FaColumns } from 'react-icons/fa';

import { useAuth } from '../../shared/hooks/useAuth';
import type { AuthContextType } from '@/shared/types/authContext';
import Sidebar from '@/shared/modules/sidebar';
import useSidebar from '@/shared/modules/sidebar/infrastructure/hooks/useSidebar';
import styles from './infrastructure/styles/home.module.css';

const Home = () => {
  const { currentUser } = useAuth() as AuthContextType;
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
          Good Evening, {currentUser?.displayName}
        </div>
        <Sidebar isOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Home;

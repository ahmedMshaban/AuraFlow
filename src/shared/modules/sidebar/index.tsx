import styles from './infrastructure/styles/sidebar.module.css';
import StressMonitoringPanel from '@/shared/components/StressMonitoringPanel';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div
      style={{
        width: isOpen ? '450px' : '0px',
      }}
      className={styles.sidebarContainer}
    >
      <div className={styles.sidebarContent}>
        <StressMonitoringPanel />
      </div>
    </div>
  );
};

export default Sidebar;

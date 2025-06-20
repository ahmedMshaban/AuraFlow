import styles from './infrastructure/styles/sidebar.module.css';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div
      style={{
        width: isOpen ? '450px' : '0px',
      }}
      className={styles.sidebarContainer}
    >
      <div className={styles.sidebarContent}>Hello from sidebar</div>
    </div>
  );
};

export default Sidebar;

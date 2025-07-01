import { useActivityLibrary } from '../infrastructure/hooks/useActivityLibrary';
import ActivityCard from './ActivityCard';
import Modal from './Modal';
import BreathBox from './BreathBox';
import styles from '../infrastructure/styles/ActivityLibrary.module.css';

const ActivityLibrary = () => {
  const { activities, selectedActivity, isModalOpen, handleActivityClick, handleCloseModal } = useActivityLibrary();

  const getActivityComponent = (componentKey: string) => {
    switch (componentKey) {
      case 'BreathBox':
        return <BreathBox />;
      case 'MeditationPlaceholder':
        return (
          <div className={styles.placeholderComponent}>
            <div className={styles.placeholderIcon}>🧘‍♀️</div>
            <h3>Guided Meditation</h3>
            <p>This meditation component will be implemented next!</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.activityLibrary}>
      <div className={styles.libraryHeader}>
        <h1 className={styles.libraryTitle}>Wellness Activities</h1>
        <p className={styles.librarySubtitle}>Choose from our collection of stress-relief and wellness activities</p>
      </div>

      <div className={styles.activitiesGrid}>
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            title={activity.title}
            description={activity.description}
            icon={<activity.icon />}
            duration={activity.duration}
            difficulty={activity.difficulty}
            category={activity.category}
            onClick={() => handleActivityClick(activity)}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedActivity?.title || ''}
        size="large"
      >
        {selectedActivity?.componentKey && getActivityComponent(selectedActivity.componentKey)}
      </Modal>
    </div>
  );
};

export default ActivityLibrary;

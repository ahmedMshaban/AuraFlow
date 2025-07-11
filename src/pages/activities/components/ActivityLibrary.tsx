import { useActivityLibrary } from '../infrastructure/hooks/useActivityLibrary';
import ActivityCard from './ActivityCard';
import Modal from './Modal';
import BreathBox from './BreathBox';
import DoodlingSpace from './DoodlingSpace';
import styles from '../infrastructure/styles/ActivityLibrary.module.css';

/**
 * The main activity library component that displays a grid of available wellness activities.
 * Provides a comprehensive interface for users to browse and select from various
 * stress-relief and wellness activities including breathing exercises, creative activities,
 * and meditation practices.
 *
 * Features:
 * - Grid layout of activity cards with hover effects
 * - Modal system for activity interaction
 * - Dynamic component rendering based on activity type
 * - Responsive design for different screen sizes
 * - Integration with activity management hooks
 *
 * @returns A complete activity library interface
 *
 * @example
 * ```tsx
 * // Simple usage - renders the complete activity library
 * <ActivityLibrary />
 *
 * // The component automatically handles:
 * // - Loading activities from constants
 * // - Displaying activity cards in a grid
 * // - Opening selected activities in modals
 * // - Managing modal state and interactions
 * ```
 *
 * @note This component is the main entry point for the activities module
 * @note Activities are loaded from ACTIVITIES_DATA constant and mapped with icons
 * @see {@link useActivityLibrary} For activity state management
 * @see {@link ActivityCard} For individual activity display
 * @see {@link Modal} For activity interaction interface
 */
const ActivityLibrary = () => {
  const { activities, selectedActivity, isModalOpen, handleActivityClick, handleCloseModal } = useActivityLibrary();

  /**
   * Maps activity component keys to their corresponding React components.
   * Provides a centralized way to manage and render different activity types.
   *
   * @param componentKey - The string identifier for the activity component
   * @returns The corresponding React component or null if not found
   *
   * @example
   * ```typescript
   * getActivityComponent('BreathBox');     // Returns: <BreathBox />
   * getActivityComponent('DoodlingSpace'); // Returns: <DoodlingSpace />
   * getActivityComponent('unknown');       // Returns: null
   * ```
   */
  const getActivityComponent = (componentKey: string) => {
    switch (componentKey) {
      case 'BreathBox':
        return <BreathBox />;
      case 'DoodlingSpace':
        return <DoodlingSpace />;
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

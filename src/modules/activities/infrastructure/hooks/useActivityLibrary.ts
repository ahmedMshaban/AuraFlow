import { useState } from 'react';
import { ACTIVITIES_DATA, ACTIVITY_ICONS } from '../constants/constants';
import type { ActivityData } from '../types/activities.types';

/**
 * Custom hook for managing the activity library functionality.
 * Handles activity selection, modal state, and provides mapped activities with icons.
 *
 * @returns {Object} Activity library state and handlers
 * @returns {Array} activities - Array of activities with mapped icons
 * @returns {ActivityData | null} selectedActivity - Currently selected activity
 * @returns {boolean} isModalOpen - Whether the activity modal is open
 * @returns {Function} handleActivityClick - Handler for selecting an activity
 * @returns {Function} handleCloseModal - Handler for closing the modal
 *
 * @example
 * ```typescript
 * const {
 *   activities,
 *   selectedActivity,
 *   isModalOpen,
 *   handleActivityClick,
 *   handleCloseModal
 * } = useActivityLibrary();
 *
 * // Display activities
 * activities.map(activity => (
 *   <ActivityCard
 *     key={activity.id}
 *     {...activity}
 *     onClick={() => handleActivityClick(activity)}
 *   />
 * ));
 *
 * // Handle modal
 * <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
 *   {selectedActivity && <ActivityComponent {...selectedActivity} />}
 * </Modal>
 * ```
 *
 * @note This hook automatically maps iconKey strings to actual icon components from ACTIVITY_ICONS
 */
export const useActivityLibrary = () => {
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activities = ACTIVITIES_DATA.map((activity) => ({
    ...activity,
    icon: ACTIVITY_ICONS[activity.iconKey as keyof typeof ACTIVITY_ICONS],
  }));

  const handleActivityClick = (activity: (typeof activities)[0]) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  return {
    activities,
    selectedActivity,
    isModalOpen,
    handleActivityClick,
    handleCloseModal,
  };
};

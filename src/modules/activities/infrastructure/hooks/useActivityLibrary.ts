import { useState } from 'react';
import { ACTIVITIES_DATA, ACTIVITY_ICONS } from '../constants/activities.constants';
import type { ActivityData } from '../types/activities.types';

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

import { useState } from 'react';
import BreathBox from '../../components/BreathBox';
import { ACTIVITIES, ACTIVITY_ICONS } from '../constants/activities';
import type { Activity, ActivityModalState } from '../types/activities.types';

export const useActivityLibrary = () => {
  const [modalState, setModalState] = useState<ActivityModalState>({
    isOpen: false,
    selectedActivity: null,
  });

  const activities: Activity[] = ACTIVITIES.map((activity) => {
    const IconComponent = ACTIVITY_ICONS[activity.id as keyof typeof ACTIVITY_ICONS];

    let component: React.ReactNode;
    switch (activity.id) {
      case 'breath-box':
        component = <BreathBox />;
        break;
      case 'meditation-placeholder':
        // Return a placeholder component function that will be called in the component
        component = 'meditation-placeholder';
        break;
      default:
        component = 'not-found';
    }

    return {
      ...activity,
      icon: <IconComponent />,
      component,
    };
  });

  const handleActivityClick = (activity: Activity) => {
    setModalState({
      isOpen: true,
      selectedActivity: activity,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      selectedActivity: null,
    });
  };

  return {
    activities,
    modalState,
    handleActivityClick,
    handleCloseModal,
  };
};

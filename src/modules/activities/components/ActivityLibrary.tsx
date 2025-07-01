import { useState } from 'react';
import { FaLungs, FaOm } from 'react-icons/fa';
import ActivityCard from './ActivityCard';
import Modal from './Modal';
import BreathBox from './BreathBox';
import styles from './ActivityLibrary.module.css';

interface Activity {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  component: React.ReactNode;
}

const ActivityLibrary = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activities: Activity[] = [
    {
      id: 'breath-box',
      title: 'Box Breathing',
      description:
        'A calming breathing technique used by Navy SEALs to reduce stress and improve focus. Follow the 4-4-4-4 pattern for optimal relaxation.',
      icon: <FaLungs />,
      duration: '5-10 min',
      difficulty: 'Easy',
      category: 'Breathing',
      component: <BreathBox />,
    },
    {
      id: 'meditation-placeholder',
      title: 'Guided Meditation',
      description:
        'A peaceful meditation session to help you relax, focus your mind, and reduce anxiety. Perfect for beginners and experienced practitioners.',
      icon: <FaOm />,
      duration: '10-20 min',
      difficulty: 'Easy',
      category: 'Mindfulness',
      component: (
        <div className={styles.placeholderComponent}>
          <div className={styles.placeholderIcon}>🧘‍♀️</div>
          <h3>Guided Meditation</h3>
          <p>This meditation component will be implemented next!</p>
        </div>
      ),
    },
  ];

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
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
            icon={activity.icon}
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
        {selectedActivity?.component}
      </Modal>
    </div>
  );
};

export default ActivityLibrary;

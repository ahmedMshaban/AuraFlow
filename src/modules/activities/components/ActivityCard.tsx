import { FaPlay } from 'react-icons/fa';
import { getDifficultyColor } from '../infrastructure/helpers/activityHelpers';
import styles from '../infrastructure/styles/ActivityCard.module.css';

interface ActivityCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  duration?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  category: string;
  onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  description,
  icon,
  duration,
  difficulty = 'Easy',
  category,
  onClick,
}) => {
  return (
    <div
      className={styles.activityCard}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconContainer}>{icon}</div>
        <div className={styles.cardInfo}>
          <h3 className={styles.cardTitle}>{title}</h3>
          <span className={styles.cardCategory}>{category}</span>
        </div>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.cardDescription}>{description}</p>

        <div className={styles.cardMeta}>
          {duration && (
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Duration:</span>
              <span className={styles.metaValue}>{duration}</span>
            </div>
          )}
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Difficulty:</span>
            <span
              className={styles.difficultyBadge}
              style={{ '--difficulty-color': getDifficultyColor(difficulty) } as React.CSSProperties}
            >
              {difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button className={styles.startButton}>
          <FaPlay /> Start Activity
        </button>
      </div>

      <div className={styles.cardOverlay}>
        <div className={styles.overlayContent}>
          <FaPlay size={24} />
          <span>Click to Start</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;

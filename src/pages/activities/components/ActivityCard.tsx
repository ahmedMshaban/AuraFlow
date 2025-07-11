import { FaPlay } from 'react-icons/fa';
import { getDifficultyColor } from '../infrastructure/helpers/activityHelpers';
import styles from '../infrastructure/styles/ActivityCard.module.css';

/**
 * Props for the ActivityCard component.
 */
interface ActivityCardProps {
  /** The title of the activity */
  title: string;
  /** A brief description of the activity */
  description: string;
  /** React icon component to display for the activity */
  icon: React.ReactNode;
  /** Optional duration string (e.g., "5 min", "10-15 minutes") */
  duration?: string;
  /** Difficulty level of the activity with color-coded display */
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  /** Category/type of the activity (e.g., "breathing", "mindfulness") */
  category: string;
  /** Callback function triggered when the card is clicked */
  onClick: () => void;
}

/**
 * A card component for displaying activity information with interactive elements.
 * Provides a clickable interface for users to view and select wellness activities.
 * Features color-coded difficulty levels and responsive hover effects.
 *
 * @param props - The component props
 * @param props.title - The activity title displayed prominently
 * @param props.description - Detailed description of the activity
 * @param props.icon - Icon component representing the activity type
 * @param props.duration - Optional duration display (e.g., "5 min")
 * @param props.difficulty - Difficulty level with automatic color coding
 * @param props.category - Activity category for organization
 * @param props.onClick - Handler for card selection/interaction
 * @returns A styled activity card component
 *
 * @example
 * ```tsx
 * import { FaBrain } from 'react-icons/fa';
 *
 * <ActivityCard
 *   title="Deep Breathing"
 *   description="Calm your mind with guided breathing exercises"
 *   icon={<FaBrain />}
 *   duration="5 min"
 *   difficulty="Easy"
 *   category="breathing"
 *   onClick={() => openActivity('breathing')}
 * />
 * ```
 *
 * @note The component automatically applies difficulty-based color coding
 * @note Clicking the card triggers the onClick handler for activity selection
 * @see {@link getDifficultyColor} For difficulty color mapping
 */
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

import { FaPlay, FaPause, FaStop } from 'react-icons/fa';
import { useBreathBox } from '../infrastructure/hooks/useBreathBox';
import styles from '../infrastructure/styles/BreathBox.module.css';

/**
 * Props for the BreathBox component.
 */
interface BreathBoxProps {
  /** Optional CSS class name for styling customization */
  className?: string;
}

/**
 * A guided box breathing exercise component implementing the 4-4-4-4 breathing technique.
 * Provides visual guidance, timing controls, and progress tracking for stress reduction
 * and focus improvement through controlled breathing patterns.
 *
 * The 4-4-4-4 technique involves:
 * 1. Inhale for 4 seconds
 * 2. Hold breath for 4 seconds
 * 3. Exhale for 4 seconds
 * 4. Hold empty lungs for 4 seconds
 *
 * Features:
 * - Visual breathing cues with animated progress indicators
 * - Real-time phase tracking and countdown timer
 * - Cycle counting for session progress
 * - Play/pause/stop controls for session management
 * - Responsive design with accessibility considerations
 *
 * @param props - The component props
 * @param props.className - Optional CSS class for styling customization
 * @returns A complete box breathing exercise interface
 *
 * @example
 * ```tsx
 * // Basic usage
 * <BreathBox />
 *
 * // With custom styling
 * <BreathBox className="custom-breath-box" />
 * ```
 *
 * @note This component is designed to be used within the activity modal system
 * @note The breathing technique is based on Navy SEAL training methods
 * @see {@link useBreathBox} For breathing logic and state management
 */
const BreathBox: React.FC<BreathBoxProps> = ({ className }) => {
  const {
    isActive,
    currentPhase,
    progress,
    cycleCount,
    timeRemaining,
    handleStart,
    handlePause,
    handleStop,
    getCurrentPhaseLabel,
  } = useBreathBox();

  return (
    <div className={`${styles.breathBoxContainer} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Box Breathing</h3>
        <p className={styles.subtitle}>4-4-4-4 breathing technique for relaxation</p>
      </div>

      <div className={styles.breathingArea}>
        <div className={`${styles.breathBox} ${styles[currentPhase]}`}>
          <div className={styles.innerBox}>
            <div className={styles.phaseText}>{getCurrentPhaseLabel()}</div>
            <div className={styles.timer}>{timeRemaining}</div>
          </div>
          <div
            className={styles.progressIndicator}
            style={{ '--progress': `${progress}%` } as React.CSSProperties}
          />
        </div>

        <div className={styles.instructions}>
          <div className={styles.phaseGuide}>
            <div className={`${styles.phaseStep} ${currentPhase === 'inhale' ? styles.active : ''}`}>
              1. Inhale (4s)
            </div>
            <div className={`${styles.phaseStep} ${currentPhase === 'hold1' ? styles.active : ''}`}>2. Hold (4s)</div>
            <div className={`${styles.phaseStep} ${currentPhase === 'exhale' ? styles.active : ''}`}>
              3. Exhale (4s)
            </div>
            <div className={`${styles.phaseStep} ${currentPhase === 'hold2' ? styles.active : ''}`}>4. Hold (4s)</div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.controlButton} ${styles.startButton}`}
          onClick={handleStart}
          disabled={isActive}
        >
          <FaPlay /> Start
        </button>
        <button
          className={`${styles.controlButton} ${styles.pauseButton}`}
          onClick={handlePause}
          disabled={!isActive}
        >
          <FaPause /> Pause
        </button>
        <button
          className={`${styles.controlButton} ${styles.stopButton}`}
          onClick={handleStop}
        >
          <FaStop /> Reset
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Completed Cycles:</span>
          <span className={styles.statValue}>{cycleCount}</span>
        </div>
      </div>
    </div>
  );
};

export default BreathBox;

import { FaPlay, FaPause, FaStop } from 'react-icons/fa';
import { useBreathBox } from '../infrastructure/hooks/useBreathBox';
import styles from '../infrastructure/styles/BreathBox.module.css';

interface BreathBoxProps {
  className?: string;
}

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

import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';
import styles from './BreathBox.module.css';

interface BreathBoxProps {
  className?: string;
}

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PHASE_DURATION = 4000; // 4 seconds
const PHASE_LABELS = {
  inhale: 'Breathe In',
  hold1: 'Hold',
  exhale: 'Breathe Out',
  hold2: 'Hold',
};

const BreathBox: React.FC<BreathBoxProps> = ({ className }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('inhale');
  const [progress, setProgress] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(4);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseStartRef = useRef<number>(0);

  const phases = useRef<BreathPhase[]>(['inhale', 'hold1', 'exhale', 'hold2']);

  useEffect(() => {
    if (isActive) {
      phaseStartRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - phaseStartRef.current;
        const phaseProgress = (elapsed / PHASE_DURATION) * 100;
        const timeLeft = Math.ceil((PHASE_DURATION - elapsed) / 1000);

        setProgress(Math.min(phaseProgress, 100));
        setTimeRemaining(Math.max(timeLeft, 0));

        if (elapsed >= PHASE_DURATION) {
          const currentIndex = phases.current.indexOf(currentPhase);
          const nextIndex = (currentIndex + 1) % phases.current.length;
          const nextPhase = phases.current[nextIndex];

          setCurrentPhase(nextPhase);
          setProgress(0);
          setTimeRemaining(4);
          phaseStartRef.current = Date.now();

          if (nextPhase === 'inhale') {
            setCycleCount((prev) => prev + 1);
          }
        }
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, currentPhase]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setProgress(0);
    setCycleCount(0);
    setTimeRemaining(4);
  };

  return (
    <div className={`${styles.breathBoxContainer} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Box Breathing</h3>
        <p className={styles.subtitle}>4-4-4-4 breathing technique for relaxation</p>
      </div>

      <div className={styles.breathingArea}>
        <div className={`${styles.breathBox} ${styles[currentPhase]}`}>
          <div className={styles.innerBox}>
            <div className={styles.phaseText}>{PHASE_LABELS[currentPhase]}</div>
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

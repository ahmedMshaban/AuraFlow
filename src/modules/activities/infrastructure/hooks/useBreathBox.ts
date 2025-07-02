import { useState, useEffect, useRef } from 'react';
import { PHASE_DURATION, PHASE_LABELS } from '../constants/constants';
import type { BreathPhase } from '../types/activities.types';

/**
 * Custom hook for managing box breathing exercise functionality.
 * Implements the 4-4-4-4 breathing pattern (4 seconds each phase) used by Navy SEALs
 * for stress reduction and focus improvement.
 *
 * Breathing phases:
 * 1. Inhale (4 seconds)
 * 2. Hold (4 seconds)
 * 3. Exhale (4 seconds)
 * 4. Hold (4 seconds)
 *
 * Features:
 * - Automatic phase progression with visual feedback
 * - Cycle counting for session tracking
 * - Real-time progress indicators
 * - Precise timing control
 * - Session start/pause/stop controls
 *
 * @returns {Object} Breath box state and controls
 * @returns {boolean} isActive - Whether the breathing exercise is currently running
 * @returns {BreathPhase} currentPhase - Current breathing phase ('inhale', 'hold1', 'exhale', 'hold2')
 * @returns {number} progress - Current phase progress as percentage (0-100)
 * @returns {number} cycleCount - Number of completed breathing cycles
 * @returns {number} timeRemaining - Seconds remaining in current phase
 * @returns {Function} handleStart - Start the breathing exercise
 * @returns {Function} handlePause - Pause/resume the breathing exercise
 * @returns {Function} handleStop - Stop and reset the breathing exercise
 * @returns {Object} phaseLabels - Human-readable labels for each phase
 * @returns {number} phaseDuration - Duration of each phase in milliseconds
 *
 * @example
 * ```typescript
 * const {
 *   isActive,
 *   currentPhase,
 *   progress,
 *   cycleCount,
 *   timeRemaining,
 *   handleStart,
 *   handlePause,
 *   handleStop,
 *   phaseLabels,
 *   phaseDuration
 * } = useBreathBox();
 *
 * // Display current phase
 * <div>{phaseLabels[currentPhase]}</div>
 *
 * // Show progress bar
 * <div style={{ width: `${progress}%` }} />
 *
 * // Display countdown
 * <div>{timeRemaining}s</div>
 *
 * // Control buttons
 * <button onClick={handleStart} disabled={isActive}>
 *   Start
 * </button>
 * <button onClick={handlePause} disabled={!isActive}>
 *   {isActive ? 'Pause' : 'Resume'}
 * </button>
 * <button onClick={handleStop}>
 *   Stop
 * </button>
 *
 * // Cycle counter
 * <div>Cycles completed: {cycleCount}</div>
 * ```
 *
 * @see {@link BreathPhase} For breathing phase types
 * @see {@link PHASE_DURATION} For phase timing constants
 * @see {@link PHASE_LABELS} For phase label constants
 */
export const useBreathBox = () => {
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

  const getCurrentPhaseLabel = () => PHASE_LABELS[currentPhase];

  return {
    // State
    isActive,
    currentPhase,
    progress,
    cycleCount,
    timeRemaining,

    // Actions
    handleStart,
    handlePause,
    handleStop,

    // Helpers
    getCurrentPhaseLabel,

    // Constants
    phaseLabels: PHASE_LABELS,
  };
};

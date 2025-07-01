import { useState, useEffect, useRef } from 'react';
import { PHASE_DURATION, PHASE_LABELS } from '../constants/activities.constants';
import type { BreathPhase } from '../types/activities.types';

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

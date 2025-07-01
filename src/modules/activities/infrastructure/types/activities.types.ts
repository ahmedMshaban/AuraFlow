export interface Activity {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  component: React.ReactNode;
}

export interface ActivityData {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  duration?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  componentKey: string;
}

export type ActivityId = 'breath-box' | 'meditation-placeholder';

export interface ActivityModalState {
  isOpen: boolean;
  selectedActivity: Activity | null;
}

export type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export interface BreathBoxState {
  isActive: boolean;
  currentPhase: BreathPhase;
  progress: number;
  cycleCount: number;
  timeRemaining: number;
}

export interface BreathBoxControls {
  handleStart: () => void;
  handlePause: () => void;
  handleStop: () => void;
}

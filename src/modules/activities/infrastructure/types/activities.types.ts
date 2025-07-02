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

// Doodling Space Types
export interface Point {
  x: number;
  y: number;
}

export interface DrawingStroke {
  points: Point[];
  color: string;
  size: number;
  timestamp: number;
}

export interface DoodlingState {
  isDrawing: boolean;
  currentColor: string;
  currentBrushSize: number;
  strokes: DrawingStroke[];
  canvasRef: React.RefObject<HTMLCanvasElement> | null;
}

export interface DoodlingControls {
  startDrawing: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  changeColor: (color: string) => void;
  changeBrushSize: (size: number) => void;
  undo: () => void;
}

export type DrawingTool = 'brush' | 'eraser';

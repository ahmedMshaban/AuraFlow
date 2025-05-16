import type { StressAnalysisResult } from './FaceExpressions.types';

export interface StressDetectorProps {
  /** Called when stress analysis is complete */
  onAnalysisComplete?: (result: StressAnalysisResult) => void;
}

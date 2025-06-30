import type { StressAnalysisResult } from './FaceExpressions.types';
import type { RecordingResult } from './VideoRecorder.types';

export interface UseFaceAnalysisProps {
  onAnalysisComplete?: (result: StressAnalysisResult) => void;
}

export interface UseFaceAnalysisResult {
  isLoading: boolean;
  analysisResult: StressAnalysisResult | null;
  error: string | null;
  handleRecordingComplete: (recordingResult: RecordingResult) => Promise<void>;
  handleReset: () => void;
}

export interface UseStressAnalysisUtilsResult {
  getStressLevelText: (level: number) => string;
}

export interface FaceAnalysisProps {
  onAnalysisComplete?: (result: StressAnalysisResult) => void;
  onClose?: () => void;
}

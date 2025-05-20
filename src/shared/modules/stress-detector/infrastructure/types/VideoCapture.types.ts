import type { RecordingResult } from './VideoRecorder.types';

export interface VideoCaptureProps {
  /** Duration of recording in milliseconds */
  recordingDuration?: number;
  /** Called when recording is completed */
  onRecordingComplete?: (result: RecordingResult) => void;
  currentStep?: number;
}

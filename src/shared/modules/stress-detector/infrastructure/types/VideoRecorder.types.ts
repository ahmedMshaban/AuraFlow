export interface RecordingOptions {
  /** Recording duration in milliseconds */
  duration?: number;
  /** MIME type for the recording */
  mimeType?: string;
}

export interface RecordingResult {
  /** The recorded media as a Blob */
  blob: Blob;
  /** URL that can be used to view the recording */
  url: string;
  /** Duration of the recording in milliseconds */
  duration: number;
}

export interface UseVideoRecorderProps {
  recordingDuration?: number;
  onRecordingComplete?: (result: RecordingResult) => void;
}

export interface VideoRecorderState {
  isRecording: boolean;
  isProcessing: boolean;
  countdown: number | null;
  recordingTime: number | null;
  cameraReady: boolean;
  hasRecorded: boolean;
  startRecordingWithCountdown: () => Promise<void>;
  setupRecorder: (stream: MediaStream) => void;
  resetRecording: () => void;
}

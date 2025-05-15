export interface WebcamCaptureProps {
  /** Called when the camera is ready to use */
  onCaptureReady?: () => void;
  /** Called when a media stream becomes available */
  onStreamAvailable?: (stream: MediaStream) => void;
}

export interface UseWebcamProps {
  onCaptureReady?: () => void;
  onStreamAvailable?: (stream: MediaStream) => void;
}

export interface UseWebcamResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export interface UseWebcamSetupProps {
  onCaptureReady?: () => void;
  onStreamAvailable?: (stream: MediaStream) => void;
}

export interface WebcamSetupHandlers {
  handleCaptureReady: () => void;
  handleStreamAvailable: (stream: MediaStream) => void;
}

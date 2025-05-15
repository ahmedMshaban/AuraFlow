export interface WebcamCaptureProps {
  /** Called when the camera is ready to use */
  onCaptureReady?: () => void;
  /** Called when a media stream becomes available */
  onStreamAvailable?: (stream: MediaStream) => void;
}
